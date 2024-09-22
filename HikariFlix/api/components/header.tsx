import React from 'react';
import { View, Text, ImageBackground, StyleSheet, useColorScheme } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_ANIME_BY_AVERAGE_SCORE } from '../lib/queries';
import { useTheme } from '../../constants/theme'; // Import the useTheme hook

function Header(): React.ReactElement {
  const currentTheme = useTheme(); // Use the useTheme hook to get the current theme
  const { loading, error, data } = useQuery(GET_TOP_ANIME_BY_AVERAGE_SCORE, {
    variables: { page: 1, perPage: 1 },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const topAnime = data.Page.media[0];

  return (
    <ImageBackground
      source={{ uri: topAnime.coverImage.large }}
      style={styles.header}
    >
      <View style={styles.overlay}>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>
          {topAnime.title.english || topAnime.title.romaji}
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
          {topAnime.averageScore} points
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 300,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
  },
});

export default Header;