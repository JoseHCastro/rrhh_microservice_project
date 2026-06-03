package com.example.rrhh.proyecto.preplanilla;

import com.example.rrhh.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;

/**
 * Servicio S3 para subida de PDFs de preplanillas y generación de URLs pre-firmadas.
 * Solo disponible cuando app.aws.enabled=true.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.aws.enabled", havingValue = "true")
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AppProperties appProperties;

    /**
     * Sube el PDF de la preplanilla a S3.
     * Key: preplanillas/{periodo}/emp-{empleadoId}-{apellido}.pdf
     */
    public String subirPreplanillaPdf(byte[] contenidoPdf, Long empleadoId,
                                      String apellido, String periodo) {
        String bucket = appProperties.aws().s3().bucket();
        String key = String.format("preplanillas/%s/emp-%d-%s.pdf",
            periodo, empleadoId, apellido.toLowerCase().replace(" ", "-"));

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("application/pdf")
                .build(),
            RequestBody.fromBytes(contenidoPdf)
        );

        log.info("Preplanilla subida a S3: s3://{}/{}", bucket, key);
        return key;
    }

    /**
     * Genera URL pre-firmada válida por 15 minutos para descarga segura.
     */
    public String generarUrlPresignada(String s3Key) {
        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(
            GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(req -> req
                    .bucket(appProperties.aws().s3().bucket())
                    .key(s3Key))
                .build()
        );

        return presignedRequest.url().toString();
    }
}
