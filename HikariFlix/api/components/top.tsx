import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_100_ANIME_BY_AVERGAE_SCORE } from '../lib/queries';

const Top100Anime = () => {
  const { loading, error, data } = useQuery(GET_TOP_100_ANIME_BY_AVERGAE_SCORE);
  const colorScheme = useColorScheme();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data.Page.media}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <Image source={{ uri: item.coverImage.medium }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
            ]}>
              {item.title.romaji}
            </Text>
            <Text style={[
              styles.subtitle,
              { color: colorScheme === 'dark' ? '#cccccc' : '#666666' }
            ]}>
              {item.averageScore} points
            </Text>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 50,
    height: 75,
    marginRight: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
});

export default Top100Anime;
