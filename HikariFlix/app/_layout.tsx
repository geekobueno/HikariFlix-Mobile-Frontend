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
          headerShown: true,
          headerBackVisible: false,
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
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
        <Stack.Screen 
          name="category-anime" 
          options={{ 
            title: 'Category Anime',
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
        <Stack.Screen 
          name="anime-details" 
          options={{ 
            title: 'Anime Details',
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
        <Stack.Screen 
          name="popularAll" 
          options={{ 
            title: 'All Popular Anime',
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
        <Stack.Screen 
          name="trendingAll" 
          options={{ 
            title: 'All Trending Anime',
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
        <Stack.Screen 
          name="topAll" 
          options={{ 
            title: 'Top Anime',
            headerBackVisible: false, // Added to hide the back button
          }} 
        />
      </Stack>
    </ApolloProvider>
  );
}
