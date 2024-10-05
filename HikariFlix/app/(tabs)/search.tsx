import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import AnimeSearch from '../searchScreen/AnimeSearch';
import { ApolloProvider } from '@apollo/client';
import client from '../../api/graphQL/apollo';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';

export default function SearchAnime() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

    return (
        <ApolloProvider client={client}>
            <View style={[
                styles.container,
                { backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff' }
            ]}>
                <Text style={[
                    styles.title,
                    { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
                ]}>
                    HikariFlix
                </Text>
                <AnimeSearch />
            </View>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});