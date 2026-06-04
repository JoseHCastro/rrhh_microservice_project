import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { SolicitudAusencia, EstadoSolicitud } from '@/types/solicitud';

interface SolicitudItemProps {
  solicitud: SolicitudAusencia;
  onPress?: (solicitud: SolicitudAusencia) => void;
}

// ─── Estado config ────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<
  EstadoSolicitud,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDIENTE:  { label: 'Pendiente',  color: '#D97706', bg: '#FEF3C7', icon: 'clock' },
  APROBADA:   { label: 'Aprobada',   color: '#059669', bg: '#D1FAE5', icon: 'check-circle' },
  RECHAZADA:  { label: 'Rechazada',  color: '#DC2626', bg: '#FEE2E2', icon: 'x-circle' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Mapa de tipos de ausencia conocidos ─────────────────────────────────────
// Claves normalizadas (minúsculas) para comparación robusta.

type TipoConfig = {
  color: string;
  icon: React.ReactNode;
};

const TIPO_MAP: Record<string, TipoConfig> = {
  // ID 1 — Vacación
  'vacación': {
    color: '#0284C7',
    icon: <Feather name="sun" size={20} color="#0284C7" />,
  },
  'vacacion': {
    color: '#0284C7',
    icon: <Feather name="sun" size={20} color="#0284C7" />,
  },
  // ID 2 — Permiso Médico
  'permiso médico': {
    color: '#DC2626',
    icon: <MaterialCommunityIcons name="hospital-box-outline" size={20} color="#DC2626" />,
  },
  'permiso medico': {
    color: '#DC2626',
    icon: <MaterialCommunityIcons name="hospital-box-outline" size={20} color="#DC2626" />,
  },
  // ID 3 — Licencia por Paternidad/Maternidad
  'licencia por paternidad/maternidad': {
    color: '#7C3AED',
    icon: <MaterialCommunityIcons name="baby-carriage" size={20} color="#7C3AED" />,
  },
  // ID 4 — Permiso Personal sin Goce de Haber
  'permiso personal sin goce de haber': {
    color: '#D97706',
    icon: <Feather name="clock" size={20} color="#D97706" />,
  },
};

/** Obtiene la configuración visual del tipo de ausencia por nombre (insensible a mayúsculas). */
function getTipoConfig(nombre: string): TipoConfig {
  const key = nombre.toLowerCase().trim();
  return (
    TIPO_MAP[key] ?? {
      // Fallback para tipos no previstos
      color: '#059669',
      icon: <Feather name="file-text" size={20} color="#059669" />,
    }
  );
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  // Handles "YYYY-MM-DD" or ISO datetime "YYYY-MM-DDTHH:mm:ss"
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return dateStr;
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function calcDias(fechaInicio: string, fechaFin: string): number {
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SolicitudItem: React.FC<SolicitudItemProps> = ({
  solicitud,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const cardBg = isDark ? Palette.gray[600] : '#ffffff';
  const borderColor = isDark ? Palette.gray[500] : Palette.gray[200];

  const tipoConfig = getTipoConfig(solicitud.tipoAusencia?.nombre ?? '');
  const accentColor = tipoConfig.color;
  const estado = ESTADO_CONFIG[solicitud.estado] ?? ESTADO_CONFIG['PENDIENTE'];
  const dias = calcDias(solicitud.fechaInicio, solicitud.fechaFin);

  // Guard: si tipoAusencia no viene del backend, no renderizar
  if (!solicitud.tipoAusencia) return null;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={() => onPress?.(solicitud)}
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
        {tipoConfig.icon}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: tipo name + estado badge */}
        <View style={styles.topRow}>
          <Text style={[styles.tipoText, { color: theme.text }]} numberOfLines={1}>
            {solicitud.tipoAusencia.nombre}
          </Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.bg }]}>
            <Feather
              name={estado.icon as any}
              size={11}
              color={estado.color}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.estadoText, { color: estado.color }]}>
              {estado.label}
            </Text>
          </View>
        </View>

        {/* Date range */}
        <View style={styles.dateRow}>
          <Feather name="calendar" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatDateDisplay(solicitud.fechaInicio)} — {formatDateDisplay(solicitud.fechaFin)}
          </Text>
        </View>

        {/* Days pill + aprobador */}
        <View style={styles.bottomRow}>
          <View style={[styles.daysPill, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.daysText, { color: accentColor }]}>
              {dias} {dias === 1 ? 'día' : 'días'}
            </Text>
          </View>
          {solicitud.aprobador && (
            <Text style={[styles.aprobadorText, { color: theme.textSecondary }]} numberOfLines={1}>
              ✓ {solicitud.aprobador.username}
            </Text>
          )}
        </View>
      </View>

      {/* Chevron */}
      {onPress && (
        <Feather name="chevron-right" size={18} color={theme.textSecondary} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginVertical: 16,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipoText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  daysPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aprobadorText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  chevron: {
    marginRight: 14,
    flexShrink: 0,
  },
});
