import { Component } from '@angular/core';
import { LayoutService } from '../../shared/services/layout.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  constructor(public nav: LayoutService) {}
}
