import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import * as epHandler from './episodeHandler';

interface ASepScreenProps {
  route: {
    params: {
      number: number;
      streamingInfo: string;
    };
  };
}

const ASepScreen = ({ route }: ASepScreenProps) => {
  const { number, streamingInfo } = route.params;
  const { number: totalEpisodes, episodes } = JSON.parse(streamingInfo);
  const  currentTheme  = useTheme();

  const renderEpisodeItem: ListRenderItem<epHandler.CommonEpisode> = ({ item, index }) => (
    <TouchableOpacity style={[styles.episodeItem, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={styles.episodeContent}>
        <Text style={[styles.episodeNumber, { color: currentTheme.primaryColor }]}>
          {item.episodeNumber || `${index + 1}`}
        </Text>
        <View style={styles.episodeTitleContainer}>
          <Text style={[styles.episodeTitle, { color: currentTheme.textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.japanese_title && (
            <Text style={[styles.japaneseTitle, { color: currentTheme.textColor }]} numberOfLines={1}>
              {item.japanese_title}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={currentTheme.primaryColor} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.title, { color: currentTheme.textColor }]}>Episode List</Text>
      <FlatList<epHandler.CommonEpisode>
        data={episodes}
        keyExtractor={(episode, index) => episode.id || index.toString()}
        renderItem={renderEpisodeItem}
        contentContainerStyle={styles.episodeList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  episodeList: {
    paddingBottom: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  episodeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  episodeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 30,
  },
  episodeTitleContainer: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  japaneseTitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ASepScreen;