import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Popular from '../../api/components/popular';
import Trending from '../../api/components/trending';
import Top100Anime from '../../api/components/top';
import Header from '../../api/components/header';
import { ApolloProvider } from '@apollo/client';
import client from '../../api/lib/apollo';
import { useTheme } from '../../constants/theme'; // Import the useTheme hook

export default function HomeScreen() {
  const currentTheme = useTheme(); // Use the useTheme hook to get the current theme

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.headerBackgroundColor }]}>
        <Text style={[styles.headerText, { color: currentTheme.headerTextColor }]}>N</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity><Text style={[styles.headerButtonText, { color: currentTheme.headerTextColor }]}>Tv Shows</Text></TouchableOpacity>
          <TouchableOpacity><Text style={[styles.headerButtonText, { color: currentTheme.headerTextColor }]}>Movies</Text></TouchableOpacity>
          <TouchableOpacity><Text style={[styles.headerButtonText, { color: currentTheme.headerTextColor }]}>Categories</Text></TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView>
        {/* Featured Content */}
        <ApolloProvider client={client}>
          <Header />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Popular Anime</Text>
            <Popular />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Trending Now</Text>
            <Trending />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Top 100 Anime by Votes</Text>
            <Top100Anime />
          </View>
        </ApolloProvider>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButtonText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 10,
  },
});
