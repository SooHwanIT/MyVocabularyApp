// navigation/TabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/HomeScreen';
import TodayStudyScreen from '../screens/TodayStudyScreen';
import WordSetScreen from '../screens/WordSetScreen';
import WordListScreen from '../screens/WordListScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WordSetStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="WordSetStack"
                component={WordSetScreen}
                options={{ title: '단어 세트', headerStyle: { backgroundColor: '#1A73E8' }, headerTintColor: '#FFFFFF' }}
            />
            <Stack.Screen
                name="WordListStack"
                component={WordListScreen}
                options={({ route }) => ({ title: route.params.title, headerStyle: { backgroundColor: '#1A73E8' }, headerTintColor: '#FFFFFF' })}
            />
        </Stack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'TodayStudy') {
                        iconName = 'clipboard';
                    } else if (route.name === 'WordSet') {
                        iconName = 'book';
                    } else if (route.name === 'Progress') {
                        iconName = 'bar-chart';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1A73E8',
                tabBarInactiveTintColor: '#666666',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="TodayStudy" component={TodayStudyScreen} />
            <Tab.Screen name="WordSet" component={WordSetStack} options={{ title: '단어 세트' }} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

export default TabNavigator;
