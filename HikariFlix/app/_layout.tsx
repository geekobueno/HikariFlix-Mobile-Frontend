import React from 'react';
import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import client from '../api/graphQL/apollo';
import { useTheme } from '../constants/theme';

export default function RootLayout() {
  const currentTheme = useTheme();

  return (
    <ApolloProvider client={client}>
      <Stack initialRouteName="splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.headerBackgroundColor,
        },
        headerTintColor: currentTheme.headerTextColor,
        headerBackVisible: true,
        headerBackTitleVisible: false
      }}>
      <Stack.Screen name="splashScreen" options={{ headerShown: false }} />
      <Stack.Screen 
          name="(tabs)" 
          options={{ 
            title: 'HikariFlix',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="category" 
          options={{ 
            title: 'Categories',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="category-anime" 
          options={{ 
            title: 'Category Anime',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="anime-details" 
          options={{ 
            title: 'Anime Details',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="popularAll" 
          options={{ 
            title: 'All Popular Anime',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="trendingAll" 
          options={{ 
            title: 'All Trending Anime',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="topAll" 
          options={{ 
            title: 'Top Anime',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="hentaiStreamScreen" 
          options={{ 
            title: 'Hentai Stream',
            headerBackVisible: true, 
          }} 
        />
        <Stack.Screen 
          name="streamScreen" 
          options={{ 
            title: 'Anime Stream',
            headerBackVisible: true, 
          }} 
        />
    </Stack>
    </ApolloProvider>
  );
}
