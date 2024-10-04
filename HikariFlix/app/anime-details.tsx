import React, { useLayoutEffect, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { useQuery } from '@apollo/client';
import { useTheme } from '../constants/theme';
import { useFavorites } from '../controllers/favorite.controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GET_ANIME_DETAILS } from '../api/graphQL/queries';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchAnime, fetchEpisodes, fetchHentai, fetchHentaiStream, fetchStream } from '../api/restAPI/api';


// Interface for a single source of the video (HLS stream, etc.)
interface AnimeSource {
  file: string;
  type: string;
}

// Interface for a single track (captions, subtitles, thumbnails, etc.)
interface AnimeTrack {
  file: string;
  label?: string;
  kind: string;
  default?: boolean; // Optional, as not all tracks will have this property
}

// Interface for the intro and outro timings
interface AnimeIntroOutro {
  start: number;
  end: number;
}

// Interface for the decryption result, including video and track information
interface AnimeDecryptionResult {
  type: string; // e.g., "dub" or "sub"
  source: {
    sources: AnimeSource[];
    tracks: AnimeTrack[];
    encrypted: boolean;
    intro: AnimeIntroOutro;
    outro: AnimeIntroOutro;
  };
  server: string; // Server providing the stream
}

// Interface for a streamingInfo entry, which includes the status and decryption result
interface AnimeStreamingInfo {
  status: string; // e.g., "fulfilled"
  value: {
    decryptionResult: AnimeDecryptionResult;
  };
}

// Main interface for the API response
interface AnimeStreamingResponse {
  success: boolean;
  results: {
    streamingInfo: AnimeStreamingInfo[];
  };
}


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
  link: string;
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
  const router = useRouter();
  const { animeId } = useLocalSearchParams();
  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, {
    variables: { id: Number(animeId) },
  });


  const currentTheme = useTheme();
  const navigation = useNavigation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [episodeList, setEpisodeList] = useState<CommonEpisode[]>([]);
  const [noEpisodesFound, setNoEpisodesFound] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false); // Add a state for navigation loading

  const isFav = useMemo(() => {
    return data && data.Media ? isFavorite(data.Media.id) : false;
  }, [data, isFavorite]);

  useLayoutEffect(() => {
    if (data && data.Media) {
      navigation.setOptions({
        title: data.Media.title.english || data.Media.title.romaji,
      });
    }
  }, [navigation, data]);

  useEffect(() => {
    if (data && data.Media) {
      if (isHentai(data.Media.genres)) {
        handleHentaiSearch(data.Media.title.romaji).then(() => {
          if (noEpisodesFound) {
            handleHentaiSearch(data.Media.title.english);
          }
        });
      } else {
        handleAnimeSearch(data.Media.title.english, data.Media.episodes)
      }
    }
  }, [data]);

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
  }, [data]);

  const handleAnimeSearch = useCallback(async (englishTitle: string | null, ep: string) => {
    if (!englishTitle) return;
  
    const sanitizedKeyword = encodeURIComponent(englishTitle.replace(/[^\w\s]/gi, ' ')).replace(/%3A/g, ':');
  
    try {
      const searchResult: AnimeResponse = await searchAnime(sanitizedKeyword,ep);
  
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
  }, [data]);

  const handleStreamSearch = useCallback(async (episodeId: string) => {
    try {
      const search = await fetchStream(episodeId);
      return search.results.streamingInfo;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, [handleAnimeSearch]);

  const handleEpisodePress = useCallback(async (episode: CommonEpisode) => {
    setIsNavigating(true); // Set navigation loading state
    const streamingInfo = await handleStreamSearch(episode.id);
    if (streamingInfo) {
      router.push({
        pathname: '/streamScreen',
        params: { 
          episodeTitle: episode.title,
          streamingInfo: JSON.stringify(streamingInfo)
        }
      });
    } else {
      // Handle the case when streaming info is not available
      console.log("Streaming info not available for this episode");
    }
    setIsNavigating(false); // Reset navigation loading state after operation
  }, [router, handleStreamSearch]);

  const isHentai = (genres: string[]): boolean => {
    return genres.includes('Hentai');
  };

  const handleFavoriteToggle = useCallback(() => {
    if (data && data.Media) {
      if (isFav) {
        removeFavorite(data.Media.id);
      } else {
        addFavorite(data.Media);
      }
    }
  }, [data, isFav, addFavorite, removeFavorite]);


  const renderEpisodeItem: ListRenderItem<CommonEpisode> = useCallback(({ item, index }) => (
    <TouchableOpacity 
      onPress={() => handleEpisodePress(item)}
      style={[
        styles.episodeItem, 
        { backgroundColor: currentTheme.backgroundColor }
      ]}
    >
      <View style={styles.episodeContent}>
        <Text style={[styles.episodeNumber, { color: currentTheme.primaryColor }]}>
          {item.episodeNumber || `${index + 1}`}
        </Text>
        <View style={styles.episodeTitleContainer}>
          <Text style={[styles.episodeTitle, { color: currentTheme.textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.japanese_title && (
            <Text style={[styles.japaneseTitle, { color: currentTheme.textColor }]} numberOfLines={1}>
              {item.japanese_title}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={currentTheme.primaryColor} />
    </TouchableOpacity>
  ), [currentTheme, handleEpisodePress]);

  if (loading || isNavigating) { // Show loading if either is true
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
        <ActivityIndicator size="small" color={currentTheme.primaryColor} />
      ) : noEpisodesFound ? (
        <Text style={[styles.noEpisodesText, { color: currentTheme.textColor }]}>
          No episodes found for this content.
        </Text>
      ) : (
        <FlatList<CommonEpisode>
          data={episodeList}
          keyExtractor={(episode, index) => episode.id || index.toString()}
          renderItem={renderEpisodeItem}
          contentContainerStyle={styles.episodeList}
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
  episodeList: {
    paddingHorizontal: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  episodeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  episodeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 30,
  },
  episodeTitleContainer: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  japaneseTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  noEpisodesText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

export default AnimeDetails;