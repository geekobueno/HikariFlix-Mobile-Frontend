import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useTheme } from '../constants/theme';
import { useLocalSearchParams } from 'expo-router';

interface LocalSearchParams {
  info: string;
}

interface Info {
  animeUrl: string;
  totalEpisodes: number;
  episodes: Episode[];
}

interface Episode {
  episode: number;
  sources: {
    vostfr: Source[];
    vf: Source[];
  };
}

interface Source {
  source: string;
  url: string;
}

const isLocalSearchParams = (params: any): params is LocalSearchParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'info' in params
  );
};

const ASepScreen: React.FC = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  
  const { info } = useMemo(() => {
    if (!isLocalSearchParams(params)) {
      return { info: '{}' };
    }
    return params;
  }, [params]);

  const [parsedInfo, setParsedInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(info as string);
      setParsedInfo(parsed);
      console.log('Parsed Info:', parsed);
    } catch (err) {
      console.error('Parsing error:', err);
      setError('Failed to parse episode information');
    }
  }, [info]);

  const renderEpisodeItem: ListRenderItem<Episode> = ({ item }) => (
    <View style={styles.episodeContainer}>
      <Text style={[styles.episodeText, { color: theme.textColor }]}>
        Episode {item.episode}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {parsedInfo?.episodes ? (
        <FlatList
          data={parsedInfo.episodes}
          keyExtractor={(item) => item.episode.toString()}
          renderItem={renderEpisodeItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={[styles.errorText, { color: theme.textColor }]}>No episodes found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  episodeContainer: {
    marginBottom: 15,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  episodeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sourcesContainer: {
    marginTop: 5,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  sourceText: {
    fontSize: 12,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ASepScreen;