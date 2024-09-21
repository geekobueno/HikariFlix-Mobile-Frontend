import React from 'react';
import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
        },
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
