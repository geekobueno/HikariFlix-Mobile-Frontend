import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { useTheme } from '../constants/theme';
import { useFavorites } from '../controllers/favorite.controller';
import { useLocalSearchParams } from 'expo-router';
import { GET_ANIME_DETAILS } from '../api/graphQL/queries';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchAnime, fetchEpisodes } from '../api/restAPI/api'; 


interface Anime {
  id: string; // Unique identifier for the anime
  title: string; // Title of the anime
  data_id: string; // Additional identifier or unique data ID from the response
}

interface EpisodeResponse {
  success: boolean;
  results: Episode[]
}

interface Episode {
  number: string;
  episode_no: string;
  id: string;
  title: string;
  japanese_title: string;
}
interface AnimeResponse {
  success: boolean;
  results: Anime
}

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
  bannerImage: string | null;
  description: string;
  genres: string[];
  averageScore: number;
  popularity: number;
  episodes: number;
  season: string;
  seasonYear: number;
  status: string;
  studios: {
    nodes: {
      name: string;
    }[];
  };
}


const AnimeDetails = () => {
  const { animeId } = useLocalSearchParams();
  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, {
    variables: { id: Number(animeId) },
  });

  const currentTheme = useTheme();
  const navigation = useNavigation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [isFav, setIsFav] = useState(false);
  const [episodeList, setEpisodeList] = useState<Episode[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Set navigation title based on anime data
  useLayoutEffect(() => {
    if (data && data.Media) {
      navigation.setOptions({
        title: data.Media.title.english || data.Media.title.romaji,
      });
    }
  }, [navigation, data]);

  // Determine if the anime is a favorite when the data is loaded
  useEffect(() => {
    if (data && data.Media) {
      setIsFav(isFavorite(data.Media.id));  // Initial favorite state
      handleSearch(data.Media.title.english || data.Media.title.romaji); // Use either English or Romaji title
    }
  }, [data, isFavorite]); // Dependencies to check for updates

  const handleSearch = async (keyword: string) => {
    // Remove special characters from the keyword
    const sanitizedKeyword = keyword.replace(/[^\w\s]/gi, '');

    try {
      const searchResult: AnimeResponse = await searchAnime(sanitizedKeyword);
      console.log(searchResult)
      const animeData = searchResult.results;
      console.log(animeData)

      // Directly use the first item as the best match
      const episodesResponse: EpisodeResponse = await fetchEpisodes(animeData.id);
      if (episodesResponse.success && Array.isArray(episodesResponse.results)) {
        setEpisodeList(episodesResponse.results);
      } else {
        setEpisodeList([]);
      }

      console.log(`Best match found: ${animeData.title}`);

    } catch (err) {
      console.error('Error in handleSearch:', err);
      setSearchError(err instanceof Error ? err.message : 'An unknown error occurred');
      setEpisodeList([]);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(data.Media.id);
    } else {
      addFavorite(data.Media);
    }
    setIsFav(!isFav); // Update local state immediately for instant UI feedback
  };

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
      <ActivityIndicator size="large" color={currentTheme.textColor} />
    </View>
  );

  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  if (searchError) return <Text style={{ color: currentTheme.textColor }}>{searchError}</Text>;

  const anime: AnimeDetails = data.Media; // Anime is guaranteed to be defined here

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {anime.bannerImage && (
        <Image source={{ uri: anime.bannerImage }} style={styles.bannerImage} />
      )}
      <TouchableOpacity 
        onPress={handleFavoriteToggle}
        style={styles.favoriteButton}
      >
        <Ionicons 
          name={isFav ? "heart" : "heart-outline"} 
          size={28} 
          color={isFav ? "red" : currentTheme.textColor} 
        />
      </TouchableOpacity>
      <View style={[styles.contentContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        <Image source={{ uri: anime.coverImage.large }} style={styles.coverImage} />
        <Text style={[styles.title, { color: currentTheme.textColor }]}>
          {anime.title.english || anime.title.romaji}
        </Text>
        <Text style={[styles.nativeTitle, { color: currentTheme.textColor }]}>
          {anime.title.native}
        </Text>
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
            Score: {anime.averageScore}
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
            Popularity: {anime.popularity}
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
            Episodes: {anime.episodes}
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
            Status: {anime.status}
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
            Season: {anime.season} {anime.seasonYear}
          </Text>
        </View>
        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Genres</Text>
        <View style={styles.genreContainer}>
          {anime.genres.map((genre, index) => (
            <View key={index} style={[styles.genreTag, { backgroundColor: currentTheme.backgroundColor }]}>
              <Text style={[styles.genreText, { color: currentTheme.textColor }]}>{genre}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Studios</Text>
        <Text style={[styles.studioText, { color: currentTheme.textColor }]}>
          {anime.studios.nodes.map(studio => studio.name).join(', ')}
        </Text>
        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Description</Text>
        <Text style={[styles.description, { color: currentTheme.textColor }]}>
          {anime.description.replace(/<[^>]*>/g, '')}
        </Text>

        {/* Episode List */}
        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Episodes</Text>
        {episodeList.length === 0 ? (
          <Text style={{ color: currentTheme.textColor }}>No episodes available.</Text>
        ) : (
          <FlatList
            data={episodeList}
            keyExtractor={(episode) => episode.id}
            renderItem={({ item }) => (
              <Text style={[styles.episodeText, { color: currentTheme.textColor }]}>
                Episode {item.episode_no || item.number}: {item.title}
                {item.japanese_title && ` (${item.japanese_title})`}
              </Text>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
  },
  coverImage: {
    width: 150,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nativeTitle: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreTag: {
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  genreText: {
    fontSize: 14,
  },
  studioText: {
    fontSize: 16,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  episodeText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default AnimeDetails;

