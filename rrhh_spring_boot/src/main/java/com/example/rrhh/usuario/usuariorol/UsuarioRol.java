package com.example.rrhh.usuario.usuariorol;

import com.example.rrhh.usuario.Usuario;
import com.example.rrhh.usuario.rol.Rol;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario_roles")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class UsuarioRol {

    @EmbeddedId
    private UsuarioRolId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id", foreignKey = @ForeignKey(name = "fk_ur_usuario"))
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("rolId")
    @JoinColumn(name = "rol_id", foreignKey = @ForeignKey(name = "fk_ur_rol"))
    private Rol rol;
}
