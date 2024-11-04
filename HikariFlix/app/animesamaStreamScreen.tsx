import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode, VideoFullscreenUpdateEvent, VideoFullscreenUpdate } from 'expo-av';
import RNPickerSelect from 'react-native-picker-select';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme } from '../constants/theme';
import { useLocalSearchParams } from 'expo-router';

interface Source {
  source: string;
  url: string;
}

interface StreamData {
  vostfr: Source[];
  vf: Source[];
}


const StreamScreen: React.FC = () => {
  const theme = useTheme();
  const videoRef = useRef<Video>(null);
  const { streams } = useLocalSearchParams();
  
  // Parse the streams data
  const streamData: StreamData = useMemo(() => {
    try {
      return JSON.parse(streams as string);
    } catch (e) {
      console.error('Error parsing stream data:', e);
      return { vostfr: [], vf: [] };
    }
  }, [streams]);
  
  const [selectedVersion, setSelectedVersion] = useState<'vostfr' | 'vf'>('vostfr');
  const [selectedSource, setSelectedSource] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSources = useMemo(() => 
    streamData[selectedVersion] || []
  , [streamData, selectedVersion]);

  const currentUrl = useMemo(() => 
    currentSources[selectedSource]?.url || null
  , [currentSources, selectedSource]);

  const handleVersionChange = useCallback((value: 'vostfr' | 'vf') => {
    setSelectedVersion(value);
    setSelectedSource(0);
    setError(null);
  }, []);

  const handleSourceChange = useCallback((value: number) => {
    setSelectedSource(value);
    setError(null);
  }, []);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video Error:', error);
    setError('This source is not working. Please try another option.');
  }, []);

  const handleFullscreenUpdate = useCallback(async ({ fullscreenUpdate }: VideoFullscreenUpdateEvent) => {
    if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_PRESENT) {
      setIsFullScreen(true);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
      setIsFullScreen(false);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, []);

  // Cleanup when component unmounts
  React.useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
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

  // Show loading state if no stream data
  if (!streamData || (!streamData.vostfr?.length && !streamData.vf?.length)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.textColor }]}>
          No streaming sources available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {error ? (
        <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
      ) : (
        <View style={styles.videoContainer}>
          {currentUrl && (
            <Video
              ref={videoRef}
              source={{ uri: currentUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              onFullscreenUpdate={handleFullscreenUpdate}
              onError={() => handleVideoError("Video playback error")}
              shouldPlay // Auto-play when source changes
            />
          )}
        </View>
      )}

      <View style={styles.opContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Select Version:</Text>
        <RNPickerSelect
          onValueChange={(value: 'vostfr' | 'vf') => handleVersionChange(value)}
          items={[
            { label: 'VOSTFR (Subbed)', value: 'vostfr', key: 'vostfr' },
            { label: 'VF (Dubbed)', value: 'vf', key: 'vf' },
          ].filter(item => streamData[item.value as 'vostfr' | 'vf']?.length > 0)} // Only show available versions
          value={selectedVersion}
          style={pickerSelectStyles}
          placeholder={{}}
        />
      </View>

      {currentSources.length > 0 && (
        <View style={styles.opContainer}>
          <Text style={[styles.label, { color: theme.textColor }]}>Select Source:</Text>
          <RNPickerSelect
            onValueChange={(value: string) => handleSourceChange(Number(value))}
            items={currentSources.map((source, index) => ({
              label: `Source ${source.source}`,
              value: index.toString(),
              key: index.toString(),
            }))}
            value={selectedSource.toString()}
            style={pickerSelectStyles}
            placeholder={{}}
          />
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
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