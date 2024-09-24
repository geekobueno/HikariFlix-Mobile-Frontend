import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from '../api/lib/apollo';
import { useTheme } from '../constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const currentTheme = useTheme();

  return (
    <ApolloProvider client={client}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: currentTheme.headerBackgroundColor,
          },
          headerTintColor: currentTheme.headerTextColor,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="category" 
          options={{ 
            title: 'Categories',
          }} 
        />
        <Stack.Screen 
          name="category-anime" 
          options={{ 
            title: 'Category Anime',
          }} 
        />
        <Stack.Screen 
          name="anime-details" 
          options={{ 
            title: 'Anime Details',
          }} 
        />
        <Stack.Screen 
          name="popularAll" 
          options={{ 
            title: 'All Popular Anime',
          }} 
        />
        <Stack.Screen 
          name="trendingAll" 
          options={{ 
            title: 'All Trending Anime',
          }} 
        />
        <Stack.Screen 
          name="all-top-anime" 
          options={{ 
            title: 'Top Anime',
          }} 
        />
        {/* Add other screens as needed */}
      </Stack>
    </ApolloProvider>
  );
}
