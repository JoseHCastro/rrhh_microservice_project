import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpleadosListComponent } from './empleados/empleados-list.component';
import { EmpleadoDetalleComponent } from './empleados/empleado-detalle.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { CargosComponent } from './cargos/cargos.component';
import { SolicitudesComponent } from './ausencias/solicitudes.component';
import { TiposAusenciaComponent } from './ausencias/tipos-ausencia.component';
import { MarcacionesComponent } from './asistencia/marcaciones.component';
import { DispositivosComponent } from './asistencia/dispositivos.component';
import { ReconocimientoComponent } from './asistencia/reconocimiento.component';
import { PreplanillasComponent } from './nomina/preplanillas.component';
import { UsuariosComponent } from './seguridad/usuarios.component';
import { TokensComponent } from './seguridad/tokens.component';
import { AuditoriaComponent } from './seguridad/auditoria.component';

const routes: Routes = [
  // Organización (Core HR)
  { path: 'empleados', component: EmpleadosListComponent },
  { path: 'empleados/:id', component: EmpleadoDetalleComponent },
  { path: 'departamentos', component: DepartamentosComponent },
  { path: 'cargos', component: CargosComponent },

  // Gestión de Ausencias
  { path: 'solicitudes', component: SolicitudesComponent },
  { path: 'tipos-ausencia', component: TiposAusenciaComponent },

  // Control de Asistencia
  { path: 'marcaciones', component: MarcacionesComponent },
  { path: 'dispositivos', component: DispositivosComponent },
  { path: 'reconocimiento', component: ReconocimientoComponent },

  // Nómina y Reportes
  { path: 'preplanillas', component: PreplanillasComponent },

  // Seguridad y Sistema
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'tokens', component: TokensComponent },
  { path: 'auditoria', component: AuditoriaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreHrRoutingModule {}
