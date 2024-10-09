import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';

interface Stream {
  width: number;
  height: string;
  size_mbs: number;
  url: string;
}

interface LocalSearchParams {
  episodeTitle: string;
  streams: string;
}

const isLocalSearchParams = (params: any): params is LocalSearchParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'episodeTitle' in params &&
    'streams' in params
  );
};

const StreamScreen: React.FC = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [status, setStatus] = useState({});

  const { episodeTitle, streams } = useMemo(() => {
    if (!isLocalSearchParams(params)) {
      return { episodeTitle: '', streams: '[]' };
    }
    return params;
  }, [params]);
  
  const parsedStreams: Stream[] = useMemo(() => {
    const allStreams = streams ? JSON.parse(streams) : [];
    // Filter out 1080p streams and streams with empty URLs
    return allStreams.filter((stream: Stream) => stream.width !== 1920 && stream.url !== "");
  }, [streams]);

  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parsedStreams.length > 0) {
      setSelectedStream(parsedStreams[0]);
    }
  }, [parsedStreams]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: episodeTitle,
    });
  }, [navigation, episodeTitle]);
  
  const handleStreamChange = useCallback((streamUrl: string) => {
    const newStream = parsedStreams.find(stream => stream.url === streamUrl);
    if (newStream) {
      setSelectedStream(newStream);
      setLoading(true);
      setError(null);
    }
  }, [parsedStreams]);

  useFocusEffect(
    useCallback(() => {
      console.log('In focus')
      return () => {
        console.log('Out of focus')
        if (videoRef.current) {
          console.log('removing video')
          videoRef.current.pauseAsync();
          console.log('removed video')
        }
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, []);

  const getVideoSource = useCallback(() => {
    return selectedStream?.url ? { uri: selectedStream.url } : null;
  }, [selectedStream]);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video Error:', error);
    setError('This stream is not working. Please try another option.');
    alert('Video Error: This stream is not working. Please try another option.');
  }, []);

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
          source={getVideoSource() || { uri: '' }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          useNativeControls={true}
          style={styles.video}
          onError={(error) => handleVideoError(error)}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
      )}

      <View style={styles.opContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Select Quality:</Text>
        <RNPickerSelect
          onValueChange={handleStreamChange}
          items={parsedStreams.map((stream) => ({
            label: `${stream.width}x${stream.height} (${stream.size_mbs} MB)`,
            value: stream.url,
          }))}
          value={selectedStream?.url || ''}
          style={pickerSelectStyles}
          placeholder={{}}
        />
      </View>
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
  opContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default StreamScreen;