import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Palette } from '@/constants/theme';
import { authService } from '@/services/authService';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    
    let usernameVal = email.trim();
    if (usernameVal.includes('@')) {
      usernameVal = usernameVal.split('@')[0];
    }

    try {
      await authService.login({
        username: usernameVal,
        password: password,
      });
      router.replace('/(protected)/inicio');
    } catch (err: any) {
      const msg =
        err?.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : err?.message ?? 'No se pudo conectar al servidor.';
      Alert.alert('Error de acceso', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Decorative Top Shapes */}
      <View style={styles.decorationContainer}>
        <View style={[styles.circlePrimary, { backgroundColor: Palette.primary[isDark ? 600 : 200] }]} />
        <View style={[styles.circleComplementary, { backgroundColor: Palette.complementary[isDark ? 600 : 100] }]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.primary }]}>Portal HR</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Bienvenido, inicia sesión en tu cuenta
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? Palette.gray[700] : '#ffffff', borderColor: theme.backgroundSelected }]}>
            <Input
              label="Usuario o Correo"
              placeholder="Ej: v.mendoza o v.mendoza@empresa.com"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />
            
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => Alert.alert('Info', 'Contacta a Recursos Humanos para restablecer tu contraseña.')}>
                <Text style={[styles.forgotPasswordText, { color: theme.complementary }]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title={isLoading ? 'Ingresando...' : 'Iniciar Sesión'} 
                onPress={handleLogin} 
                variant="primary" 
                disabled={isLoading}
              />
            </View>

            {isLoading && (
              <ActivityIndicator 
                size="large" 
                color={theme.primary} 
                style={styles.loader} 
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    overflow: 'hidden',
    zIndex: -1,
  },
  circlePrimary: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    top: -width * 0.8,
    left: -width * 0.2,
    opacity: 0.6,
  },
  circleComplementary: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    top: -width * 0.4,
    right: -width * 0.3,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    marginTop: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
  loader: {
    marginTop: 20,
  },
});
