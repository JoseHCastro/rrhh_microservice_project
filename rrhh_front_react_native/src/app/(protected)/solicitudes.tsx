import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { SolicitudList } from '@/components/SolicitudList';
import { authService } from '@/services/authService';
import { solicitudService } from '@/services/solicitudService';
import { employeeService } from '@/services/employeeService';
import { SolicitudAusencia } from '@/types/solicitud';

export default function SolicitudesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [solicitudes, setSolicitudes] = useState<SolicitudAusencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtenemos primero el perfil del empleado autenticado para filtrar por su ID
      const empleado = await employeeService.getMyEmployeeProfile();
      const data = await solicitudService.getMisSolicitudes(
        empleado?.id ?? undefined,
      );
      setSolicitudes(data);
    } catch (err: any) {
      console.warn('Error cargando solicitudes:', err);
      setError('No se pudieron cargar las solicitudes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          authService.logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handlePressSolicitud = (solicitud: SolicitudAusencia) => {
    Alert.alert(
      solicitud.tipoAusencia.nombre,
      `Estado: ${solicitud.estado}\nDesde: ${solicitud.fechaInicio}\nHasta: ${solicitud.fechaFin}`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header activeTab="solicitudes" onLogout={handleLogout} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando solicitudes...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.complementary }]}>
            {error}
          </Text>
          <Text
            style={[styles.retryText, { color: theme.primary }]}
            onPress={fetchSolicitudes}
          >
            Reintentar
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <SolicitudList
            solicitudes={solicitudes}
            onPressSolicitud={handlePressSolicitud}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
