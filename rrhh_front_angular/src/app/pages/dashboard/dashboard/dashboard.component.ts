import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardData, DashboardService } from '../dashboard.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { environment } from '../../../../environments/environment';

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

  // BI KPIs
  loadingKpis = false;
  errorKpis = '';
  kpiFilter: 'historico' | 'este_ano' | 'este_mes' | 'rango' = 'historico';
  startDate: string = '';
  endDate: string = '';

  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Tasa de Ausentismo Histórica (%)' } } };
  public lineChartType: ChartType = 'line';

  public doughnutChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public doughnutChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Gasto en Horas Extras por Depto ($)' } } };
  public doughnutChartType: ChartType = 'doughnut';

  public barChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public barChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Índice de Retrasos por Departamento' } } };
  public barChartType: ChartType = 'bar';

  constructor(private dashboard: DashboardService, private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
    this.loadKpis();
  }

  onFilterChange(): void {
    const today = new Date();
    
    if (this.kpiFilter === 'este_ano') {
      this.startDate = `${today.getFullYear()}-01-01`;
      this.endDate = `${today.getFullYear()}-12-31`;
      this.loadKpis();
    } else if (this.kpiFilter === 'este_mes') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      this.startDate = `${year}-${month}-01`;
      this.endDate = `${year}-${month}-${lastDay}`;
      this.loadKpis();
    } else if (this.kpiFilter === 'historico') {
      this.startDate = '';
      this.endDate = '';
      this.loadKpis();
    }
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

  loadKpis(): void {
    this.loadingKpis = true;
    this.errorKpis = '';
    let url = `${environment.fastapiGql.replace('/graphql', '')}/api/dashboard/kpis`;
    
    // Anexar query parameters si hay rango
    if (this.startDate && this.endDate) {
      url += `?start_date=${this.startDate}&end_date=${this.endDate}`;
    }

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.lineChartData = {
          labels: res.ausentismo.labels,
          datasets: [{ data: res.ausentismo.data, label: 'Tasa de Ausentismo (%)', borderColor: '#42A5F5', backgroundColor: 'rgba(66, 165, 245, 0.2)', fill: true }]
        };

        this.doughnutChartData = {
          labels: res.gasto_horas_extra.labels,
          datasets: [{ data: res.gasto_horas_extra.data, label: 'Gasto ($)' }]
        };

        this.barChartData = {
          labels: res.retrasos.labels,
          datasets: [{ data: res.retrasos.data, label: 'Total Retrasos', backgroundColor: '#EF5350' }]
        };
        this.loadingKpis = false;
      },
      error: (e) => {
        this.errorKpis = 'Error al cargar los KPIs desde FastAPI.';
        this.loadingKpis = false;
        console.error(e);
      }
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
