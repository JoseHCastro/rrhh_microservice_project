import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { SolicitudAusencia } from '@/types/solicitud';
import { SolicitudItem } from '@/components/SolicitudItem';
import { Feather } from '@expo/vector-icons';

interface SolicitudListProps {
  solicitudes: SolicitudAusencia[];
  onPressSolicitud?: (solicitud: SolicitudAusencia) => void;
}

export const SolicitudList: React.FC<SolicitudListProps> = ({
  solicitudes,
  onPressSolicitud,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const hasItems = solicitudes.length > 0;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          Historial
          <Text style={[styles.listCount, { color: theme.textSecondary }]}>
            {' '}({solicitudes.length})
          </Text>
        </Text>
      </View>

      {/* List */}
      {hasItems ? (
        <View>
          {solicitudes.map((s) => (
            <SolicitudItem
              key={s.id}
              solicitud={s}
              onPress={onPressSolicitud}
            />
          ))}
        </View>
      ) : (
        /* Empty state */
        <View style={[styles.emptyContainer, { backgroundColor: isDark ? Palette.gray[600] : Palette.gray[100], borderColor: isDark ? Palette.gray[500] : Palette.gray[200] }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '18' }]}>
            <Feather name="inbox" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin solicitudes</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Aún no tienes solicitudes registradas.{'\n'}Crea una nueva para comenzar.
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
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 4,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  listCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
});
