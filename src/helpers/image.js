import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CachedImage = ({ uri, ...props }) => {
  const [cachedSource, setCachedSource] = useState({ uri });

  const getCachedImage = async () => {
    try {
      const cachedImageData = await AsyncStorage.getItem(uri);
      if (cachedImageData) {
        setCachedSource({ uri: cachedImageData });
      } else {
        const response = await fetch(uri);
        const imageBlob = await response.blob();
        
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result;
          await AsyncStorage.setItem(uri, base64Data);
          setCachedSource({ uri: base64Data });
        };
      }
    } catch (error) {
      console.error('Error caching image: ', error);
      setCachedSource({ uri });
    }
  };

  useEffect(() => {
    getCachedImage();
  }, [uri]);

  return <Animated.Image source={cachedSource} {...props} />;
};