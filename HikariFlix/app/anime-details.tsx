import React, { useLayoutEffect, useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { useTheme } from '../constants/theme';
import { useFavorites } from '../controllers/favorite.controller';
import { useLocalSearchParams } from 'expo-router';
import { GET_ANIME_DETAILS } from '../api/graphQL/queries';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchAnime, fetchEpisodes, fetchHentai, fetchHentaiStream } from '../api/restAPI/api';

// Common Episode Interface
interface CommonEpisode {
  id: string;
  title: string;
  episodeNumber?: string;
  japanese_title?: string;
}

// Interface for stream details
interface HentaiStream {
  width: number;
  height: string;
  size_mbs: number;
  url: string;
}

// Interface for episode details
interface HentaiEpisode {
  id: number;
  name: string;
  slug?: string;
  link: string;
}

// Interface for the individual result object
interface HentaiResult {
  name: string;
  streams: HentaiStream[];
  episodes: HentaiEpisode[];
}

// Interface for the main response structure
interface HentaiResponse {
  results: HentaiResult[];
}

interface Anime {
  id: string;
  title: string;
  data_id: string;
}

interface EpisodeResponse {
  success: boolean;
  results: Episode[];
}

interface Episode {
  number?: string;
  episode_no?: string;
  id: string;
  title: string;
  japanese_title?: string;
}

interface AnimeResponse {
  success: boolean;
  result: Anime;
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
  const [episodeList, setEpisodeList] = useState<CommonEpisode[]>([]);
  const [noEpisodesFound, setNoEpisodesFound] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);

  useLayoutEffect(() => {
    if (data && data.Media) {
      navigation.setOptions({
        title: data.Media.title.english || data.Media.title.romaji,
      });
    }
  }, [navigation, data]);

  useEffect(() => {
    if (data && data.Media) {
      setIsFav(isFavorite(data.Media.id));
      
      if (isHentai(data.Media.genres)) {
        handleHentaiSearch(data.Media.title.romaji).then(() => {
          if (noEpisodesFound) {
            handleHentaiSearch(data.Media.title.english);
          }
        });
      } else {
        handleAnimeSearch(data.Media.title.english);
      }
    }
  }, [data, isFavorite]);

  const handleHentaiSearch = useCallback(async (title: string | null) => {
    if (!title) return;
    console.log(title)
    const sanitizedKeyword = encodeURIComponent(title.replace(/[^\w\s]/gi, ' '));

    try {
      const search: HentaiResponse = await fetchHentai(sanitizedKeyword);

      if (search.results.length > 0) {
        const hentaiData = search.results[0];
        const episodes: CommonEpisode[] = hentaiData.episodes.map((episode) => ({
          title: episode.name,
          id: episode.id.toString(),
        }));
        setEpisodeList(episodes);
        setNoEpisodesFound(episodes.length === 0);
        setLoadingEpisodes(false);
        console.log(`Hentai match found: ${hentaiData.name}`);
        return;
      }
    } catch (hentaiError) {
      console.error('Hentai fetch failed, trying HentaiStream:', hentaiError);

      const searchSuffixes = ['1', '1-episode-1', 'season-1'];

      for (const suffix of searchSuffixes) {
        try {
          const hentaiStreamResponse: HentaiResponse = await fetchHentaiStream(sanitizedKeyword, suffix);
          if (hentaiStreamResponse.results.length > 0) {
            const streamData = hentaiStreamResponse.results[0];
            const episodes: CommonEpisode[] = streamData.episodes.map((episode) => ({
              title: episode.name,
              id: episode.id.toString(),
            }));
            setEpisodeList(episodes);
            setNoEpisodesFound(episodes.length === 0);
            setLoadingEpisodes(false);
            console.log(`Hentai stream match found with suffix '${suffix}': ${streamData.name}`);
            return;
          }
        } catch (streamError) {
          console.error(`HentaiStream fetch failed with suffix '${suffix}':`, streamError);
        }
      }

      console.log('No hentai episodes found with any search method');
      setNoEpisodesFound(true);
      setLoadingEpisodes(false);
    }
  }, []);

  const handleAnimeSearch = useCallback(async (englishTitle: string | null) => {
    if (!englishTitle) return;
  
    const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');
  
    try {
      const searchResult: AnimeResponse = await searchAnime(sanitizedKeyword);
  
      if (!searchResult.success) {
        setNoEpisodesFound(true);
        setLoadingEpisodes(false);
        console.log("Anime search failed.");
      } else {
        const animeData = searchResult.result;
        const episodesResponse: EpisodeResponse = await fetchEpisodes(animeData.id);
  
        if (episodesResponse.success && Array.isArray(episodesResponse.results) && episodesResponse.results.length > 0) {
          const episodes: CommonEpisode[] = episodesResponse.results.map((episode) => ({
            id: episode.id,
            title: episode.title,
            episodeNumber: episode.episode_no || episode.number,
          }));
          setEpisodeList(episodes);
          setNoEpisodesFound(false);
        } else {
          setNoEpisodesFound(true);
        }
        setLoadingEpisodes(false);
        console.log(`Anime match found: ${animeData.title}`);
      }
    } catch (animeError) {
      console.error('Anime fetch failed:', animeError);
      setNoEpisodesFound(true);
      setLoadingEpisodes(false);
    }
  }, []);

  const isHentai = (genres: string[]): boolean => {
    return genres.includes('Hentai');
  };

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(data.Media.id);
    } else {
      addFavorite(data.Media);
    }
    setIsFav(!isFav);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={currentTheme.textColor} />
      </View>
    );
  }

  if (error) {
    return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;
  }

  const anime: AnimeDetails = data.Media;

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
         {`${anime.title.english} (${anime.title.romaji})`}
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
        {anime.description ? (
          <Text style={[styles.description, { color: currentTheme.textColor }]}>
            {anime.description.replace(/<[^>]*>/g, '')}
          </Text>
        ) : (
          <Text style={[styles.description, { color: currentTheme.textColor }]}>
            No description available.
          </Text>
        )}

        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Episodes</Text>
        {loadingEpisodes ? (
          <ActivityIndicator size="small" color={currentTheme.textColor} />
        ) : noEpisodesFound ? (
          <Text style={[styles.noEpisodesText, { color: currentTheme.textColor }]}>
            No episodes found for this content.
          </Text>
        ) : (
          <FlatList
            data={episodeList}
            keyExtractor={(episode, index) => episode.id || index.toString()}
            renderItem={({ item, index }) => (
              <Text style={[styles.episodeText, { color: currentTheme.textColor }]}>
                {item.episodeNumber ? `Episode ${item.episodeNumber}: ` : `Episode ${index + 1}: `}{item.title}
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
  noEpisodesText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default AnimeDetails;