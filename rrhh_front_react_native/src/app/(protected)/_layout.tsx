import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { sessionStore } from '@/services/sessionStore';
import { TabBar } from '@/components/TabBar';

export default function ProtectedLayout() {
  useEffect(() => {
    if (!sessionStore.isAuthenticated()) {
      router.replace('/');
    }
  }, []);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="solicitudes" options={{ title: 'Solicitudes' }} />
      <Tabs.Screen name="nomina" options={{ title: 'Nómina' }} />
      <Tabs.Screen name="asistencia" options={{ title: 'Asistencia' }} />
    </Tabs>
  );
}
