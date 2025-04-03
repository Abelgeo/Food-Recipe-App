import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, storage, db } from '../firebase/firebase';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/authContext';

export default function ProfileScreen() {
    const { username, currentUser, updateUsername } = useAuth();
    const [name, setName] = useState(username || '');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Load the user's profile image URL from Firestore on mount
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.profileImage) {
                        setImageUri(data.profileImage);
                    }
                }
            }
        };
        fetchProfileImage();
    }, [currentUser]);

    // Handle image selection
    const pickImage = async () => {
        try {
            const options = {
                mediaType: 'photo',
                quality: 0.5,
                includeBase64: false,
            };

            launchImageLibrary(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorMessage);
                    Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
                } else if (response.assets && response.assets.length > 0) {
                    const selectedImage = response.assets[0];
                    setProfileImage(selectedImage);
                    setImageUri(selectedImage.uri);
                }
            });
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    // Upload image to Firebase Storage and save URL to Firestore
    const uploadImage = async () => {
        if (!profileImage || !currentUser) return null;

        setLoading(true);
        try {
            const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
            const response = await fetch(profileImage.uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            // Save the image URL to Firestore
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { profileImage: downloadURL }, { merge: true });

            return downloadURL;
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'Failed to upload image: ' + error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Handle updating the profile
    const handleUpdateProfile = async () => {
        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to update your profile');
            return;
        }

        setLoading(true);
        try {
            // Update displayName
            if (name !== username) {
                await updateProfile(auth.currentUser, { displayName: name });
                updateUsername(name);
            }

            // Update profile image if a new one was selected
            if (profileImage) {
                const downloadURL = await uploadImage();
                if (downloadURL) {
                    await updateProfile(auth.currentUser, {
                        photoURL: downloadURL
                    });
                    setProfileImage(null);
                }
            }

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Failed to update profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle password update with automatic sign-out on requires-recent-login
    const handleUpdatePassword = async () => {
        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to change your password');
            return;
        }

        if (!password) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(auth.currentUser, password);
            Alert.alert('Success', 'Password updated successfully!');
            setPassword('');
        } catch (error) {
            console.error('Password update error:', error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. You will be signed out. Please log in again to update your password.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                try {
                                    await signOut(auth);
                                    navigation.replace('Login');
                                } catch (signOutError) {
                                    console.error('Sign out error:', signOutError);
                                    Alert.alert('Error', 'Failed to sign out. Please try again.');
                                }
                            }
                        }
                    ]
                );
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password must be at least 6 characters');
            } else {
                Alert.alert('Error', 'Failed to update password: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            {/* Profile Image */}
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.profileImage} />
                ) : (
                    <View style={[styles.profileImage, { backgroundColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: hp(4), color: '#666' }}>
                            {name ? name[0].toUpperCase() : 'U'}
                        </Text>
                    </View>
                )}
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            {/* Name Input */}
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Update Profile</Text>
                )}
            </TouchableOpacity>

            {/* Password Input */}
            <Text style={styles.sectionTitle}>Change Password</Text>

            <TextInput
                style={styles.input}
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity 
                style={[styles.button, (!password || loading) && styles.buttonDisabled]} 
                onPress={handleUpdatePassword} 
                disabled={!password || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Change Password</Text>
                )}
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
    imageContainer: {
        alignItems: 'center',
        marginBottom: hp(3),
    },
    profileImage: {
        width: hp(12),
        height: hp(12),
        borderRadius: hp(6),
        marginBottom: hp(1),
    },
    changePhotoText: {
        color: '#ef4444',  // Changed
        fontSize: hp(1.7),
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
    sectionTitle: {
        fontSize: hp(2),
        fontWeight: 'bold',
        color: '#333',
        marginVertical: hp(2),
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#ef4444',  // Changed
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
    buttonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.7
    }
});