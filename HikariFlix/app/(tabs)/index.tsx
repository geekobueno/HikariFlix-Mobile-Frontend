import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Popular from '../homescreen/popular';
import Trending from '../homescreen/trending';
import Top100Anime from '../homescreen/top';
import Featured from '../homescreen/featured';
import { useTheme } from '../../constants/theme';

export default function HomeScreen() {
  const currentTheme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.headerBackgroundColor }]}>
        <Text style={[styles.headerText, { color: currentTheme.headerTextColor }]}>H</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/category')}>
            <Text style={[styles.headerButtonText, { color: currentTheme.headerTextColor }]}>Categories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView>
        <Featured />
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Popular Anime</Text>
          <Popular />
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Trending Now</Text>
          <Trending />
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Top Anime by Votes</Text>
          <Top100Anime />
        </View>
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
    marginBottom: 10,
  },
});
