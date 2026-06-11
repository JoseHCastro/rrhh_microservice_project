package com.example.rrhh.proyecto.preplanilla;

import com.example.rrhh.proyecto.empleado.Empleado;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    /**
     * Genera un PDF estructurado, profesional y estéticamente superior para la preplanilla en memoria.
     * @param p La entidad Preplanilla
     * @return Arreglo de bytes con el contenido del PDF.
     */
    public byte[] generarPlanillaPdf(Preplanilla p) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Configurar márgenes profesionales
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            // Colores corporativos
            Color primaryColor = new Color(0, 51, 102);
            Color secondaryColor = new Color(240, 245, 250);
            Color borderColor = new Color(200, 200, 200);
            
            // Fuentes
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
            
            // Cabecera Corporativa
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1f, 1f});
            
            PdfPCell logoCell = new PdfPCell(new Phrase("TECH CORP RRHH", titleFont));
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            headerTable.addCell(logoCell);
            
            PdfPCell dateCell = new PdfPCell(new Phrase("Generado: " + p.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));
            dateCell.setBorder(Rectangle.NO_BORDER);
            dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            dateCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            headerTable.addCell(dateCell);
            
            document.add(headerTable);
            
            // Línea separadora
            Paragraph separator = new Paragraph(" ");
            separator.setSpacingAfter(10);
            document.add(separator);
            
            // Título Principal
            Paragraph title = new Paragraph("PREPLANILLA MENSUAL DE EMPLEADO", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);
            
            Paragraph period = new Paragraph("Período de Evaluación: " + p.getPeriodo(), subtitleFont);
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(25);
            document.add(period);
            
            // ----------------------------------------------------
            // SECCIÓN: DATOS DEL EMPLEADO (Tabla de 4 columnas)
            // ----------------------------------------------------
            PdfPTable empTable = new PdfPTable(4);
            empTable.setWidthPercentage(100);
            empTable.setWidths(new float[]{1.5f, 3.5f, 1.5f, 3.5f});
            empTable.setSpacingAfter(25);
            
            addTableHeader(empTable, "INFORMACIÓN DEL COLABORADOR", 4, headerFont, primaryColor);
            
            Empleado e = p.getEmpleado();
            
            addRow(empTable, "ID Empleado:", String.valueOf(e.getId()), labelFont, normalFont, secondaryColor, borderColor);
            addRow(empTable, "Nombre:", e.getNombre() + " " + e.getApellido(), labelFont, normalFont, secondaryColor, borderColor);
            
            String ci = e.getCarnetIdentidad() != null ? e.getCarnetIdentidad() : "N/A";
            addRow(empTable, "C.I.:", ci, labelFont, normalFont, secondaryColor, borderColor);
            
            String depto = e.getDepartamento() != null ? e.getDepartamento().getNombre() : "No Asignado";
            addRow(empTable, "Departamento:", depto, labelFont, normalFont, secondaryColor, borderColor);
            
            String cargo = e.getCargo() != null ? e.getCargo().getNombre() : "No Asignado";
            addRow(empTable, "Cargo:", cargo, labelFont, normalFont, secondaryColor, borderColor);
            
            String horario = (e.getHoraEntrada() != null ? e.getHoraEntrada().toString() : "--") + " a " + 
                             (e.getHoraSalida() != null ? e.getHoraSalida().toString() : "--");
            addRow(empTable, "Horario:", horario, labelFont, normalFont, secondaryColor, borderColor);
            
            document.add(empTable);
            
            // ----------------------------------------------------
            // SECCIÓN: RESUMEN DE ASISTENCIA Y MÉTRICAS
            // ----------------------------------------------------
            PdfPTable metricsTable = new PdfPTable(2);
            metricsTable.setWidthPercentage(100);
            metricsTable.setWidths(new float[]{3f, 1f});
            metricsTable.setSpacingAfter(30);
            
            addTableHeader(metricsTable, "RESUMEN DE ASISTENCIA Y MÉTRICAS", 2, headerFont, primaryColor);
            
            addRowSingle(metricsTable, "Días Trabajados en el Período", String.valueOf(p.getDiasTrabajados()), normalFont, borderColor);
            addRowSingle(metricsTable, "Faltas Injustificadas", String.valueOf(p.getFaltas()), normalFont, borderColor);
            addRowSingle(metricsTable, "Retrasos Registrados", String.valueOf(p.getRetrasos()), normalFont, borderColor);
            addRowSingle(metricsTable, "Marcaciones Observadas", String.valueOf(p.getMarcacionesObservadas()), normalFont, borderColor);
            addRowSingle(metricsTable, "Permisos Aprobados", String.valueOf(p.getPermisosAprobados()), normalFont, borderColor);
            addRowSingle(metricsTable, "Licencias", String.valueOf(p.getLicencias()), normalFont, borderColor);
            addRowSingle(metricsTable, "Horas Extra Acumuladas", p.getHorasExtra().toPlainString() + " hrs", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor), borderColor);
            
            document.add(metricsTable);
            
            // ----------------------------------------------------
            // SECCIÓN: FOOTER Y FIRMAS
            // ----------------------------------------------------
            PdfPTable signatures = new PdfPTable(2);
            signatures.setWidthPercentage(100);
            signatures.setSpacingBefore(40);
            
            PdfPCell cellFirmaEmp = new PdfPCell(new Phrase("Firma del Empleado\n" + e.getNombre() + " " + e.getApellido(), normalFont));
            cellFirmaEmp.setBorder(Rectangle.TOP);
            cellFirmaEmp.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellFirmaEmp.setPaddingTop(10);
            
            PdfPCell cellFirmaRRHH = new PdfPCell(new Phrase("Sello y Firma RRHH\nAprobación Oficial", normalFont));
            cellFirmaRRHH.setBorder(Rectangle.TOP);
            cellFirmaRRHH.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellFirmaRRHH.setPaddingTop(10);
            
            // Añadir espacio entre firmas
            PdfPTable signatureWrapper = new PdfPTable(3);
            signatureWrapper.setWidthPercentage(100);
            signatureWrapper.setWidths(new float[]{1f, 0.5f, 1f});
            
            cellFirmaEmp.setBorderColor(Color.DARK_GRAY);
            cellFirmaRRHH.setBorderColor(Color.DARK_GRAY);
            
            PdfPCell emptySpace = new PdfPCell();
            emptySpace.setBorder(Rectangle.NO_BORDER);
            
            signatureWrapper.addCell(cellFirmaEmp);
            signatureWrapper.addCell(emptySpace);
            signatureWrapper.addCell(cellFirmaRRHH);
            
            document.add(signatureWrapper);
            
            // Footer Final
            document.add(new Paragraph(" "));
            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);
            
            PdfPCell footerCell = new PdfPCell(new Phrase("Generado automáticamente por el Sistema de Recursos Humanos Tech Corp. \nID Preplanilla: " + p.getId(), smallFont));
            footerCell.setBorder(Rectangle.TOP);
            footerCell.setBorderColor(borderColor);
            footerCell.setPaddingTop(8);
            footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            footerTable.addCell(footerCell);
            
            document.add(footerTable);
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF de la preplanilla", e);
        }
    }

    private void addTableHeader(PdfPTable table, String headerTitle, int colspan, Font font, Color bgColor) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(bgColor);
        header.setPadding(8);
        header.setColspan(colspan);
        Phrase p = new Phrase(headerTitle, font);
        header.setPhrase(p);
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(header);
    }

    private void addRow(PdfPTable table, String label, String val, Font labelFont, Font valFont, Color labelBg, Color borderColor) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setPadding(6);
        cellLabel.setBorderColor(borderColor);
        cellLabel.setBackgroundColor(labelBg);
        cellLabel.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        PdfPCell cellVal = new PdfPCell(new Phrase(val, valFont));
        cellVal.setPadding(6);
        cellVal.setBorderColor(borderColor);
        cellVal.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        table.addCell(cellLabel);
        table.addCell(cellVal);
    }
    
    private void addRowSingle(PdfPTable table, String label, String val, Font font, Color borderColor) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
        cellLabel.setPadding(6);
        cellLabel.setBorderColor(borderColor);
        cellLabel.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        Font valFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.DARK_GRAY);
        if(font.getColor() != null && font.getColor().equals(new Color(0, 51, 102))) {
             valFont = font;
        }
        
        PdfPCell cellVal = new PdfPCell(new Phrase(val, valFont));
        cellVal.setPadding(6);
        cellVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellVal.setBorderColor(borderColor);
        cellVal.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        table.addCell(cellLabel);
        table.addCell(cellVal);
    }

    /**
     * Calcula el hash SHA-256 de un arreglo de bytes.
     */
    public String calcularHashSha256(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(fileBytes);
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al calcular el hash", e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
