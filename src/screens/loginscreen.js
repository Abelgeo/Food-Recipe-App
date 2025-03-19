<<<<<<< HEAD
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    setError('');
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // Navigate to Home on successful login
      navigation.replace('Home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <Text style={styles.title}>Log In</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
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
import { doSignInWithEmailAndPassword } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';

export default function Loginscreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const { userLoggedIn, loading } = useAuth();

    useEffect(() => {
        if (!loading && userLoggedIn) {
            navigation.replace('Home');
        }
    }, [userLoggedIn, loading, navigation]);

    const handleLogin = async () => {
        setError('');
        try {
            await doSignInWithEmailAndPassword(email, password);
            navigation.replace('Home');
        } catch (err) {
            setError(err.message);
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
            <Text style={styles.title}>Log In</Text>

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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
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