import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface HeaderProps {
  activeTab: 'inicio' | 'solicitudes' | 'nomina' | 'asistencia';
  employeeName?: string;
  username?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  employeeName,
  username,
  onLogout,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const borderColor = isDark ? '#ffffff15' : '#e2e8f0';
  const textColorSecondary = theme.textSecondary;

  const handleAvatarPress = () => {
    onLogout();
  };

  const getGreetingDate = () => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName} ${dayNum} de ${monthName} ${year}`;
  };



  // Render greeting header for "Inicio"
  if (activeTab === 'inicio') {
    return (
      <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
        <View style={styles.headerTitles}>
          <Text style={[styles.sectionTitleText, { color: theme.text }]}>
            Bienvenido
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.logoutCircle, { backgroundColor: theme.complementary + '15' }]}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={16} color={theme.complementary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render simple clean section header for other tabs
  const getTabTitle = () => {
    switch (activeTab) {
      case 'solicitudes':
        return 'Solicitudes';
      case 'nomina':
        return 'Nómina';
      case 'asistencia':
        return 'Asistencia';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
      <Text style={[styles.sectionTitleText, { color: theme.text }]}>{getTabTitle()}</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[styles.logoutCircle, { backgroundColor: theme.complementary + '15' }]}
          onPress={handleAvatarPress}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={16} color={theme.complementary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitles: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  employeeGreetingName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  waveEmoji: {
    fontSize: 22,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  sectionTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
