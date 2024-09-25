import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_ANIME_GENRES } from '../api/lib/queries';
import { useTheme } from '../constants/theme';
import { useRouter } from 'expo-router';

const AnimeCategories = () => {
  const currentTheme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { loading, error, data } = useQuery(GET_ANIME_GENRES);

  const numColumns = width > 768 ? 4 : 2;

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
      <ActivityIndicator size="large" color={currentTheme.textColor} />
    </View>
  );
  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { 
          backgroundColor: currentTheme.backgroundColor,
          width: (width / numColumns) - 20,
        }
      ]}
      onPress={() => router.push({ pathname: '/category-anime', params: { genre: item } })}
    >
      <Text style={[styles.categoryText, { color: currentTheme.textColor }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.title, { color: currentTheme.textColor }]}>Anime Categories</Text>
      <FlatList
        data={data?.GenreCollection || []}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    alignItems: 'center',
  },
  categoryItem: {
    margin: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimeCategories;
