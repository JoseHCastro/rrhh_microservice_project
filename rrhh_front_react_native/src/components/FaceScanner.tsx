import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import { Empleado } from '@/types/employee';

interface FaceScannerProps {
  onBack: () => void;
  onRegister: (photoBase64: string, location: Location.LocationObject) => void;
  employee: Empleado;
  isRegistering?: boolean;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  onBack,
  onRegister,
  employee,
  isRegistering = false,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>('Obteniendo ubicación...');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const cameraRef = useRef<CameraView>(null);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Permiso de GPS denegado');
        return;
      }
      
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        
        // Reverse geocoding optional, we'll just show coords for now
        setLocationName(`${loc.coords.latitude.toFixed(4)}°, ${loc.coords.longitude.toFixed(4)}°`);
      } catch (error) {
        setLocationName('No se pudo obtener ubicación');
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={[styles.permissionText, { color: theme.text }]}>
          Se necesita acceso a la cámara para el reconocimiento facial.
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <Text style={styles.btnText}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegister = async () => {
    if (!location) {
      Alert.alert('Espera', 'Aún estamos obteniendo tu ubicación GPS.');
      return;
    }
    
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.5,
        });
        
        if (photo?.base64) {
          onRegister(photo.base64, location);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo capturar la imagen.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onBack}
        >
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.statusBadge}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>CÁMARA ACTIVA</Text>
        </View>
        
        <View style={styles.timeBadge}>
          <Feather name="clock" size={12} color="#0EA5E9" />
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        />
        <View style={styles.overlayAbsolute}>
          {/* Frame corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Center Avatar Guide */}
          <Feather name="user" size={140} color="#3B82F6" style={{ opacity: 0.4 }} />
        </View>
      </View>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Centra tu rostro dentro del marco
      </Text>

      {/* GPS Info */}
      <View style={[styles.gpsCard, { backgroundColor: isDark ? '#022C22' : '#ECFDF5', borderColor: '#059669' }]}>
        <Feather name="map-pin" size={16} color="#10B981" />
        <View style={styles.gpsTextContainer}>
          <Text style={[styles.gpsTitle, { color: '#10B981' }]}>Ubicación GPS detectada</Text>
          <Text style={[styles.gpsSubtitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>{locationName}</Text>
        </View>
        <View style={styles.gpsDot} />
      </View>

      <View style={styles.footer}>
        <View style={styles.employeeInfo}>
          <Feather name="user" size={14} color={theme.textSecondary} />
          <Text style={[styles.employeeText, { color: theme.textSecondary }]}>
            {employee.nombreCompleto} · ID #{employee.id}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.registerBtn, 
            { backgroundColor: '#10B981', opacity: isRegistering ? 0.7 : 1 }
          ]}
          onPress={handleRegister}
          disabled={isRegistering}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.registerBtnText}>
            {isRegistering ? 'Procesando...' : 'Registrar Asistencia'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#FECACA',
    fontSize: 10,
    fontWeight: '800',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C4A6E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  timeText: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  overlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3B82F6',
    borderWidth: 0,
  },
  topLeft: {
    top: 40,
    left: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 40,
    right: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 40,
    left: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 40,
    right: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  hint: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  gpsTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  gpsTitle: {
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  gpsSubtitle: {
    fontSize: 12,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  footer: {
    alignItems: 'center',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  employeeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerBtn: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
