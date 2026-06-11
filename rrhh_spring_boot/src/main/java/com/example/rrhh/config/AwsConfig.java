package com.example.rrhh.config;

import com.example.rrhh.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configuración de AWS S3.
 * Solo se activa si app.aws.enabled=true en application.yml.
 * En dev sin credenciales AWS, el bean no se crea.
 */
@Configuration
@RequiredArgsConstructor
public class AwsConfig {

    private final AppProperties appProperties;

    @Bean
    @ConditionalOnProperty(name = "app.aws.enabled", havingValue = "true")
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
            .region(Region.of(appProperties.aws().region()));
            
        if (appProperties.aws().s3().endpoint() != null && !appProperties.aws().s3().endpoint().isBlank()) {
            builder.endpointOverride(URI.create(appProperties.aws().s3().endpoint()))
                   .forcePathStyle(true);
        }
        
        return builder.build();
        // En producción las credenciales vienen del IAM Role del EC2/ECS
        // En local usa AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY del .env
    }

    @Bean
    @ConditionalOnProperty(name = "app.aws.enabled", havingValue = "true")
    public S3Presigner s3Presigner() {
        S3Presigner.Builder builder = S3Presigner.builder()
            .region(Region.of(appProperties.aws().region()));
            
        if (appProperties.aws().s3().endpoint() != null && !appProperties.aws().s3().endpoint().isBlank()) {
            builder.endpointOverride(URI.create(appProperties.aws().s3().endpoint()))
                   .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }
        
        return builder.build();
    }
}
