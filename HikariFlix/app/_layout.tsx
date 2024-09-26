import React from 'react';
import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import client from '../api/graphQL/apollo';
import { useTheme } from '../constants/theme';

export default function RootLayout() {
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
          name="topAll" 
          options={{ 
            title: 'Top Anime',
          }} 
        />
      </Stack>
    </ApolloProvider>
  );
}
