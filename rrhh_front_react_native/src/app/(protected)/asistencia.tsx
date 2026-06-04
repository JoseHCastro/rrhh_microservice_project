import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { authService } from '@/services/authService';

export default function AsistenciaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const appBg = theme.background;
  const textColorSecondary = theme.textSecondary;

  const handleLogout = () => {
    authService.logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: appBg }]}>
      <Header
        activeTab="asistencia"
        onLogout={handleLogout}
      />
      <View style={styles.emptyViewContainer}>
        <View style={[styles.emptyViewIconCircle, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="fingerprint" size={44} color={theme.primary} />
        </View>
        <Text style={[styles.emptyViewTitle, { color: theme.text }]}>Asistencia</Text>
        <Text style={[styles.emptyViewSubtitle, { color: textColorSecondary }]}>
          Esta sección está en desarrollo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  emptyViewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyViewIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyViewTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyViewSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
});
