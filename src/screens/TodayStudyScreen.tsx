import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import wordData from '../data/words.json'; // Word data file
import { getUserWordData, updateOrAddUserWordData, initDb, getNextWord } from '../services/db'; // SQLite DB API
import { timeSinceLastStudy } from '../utils/timeSinceLastStudy'; // 유틸 파일에서 함수 임포트

const TodayStudyScreen = () => {
    const [currentWord, setCurrentWord] = useState(null);
    const [userData, setUserData] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [buttonText, setButtonText] = useState('제출');
    const [showSkip, setShowSkip] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        initDb();

        const fetchUserData = () => {
            getUserWordData(1, (data) => {
                setUserData(data);
                getNextWord(1, (word) => {
                    console.log("Received word: ", word); // 디버깅용 로그 추가
                    setCurrentWord(word);
                });
            });
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (currentWord) {
            console.log("Current word is set: ", currentWord);
        }

        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentWord]);

    const handleSubmit = () => {
        if (!currentWord) return;

        if (buttonText === '제출') {
            const correct = userAnswer.trim().toLowerCase() === currentWord.word_original.toLowerCase();
            setIsCorrect(correct);
            setButtonText('다음으로');
            setShowSkip(false);
            updateOrAddUserWordData(1, currentWord.id, correct);
        } else {
            getNextWord(1, (nextWord) => {
                setCurrentWord(nextWord);
                setUserAnswer('');
                setIsCorrect(null);
                setButtonText('제출');
                setShowSkip(true);
            });
        }
    };

    const handleSkip = () => {
        if (!currentWord) return;

        updateOrAddUserWordData(1, currentWord.id, false, true);
        setIsCorrect(false);
        setButtonText('다음으로');
        setShowSkip(false);
    };

    if (!currentWord) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>오늘의 공부가 끝났습니다.</Text>
            </SafeAreaView>
        );
    }

    const minInputWidth = Math.max(currentWord.word_original.length * 10, 40);
    const lastStudyTime = userData.find(data => data.word_id === currentWord.id)?.last_study_date;
    const lastStudyText = lastStudyTime ? timeSinceLastStudy(lastStudyTime) : '처음 학습';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.word}>{currentWord.word_korean}</Text>
                    <Text style={styles.lastStudy}>마지막 학습: {lastStudyText}</Text>
                </View>

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
                <Text style={styles.koreanSentence}>{currentWord.example_sentence_korean}</Text>
            </View>

            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={isCorrect === null}
                autoFocus={true}
                placeholder="input"
                placeholderTextColor="#999"
            />

            <View style={styles.buttonContainer}>
                {showSkip && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.buttonText}>스킵하기</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F1F3F4',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#1A73E8',
        marginTop: 0,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
    },
    word: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A73E8',
        marginBottom: 4,
    },
    lastStudy: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#606060',
    },
    sentenceContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
    },
    sentence: {
        fontSize: 20,
        color: '#202124',
        lineHeight: 24,
        textAlign: 'center',
    },
    koreanSentence: {
        fontSize: 16,
        color: '#606060',
        marginTop: 10,
        textAlign: 'center',
    },
    inputPlaceholder: {
        borderRadius: 4,
        paddingVertical: 0,
        paddingHorizontal: 8,
        marginHorizontal: 4,
        minHeight: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E1F5FE',
        borderWidth: 1,
        borderColor: '#1A73E8',
        transform: [{ translateY: 5 }],
    },
    inputText: {
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
        paddingVertical: 0,
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#1A73E8',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    skipButton: {
        backgroundColor: '#FF7043',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        flex: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TodayStudyScreen;
