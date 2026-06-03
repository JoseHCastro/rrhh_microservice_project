package com.example.rrhh.proyecto.tokenpush;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TokenPushResolver {

    private final TokenPushService tokenPushService;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public TokenPush registrarTokenPush(@Argument TokenPushInput input) {
        return tokenPushService.registrar(input.tokenFcm(), input.dispositivo());
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean revocarTokenPush(@Argument String tokenFcm) {
        return tokenPushService.revocar(tokenFcm);
    }

    public record TokenPushInput(String tokenFcm, String dispositivo) {}
}
