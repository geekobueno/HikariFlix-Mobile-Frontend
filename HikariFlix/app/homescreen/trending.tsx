import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TRENDING_ANIME } from '../../api/lib/queries';
import { useTheme } from '../../constants/theme'; // Import the useTheme hook
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

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
  trending: number;
  popularity: number;
}

const Trending: React.FC = () => {
  const currentTheme = useTheme(); // Use the useTheme hook to get the current theme
  const router = useRouter();
  const navigation = useNavigation();
  const { loading, error, data } = useQuery(GET_TRENDING_ANIME, {
    variables: { page: 1, perPage: 10 },
  });

  if (loading) return <Text style={{ color: currentTheme.textColor }}>Loading...</Text>;
  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: AnimeItem }) => (
    <TouchableOpacity 
      style={styles.animeItem}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
      <Image source={{ uri: item.coverImage.medium }} style={styles.coverImage} />
      <Text 
        style={[
          styles.title, 
          { color: currentTheme.textColor }
        ]} 
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {item.title.english || item.title.romaji}
      </Text>
    </TouchableOpacity>
  );

  const renderSeeAllButton = () => (
    <TouchableOpacity
      style={styles.seeAllButton}
      onPress={() => router.push('/trendingAll')}
    >
      <Text style={[styles.seeAllText, { color: currentTheme.textColor }]}>+</Text>
    </TouchableOpacity>
  );

  const handleSeeMore = () => {
    router.push('/trendingAll');
  };

  return (
    <FlatList
      data={data.Page.media}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={renderSeeAllButton}
    />
  );
};

const styles = StyleSheet.create({
  animeItem: {
    width: 150, // Fixed width
    marginRight: 10,
  },
  coverImage: {
    width: 150, // Fixed width
    height: 180, // Fixed height, maintaining a 2:3 aspect ratio
    borderRadius: 5,
  },
  title: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
    width: 120, // Match the width of the animeItem
  },
  seeAllButton: {
    width: 150, // Match the width of the animeItem
    height: 180, // Match the height of the coverImage
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  seeAllText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default Trending;
