import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { Header } from '@/components/Header';
import { authService } from '@/services/authService';
import { employeeService } from '@/services/employeeService';
import { nominaService } from '@/services/nominaService';
import { Preplanilla } from '@/types/nomina';
import { PreplanillaList } from '@/components/PreplanillaList';

export default function NominaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const appBg = theme.background;
  
  const [preplanillas, setPreplanillas] = useState<Preplanilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empleadoId, setEmpleadoId] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const me = await employeeService.getMyEmployeeProfile();
      if (!me) {
        throw new Error('No se encontró el perfil del empleado');
      }
      const idStr = String(me.id);
      setEmpleadoId(idStr);
      const myPreplanillas = await nominaService.getMisPreplanillas(idStr);
      setPreplanillas(myPreplanillas);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar las preplanillas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    authService.logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: appBg }]}>
      <Header activeTab="nomina" onLogout={handleLogout} />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: Palette.complementary[400] }]}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          <PreplanillaList 
            preplanillas={preplanillas} 
            empleadoId={empleadoId} 
            onPressPreplanilla={(p) => console.log('Press', p.id)}
            onDownloadPreplanilla={(p) => console.log('Download', p.id)}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
