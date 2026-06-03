package com.example.rrhh.config.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Provee el nombre del usuario autenticado para los campos
 * @CreatedBy y @LastModifiedBy de Spring Data JPA Auditing.
 */
@Component("auditorAwareImpl")
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() ||
            auth.getPrincipal().equals("anonymousUser")) {
            return Optional.of("SYSTEM");  // Para seeds o CRON jobs
        }

        return Optional.of(auth.getName());
    }
}
