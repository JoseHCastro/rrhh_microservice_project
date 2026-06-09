from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard BI"])

@router.get("/kpis")
def get_dashboard_kpis(start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    # Connect directly via pandas using the SQLAlchemy connection
    conn = db.connection()
    
    try:
        # Construct date filters
        prep_where = "WHERE 1=1"
        ra_where = "WHERE 1=1"
        
        if start_date:
            prep_where += f" AND fecha_creacion >= '{start_date}'"
            ra_where += f" AND r.hora_entrada >= '{start_date}'"
        if end_date:
            prep_where += f" AND fecha_creacion <= '{end_date} 23:59:59'"
            ra_where += f" AND r.hora_entrada <= '{end_date} 23:59:59'"

        # 1. Tasa de Ausentismo (Line Chart)
        df_ausentismo = pd.read_sql(
            f"SELECT periodo, faltas, dias_trabajados FROM preplanillas {prep_where}", 
            conn
        )
        
        # Calcular totales por periodo con pandas
        if not df_ausentismo.empty:
            ausentismo_grouped = df_ausentismo.groupby('periodo').sum().reset_index()
            ausentismo_grouped['tasa'] = (ausentismo_grouped['faltas'] / (ausentismo_grouped['faltas'] + ausentismo_grouped['dias_trabajados']) * 100).fillna(0).round(2)
            ausentismo_labels = ausentismo_grouped['periodo'].tolist()
            ausentismo_data = ausentismo_grouped['tasa'].tolist()
        else:
            ausentismo_labels = []
            ausentismo_data = []

        # 2. Gasto en Horas Extras por Departamento (Doughnut Chart)
        prep_where_gasto = prep_where.replace("fecha_creacion", "p.fecha_creacion")
        query_gasto = f"""
            SELECT d.nombre as departamento, p.horas_extra, c.salario_por_hora 
            FROM preplanillas p
            JOIN empleados e ON p.empleado_id = e.id
            JOIN departamentos d ON e.departamento_id = d.id
            JOIN cargos c ON e.cargo_id = c.id
            {prep_where_gasto}
        """
        df_gasto = pd.read_sql(query_gasto, conn)
        
        if not df_gasto.empty:
            df_gasto['gasto_total'] = df_gasto['horas_extra'] * df_gasto['salario_por_hora'] * 2
            gasto_grouped = df_gasto.groupby('departamento')['gasto_total'].sum().reset_index()
            gasto_grouped['gasto_total'] = gasto_grouped['gasto_total'].astype(float).round(2)
            
            gasto_labels = gasto_grouped['departamento'].tolist()
            gasto_data = gasto_grouped['gasto_total'].tolist()
        else:
            gasto_labels = []
            gasto_data = []

        # 3. Índice de Retrasos por Departamento (Bar Chart)
        query_retrasos = f"""
            SELECT d.nombre as departamento, r.estado
            FROM registro_asistencia r
            JOIN empleados e ON r.empleado_id = e.id
            JOIN departamentos d ON e.departamento_id = d.id
            {ra_where}
        """
        df_retrasos = pd.read_sql(query_retrasos, conn)
        
        if not df_retrasos.empty:
            # Filtramos solo los retrasos en Pandas para demostrar uso de DataFrames
            df_solo_retrasos = df_retrasos[df_retrasos['estado'] == 'RETRASO']
            retrasos_grouped = df_solo_retrasos.groupby('departamento').size().reset_index(name='total_retrasos')
            
            # Ordenamos de mayor a menor
            retrasos_grouped = retrasos_grouped.sort_values(by='total_retrasos', ascending=False)
            
            retrasos_labels = retrasos_grouped['departamento'].tolist()
            retrasos_data = retrasos_grouped['total_retrasos'].tolist()
        else:
            retrasos_labels = []
            retrasos_data = []
            
        return {
            "ausentismo": {
                "labels": ausentismo_labels,
                "data": ausentismo_data
            },
            "gasto_horas_extra": {
                "labels": gasto_labels,
                "data": gasto_data
            },
            "retrasos": {
                "labels": retrasos_labels,
                "data": retrasos_data
            }
        }
    except Exception as e:
        return {"error": str(e)}
