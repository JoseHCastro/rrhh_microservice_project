package com.example.rrhh.config;

import com.example.rrhh.config.properties.AppProperties;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

/**
 * Configuración de Firebase Cloud Messaging.
 * Solo se activa si app.fcm.enabled=true en application.yml.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirebaseConfig {

    private final AppProperties appProperties;

    @Bean
    @ConditionalOnProperty(name = "app.fcm.enabled", havingValue = "true")
    public FirebaseMessaging firebaseMessaging() throws IOException {
        String credPath = appProperties.fcm().credentialsPath();

        try (FileInputStream serviceAccount = new FileInputStream(credPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setProjectId(appProperties.fcm().projectId())
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            log.info("Firebase inicializado correctamente");
            return FirebaseMessaging.getInstance();
        }
    }
}
