import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import { SEARCH_ANIME } from '../../api/graphQL/queries';
import { useRouter } from 'expo-router';
import { useTheme } from '../../constants/theme';


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

const SearchScreen = () => {
  const [search, setSearch] = useState('');
  const currentTheme = useTheme();
  const router = useRouter();

  const { loading, error, data } = useQuery(SEARCH_ANIME, {
    variables: { search },
    skip: search.length < 3,
  });

  const renderAnimeItem = ({ item } : { item: AnimeItem }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => router.push({ pathname: '/anime-details', params: { animeId: item.id } })}
    >
      <Image source={{ uri: item.coverImage.medium }} style={styles.coverImage} />
      <View style={styles.animeInfo}>
        <Text style={[styles.animeTitle, { color: currentTheme.textColor }]}>
          {item.title.romaji}
        </Text>
        <Text style={[styles.animeSubtitle, { color: currentTheme.textColor }]}>
          {item.title.english}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: currentTheme.backgroundColor, color: currentTheme.textColor }]}
        value={search}
        onChangeText={setSearch}
        placeholder="Search anime..."
        placeholderTextColor={currentTheme.textColor}
      />
      {loading && <ActivityIndicator size="large" color={currentTheme.primaryColor} />}
      {error && <Text style={[styles.errorText, { color: currentTheme.textColor }]}>Error: {error.message}</Text>}
      {data && data.Page && data.Page.media && (
        <FlatList
          data={data.Page.media}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  searchInput: {
    height: 40,
    borderWidth: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  animeInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  animeSubtitle: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SearchScreen;