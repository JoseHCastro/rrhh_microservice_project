package com.example.rrhh.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    CorsProps cors,
    AwsProps aws,
    FcmProps fcm
) {
    public record CorsProps(String allowedOrigins) {}

    public record AwsProps(
        Boolean enabled,
        String region,
        S3Props s3,
        DynamoDbProps dynamodb
    ) {
        public record S3Props(String bucket) {}
        public record DynamoDbProps(String tableAuditoria, String endpoint) {}
    }

    public record FcmProps(
        Boolean enabled,
        String credentialsPath,
        String projectId
    ) {}
}
