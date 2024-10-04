import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'; // Add this import
import { Video, AVPlaybackStatus, ResizeMode, AVPlaybackSource } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native'; // Added import for navigation
import { useTheme } from '../constants/theme'; // Import the useTheme hook

interface StreamingInfo {
  status: string;
  value: {
    decryptionResult: {
      type: 'sub' | 'dub';
      source: {
        sources: Array<{ file: string; type: string }>;
        tracks: Array<{ file: string; label: string }>;
      };
    };
  };
}

interface LocalSearchParams {
  episodeTitle: string;
  streamingInfo: string;
}

const parseHLSFile = async (hlsUrl: string | null) => {
  if (hlsUrl) {
    const response = await fetch(hlsUrl);
    const playlistText = await response.text();
  
    const streams = [];
    const lines = playlistText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
        // Extract RESOLUTION and the URL of the variant stream
        const resolutionMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
        const bandwidthMatch = lines[i].match(/BANDWIDTH=(\d+)/);
        
        if (resolutionMatch && bandwidthMatch) {
          streams.push({
            resolution: resolutionMatch[1],  // e.g., 1920x1080
            bandwidth: bandwidthMatch[1],   // e.g., 1835388
            url: lines[i + 1],  // URL is on the next line
          });
        }
      }
    }
    return streams; 
  }
};

const isLocalSearchParams = (params: any): params is LocalSearchParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'episodeTitle' in params &&
    'streamingInfo' in params
  );
};

const StreamScreen: React.FC = () => {
  const theme = useTheme(); // Get the current theme

  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const { episodeTitle, streamingInfo } = useMemo(() => {
    if (!isLocalSearchParams(params)) {
      return { episodeTitle: '', streamingInfo: '[]' };
    }
    return params;
  }, [params]);
  
  const parsedStreamingInfo: StreamingInfo[] = useMemo(() => 
    streamingInfo ? JSON.parse(streamingInfo) : []
  , [streamingInfo]);

  const [currentSource, setCurrentSource] = useState<StreamingInfo['value']['decryptionResult']['source'] | null>(null);
  const [currentType, setCurrentType] = useState<'sub' | 'dub'>('sub');
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<string | null>(null);
  const [qualityOptions, setQualityOptions] = useState<any[]>([]);
  const [isManualQuality, setIsManualQuality] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);

  const loadQualities = useCallback(async (source: StreamingInfo['value']['decryptionResult']['source'] | null) => {
    if (source) {
      const streams = await parseHLSFile(source.sources[0].file);
      if (streams) {
        setQualityOptions(streams);
        setSelectedQuality('auto');
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (parsedStreamingInfo?.length > 0) {
      const defaultSource = parsedStreamingInfo.find(info => info.value.decryptionResult.type === 'sub');
      if (defaultSource) {
        setCurrentSource(defaultSource.value.decryptionResult.source);
        setCurrentType('sub');
        loadQualities(defaultSource.value.decryptionResult.source);
      }
    }
  }, [parsedStreamingInfo, loadQualities]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Stream' });
  }, [navigation]);
  
  const handleTypeChange = useCallback((type: 'sub' | 'dub') => {
    const newSource = parsedStreamingInfo.find(info => info.value.decryptionResult.type === type);
    if (newSource) {
      setCurrentSource(newSource.value.decryptionResult.source);
      setCurrentType(type);
      setSelectedSubtitleTrack(null);
      loadQualities(newSource.value.decryptionResult.source);
    }
  }, [parsedStreamingInfo, loadQualities]);

  const handleQualityChange = useCallback((qualityUrl: string) => {
    setSelectedQuality(qualityUrl);
    setIsManualQuality(qualityUrl !== 'auto');
    
    if (videoRef.current) {
      videoRef.current.setStatusAsync({ shouldPlay: false });
    }
  }, []);

  const handleSubtitleChange = useCallback((trackUri: string | null) => {
    setSelectedSubtitleTrack(trackUri);
    if (videoRef.current) {
      videoRef.current.setStatusAsync({
        textTracks: trackUri ? [{ uri: trackUri, type: 'vtt', language: 'en' }] : undefined,
      } as Partial<AVPlaybackStatus>);
    }
  }, []);

  const getVideoSource = useCallback(() => {
    if (isManualQuality && selectedQuality && selectedQuality !== 'auto') {
      return { uri: selectedQuality };
    }
    return currentSource?.sources[0] ? { uri: currentSource.sources[0].file } : null;
  }, [isManualQuality, selectedQuality, currentSource]);

  if (!isLocalSearchParams(params)) {
    return <Text>Error: Invalid search parameters.</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#000000" />;
  }

  console.log('Video Source:', getVideoSource());
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{episodeTitle}</Text>
      
      {getVideoSource() && (
        <Video
          ref={videoRef}
          source={getVideoSource() as AVPlaybackSource}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          style={[styles.video, { backgroundColor: 'black' }]} // Keep video background
          onError={(error) => console.log('Video Error:', error)}
        />
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, currentType === 'sub' && styles.activeButton]}
          onPress={() => handleTypeChange('sub')}
        >
          <Text style={[styles.buttonText, { color: theme.textColor }]}>Subbed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, currentType === 'dub' && styles.activeButton]}
          onPress={() => handleTypeChange('dub')}
        >
          <Text style={[styles.buttonText, { color: theme.textColor }]}>Dubbed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.opContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Select Quality:</Text>
        <Picker
          selectedValue={selectedQuality || ''}
          onValueChange={handleQualityChange}
          style={[styles.picker, { backgroundColor: theme.primaryColor }]} // Apply theme color
        >
          <Picker.Item label="Auto" value="auto" />
          {qualityOptions.map((option, index) => (
            <Picker.Item key={index} label={`${option.resolution} (${option.bandwidth}bps)`} value={option.url} />
          ))}
        </Picker>
      </View>

      {currentSource?.tracks && currentSource.tracks.length > 0 && (
        <View style={styles.opContainer}>
          <Text style={[styles.label, { color: theme.textColor }]}>Subtitles:</Text>
          <Picker
            selectedValue={selectedSubtitleTrack}
            onValueChange={(itemValue: string | null) => handleSubtitleChange(itemValue)}
            style={[styles.picker, { backgroundColor: theme.primaryColor }]} // Apply theme color
          >
            <Picker.Item label="None" value={null} />
            {currentSource.tracks.map((track, index) => (
              <Picker.Item key={index} label={track.label} value={track.file} />
            ))}
          </Picker>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
  },
  opContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 50,
  },
});

export default StreamScreen;
