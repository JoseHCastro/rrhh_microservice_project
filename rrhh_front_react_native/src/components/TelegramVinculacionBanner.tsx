import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';
import {
  getMiPerfil,
  generarCodigoVinculacion,
  abrirBotConCodigo,
} from '@/services/telegramVinculacionService';

// ─── Máquina de estados de la tarjeta ────────────────────────────────────────────
//  cargando      → consultando el perfil (¿ya está vinculado?)
//  vinculado     → telegramVinculado === true (tarjeta discreta, sin botón)
//  sin-vincular  → false (muestra botón "Vincular Telegram")
//  codigo        → se generó un código, se muestra + cuenta regresiva
type Estado = 'cargando' | 'vinculado' | 'sin-vincular' | 'codigo';

/** Formatea segundos a "m:ss" para la cuenta regresiva. */
function formatMmSs(totalSegundos: number): string {
  const m = Math.floor(totalSegundos / 60);
  const s = totalSegundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const TelegramVinculacionBanner: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const cardBg = isDark ? Palette.gray[600] : '#ffffff';
  const borderColor = isDark ? Palette.gray[500] : Palette.gray[200];

  const [estado, setEstado] = useState<Estado>('cargando');
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  // ─── Carga inicial del perfil ──────────────────────────────────────────────
  const cargarPerfil = useCallback(async () => {
    try {
      const perfil = await getMiPerfil();
      setEstado(perfil.telegramVinculado ? 'vinculado' : 'sin-vincular');
    } catch (err: any) {
      console.warn('Error cargando perfil Telegram:', err);
      setError('No se pudo verificar el estado de Telegram.');
      setEstado('sin-vincular');
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  // ─── Cuenta regresiva del código ───────────────────────────────────────────
  useEffect(() => {
    if (estado !== 'codigo' || segundosRestantes <= 0) {
      return;
    }
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado, segundosRestantes]);

  const expirado = estado === 'codigo' && segundosRestantes <= 0;

  // ─── Acciones ───────────────────────────────────────────────────────────────
  const handleVincular = async () => {
    setError(null);
    setAccionEnCurso(true);
    try {
      const { codigo: nuevoCodigo, expiraEnSegundos } =
        await generarCodigoVinculacion();
      setCodigo(nuevoCodigo);
      setSegundosRestantes(expiraEnSegundos);
      setEstado('codigo');
      // Abrir Telegram con el código precargado (async → manejamos el rechazo).
      await abrirBotConCodigo(nuevoCodigo).catch((err: any) => {
        console.warn('No se pudo abrir Telegram:', err);
        setError(
          'Generamos el código, pero no se pudo abrir Telegram. Ábrelo manualmente.',
        );
      });
    } catch (err: any) {
      console.warn('Error generando código de vinculación:', err);
      setError(err?.message ?? 'No se pudo generar el código. Intenta de nuevo.');
    } finally {
      setAccionEnCurso(false);
    }
  };

  const handleAbrirDeNuevo = () => {
    if (!codigo) return;
    setError(null);
    abrirBotConCodigo(codigo).catch((err: any) => {
      console.warn('No se pudo abrir Telegram:', err);
      setError('No se pudo abrir Telegram. Ábrelo manualmente.');
    });
  };

  const handleRefrescar = async () => {
    setError(null);
    setAccionEnCurso(true);
    try {
      const perfil = await getMiPerfil();
      if (perfil.telegramVinculado) {
        setEstado('vinculado');
        setCodigo(null);
      } else {
        setError('Aún no detectamos la vinculación. Pulsa "Iniciar" en el bot.');
      }
    } catch (err: any) {
      console.warn('Error refrescando perfil Telegram:', err);
      setError('No se pudo verificar la vinculación. Intenta de nuevo.');
    } finally {
      setAccionEnCurso(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  // Estado de carga inicial
  if (estado === 'cargando') {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Verificando Telegram...
        </Text>
      </View>
    );
  }

  // Tarjeta discreta: ya vinculado
  if (estado === 'vinculado') {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
            <Feather name="check-circle" size={20} color={theme.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Telegram vinculado
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ya puedes enviar tus justificaciones por el bot.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
          <Feather name="send" size={20} color={theme.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>
            Vincular Telegram
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Conecta tu cuenta para enviar justificaciones de ausencia por el bot.
          </Text>
        </View>
      </View>

      {/* Estado: código generado */}
      {estado === 'codigo' && codigo && (
        <View style={styles.codigoBlock}>
          <Text style={[styles.codigoLabel, { color: theme.textSecondary }]}>
            Tu código (escríbelo en el bot si no se abrió solo):
          </Text>
          <View
            style={[
              styles.codigoBox,
              { backgroundColor: theme.backgroundElement, borderColor },
            ]}
          >
            <Text style={[styles.codigoText, { color: theme.text }]}>
              {codigo}
            </Text>
          </View>

          {expirado ? (
            <Text style={[styles.expiradoText, { color: theme.complementary }]}>
              El código expiró, genera otro.
            </Text>
          ) : (
            <Text style={[styles.countdownText, { color: theme.textSecondary }]}>
              Expira en {formatMmSs(segundosRestantes)}
            </Text>
          )}

          {!expirado && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAbrirDeNuevo}
              style={styles.linkBtn}
            >
              <Feather name="external-link" size={14} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.primary }]}>
                Abrir Telegram de nuevo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <Text style={[styles.errorText, { color: theme.complementary }]}>
          {error}
        </Text>
      )}

      {/* Botón principal */}
      {estado === 'sin-vincular' || expirado ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleVincular}
          disabled={accionEnCurso}
          style={[
            styles.primaryBtn,
            { backgroundColor: theme.primary, opacity: accionEnCurso ? 0.6 : 1 },
          ]}
        >
          {accionEnCurso ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="send" size={16} color="#ffffff" />
              <Text style={styles.primaryBtnText}>
                {expirado ? 'Generar otro código' : 'Vincular Telegram'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : estado === 'codigo' ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRefrescar}
          disabled={accionEnCurso}
          style={[
            styles.primaryBtn,
            { backgroundColor: theme.primary, opacity: accionEnCurso ? 0.6 : 1 },
          ]}
        >
          {accionEnCurso ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="refresh-cw" size={16} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Ya vinculé / Refrescar</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  codigoBlock: {
    marginTop: 16,
    alignItems: 'center',
  },
  codigoLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  codigoBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  codigoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expiradoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
