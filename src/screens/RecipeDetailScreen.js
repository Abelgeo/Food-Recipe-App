import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { CachedImage } from '../helpers/image'
import { ChevronLeftIcon, ClockIcon, UsersIcon, FireIcon } from "react-native-heroicons/outline"
import { HeartIcon, Square3Stack3DIcon } from "react-native-heroicons/solid"
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import YoutubePlayer from 'react-native-youtube-iframe';
import YoutubeIframe from 'react-native-youtube-iframe'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function RecipeDetailScreen(props) {
  let item = props.route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation= useNavigation();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meal?.strYouTube) {
      console.log('Video URL:', meal.strYouTube);
      console.log('Video ID:', getYoutubeVideoId(meal.strYouTube));
    }
  }, [meal]);

  useEffect(() => {
      getMealData(item.idMeal);
    }, []);
  

  const getMealData = async (id) => {
    try {
      const response = await axios.get(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if(response && response.data) {
        setMeal(response.data.meals[0]);
        setLoading(false);
      }
    } catch(err) {
      console.log('error: ', err.message);
    }
  }

  const ingredientsIndexes = (meal) => {
    if(!meal) return [];
    let indexes = [];
    for(let i=1; i<=20; i++) {
      if(meal['strIngredient'+i]){
        indexes.push(i);
      }
    }
    return indexes;
  }
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <ScrollView
      style={{backgroundColor: 'white', flex: 1}}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 30}}
    >
      <StatusBar style="light"/>
      {/* Recipe image */}
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <CachedImage 
          uri={item.strMealThumb} 
          style={{
            width: wp(98),
            height: hp(50),
            borderRadius: 50,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            marginTop: 4
          }}
        />
      </View>

      {/*back-button*/}
      <Animated.View entering={FadeIn.delay(200).duration(1000)} style={{
        width: '100%',
        position: 'absolute', 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 56 // equivalent to pt-14
        }}>
        <TouchableOpacity onPress={()=> navigation.goBack()} style={{
            padding: 8,
            borderRadius: 9999,
            marginLeft: 20,
            backgroundColor: 'white'
        }}>
            <ChevronLeftIcon color='#fbbf24' size={hp(3.5)} strokeWidth={4.5} />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.delay(100).duration(700).springify().damping(12)} style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
          {/* Timer */}
          <View style={{
            backgroundColor: '#fbbf24',
            borderRadius: 9999,
            padding: 8,
            alignItems: 'center'
          }}>
            <View style={{
              height: hp(6.5),
              width: hp(6.5),
              backgroundColor: 'white',
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ClockIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
            </View>
            <View style={{
              alignItems: 'center',
              paddingVertical: 8,
              gap: 4
            }}>
              <Text style={{ fontSize: hp(2), fontWeight: 'bold', color: '#404040' }}>35</Text>
              <Text style={{ fontSize: hp(1.3), fontWeight: 'bold', color: '#404040' }}>Mins</Text>
            </View>
          </View>

          {/* Servings */}
          <View style={{
            backgroundColor: '#fbbf24',
            borderRadius: 9999,
            padding: 8,
            alignItems: 'center'
          }}>
            <View style={{
              height: hp(6.5),
              width: hp(6.5),
              backgroundColor: 'white',
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UsersIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
            </View>
            <View style={{
              alignItems: 'center',
              paddingVertical: 8,
              gap: 4
            }}>
              <Text style={{ fontSize: hp(2), fontWeight: 'bold', color: '#404040' }}>03</Text>
              <Text style={{ fontSize: hp(1.3), fontWeight: 'bold', color: '#404040' }}>Servings</Text>
            </View>
          </View>

          {/* Calories */}
          <View style={{
            backgroundColor: '#fbbf24',
            borderRadius: 9999,
            padding: 8,
            alignItems: 'center'
          }}>
            <View style={{
              height: hp(6.5),
              width: hp(6.5),
              backgroundColor: 'white',
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FireIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
            </View>
            <View style={{
              alignItems: 'center',
              paddingVertical: 8,
              gap: 4
            }}>
              <Text style={{ fontSize: hp(2), fontWeight: 'bold', color: '#404040' }}>135</Text>
              <Text style={{ fontSize: hp(1.3), fontWeight: 'bold', color: '#404040' }}>Cal</Text>
            </View>
          </View>

          {/* Difficulty */}
          <View style={{
            backgroundColor: '#fbbf24',
            borderRadius: 9999,
            padding: 8,
            alignItems: 'center'
          }}>
            <View style={{
              height: hp(6.5),
              width: hp(6.5),
              backgroundColor: 'white',
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Square3Stack3DIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
            </View>
            <View style={{
              alignItems: 'center',
              paddingVertical: 8,
              gap: 4
            }}>
              <Text style={{ fontSize: hp(2), fontWeight: 'bold', color: '#404040' }}></Text>
              <Text style={{ fontSize: hp(1.3), fontWeight: 'bold', color: '#404040' }}>Easy</Text>
            </View>
          </View>
        </Animated.View>
        {/* ingredients */}
        <Animated.View entering={FadeInDown.delay(200).duration(700).springify().damping(12)} style={{ gap: 16, marginTop: 3}}>
          {/* Add ingredients content here */}
          <Text style={{fontSize: hp(2.5), fontWeight: 'bold', color: '#404040' }}>
            Ingredients
          </Text>
          <View style={{ gap: 4, marginLeft: 3 }}>
            {
              ingredientsIndexes(meal).map(i=>{
                return (
                  <View key={i} style={{flexDirection: 'row', gap: 16}}>
                    <View style={{height: hp(1.5), width: hp(1.5), backgroundColor: '#fcd34d',
              borderRadius: 9999,}}>
              </View>
              <View style={{flexDirection: 'row', gap: 4}}>
              <Text style={{fontWeight: '900', color: '#525252', fontSize: hp(1.7)}}>{meal['strMeasure'+i]}</Text>
                  <Text style={{fontWeight: '500', color: '#525252', fontSize: hp(1.7)}}>{meal['strIngredient'+i]}</Text>
                </View>
                  </View>
                )
              })
            }
          </View>
        </Animated.View>
        {/* instructions */}
        <Animated.View entering={FadeInDown.delay(300).duration(700).springify().damping(12)} style={{ gap: 16, marginTop: 3}}>
          {/* Add instructions content here */}
          <Text style={{fontSize: hp(2.5), fontWeight: 'bold', color: '#404040' }}>
            Instructions
          </Text>
          <Text style={{fontSize: hp(1.6), color: '#404040'}}>
            {
              meal?.strInstructions
            }
          </Text>
        </Animated.View>
        {/* recipe video */}
        {
          meal?.strYouTube && (
            <Animated.View entering={FadeInDown.delay(400).duration(700).springify().damping(12)} style={{gap: 16, marginTop: 3}}>
              <Text style={{fontSize: hp(2.5), fontWeight: 'bold', color: '#404040'}}>
                Recipe Video
              </Text>
              <View>
                <YoutubeIframe 
                  videoId={getYoutubeVideoId(meal.strYouTube)}  // Remove comment and use the function
                  height={hp(30)}
                  play={false}
                  onError={(error) => console.log(error)}
                />
              </View>
            </Animated.View>
          )
        }
      </View>
    </>
  )
}


    </ScrollView>
  )
}