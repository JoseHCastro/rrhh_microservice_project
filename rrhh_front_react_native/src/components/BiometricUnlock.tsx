import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

interface BiometricUnlockProps {
  onUnlockSuccess: () => void;
  onInitiateScan: () => void;
  isScanning?: boolean;
}

export const BiometricUnlock: React.FC<BiometricUnlockProps> = ({
  onUnlockSuccess,
  onInitiateScan,
  isScanning = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Feather name="check-circle" size={14} color="#10B981" />
          <Text style={styles.badgeText}>Verificación Biométrica</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Desbloqueo con{'\n'}Huella Dactilar
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Coloca tu dedo en el sensor para validar tu identidad antes de marcar asistencia
        </Text>

        <View style={styles.sensorContainer}>
          <View style={[styles.circle3, { borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <View style={[styles.circle2, { borderColor: isDark ? '#334155' : '#CBD5E1' }]}>
              <View style={[styles.circle1, { borderColor: isDark ? '#475569' : '#94A3B8' }]}>
                <MaterialCommunityIcons 
                  name="fingerprint" 
                  size={72} 
                  color={isDark ? '#94A3B8' : '#64748B'} 
                />
              </View>
            </View>
          </View>
        </View>
        
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          — Toca el botón para iniciar —
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Palette.primary[400] }]}
        onPress={onInitiateScan}
        disabled={isScanning}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="fingerprint" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {isScanning ? 'Escaneando...' : 'Iniciar Escaneo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 24,
  },
  badgeText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  sensorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circle3: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle2: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
