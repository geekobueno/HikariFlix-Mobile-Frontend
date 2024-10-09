import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode  } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/theme';
import { WebVTTParser } from 'webvtt-parser';
import RenderHTML from 'react-native-render-html'; 
import { useFocusEffect } from '@react-navigation/native';


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
  const [videoLayout, setVideoLayout] = useState({ width: 0, height: 0 });
  const [overlayPosition, setOverlayPosition] = useState(0);
  const videoRef = useRef<Video>(null);
  const [currentTime, setCurrentTime] = useState(0); // Track the current time
  const [isFullScreen, setIsFullScreen] = useState(false); // Track full screen state
  const [subtitleCues, setSubtitleCues] = useState<any[]>([]); // To store parsed subtitles
  const [currentCue, setCurrentCue] = useState<string | null>(null);
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

  useFocusEffect(
    useCallback(() => {
      console.log('In focus')
      return () => {
        console.log('Out of focus')
        if (videoRef.current) {
          videoRef.current.pauseAsync();
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
    if (trackUri) {
      // Fetch and parse the subtitle file using WebVTT parser
      fetch(trackUri)
        .then((response) => response.text())
        .then((vttText) => {
          const parser = new WebVTTParser();
          const parsedVTT = parser.parse(vttText);
          const cues = parsedVTT.cues.map((cue: any) => ({
            startTime: cue.startTime,
            endTime: cue.endTime,
            text: cue.text,
          }));
          setSubtitleCues(cues);
        })
        .catch((error) => console.error('Error fetching subtitles:', error));
    }
  }, []);

  const getVideoSource = useCallback(() => {
    return currentSource?.sources[0] ? { uri: currentSource.sources[0].file } : null;
  }, [currentSource]);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video Error:', error);
    setError('This link is not working. Please try another option.');
    alert('Video Error This link is not working. Please try another option.');
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded && status.positionMillis !== undefined) {
      const newTime = status.positionMillis / 1000; // Convert to seconds
      setCurrentTime(newTime);

      // Find the current cue based on current time
      const currentCue = subtitleCues.find(
        (cue) => newTime >= cue.startTime && newTime <= cue.endTime
      );
      setCurrentCue(currentCue ? currentCue.text : null);
    }
  }, [subtitleCues]);

  const renderSubtitles = useCallback(() => {
    if (!currentCue) return null;

    const subtitleStyles = isFullScreen ? styles.fullscreenSubtitle : styles.subtitleText;
    const containerStyles = [
      styles.subtitleContainer,
      isFullScreen ? styles.fullscreenSubtitleContainer : null,
      { top: overlayPosition }
    ];

    return (
      <View style={containerStyles}>
        <RenderHTML 
          contentWidth={isFullScreen ? Dimensions.get('window').width : videoLayout.width}
          source={{ html: currentCue }}
          tagsStyles={{
            body: subtitleStyles,
          }}
        />
      </View>
    );
  }, [currentCue, isFullScreen, overlayPosition, videoLayout.width]);

  if (!isLocalSearchParams(params)) {
    return <Text>Error: Invalid search parameters.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{episodeTitle}</Text>
      
      {error ? (
        <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
      ) : (
        <View style={styles.videoContainer}>
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
            onError={handleVideoError}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
          {renderSubtitles()}
        </View>

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
              ...currentSource.tracks.map((track) => ({
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
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  subtitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fullscreenSubtitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40, // Adjust as needed
    alignItems: 'center',
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  fullscreenSubtitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  opContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default StreamScreen;
