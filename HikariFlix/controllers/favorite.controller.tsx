import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnimeDetails {
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

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<AnimeDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      setError('Error loading favorites');
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false); // Load completed
    }
  };

  const saveFavorites = async (newFavorites: AnimeDetails[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      setError('Error saving favorites');
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = (anime: AnimeDetails) => {
    if (!isFavorite(anime.id)) { // Prevent duplicates
      const newFavorites = [...favorites, anime];
      setFavorites(newFavorites); // This triggers a re-render
      saveFavorites(newFavorites); // Save updated favorites to AsyncStorage
    }
  };
  
  const removeFavorite = (animeId: number) => {
    const newFavorites = favorites.filter((fav) => fav.id !== animeId);
    setFavorites(newFavorites); // This triggers a re-render
    saveFavorites(newFavorites); // Save updated favorites to AsyncStorage
  };
  

  const isFavorite = (animeId: number) => {
    return favorites.some((fav) => fav.id === animeId);
  };

  // Return values including loading and error state
  return { favorites, addFavorite, removeFavorite, isFavorite,loadFavorites, loading, error };
};
