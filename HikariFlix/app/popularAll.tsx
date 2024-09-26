import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, useWindowDimensions, ActivityIndicator,TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_POPULAR_ANIME } from '../api/graphQL/queries';
import { useTheme } from '../constants/theme';
import { useNavigation, useRouter } from 'expo-router';

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
  popularity: number;
  averageScore: number;
}


const AllPopularAnime: React.FC = () => {
  const router = useRouter();
  const currentTheme = useTheme();
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  const { loading, error, data, fetchMore } = useQuery(GET_POPULAR_ANIME, {
    variables: { page: 1, perPage: 20 },
  });
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      title: 'All Popular Anime',
    });
  }, [navigation]);

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
      <ActivityIndicator size="large" color={currentTheme.textColor} />
    </View>
  );
  if (error) return <Text style={{ color: currentTheme.textColor }}>Error: {error.message}</Text>;

  const isLargeScreen = screenWidth > 768; // Adjust this breakpoint as needed
  const numColumns = isLargeScreen ? Math.floor(screenWidth / 200) : 1;

  const renderItem = ({ item, index }: { item: AnimeItem; index: number }) => (
    <TouchableOpacity  onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}>
    <View style={[
      styles.itemContainer,
      { backgroundColor: currentTheme.backgroundColor },
      isLargeScreen ? { width: screenWidth / numColumns - 20 } : styles.tableRow
    ]}>
      {!isLargeScreen && (
        <Text style={[styles.rankText, { color: currentTheme.textColor }]}>{index + 1}</Text>
      )}
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
    </View>
    </TouchableOpacity>
  );

  const loadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
      fetchMore({
        variables: {
          page: page + 1,
          perPage: 20,
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

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.backgroundColor }}>
      <FlatList
        data={data.Page.media}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => loading && <ActivityIndicator size="small" color={currentTheme.textColor} />}
        numColumns={numColumns}
        key={numColumns}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 40,
    textAlign: 'center',
  },
});

export default AllPopularAnime;
