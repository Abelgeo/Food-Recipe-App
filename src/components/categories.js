import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { categorydata } from '../constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CachedImage } from '../helpers/image';

export default function Categories({categories, activeCategory, handlechangecategory}) {
  return (
    <Animated.View entering={FadeInDown.duration(500).springify()}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 15}}
        style={styles.scrollView}
      >
        {
        categories.map((cat, index) => {
          let isActive = cat.strCategory == activeCategory;
          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => handlechangecategory(cat.strCategory)} 
              style={styles.categoryButton}
            >
              <View style={[
                styles.imageContainer,
                {backgroundColor: isActive ? '#fbbf24' : 'rgba(0,0,0,0.1)'}
              ]}>
                <Image 
                  source={{uri: cat.strCategoryThumb}}
                  style={styles.categoryImage}
                />
                
                {/*<CachedImage uri={cat.strCategoryThumb}
                          style={styles.categoryImage} />*/}
              </View>
              <Text style={styles.categoryText}>{cat.strCategory}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </Animated.View>
  );
}