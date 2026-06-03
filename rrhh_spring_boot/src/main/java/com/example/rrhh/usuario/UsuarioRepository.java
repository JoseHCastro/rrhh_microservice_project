package com.example.rrhh.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // IMPORTANTE: fetch EAGER de roles para evitar LazyInitializationException en el filtro JWT
    @Query("""
        SELECT u FROM Usuario u
        LEFT JOIN FETCH u.roles ur
        LEFT JOIN FETCH ur.rol
        WHERE u.username = :username
    """)
    Optional<Usuario> findByUsernameWithRoles(@Param("username") String username);

    boolean existsByUsername(String username);

    Optional<Usuario> findByEmpleadoId(Long empleadoId);

    // Para @BatchMapping en EmpleadoResolver — evita N+1
    @Query("SELECT u FROM Usuario u WHERE u.empleado.id IN :ids")
    List<Usuario> findByEmpleadoIdIn(@Param("ids") List<Long> ids);
}
