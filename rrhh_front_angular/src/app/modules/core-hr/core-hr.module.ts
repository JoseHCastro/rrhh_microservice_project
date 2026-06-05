import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../_metronic/shared/shared.module';
import { CoreHrRoutingModule } from './core-hr-routing.module';
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

@NgModule({
  declarations: [
    EmpleadosListComponent,
    EmpleadoDetalleComponent,
    DepartamentosComponent,
    CargosComponent,
    SolicitudesComponent,
    TiposAusenciaComponent,
    MarcacionesComponent,
    DispositivosComponent,
    ReconocimientoComponent,
    PreplanillasComponent,
    UsuariosComponent,
    TokensComponent,
    AuditoriaComponent,
  ],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, CoreHrRoutingModule],
})
export class CoreHrModule {}
