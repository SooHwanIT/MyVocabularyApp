import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const WordListScreen = ({ route }) => {
    const { words, title } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={words}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.wordContainer}>
                        <View style={styles.wordHeader}>
                            <Text style={styles.wordOriginal}>{item.word_original}</Text>
                            <Text style={styles.wordKorean}>{item.word_korean}</Text>
                        </View>
                        <Text style={styles.wordImportance}>중요도: {item.importance}</Text>
                        <Text style={styles.exampleSentence}>{item.example_sentence}</Text>
                        <Text style={styles.exampleSentenceKorean}>{item.example_sentence_korean}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F1F3F4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#202124',
    },
    wordContainer: {
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    wordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    wordOriginal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A73E8',
    },
    wordKorean: {
        fontSize: 16,
        color: '#5F6368',
    },
    wordImportance: {
        fontSize: 14,
        color: '#34A853',
        marginBottom: 8,
    },
    exampleSentence: {
        fontSize: 14,
        color: '#202124',
    },
    exampleSentenceKorean: {
        fontSize: 14,
        color: '#5F6368',
        marginTop: 4,
    },
});

export default WordListScreen;
