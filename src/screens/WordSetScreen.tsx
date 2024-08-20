import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import wordData from '../data/words.json'; // JSON 파일에서 단어를 가져옵니다.

const groupWords = (words, groupSize) => {
    const groupedWords = [];
    for (let i = 0; i < words.length; i += groupSize) {
        groupedWords.push(words.slice(i, i + groupSize));
    }
    return groupedWords;
};

const WordSetScreen = ({ navigation }) => {
    const groupedWords = groupWords(wordData, 20); // 단어를 20개씩 그룹화합니다.

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>단어 세트</Text>
            {groupedWords.map((wordGroup, index) => (
                <View key={index} style={styles.buttonContainer}>
                    <Button
                        title={`단어 ${index * 20 + 1} - ${index * 20 + wordGroup.length}`}
                        onPress={() => navigation.navigate('WordList', { title: `단어 ${index * 20 + 1} - ${index * 20 + wordGroup.length}`, words: wordGroup })}
                        color="#1A73E8"
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
    buttonContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    button: {
        padding: 12,
        borderRadius: 12,
    },
});

export default WordSetScreen;
