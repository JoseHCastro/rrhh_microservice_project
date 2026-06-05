import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './components/icon/icon.component';
import { ToastComponent } from './components/toast/toast.component';
import { ModalComponent } from './components/modal/modal.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';

/**
 * UI genérica reutilizable (sin lógica de negocio).
 * Lo importan tanto AppModule como los feature modules.
 */
@NgModule({
  declarations: [IconComponent, ToastComponent, ModalComponent, ComingSoonComponent],
  imports: [CommonModule],
  exports: [CommonModule, IconComponent, ToastComponent, ModalComponent, ComingSoonComponent],
})
export class SharedModule {}
