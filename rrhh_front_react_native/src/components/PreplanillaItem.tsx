import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { Preplanilla } from '@/types/nomina';

interface PreplanillaItemProps {
  preplanilla: Preplanilla;
  isRecent?: boolean;
  onDownload?: (preplanilla: Preplanilla) => void;
  onPress?: (preplanilla: Preplanilla) => void;
}

export const PreplanillaItem: React.FC<PreplanillaItemProps> = ({
  preplanilla,
  isRecent = false,
  onDownload,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(preplanilla)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? Palette.gray[700] : '#ffffff',
          borderColor: isDark ? Palette.gray[600] : Palette.gray[200],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.periodBadge, { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }]}>
            <Text style={styles.periodText}>{preplanilla.periodo}</Text>
          </View>
          {isRecent && (
            <View style={[styles.recentBadge, { backgroundColor: isDark ? '#3F3F2A' : '#FEF9C3' }]}>
              <Feather name="star" size={12} color="#EAB308" />
              <Text style={[styles.recentText, { color: '#EAB308' }]}>Reciente</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{preplanilla.diasTrabajados}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Días</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{preplanilla.faltas}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Faltas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{preplanilla.retrasos}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Retrasos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {Number(preplanilla.horasExtra || 0).toFixed(2)}h
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>H. Extra</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: isDark ? Palette.gray[600] : Palette.gray[200] }]} />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.downloadButton, { borderColor: theme.primary }]}
          onPress={() => onDownload?.(preplanilla)}
          activeOpacity={0.7}
        >
          <Feather name="download-cloud" size={16} color={theme.primary} />
          <Text style={[styles.downloadText, { color: theme.primary }]}>Descargar Preplanilla</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  periodText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recentText: {
    fontWeight: '600',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  downloadText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
