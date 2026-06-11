package com.example.rrhh.proyecto.preplanilla;

import com.example.rrhh.proyecto.asistencia.EstadoAsistencia;
import com.example.rrhh.proyecto.asistencia.RegistroAsistencia;
import com.example.rrhh.proyecto.asistencia.RegistroAsistenciaRepository;
import com.example.rrhh.proyecto.ausencia.solicitud.EstadoSolicitud;
import com.example.rrhh.proyecto.ausencia.solicitud.SolicitudAusenciaRepository;
import com.example.rrhh.proyecto.empleado.Empleado;
import com.example.rrhh.proyecto.empleado.EmpleadoRepository;
import com.example.rrhh.shared.exception.BusinessException;
import com.example.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PreplanillaService {

    private final PreplanillaRepository preplanillaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final RegistroAsistenciaRepository registroRepository;
    private final SolicitudAusenciaRepository solicitudRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final BlockchainService blockchainService;
    private final Optional<S3Service> s3Service;

    @Transactional(readOnly = true)
    public List<Preplanilla> findAll(Long empleadoId, String periodo) {
        return preplanillaRepository.findAllWithFilters(empleadoId, periodo);
    }

    @Transactional(readOnly = true)
    public Preplanilla findById(Long id) {
        return preplanillaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Preplanilla", id));
    }

    @Transactional(readOnly = true)
    public Optional<Preplanilla> verificarPorHash(String hash) {
        Optional<Preplanilla> opt = preplanillaRepository.findByDocumentoHash(hash);
        if (opt.isPresent()) {
            boolean enBlockchain = blockchainService.verificarHashEnBlockchain(hash);
            if (!enBlockchain) {
                log.warn("ALERTA: El Hash {} está en BD pero NO en Blockchain. Documento comprometido o no registrado.", hash);
                return Optional.empty();
            }
        }
        return opt;
    }

    @Transactional
    public Preplanilla generar(Long empleadoId, String periodo) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));

        // Verificar si ya existe preplanilla para este período
        preplanillaRepository.findByEmpleadoIdAndPeriodo(empleadoId, periodo)
            .ifPresent(p -> {
                throw new BusinessException(
                    "Ya existe preplanilla para empleado " + empleadoId + " en período " + periodo
                );
            });

        // Parsear el período (formato "YYYY-MM")
        YearMonth ym;
        try {
            ym = YearMonth.parse(periodo);
        } catch (DateTimeParseException e) {
            throw new BusinessException("Formato de período inválido. Use 'YYYY-MM', por ejemplo '2025-05'");
        }

        LocalDateTime desde = ym.atDay(1).atStartOfDay();
        LocalDateTime hasta = ym.atEndOfMonth().atTime(23, 59, 59);

        // Obtener todos los registros de asistencia del período
        List<RegistroAsistencia> registros = registroRepository
            .findByEmpleadoIdAndRango(empleadoId, desde, hasta, org.springframework.data.domain.Pageable.unpaged())
            .getContent();

        // Calcular métricas
        int diasTrabajados = registros.size();
        long retrasos = registros.stream()
            .filter(r -> r.getEstado() == EstadoAsistencia.RETRASO)
            .count();
        long marcacionesObservadas = registros.stream()
            .filter(r -> r.getEstado() == EstadoAsistencia.MARCACION_OBSERVADA)
            .count();

        // Calcular horas extra (horas trabajadas más allá de la hora de salida esperada)
        BigDecimal horasExtra = registros.stream()
            .filter(r -> r.getHoraSalida() != null)
            .map(r -> {
                LocalDateTime salidaEsperada = r.getHoraEntrada().toLocalDate()
                    .atTime(empleado.getHoraSalida());
                if (r.getHoraSalida().isAfter(salidaEsperada)) {
                    long minutos = Duration.between(salidaEsperada, r.getHoraSalida()).toMinutes();
                    return BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
                }
                return BigDecimal.ZERO;
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calcular días laborables del mes (lunes a viernes)
        long diasLaborables = 0;
        LocalDate dia = ym.atDay(1);
        while (!dia.isAfter(ym.atEndOfMonth())) {
            java.time.DayOfWeek dow = dia.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                diasLaborables++;
            }
            dia = dia.plusDays(1);
        }

        // Contar permisos aprobados (que no sean licencias)
        int permisosAprobados = (int) solicitudRepository
            .findAllWithFilters(EstadoSolicitud.APROBADA, empleadoId)
            .stream()
            .filter(s -> !s.getFechaInicio().isBefore(ym.atDay(1))
                      && !s.getFechaFin().isAfter(ym.atEndOfMonth()))
            .count();

        int faltas = (int) Math.max(0, diasLaborables - diasTrabajados - permisosAprobados);

        Preplanilla preplanilla = Preplanilla.builder()
            .empleado(empleado)
            .periodo(periodo)
            .diasTrabajados(diasTrabajados)
            .faltas(faltas)
            .retrasos((int) retrasos)
            .permisosAprobados(permisosAprobados)
            .licencias(0)
            .horasExtra(horasExtra)
            .marcacionesObservadas((int) marcacionesObservadas)
            .fechaCreacion(LocalDateTime.now())
            .build();

        // 1. Guardar la preplanilla inicial
        Preplanilla saved = preplanillaRepository.save(preplanilla);
        
        try {
            // 2. Generar el PDF
            byte[] pdfBytes = pdfGeneratorService.generarPlanillaPdf(saved);
            
            // 3. Calcular el Hash del PDF
            String hashSha256 = pdfGeneratorService.calcularHashSha256(pdfBytes);
            saved.setDocumentoHash(hashSha256);
            
            // 3.5. Subir a S3 (si está habilitado)
            if (s3Service.isPresent()) {
                String s3Key = s3Service.get().subirPreplanillaPdf(pdfBytes, empleadoId, empleado.getApellido(), periodo);
                saved.setS3KeyUri(s3Key);
                log.info("PDF guardado en S3 con key: {}", s3Key);
            }
            
            // Guardar para no perder s3_key_uri en caso de fallo en blockchain
            saved = preplanillaRepository.save(saved);
            
            // 4. Registrar en Blockchain
            String txHash = blockchainService.registrarHashEnBlockchain(hashSha256, empleadoId, periodo);
            saved.setBlockchainTx(txHash);
            
            // 5. Actualizar con los datos de blockchain y el hash
            saved = preplanillaRepository.save(saved);
            
            log.info("Preplanilla asegurada en Blockchain: hash={}, tx={}", hashSha256, txHash);
        } catch (Exception e) {
            log.error("Error al generar PDF o registrar en Blockchain para la preplanilla ID {}: {}", saved.getId(), e.getMessage());
            // Nota: Aquí se podría lanzar la excepción si queremos que falle la transacción completa,
            // pero si falla la blockchain (red caída), tal vez queremos conservar la planilla.
            // Para asegurar la completitud, en este caso dejamos que pase el error pero queda logueado.
        }

        log.info("Preplanilla generada: empleado_id={}, periodo={}, diasTrabajados={}, faltas={}, retrasos={}",
            empleadoId, periodo, diasTrabajados, faltas, retrasos);
        return saved;
    }
}
