import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>VocabApp에 오신 것을 환영합니다</Text>

            <TouchableOpacity
                style={styles.todayStudyCard}
                onPress={() => navigation.navigate('TodayStudy')}
            >
                <Text style={styles.todayStudyTitle}>오늘의 학습</Text>
                <Text style={styles.todayStudyDescription}>오늘의 단어 리스트로 어휘력을 확장하세요!</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('WordSet')}
            >
                <Text style={styles.buttonText}>단어 세트 보기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#F1F3F4', // Light Gray background for the main content area
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#202124', // Dark Gray text for the main title
        marginBottom: 24,
        textAlign: 'center',
    },
    todayStudyCard: {
        backgroundColor: '#FFFFFF', // White background for the card
        borderRadius: 12, // Border radius for cards
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    todayStudyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A73E8', // Primary Blue color for titles
        marginBottom: 8,
    },
    todayStudyDescription: {
        fontSize: 16,
        color: '#5F6368', // Medium Gray text for descriptions
    },
    button: {
        backgroundColor: '#1A73E8', // Primary Blue for buttons
        borderRadius: 12, // Border radius for buttons
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF', // White text on buttons
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
