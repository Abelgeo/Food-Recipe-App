import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import { mealdata } from '../constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Loading from './loading';
import { CachedImage } from '../helpers/image';
import { useNavigation } from '@react-navigation/native';


export default function Recipes({categories, meals}) {
  const navigation = useNavigation();
  return (
    <View>
      <Text style={styles.recipes}>Recipes</Text>
      <View>
        {(!categories || !meals) ? (
          <Loading size="large" style={{marginTop: 20}}/>
        ) : (
          <MasonryList
            data={meals}
            keyExtractor={(item) => item.idMeal}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({item, i}) => (
              <RecipeCard 
                item={item}
                index={i} navigation={navigation}
              /> 
            )}
          />
        )}
      </View>
    </View>
  );
}
//console.log(`Rendering item ${index}`); // Debugging line
const RecipeCard = ({item, index, navigation}) => {
  if (!item) return null;
  
  const isEven = index % 2 === 0;
  const mealName = item?.strMeal || '';
  const imageUrl = item?.strMealThumb;
  
  if (!imageUrl) return null;

  return (
    <Animated.View 
      entering={FadeInDown
        .delay(index * 100)
        .duration(600)
        .springify()
        .damping(20)}
    >
      <Pressable 
        style={[
          styles.recipeContainer,
          {
            paddingLeft: isEven ? 0 : 8,
            paddingRight: isEven ? 8 : 0
          }
        ]} onPress={() => navigation.navigate('RecipeDetail', {...item})}
      >
       {/*<Image 
          source={{uri: imageUrl}} 
          style={[styles.recipeImage, {
            height: index % 3 === 0 ? hp(25) : hp(35)
          }]} 
        />*/}
        <CachedImage uri={item.strMealThumb}
          style={[styles.recipeImage, {
            height: index % 3 === 0 ? hp(25) : hp(35)
          }]} />
        <Text style={[styles.recipeText, {
          fontSize: hp(1.5),
          marginLeft: 8,
          fontWeight: '600',
          color: '#525252'
        }]}>
          {mealName}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  recipes: {
    fontSize: hp(3),
    color: '#525252',
    fontWeight: '600',
    marginBottom: hp(1.5),
    paddingLeft: 8
  },
  recipeContainer: {
    width: '100%',
    marginBottom: hp(2),
  },
  recipeImage: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 35
  },
  recipeText: {
    marginTop: 4
  }
});