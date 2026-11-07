
import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#A0452C',
        tabBarInactiveTintColor: '#C7B6A5',

        tabBarStyle: {
          backgroundColor: '#FFFDF9',
          borderTopWidth: 1,
          borderTopColor: '#EAE0D0',

          // Altura original + área dos botões do Android
          height: 60 + bottomInset,

          // Mantém ícones e textos acima da navegação
          paddingBottom: Math.max(10, bottomInset),
          paddingTop: 5,

          // Evita sobreposição por posicionamento absoluto
          position: 'relative',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        tabBarIconStyle: {
          marginTop: 0,
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => (
            <Feather
              name="compass"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Feather
              name="map"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <Feather
              name="heart"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="request"
        options={{
          title: 'Solicitações',
          tabBarIcon: ({ color }) => (
            <Feather
              name="clipboard"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
