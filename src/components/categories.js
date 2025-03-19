import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Categories({ categories, activeCategory, handleChangeCategory }) {
  return (
    <View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.strCategory}
        contentContainerStyle={{ paddingHorizontal: wp(4) }}
        renderItem={({ item }) => {
          let isActive = item.strCategory === activeCategory;
          return (
            <TouchableOpacity
              onPress={() => handleChangeCategory(item.strCategory)}
              style={{
                marginRight: wp(4), // Increased margin for larger containers
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  backgroundColor: isActive ? '#f59e0b' : 'rgba(0,0,0,0.07)',
                  width: wp(16), // Increased from 14 to 20
                  height: wp(16), // Keep aspect ratio square
                  borderRadius: wp(10), // Half of width/height for circle
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                  elevation: 3,
                  padding: wp(2.5), // Slightly increased padding
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: item.strCategoryThumb }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: wp(10), // Match container border radius
                    resizeMode: 'cover',
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: hp(1.6), // Slightly increased font size
                  color: isActive ? '#f59e0b' : 'gray',
                  marginTop: hp(1), // Increased top margin
                  fontWeight: isActive ? '600' : 'normal'
                }}
                numberOfLines={1}
              >
                {item.strCategory}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}