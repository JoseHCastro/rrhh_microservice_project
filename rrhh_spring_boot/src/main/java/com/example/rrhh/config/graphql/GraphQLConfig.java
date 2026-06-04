package com.example.rrhh.config.graphql;

import graphql.language.StringValue;
import graphql.scalars.ExtendedScalars;
import graphql.schema.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Registra los scalares personalizados (Date, LocalDateTime, LocalTime, BigDecimal)
 * usando la librería graphql-java-extended-scalars.
 *
 * Nota: ExtendedScalars.DateTime espera OffsetDateTime, pero nuestras entidades
 * usan LocalDateTime. Por eso registramos un scalar propio para LocalDateTime.
 */
@Configuration
public class GraphQLConfig {

    /** Scalar personalizado para java.time.LocalDateTime (sin zona horaria). */
    private static final GraphQLScalarType LOCAL_DATE_TIME_SCALAR = GraphQLScalarType.newScalar()
        .name("LocalDateTime")
        .description("Scalar para java.time.LocalDateTime en formato ISO-8601 (ej: 2026-06-04T17:30:00)")
        .coercing(new Coercing<LocalDateTime, String>() {

            @Override
            public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                if (dataFetcherResult instanceof LocalDateTime ldt) {
                    return ldt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                }
                throw new CoercingSerializeException(
                    "No se puede serializar " + dataFetcherResult + " como LocalDateTime");
            }

            @Override
            public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
                try {
                    return LocalDateTime.parse(input.toString(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    throw new CoercingParseValueException("Valor inválido para LocalDateTime: " + input);
                }
            }

            @Override
            public LocalDateTime parseLiteral(Object input) throws CoercingParseLiteralException {
                if (input instanceof StringValue sv) {
                    try {
                        return LocalDateTime.parse(sv.getValue(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    } catch (DateTimeParseException e) {
                        throw new CoercingParseLiteralException("Literal inválido para LocalDateTime: " + sv.getValue());
                    }
                }
                throw new CoercingParseLiteralException("Tipo de literal no soportado: " + input);
            }
        })
        .build();

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
            .scalar(ExtendedScalars.Date)             // LocalDate
            .scalar(LOCAL_DATE_TIME_SCALAR)            // LocalDateTime (custom)
            .scalar(ExtendedScalars.LocalTime)         // LocalTime (sin offset)
            .scalar(ExtendedScalars.GraphQLBigDecimal);
    }
}
