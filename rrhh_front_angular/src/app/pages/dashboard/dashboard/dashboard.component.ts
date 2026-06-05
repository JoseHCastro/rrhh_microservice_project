import { Component, OnInit } from '@angular/core';
import { DashboardData, DashboardService } from '../dashboard.service';

interface DeptStat {
  nombre: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  data?: DashboardData;
  loading = true;
  error = '';

  totalEmpleados = 0;
  activos = 0;
  totalDepartamentos = 0;
  pendientes = 0;
  estadoSistema = '—';
  deptStats: DeptStat[] = [];

  readonly deptColors = ['var(--brand)', 'var(--ok)', 'var(--warn)', 'var(--info)', 'var(--bad)', 'var(--brand2)'];

  constructor(private dashboard: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.dashboard.load().subscribe({
      next: (d) => {
        this.data = d;
        this.compute(d);
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.status === 0
            ? 'Sin conexión con el backend (localhost:8080). Inicia el servicio Spring Boot.'
            : e?.message || 'Error al cargar el dashboard';
      },
    });
  }

  private compute(d: DashboardData): void {
    const emps = d.empleados.content ?? [];
    this.totalEmpleados = d.empleados.pageInfo.totalElements;
    this.activos = emps.filter((e) => e.estado === 'ACTIVO').length;
    this.totalDepartamentos = d.departamentos.length;
    this.pendientes = d.solicitudesAusencia.length;
    this.estadoSistema = d.sistemaConfigEstado?.estado ?? '—';

    const counts = new Map<string, number>();
    for (const e of emps) {
      const n = e.departamento?.nombre ?? 'Sin departamento';
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    this.deptStats = [...counts.entries()]
      .map(([nombre, count]) => ({ nombre, count, pct: Math.round((count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  }
}
