package com.rrhh.core;

import org.springframework.stereotype.Controller;
import org.springframework.graphql.data.method.annotation.QueryMapping;

@Controller
public class HelloController {

    @QueryMapping
    public String hello() {
        return "Hello from Spring Boot GraphQL!";
    }
}
