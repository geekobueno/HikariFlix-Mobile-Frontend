import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../constants/theme';
import { useFavorites } from '../../controllers/favorite.controller';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AnimeItem {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string;
  };
}

export default function Favorites() {
  const currentTheme = useTheme();
  const { favorites, removeFavorite, loadFavorites } = useFavorites();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing

  // Handler for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites(); // Reload the favorites
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: AnimeItem }) => (
    <TouchableOpacity 
      style={styles.animeItem} 
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
      <Image source={{ uri: item.coverImage.large }} style={styles.coverImage} />
      <View style={styles.animeInfo}>
        <Text style={[styles.title, { color: currentTheme.textColor }]} numberOfLines={2}>
          {item.title.english || item.title.romaji}
        </Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart-dislike" size={24} color={currentTheme.accentColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Pull-to-refresh control
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={currentTheme.textColor} />
          <Text style={[styles.emptyStateText, { color: currentTheme.textColor }]}>
            No favorites yet. Start adding some!
          </Text>
        </View>
      )}

      {/* Reload Button */}
      <TouchableOpacity style={styles.reloadButton} onPress={onRefresh}>
        <Text style={[styles.reloadText, { color: currentTheme.textColor }]}>Reload Favorites</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  animeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  reloadButton: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
