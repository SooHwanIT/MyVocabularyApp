import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import wordData from '../data/words.json'; // Word data file
import { getUserWordData, updateOrAddUserWordData, initDb } from '../services/db'; // SQLite DB API

// Function to get the next word to study
const getNextWord = (wordList, userWordData) => {
    const remainingWords = wordList.filter(word => !userWordData.some(userData => userData.word_id === word.id));
    return remainingWords.length ? remainingWords[Math.floor(Math.random() * remainingWords.length)] : null;
};

const TodayStudyScreen = () => {
    const [currentWord, setCurrentWord] = useState(null);
    const [userData, setUserData] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Initialize SQLite database
        initDb();

        // Fetch user word data
        const fetchUserData = () => {
            getUserWordData(1, (data) => {
                setUserData(data);
                const word = getNextWord(wordData, data);
                setCurrentWord(word);
            });
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentWord]);

    const handleSubmit = () => {
        if (!currentWord) return;

        const correct = userAnswer.trim().toLowerCase() === currentWord.word_original.toLowerCase();
        setIsCorrect(correct);

        // Update user word data
        updateOrAddUserWordData(1, currentWord.id, correct);

        // Allow a brief pause before showing the next word
        setTimeout(() => {
            const nextWord = getNextWord(wordData, userData);
            setCurrentWord(nextWord);
            setUserAnswer('');
            setIsCorrect(null);
        }, 2000); // 2 seconds delay
    };

    if (!currentWord) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>오늘의 공부가 끝났습니다.</Text>
            </SafeAreaView>
        );
    }

    // 단어 길이에 따라 최소 입력 필드 크기 설정
    const minInputWidth = Math.max(currentWord.word_original.length * 10, 40);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>단어 퀴즈</Text>
            <Text style={styles.word}>뜻: {currentWord.word_korean}</Text>

            <View style={styles.card}>
                <TouchableOpacity onPress={() => inputRef.current.focus()} activeOpacity={1}>
                    <View style={styles.sentenceContainer}>
                        <Text style={styles.sentence}>
                            {currentWord.example_sentence.split(currentWord.word_original)[0]}{' '}
                            <View style={[
                                styles.inputPlaceholder,
                                { minWidth: minInputWidth },
                                isCorrect !== null && {
                                    backgroundColor: isCorrect ? 'lightgreen' : 'lightcoral',
                                    borderColor: isCorrect ? 'green' : 'red',
                                    borderWidth: 2,
                                }
                            ]}>
                                <Text style={[
                                    styles.inputText,
                                    { color: isCorrect !== null ? (isCorrect ? 'green' : 'red') : '#000' }
                                ]}>
                                    {isCorrect !== null ? currentWord.word_original : userAnswer}
                                </Text>
                            </View>{' '}
                            {currentWord.example_sentence.split(currentWord.word_original)[1]}
                        </Text>
                    </View>
                </TouchableOpacity>
                {/* 한글 예문 추가 */}
                <Text style={styles.koreanSentence}>{currentWord.example_sentence_korean}</Text>
            </View>

            {/* 숨겨진 텍스트 인풋 */}
            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={isCorrect === null}
                autoFocus={true} // 자동으로 포커싱
                placeholder="input"
                placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>제출</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F1F3F4', // Light gray background
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A73E8', // Blue text
    },
    word: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A73E8',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15, // Reduced padding to fit content
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    sentenceContainer: {
        flexDirection: 'column',
        alignItems: 'center', // Center vertically in the row
        textAlign: 'center',
        justifyContent: 'center',
    },
    sentence: {
        fontSize: 16, // Ensure this matches the inputText font size
        color: '#202124', // Dark gray text
        lineHeight: 24, // Slightly increased line height for better alignment
        textAlign: 'center',
    },
    koreanSentence: {
        fontSize: 14,
        color: '#606060', // Slightly lighter color for Korean translation
        marginTop: 10,
        textAlign: 'center',
    },
    inputPlaceholder: {
        borderRadius: 4,
        paddingVertical: 0, // Keep padding minimal
        paddingHorizontal: 8, // Adjusted horizontal padding
        marginHorizontal: 4, // Add margin to match spacing with surrounding text
        minHeight: 22, // Ensure consistent height with lineHeight
        alignItems: 'center', // Center text vertically within the placeholder
        justifyContent: 'center', // Center text horizontally within the placeholder
        backgroundColor: '#E1F5FE', // Light blue background
        borderWidth: 1, // Light border for visibility
        borderColor: '#1A73E8', // Blue border color
        transform: [{ translateY: 5 }], // Move the input placeholder down by 5 pixels
    },
    inputText: {
        fontSize: 16, // Match the font size of surrounding text
        lineHeight: 24, // Ensure line height matches surrounding text
        textAlign: 'center',
        paddingVertical: 0, // Minimal padding for better vertical alignment
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
    },
    button: {
        backgroundColor: '#1A73E8', // Blue button
        paddingVertical: 12,
        borderRadius: 12, // Border radius for button
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF', // White text
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TodayStudyScreen;
