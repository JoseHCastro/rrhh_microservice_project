import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const TabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? theme.backgroundElement : '#ffffff';
  const borderColor = isDark ? '#ffffff15' : '#e2e8f0';
  const textColorSecondary = theme.textSecondary;

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const getIcon = () => {
          const color = isFocused ? theme.primary : textColorSecondary;
          switch (route.name) {
            case 'inicio':
              return <Feather name="home" size={24} color={color} />;
            case 'solicitudes':
              return <Feather name="file-text" size={24} color={color} />;
            case 'nomina':
              return <Feather name="dollar-sign" size={24} color={color} />;
            case 'asistencia':
              return <MaterialCommunityIcons name="fingerprint" size={26} color={color} />;
            default:
              return null;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={onPress}
            activeOpacity={0.6}
          >
            {getIcon()}
            <Text style={[styles.tabButtonText, { color: isFocused ? theme.primary : textColorSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: 28,
    paddingTop: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
