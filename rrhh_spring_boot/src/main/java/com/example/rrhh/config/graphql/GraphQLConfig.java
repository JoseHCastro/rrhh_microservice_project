package com.example.rrhh.config.graphql;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

/**
 * Registra los scalares personalizados (Date, DateTime, Time, BigDecimal)
 * usando la librería graphql-java-extended-scalars.
 */
@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
            .scalar(ExtendedScalars.Date)            // LocalDate
            .scalar(ExtendedScalars.DateTime)        // LocalDateTime
            .scalar(ExtendedScalars.Time)            // LocalTime
            .scalar(ExtendedScalars.GraphQLBigDecimal);
    }
}
