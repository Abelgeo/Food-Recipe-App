import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { CachedImage } from '../helpers/image'
import { ChevronLeftIcon } from "react-native-heroicons/outline"
import { HeartIcon } from "react-native-heroicons/solid"
import { useNavigation } from '@react-navigation/native'

export default function RecipeDetailScreen(props) {
  let item = props.route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation= useNavigation();



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
      <View style={{
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
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={{
            padding: 8,
            borderRadius: 9999,
            marginRight: 20,
            backgroundColor: "white"
        }}>
            <HeartIcon color={isFavorite ? "red" : "gray"} size={hp(3.5)} strokeWidth={4.5} />
        </TouchableOpacity>
        </View>

    </ScrollView>
  )
}