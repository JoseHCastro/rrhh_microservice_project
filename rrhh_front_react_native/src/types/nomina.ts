export interface Preplanilla {
  id: string;
  periodo: string; // e.g. "Mayo 2026" or "2026-05" - I'll parse it as string
  s3KeyUri?: string;
  diasTrabajados: number;
  faltas: number;
  retrasos: number;
  permisosAprobados: number;
  licencias: number;
  horasExtra: number;
  marcacionesObservadas: number;
  fechaCreacion: string;
}
