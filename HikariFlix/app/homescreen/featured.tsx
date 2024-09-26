import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_ANIME_BY_AVERAGE_SCORE } from '../../api/graphQL/queries';
import { useTheme } from '../../constants/theme';
import { useRouter } from 'expo-router';

function Header(): React.ReactElement {
  const currentTheme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_TOP_ANIME_BY_AVERAGE_SCORE, {
    variables: { page: 1, perPage: 100 },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const animeList = data?.Page?.media || [];
  if (animeList.length === 0) {
    return <Text>No anime found</Text>;
  }

  const randomIndex = Math.floor(Math.random() * animeList.length);
  const featuredAnime = animeList[randomIndex];
  const isLargeScreen = screenWidth > 768;

  // Safely access the image URL
  const imageUrl = featuredAnime?.bannerImage || (featuredAnime?.coverImage?.large) || '';

  return (
    <TouchableOpacity 
      style={[styles.header, isLargeScreen && styles.headerLarge]}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: featuredAnime.id } })}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { backgroundColor: currentTheme.backgroundColor }]} />
        )}
        <View style={[
          styles.textContainer,
          { backgroundColor: currentTheme.backgroundColor === '#000000' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(113, 106, 109, 0.8)' }
        ]}>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            {featuredAnime?.title?.english || featuredAnime?.title?.romaji || 'Unknown Title'}
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
            Score: {featuredAnime?.averageScore ?? 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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