<<<<<<< HEAD
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleSignup = async () => {
    setError('');
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      // Navigate to Home on successful signup
      navigation.replace('Home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    paddingTop: hp(10),
    justifyContent: 'center',
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(4),
    textAlign: 'center',
  },
  input: {
    height: hp(6),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: hp(1),
    marginBottom: hp(2),
    paddingHorizontal: wp(3),
    fontSize: hp(1.8),
  },
  errorText: {
    color: 'red',
    fontSize: hp(1.5),
    marginBottom: hp(2),
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: hp(2),
    borderRadius: hp(1),
    marginBottom: hp(2),
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: '600',
  },
  linkText: {
    color: '#f59e0b',
    fontSize: hp(1.7),
    textAlign: 'center',
    marginTop: hp(2),
  },
=======
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { doCreateUserWithEmailAndPassword } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
import { updateProfile } from 'firebase/auth'; // Import updateProfile to set the username

export default function Signupscreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Add username state
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const { userLoggedIn, loading } = useAuth();

    useEffect(() => {
        if (!loading && userLoggedIn) {
            navigation.replace('Home');
        }
    }, [userLoggedIn, loading, navigation]);

    const handleSignup = async () => {
        setError('');
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        try {
            // Create user with email and password
            const userCredential = await doCreateUserWithEmailAndPassword(email, password);
            // Update the user's displayName with the username
            await updateProfile(userCredential.user, {
                displayName: username,
            });
            navigation.replace('Home');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already in use. Please use a different email or log in.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters long.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style='dark' />
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="Username" // Add username input
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: wp(4),
        paddingTop: hp(10),
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: hp(4),
        textAlign: 'center',
    },
    input: {
        height: hp(6),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: hp(1),
        marginBottom: hp(2),
        paddingHorizontal: wp(3),
        fontSize: hp(1.8),
    },
    errorText: {
        color: 'red',
        fontSize: hp(1.5),
        marginBottom: hp(2),
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#f59e0b',
        paddingVertical: hp(2),
        borderRadius: hp(1),
        marginBottom: hp(2),
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: hp(2),
        fontWeight: '600',
    },
    linkText: {
        color: '#f59e0b',
        fontSize: hp(1.7),
        textAlign: 'center',
        marginTop: hp(2),
    },
>>>>>>> 99feb9d0aeadbbd19fd37940296214ee80268834
});