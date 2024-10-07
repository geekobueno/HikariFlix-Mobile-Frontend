import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'; // Add this import
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
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

const isLocalSearchParams = (params: any): params is LocalSearchParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'episodeTitle' in params &&
    'streamingInfo' in params
  );
};

const StreamScreen: React.FC = () => {
  const theme = useTheme();
  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.primaryColor,
      borderRadius: 4,
      color: theme.textColor,
      paddingRight: 30,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.primaryColor,
      borderRadius: 8,
      color: theme.textColor,
      paddingRight: 30,
    },
  });
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
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (parsedStreamingInfo?.length > 0) {
      const defaultSource = parsedStreamingInfo[0].value.decryptionResult;
      setCurrentSource(defaultSource.source);
      setSelectedOption(`${defaultSource.type}-0`);
    }
  }, [parsedStreamingInfo]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: episodeTitle,
    });
  }, [navigation, episodeTitle]);
  
  const handleOptionChange = useCallback((optionValue: string) => {
    const [type, index] = optionValue.split('-');
    const newSource = parsedStreamingInfo[parseInt(index)].value.decryptionResult;
    setCurrentSource(newSource.source);
    setSelectedOption(optionValue);
    setSelectedSubtitleTrack(null);
    setLoading(true);
    setError(null);
  }, [parsedStreamingInfo]);


  const handleSubtitleChange = useCallback((trackUri: string | null) => {
    setSelectedSubtitleTrack(trackUri);
    if (videoRef.current) {
      videoRef.current.setStatusAsync({
        textTracks: trackUri ? [{ uri: trackUri, type: 'vtt', language: 'en' }] : undefined,
      } as Partial<AVPlaybackStatus>);
    }
  }, []);

  const getVideoSource = useCallback(() => {
    return currentSource?.sources[0] ? { uri: currentSource.sources[0].file } : null;
  }, [ currentSource]);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video Error:', error);
    setError('This link is not working. Please try another option.');
    alert('Video Error This link is not working. Please try another option.');
  }, []);

  if (!isLocalSearchParams(params)) {
    return <Text>Error: Invalid search parameters.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{episodeTitle}</Text>
      
      {error ? (
        <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
      ) : (
        <Video
          ref={videoRef}
          source={getVideoSource() || { uri: '' }} // Fallback to an empty URI
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          useNativeControls={true}
          style={[styles.video, { backgroundColor: 'black' }]}
          onError={(error) => handleVideoError(error)}
        />
      )}

      <View style={styles.opContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Select Version:</Text>
        <RNPickerSelect
  onValueChange={handleOptionChange}
  items={parsedStreamingInfo.map((info, index) => ({
    label: `${info.value.decryptionResult.type === 'sub' ? 'Subbed' : 'Dubbed'} - Option ${index + 1}`,
    value: `${info.value.decryptionResult.type}-${index}`,
  }))}
  value={selectedOption}
  style={pickerSelectStyles}
  placeholder={{}}
/>
      </View>

      {currentSource?.tracks && currentSource.tracks.length > 0 && (
        <View style={styles.opContainer}>
          <Text style={[styles.label, { color: theme.textColor }]}>Subtitles:</Text>
          <RNPickerSelect
  onValueChange={(itemValue: string | null) => handleSubtitleChange(itemValue)}
  items={[
    { label: 'None', value: null },
    ...currentSource.tracks.map((track, index) => ({
      label: track.label,
      value: track.file,
    })),
  ]}
  value={selectedSubtitleTrack}
  style={pickerSelectStyles}
  placeholder={{}}
/>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
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
