import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import Popular from '../../api/components/popular';
import Trending from '../../api/components/trending';
import Top100Anime from '../../api/components/top';
import Header from '../../api/components/header';
import { ApolloProvider } from '@apollo/client';
import client from '../../api/lib/apollo';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f0f0f0' }
      ]}
    >
      <ApolloProvider client={client}>
        <Header />
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
          ]}>
            Popular Anime
          </Text>
          <Popular />
        </View>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
          ]}>
            Trending Now
          </Text>
          <Trending />
        </View>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
          ]}>
            Top 100 Anime by Votes
          </Text>
          <Top100Anime />
        </View>
      </ApolloProvider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
});
