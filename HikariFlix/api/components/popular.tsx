import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_POPULAR_ANIME } from '../lib/queries';

interface AnimeItem {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    medium: string;
  };
  popularity: number;
  averageScore: number;
}

const Popular: React.FC = () => {
  const colorScheme = useColorScheme();
  const { loading, error, data } = useQuery(GET_POPULAR_ANIME, {
    variables: { page: 1, perPage: 20 },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: AnimeItem }) => (
    <View style={styles.animeItem}>
      <Image source={{ uri: item.coverImage.medium }} style={styles.coverImage} />
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }]} numberOfLines={2}>
        {item.title.english || item.title.romaji}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data.Page.media}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  animeItem: {
    width: Dimensions.get('window').width / 3 - 20,
    marginRight: 10,
  },
  coverImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  title: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default Popular;
