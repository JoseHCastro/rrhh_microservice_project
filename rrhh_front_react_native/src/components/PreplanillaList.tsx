import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { Preplanilla } from '@/types/nomina';
import { PreplanillaItem } from '@/components/PreplanillaItem';
import { Feather } from '@expo/vector-icons';

interface PreplanillaListProps {
  preplanillas: Preplanilla[];
  empleadoId?: string;
  onPressPreplanilla?: (preplanilla: Preplanilla) => void;
  onDownloadPreplanilla?: (preplanilla: Preplanilla) => void;
}

export const PreplanillaList: React.FC<PreplanillaListProps> = ({
  preplanillas,
  empleadoId,
  onPressPreplanilla,
  onDownloadPreplanilla,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const hasItems = preplanillas.length > 0;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          Mis Preplanillas
        </Text>
        <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>
          Ciclo Mar — May 2026
        </Text>
      </View>

      {/* List */}
      {hasItems ? (
        <View>
          {preplanillas.map((p, index) => (
            <PreplanillaItem
              key={p.id}
              preplanilla={p}
              isRecent={index === 0} // First item is recent
              onPress={onPressPreplanilla}
              onDownload={onDownloadPreplanilla}
            />
          ))}
        </View>
      ) : (
        /* Empty state */
        <View style={[styles.emptyContainer, { backgroundColor: isDark ? Palette.gray[600] : Palette.gray[100], borderColor: isDark ? Palette.gray[500] : Palette.gray[200] }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '18' }]}>
            <Feather name="file-text" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin preplanillas</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            No hay preplanillas generadas para este periodo.
          </Text>
        </View>
      )}

      {/* Info footer */}
      {empleadoId && (
        <View style={[styles.infoFooter, { backgroundColor: isDark ? Palette.gray[700] : Palette.gray[100], borderColor: isDark ? Palette.gray[600] : Palette.gray[200] }]}>
          <Feather name="info" size={14} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Datos obtenidos vía GraphQL · preplanillas(empleadoId: {empleadoId})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingLeft: 4,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  listSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
  },
});
