import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TOP_ANIME_BY_AVERAGE_SCORE } from '../../api/graphQL/queries';
import { useTheme } from '../../constants/theme';
import { useRouter } from 'expo-router';

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

const TopAnime: React.FC = () => {
  const currentTheme = useTheme();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_TOP_ANIME_BY_AVERAGE_SCORE, {
    variables: { page: 1, perPage: 25 },
  });
  const { width: screenWidth } = useWindowDimensions();

  const isLargeScreen = screenWidth > 768;
  const numColumns = isLargeScreen ? Math.floor(screenWidth / 200) : 1;

  const renderItem = ({ item, index }: { item: AnimeItem; index: number }) => (
    <TouchableOpacity 
      style={[
        styles.itemContainer,
        isLargeScreen ? { width: screenWidth / numColumns - 20 } : styles.tableRow
      ]}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
      <Text style={[styles.rankText, { color: currentTheme.textColor }]}>{index + 1}</Text>
      <Image 
        source={{ uri: item.coverImage.medium }} 
        style={isLargeScreen ? styles.gridImage : styles.tableImage} 
      />
      <View style={isLargeScreen ? styles.gridTextContainer : styles.tableTextContainer}>
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
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
          {item.averageScore} points
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <FlatList
        data={data?.Page?.media || []}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        numColumns={numColumns}
        key={numColumns}
        scrollEnabled={false}
      />
      <TouchableOpacity 
        style={styles.seeMoreButton} 
        onPress={() => router.push('/topAll')}
      >
        <Text style={[styles.seeMoreText, { color: currentTheme.textColor }]}>See More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    marginLeft: 5,
    marginBottom: 5,
    marginRight: 5,
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
    justifyContent: 'center',
  },
  tableTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'left',
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
    width: 40,
    textAlign: 'center',
  },
  seeMoreButton: {
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TopAnime;
