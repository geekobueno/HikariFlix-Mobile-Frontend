import React from 'react';
import { View, Text, useColorScheme, StyleSheet } from 'react-native';

export default function Favorites() {
  const colorScheme = useColorScheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }
    ]}>
      <Text style={[
        styles.text,
        { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
      ]}>
        Your Downloads
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

