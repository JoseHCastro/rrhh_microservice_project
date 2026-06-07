import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { BiometricUnlock } from '@/components/BiometricUnlock';
import { FaceScanner } from '@/components/FaceScanner';
import { authService } from '@/services/authService';
import { employeeService } from '@/services/employeeService';
import { asistenciaService } from '@/services/asistenciaService';
import { Empleado } from '@/types/employee';

type Step = 'UNLOCK' | 'SCAN';

export default function AsistenciaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [currentStep, setCurrentStep] = useState<Step>('UNLOCK');
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [employee, setEmployee] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const me = await employeeService.getMyEmployeeProfile();
        setEmployee(me);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadEmployee();
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.replace('/');
  };

  const initiateBiometricUnlock = async () => {
    setIsScanningBiometrics(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometría no disponible', 
          'Tu dispositivo no tiene biometría configurada. Por favor, usa otro método.'
        );
        // Fallback for demo purposes
        setCurrentStep('SCAN');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad para marcar asistencia',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        setCurrentStep('SCAN');
      } else {
        Alert.alert('Autenticación fallida', 'No se pudo verificar tu identidad.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al usar la biometría.');
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  const handleRegisterAttendance = async (photoBase64: string, location: Location.LocationObject) => {
    if (!employee) return;
    
    setIsRegistering(true);
    try {
      // Llamada real al servicio de asistencia en FastAPI
      await asistenciaService.registrar(
        employee.id, 
        photoBase64, 
        location.coords.latitude, 
        location.coords.longitude
      );
      
      Alert.alert('Éxito', 'Asistencia registrada correctamente.', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentStep('UNLOCK');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrar la asistencia.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>No se pudo cargar el perfil del empleado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {currentStep === 'UNLOCK' && (
        <>
          <Header activeTab="asistencia" onLogout={handleLogout} />
          <BiometricUnlock 
            onInitiateScan={initiateBiometricUnlock}
            onUnlockSuccess={() => setCurrentStep('SCAN')}
            isScanning={isScanningBiometrics}
          />
        </>
      )}

      {currentStep === 'SCAN' && (
        <FaceScanner 
          onBack={() => setCurrentStep('UNLOCK')}
          onRegister={handleRegisterAttendance}
          employee={employee}
          isRegistering={isRegistering}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
