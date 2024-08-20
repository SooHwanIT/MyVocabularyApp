// screens/ProgressScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Progress Screen</Text>
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
    },
});

export default ProgressScreen;
