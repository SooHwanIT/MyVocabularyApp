// screens/SettingsScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAllData } from '../services'; // 데이터베이스 함수 경로를 맞게 수정하세요

const SettingsScreen = () => {
    // 버튼 클릭 시 전체 데이터를 가져와 Alert로 출력하는 함수
    const handleGetAllData = () => {
        getAllData((data) => {
            Alert.alert("All Data", JSON.stringify(data, null, 2));
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Settings Screen</Text>

            <TouchableOpacity style={styles.card} onPress={handleGetAllData}>
                <Text style={styles.cardText}>Get All Data</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5F3FF',
    },
    text: {
        fontSize: 24,
        color: '#333333',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 18,
        color: '#007AFF',
    },
});

export default SettingsScreen;
