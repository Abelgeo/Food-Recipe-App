import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import LoginScreen from '../screens/Loginscreen';
import SignupScreen from '../screens/Signupscreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthProvider, useAuth } from '../contexts/authContext';

const Stack = createNativeStackNavigator();

const NavigationContent = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName='Welcome'
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

const AppNavigation = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <NavigationContent />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default AppNavigation;