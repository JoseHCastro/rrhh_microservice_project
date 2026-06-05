import { Component, OnInit } from '@angular/core';
import { ThemeModeService } from './_metronic/shared/services/theme-mode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'TechVentures RRHH';

  constructor(private theme: ThemeModeService) {}

  ngOnInit(): void {
    this.theme.init();
  }
}
