import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'; // Add this import
import { Video, AVPlaybackStatus, ResizeMode, AVPlaybackSource } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native'; // Added import for navigation

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


const StreamScreen: React.FC = () => {
    // Type guard to check if the object matches LocalSearchParams
const isLocalSearchParams = useCallback((params: any): params is LocalSearchParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'episodeTitle' in params &&
    'streamingInfo' in params
  );
}, []);
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  if (!isLocalSearchParams(params)) {
    return <Text>Error: Invalid search parameters.</Text>;
  }

  const { episodeTitle, streamingInfo } = params;
  const [currentSource, setCurrentSource] = useState<StreamingInfo['value']['decryptionResult']['source'] | null>(null);
  const [currentType, setCurrentType] = useState<'sub' | 'dub'>('sub');
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<string | null>(null);
  const [qualityOptions, setQualityOptions] = useState<any[]>([]);
  const [isManualQuality, setIsManualQuality] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);

  const parsedStreamingInfo: StreamingInfo[] = streamingInfo ? JSON.parse(streamingInfo) : [];

  const loadQualities = useCallback(async (source: StreamingInfo['value']['decryptionResult']['source'] | null) => {
    const streams = await parseHLSFile(source ? source.sources[0].file : null);
    if (streams) {
      setQualityOptions(streams);
      setSelectedQuality('auto');
    }
    setLoading(false);
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
    if (isManualQuality && selectedQuality !== 'auto') {
      return { uri: selectedQuality };
    }
    return { uri: currentSource?.sources[0].file };
  }, [isManualQuality, selectedQuality, currentSource]);

  if (loading) {
    return <ActivityIndicator size="large" color="#000000" />;
  }

  if (!selectedQuality || !currentSource) {
    return <ActivityIndicator size="large" color="#000000" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{episodeTitle}</Text>
      
      <Video
  ref={videoRef}
  source={getVideoSource() as AVPlaybackSource} // Ensure the type is correct
  rate={1.0}
  volume={1.0}
  isMuted={false}
  resizeMode={ResizeMode.CONTAIN}  // Correctly using the constant here
  shouldPlay
  useNativeControls
  style={styles.video}
  onError={(error) => console.log('Video Error:', error)} // Handle video load error
/>


      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, currentType === 'sub' && styles.activeButton]}
          onPress={() => handleTypeChange('sub')}
        >
          <Text style={styles.buttonText}>Subbed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, currentType === 'dub' && styles.activeButton]}
          onPress={() => handleTypeChange('dub')}
        >
          <Text style={styles.buttonText}>Dubbed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.opContainer}>
        <Text style={styles.label}>Select Quality:</Text>
        <Picker
          selectedValue={selectedQuality}
          onValueChange={handleQualityChange}
          style={styles.picker}
        >
          <Picker.Item label="Auto" value="auto" /> {/* Auto option to let HLS handle quality */}
          {qualityOptions.map((option, index) => (
            <Picker.Item key={index} label={`${option.resolution} (${option.bandwidth}bps)`} value={option.url} />
          ))}
        </Picker>
      </View>

      {currentSource.tracks && currentSource.tracks.length > 0 && (
        <View style={styles.opContainer}>
          <Text style={styles.label}>Subtitles:</Text>
          <Picker
            selectedValue={selectedSubtitleTrack}
            onValueChange={(itemValue: string | null) => handleSubtitleChange(itemValue)}
            style={styles.picker}
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
