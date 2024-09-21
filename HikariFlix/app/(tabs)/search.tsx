import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import AnimeSearch from '../../api/components/AnimeSearch';
import { ApolloProvider } from '@apollo/client';
import client from '../../api/lib/apollo';

export default function SearchAnime() {
    const colorScheme = useColorScheme();

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