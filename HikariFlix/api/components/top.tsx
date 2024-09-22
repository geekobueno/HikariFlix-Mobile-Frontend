import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_100_ANIME_BY_AVERGAE_SCORE } from '../lib/queries';
import { useTheme } from '../../constants/theme';

interface AnimeItem {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    medium: string;
  };
  favourites: number;
  averageScore: number;
}

const Top100Anime = () => {
  const currentTheme = useTheme();
  const { loading, error, data } = useQuery(GET_TOP_100_ANIME_BY_AVERGAE_SCORE);
  const { width: screenWidth } = useWindowDimensions();

  if (loading) return <Text style={{ color: currentTheme.textColor }}>Loading...</Text>;
  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  const isLargeScreen = screenWidth > 768; // Adjust this breakpoint as needed
  const numColumns = isLargeScreen ? 1 : Math.floor(screenWidth / 200);

  const renderItem = ({ item, index }: { item: AnimeItem; index: number }) => (
    <View style={[
      styles.itemContainer,
      isLargeScreen ? styles.tableRow : { width: screenWidth / numColumns - 20 }
    ]}>
      {isLargeScreen && (
        <Text style={[styles.rankText, { color: currentTheme.textColor }]}>{index + 1}</Text>
      )}
      <Image 
        source={{ uri: item.coverImage.medium }} 
        style={isLargeScreen ? styles.tableImage : styles.gridImage} 
      />
      <View style={isLargeScreen ? styles.tableTextContainer : styles.gridTextContainer}>
        <Text 
          style={[styles.title, { color: currentTheme.textColor }]} 
          numberOfLines={isLargeScreen ? 1 : 2}
        >
          {item.title.romaji}
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
          {item.averageScore} points
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data.Page.media}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      numColumns={numColumns}
      key={numColumns}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    margin: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  gridImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  tableImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  gridTextContainer: {
    alignItems: 'center',
  },
  tableTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    width: 30,
    textAlign: 'center',
  },
});

export default Top100Anime;
