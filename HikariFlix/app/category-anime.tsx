import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client';
import { useTheme } from '../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GET_ANIME_BY_GENRE } from '../api/graphQL/queries';
import { useNavigation } from '@react-navigation/native';

interface AnimeItem {
    id: number;
    title: {
      romaji: string;
      english: string | null;
    };
    coverImage: {
      large: string;
    };
    averageScore: number;
  }

const CategoryAnime = () => {
  const currentTheme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { genre } = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const { width: screenWidth } = useWindowDimensions();

  const { loading, error, data, fetchMore } = useQuery(GET_ANIME_BY_GENRE, {
    variables: { genre, page: 1, perPage: 30 },
  });

const isLargeScreen = screenWidth > 768;
  const numColumns = isLargeScreen ? 4 : 2;

  const loadMore = () => {
    if (!loading) {
      fetchMore({
        variables: {
          page: page + 1,
          perPage: 30,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            Page: {
              ...fetchMoreResult.Page,
              media: [...prev.Page.media, ...fetchMoreResult.Page.media],
            },
          };
        },
      });
      setPage(page + 1);
    }
  };

  const renderItem = ({ item }: { item: AnimeItem }) => (
    <TouchableOpacity
      style={[
        styles.animeItem,
        {
          backgroundColor: currentTheme.backgroundColor,
          width: (screenWidth / numColumns) - 20,
        }
      ]}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
 <Image source={{ uri: item.coverImage.large }} style={styles.coverImage} />
      <Text style={[styles.title, { color: currentTheme.textColor }]} numberOfLines={2}>
        {item.title.english || item.title.romaji}
      </Text>
      <Text style={[styles.score, { color: currentTheme.textColor }]}>
        Score: {item.averageScore}
      </Text>    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${genre} Anime`,
    });
  }, [navigation, genre]);

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
      <ActivityIndicator size="large" color={currentTheme.textColor} />
    </View>
  );
  if (error) return <Text style={{ color: currentTheme.textColor }}>Server issue: Please try again later.</Text>;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.genreTitle, { color: currentTheme.textColor }]}>{genre} Anime</Text>
      <FlatList
        data={data?.Page?.media || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        onEndReached={loadMore}
        onEndReachedThreshold={0.50}
        ListFooterComponent={() => loading && <ActivityIndicator size="small" color={currentTheme.textColor} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  genreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  animeItem: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: 150,
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  score: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryAnime;
