import React, { useLayoutEffect, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { useQuery } from '@apollo/client';
import { useTheme } from '../constants/theme';
import { useFavorites } from '../controllers/favorite.controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GET_ANIME_DETAILS } from '../api/graphQL/queries';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as api from '../api/restAPI/api';
import { handleHentaiSearch, handleAnimeSearch, handleStreamSearch, isHentai, CommonEpisode, HentaiResponse, AnimeStreamingInfo } from './episodeHandler';

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
  const [isNavigating, setIsNavigating] = useState(false);

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
    const fetchEpisodes = async () => {
      if (data && data.Media) {
        if (isHentai(data.Media.genres)) {
          const result = await handleHentaiSearch(data.Media.title.romaji);
          if (result.noEpisodesFound) {
            const englishResult = await handleHentaiSearch(data.Media.title.english);
            setEpisodeList(englishResult.episodes);
            setNoEpisodesFound(englishResult.noEpisodesFound);
          } else {
            setEpisodeList(result.episodes);
            setNoEpisodesFound(result.noEpisodesFound);
          }
        } else {
          const result = await handleAnimeSearch(data.Media.title.english, data.Media.episodes);
          setEpisodeList(result.episodes);
          setNoEpisodesFound(result.noEpisodesFound);
        }
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [data]);

  const handleEpisodePress = useCallback(async (episode: CommonEpisode) => {
    setIsNavigating(true);
    const isHentaiAnime = isHentai(data.Media.genres);
    
    if (isHentaiAnime) {
      const title = episode.slug || episode.title;
      const search: HentaiResponse = await api.fetchHentai(title);
      if (search) {
        const streams = search.results[0].streams;
        router.push({
          pathname: '/hentaiStreamScreen',
          params: { 
            episodeTitle: episode.title,
            streams: JSON.stringify(streams)
          }
        });
      }
    } else {
      const streamingInfo = await handleStreamSearch(episode.id);
      if (streamingInfo) {
        router.push({
          pathname: '/streamScreen',
          params: { 
            episodeTitle: episode.title,
            streamingInfo: JSON.stringify(streamingInfo)
          }
        });
      }
    }
    setIsNavigating(false);
  }, [router, data]);

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
      style={[styles.episodeItem, { backgroundColor: currentTheme.backgroundColor }]}
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

  if (loading || isNavigating) {
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
          {anime.title.english ? `${anime.title.english} (${anime.title.romaji})` : anime.title.romaji}
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
    elevation: 2,
    shadowColor: '#000',
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