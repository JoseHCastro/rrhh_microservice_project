import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { authService } from '@/services/authService';
import { Header } from '@/components/Header';
import { employeeService } from '@/services/employeeService';
import { Empleado } from '@/types/employee';

export default function InicioScreen() {
  const [employee, setEmployee] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = isDark ? Colors.dark : Colors.light;
  const appBg = theme.background;
  const cardBg = isDark ? Palette.gray[700] : '#ffffff';
  const borderColor = theme.backgroundSelected;
  const textColorSecondary = theme.textSecondary;

  const user = authService.getCurrentUser();

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const matchedEmp = await employeeService.getMyEmployeeProfile();
        setEmployee(matchedEmp);
      } catch (err) {
        console.warn('Error fetching data from GraphQL:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return timeStr;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: appBg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: textColorSecondary }]}>Cargando Perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: appBg }]}>
      <Header
        activeTab="inicio"
        employeeName={employee?.nombreCompleto}
        username={user?.username}
        onLogout={handleLogout}
      />

      <ScrollView 
        style={styles.contentScroll} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {employee ? (
          <View style={styles.tabContent}>
            {/* ── Tarjeta del Empleado (Ficha) ── */}
            <View style={[styles.employeeCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardNameCol}>
                  <Text style={[styles.cardFullName, { color: theme.text }]}>{employee.nombreCompleto}</Text>
                  <Text style={[styles.cardRole, { color: textColorSecondary }]}>{employee.cargo.nombre}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: employee.estado === 'ACTIVO' ? '#10B98120' : '#EF444420' }]}>
                  <View style={[styles.statusDot, { backgroundColor: employee.estado === 'ACTIVO' ? '#10B981' : '#EF4444' }]} />
                  <Text style={[styles.statusText, { color: employee.estado === 'ACTIVO' ? '#10B981' : '#EF4444' }]}>
                    {employee.estado}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottomRow}>
                <View style={[styles.deptPill, { backgroundColor: theme.primary + '20' }]}>
                  <Feather name="briefcase" size={16} color={theme.primary} />
                  <Text style={[styles.deptPillText, { color: theme.primary }]}>{employee.departamento.nombre}</Text>
                </View>

                <Text style={[styles.empCode, { color: textColorSecondary }]}>EMP #{String(employee.id).padStart(3, '0')}</Text>
              </View>
            </View>

            {/* ── Mi Horario ── */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Horario de Trabajo</Text>
            </View>

            <View style={[styles.scheduleCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.scheduleCol}>
                <View style={[styles.scheduleIconBg, { backgroundColor: theme.primary + '20' }]}>
                  <Feather name="sun" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.scheduleLabel, { color: textColorSecondary }]}>Entrada</Text>
                <Text style={[styles.scheduleTime, { color: theme.text }]}>{formatTime(employee.horaEntrada || '08:30:00')}</Text>
              </View>

              <View style={[styles.scheduleDivider, { backgroundColor: borderColor }]} />

              <View style={styles.scheduleCol}>
                <View style={[styles.scheduleIconBg, { backgroundColor: theme.complementary + '20' }]}>
                  <Feather name="moon" size={24} color={theme.complementary} />
                </View>
                <Text style={[styles.scheduleLabel, { color: textColorSecondary }]}>Salida</Text>
                <Text style={[styles.scheduleTime, { color: theme.text }]}>{formatTime(employee.horaSalida || '17:30:00')}</Text>
              </View>
            </View>

            {/* ── Datos Personales ── */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Personal</Text>
            </View>

            <View style={[styles.personalDataCard, { backgroundColor: cardBg, borderColor }]}>
              {/* Email */}
              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.dataIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Feather name="mail" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.dataLabel, { color: textColorSecondary }]}>Email</Text>
                </View>
                <Text style={[styles.dataValue, { color: theme.text }]} numberOfLines={1}>
                  {user?.username?.toLowerCase()}@empresa.com
                </Text>
              </View>
              <View style={[styles.rowDivider, { backgroundColor: borderColor }]} />

              {/* Teléfono */}
              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.dataIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Feather name="phone" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.dataLabel, { color: textColorSecondary }]}>Teléfono</Text>
                </View>
                <Text style={[styles.dataValue, { color: theme.text }]}>{employee.telefono || 'No registrado'}</Text>
              </View>
              <View style={[styles.rowDivider, { backgroundColor: borderColor }]} />

              {/* Carnet Identidad */}
              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.dataIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Feather name="credit-card" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.dataLabel, { color: textColorSecondary }]}>C.I.</Text>
                </View>
                <Text style={[styles.dataValue, { color: theme.text }]}>{employee.carnetIdentidad || 'No registrado'}</Text>
              </View>
              <View style={[styles.rowDivider, { backgroundColor: borderColor }]} />

              {/* Fecha Contratación */}
              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.dataIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Feather name="calendar" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.dataLabel, { color: textColorSecondary }]}>Contratación</Text>
                </View>
                <Text style={[styles.dataValue, { color: theme.text }]}>{formatDate(employee.fechaContratacion)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyEmployeeContainer}>
            <Feather name="user-x" size={48} color={theme.complementary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyViewTitle, { color: theme.text }]}>Sin Perfil de Empleado</Text>
            <Text style={[styles.emptyViewSubtitle, { color: textColorSecondary, marginTop: 8 }]}>
              Tu usuario no está asociado a un registro de empleado. Contacta a RRHH.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  tabContent: {
    width: '100%',
  },
  employeeCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardNameCol: {
    flex: 1,
    paddingRight: 12,
  },
  cardFullName: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  cardRole: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  deptPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  empCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    width: '100%',
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scheduleCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  scheduleCol: {
    flex: 1,
    alignItems: 'center',
  },
  scheduleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 22,
    fontWeight: '800',
  },
  scheduleDivider: {
    width: 1,
    height: 60,
  },
  personalDataCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  dataRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dataIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    width: '100%',
  },
  emptyEmployeeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
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
