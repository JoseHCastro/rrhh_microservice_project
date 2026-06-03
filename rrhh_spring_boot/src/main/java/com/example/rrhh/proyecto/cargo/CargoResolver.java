package com.example.rrhh.proyecto.cargo;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class CargoResolver {

    private final CargoService cargoService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Cargo> cargos() {
        return cargoService.findAll();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Cargo cargo(@Argument Long id) {
        return cargoService.findById(id);
    }
}
