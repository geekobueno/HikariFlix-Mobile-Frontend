import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_ANIME_BY_AVERAGE_SCORE } from '../lib/queries';
import { useTheme } from '../../constants/theme';

function Header(): React.ReactElement {
  const currentTheme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { loading, error, data } = useQuery(GET_TOP_ANIME_BY_AVERAGE_SCORE, {
    variables: { page: 1, perPage: 1 },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const topAnime = data.Page.media[0];
  const isLargeScreen = screenWidth > 768;

  return (
    <View style={[styles.header, isLargeScreen && styles.headerLarge]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: topAnime.coverImage.large }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[
          styles.textContainer,
          { backgroundColor: currentTheme.backgroundColor === '#000000' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(239, 235, 237, 0.8)' }
        ]}>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            {topAnime.title.english || topAnime.title.romaji}
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
            {topAnime.averageScore} points
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 300,
  },
  headerLarge: {
    height: 400,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    padding: 15,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
  },
});

export default Header;