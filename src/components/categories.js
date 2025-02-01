import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { categorydata } from '../constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Categories({categories, activeCategory, setActiveCategory}) {
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
              onPress={() => setActiveCategory(cat.strCategory)} 
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
              </View>
              <Text style={styles.categoryText}>{cat.strCategory}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginTop: hp(2)
  },
  categoryButton: {
    marginRight: wp(3),
    alignItems: 'center'
  },
  imageContainer: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 999
  },
  categoryImage: {
    width: hp(6),
    height: hp(6),
    borderRadius: hp(3)
  },
  categoryText: {
    fontSize: hp(1.6),
    color: '#525252',  // neutral-600
    marginTop: 4
  },
  categoryButton: {
    marginRight: wp(3),
    alignItems: 'center'
  },
  imageContainer: {
    padding: 6,
    borderRadius: 999
  },
  categoryImage: {
    width: hp(6),
    height: hp(6),
    borderRadius: hp(3)
  },
  categoryText: {
    fontSize: hp(1.6),
    color: '#525252',
    marginTop: 4
  }
});