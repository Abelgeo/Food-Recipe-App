import { View, Text, StyleSheet, Image } from 'react-native';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/authContext';

export default function WelcomeScreen() {
    const ring1padding = useSharedValue(0);
    const ring2padding = useSharedValue(0);
    const navigation = useNavigation();
    const { userLoggedIn, loading } = useAuth();

    useEffect(() => {
        ring1padding.value = 0;
        ring2padding.value = 0;
        setTimeout(() => ring1padding.value = withSpring(ring1padding.value + hp(5)), 100);
        setTimeout(() => ring2padding.value = withSpring(ring2padding.value + hp(5.5)), 300);

        if (!loading) {
            setTimeout(() => {
                if (userLoggedIn) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('Login');
                }
            }, 2500);
        }
    }, [userLoggedIn, loading, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar style='light' />
            <Animated.View style={[styles.logoOuterContainer, { padding: ring2padding }]}>
                <Animated.View style={[styles.logoInnerContainer, { padding: ring1padding }]}>
                    <Image
                        source={require('../../assets/images/welcome.png')}
                        style={styles.logo}
                    />
                </Animated.View>
            </Animated.View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>Foodi Cafe</Text>
                <Text style={styles.tagline}>The best food in town</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ef4444',  // Changed
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoOuterContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
    },
    logoInnerContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
    },
    logo: {
        width: hp(20),
        height: hp(20)
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 20
    },
    title: {
        fontSize: hp(7),
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 2
    },
    tagline: {
        fontSize: hp(2),
        color: '#ffffff',
        marginTop: 8
    }
});