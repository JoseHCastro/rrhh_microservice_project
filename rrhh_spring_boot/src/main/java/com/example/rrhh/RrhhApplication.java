package com.example.rrhh;

import com.example.rrhh.config.properties.AppProperties;
import com.example.rrhh.config.properties.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
@EnableScheduling
@EnableConfigurationProperties({ JwtProperties.class, AppProperties.class })
public class RrhhApplication {

    public static void main(String[] args) {
        SpringApplication.run(RrhhApplication.class, args);
    }
}
