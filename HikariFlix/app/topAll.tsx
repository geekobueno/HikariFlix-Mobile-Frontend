import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@apollo/client';
import { GET_TOP_ANIME_BY_AVERAGE_SCORE } from '../api/graphQL/queries';
import { useTheme } from '../constants/theme';

interface AnimeItem {
  id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    medium: string;
  };
  averageScore: number;
}

const AllTopAnime = () => {
  const router = useRouter();
  const currentTheme = useTheme();
  const [page, setPage] = useState(1);

  const { loading, error, data, fetchMore } = useQuery(GET_TOP_ANIME_BY_AVERAGE_SCORE, {
    variables: { page: 1, perPage: 50 },
  });

  const loadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
      fetchMore({
        variables: {
          page: page + 1,
          perPage: 50,
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
    }
  };

  const renderItem = ({ item, index }: { item: AnimeItem; index: number }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
      <Text style={[styles.rankText, { color: currentTheme.textColor }]}>{index + 1}</Text>
      <Image source={{ uri: item.coverImage.medium }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={[styles.titleText, { color: currentTheme.textColor }]} numberOfLines={2}>
          {item.title.english || item.title.romaji}
        </Text>
        <Text style={[styles.scoreText, { color: currentTheme.textColor }]}>
          Score: {item.averageScore}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
      <ActivityIndicator size="large" color={currentTheme.textColor} />
    </View>
  );
  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  return (
    <>
      <Stack.Screen options={{ title: 'Top Anime' }} />
      <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
        <FlatList
          data={data?.Page?.media || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => loading && <ActivityIndicator size="small" color={currentTheme.textColor} />}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    width: 40,
    textAlign: 'center',
  },
  image: {
    width: 50,
    height: 75,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllTopAnime;
