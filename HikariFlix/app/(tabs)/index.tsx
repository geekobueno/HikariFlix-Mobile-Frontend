import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Popular from '../homescreen/popular';
import Trending from '../homescreen/trending';
import Top100Anime from '../homescreen/top';
import Featured from '../homescreen/featured';
import { useTheme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';


export default function HomeScreen() {
  const currentTheme = useTheme();
  const router = useRouter();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.headerBackgroundColor }]}>
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
    flexDirection: 'column',
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
    fontSize: 20,
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
