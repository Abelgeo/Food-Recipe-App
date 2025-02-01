import { View, Text, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BellIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import Categories from '../components/categories';
import axios from 'axios';
export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('Drinks');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await axios.get('https://themealdb.com/api/json/v1/1/categories.php');
      if(response && response.data) {
        setCategories(response.data.categories);
      }
    } catch(err) {
      console.log('error: ', err.message);
    }
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
          <BellIcon color='gray' size={hp(4)} />
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello Abel!</Text>
          <View>
            <Text style={styles.punchline}>Make your own food.</Text>
          </View>
          <Text style={styles.punchline}>
            Stay at <Text style={styles.highlight}>Home.</Text>
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput 
            placeholder='Search any recipe' 
            placeholderTextColor='gray'
            style={styles.searchInput}
          />
          <View style={styles.iconContainer}>
            <MagnifyingGlassIcon color='gray' size={hp(2.7)} strokeWidth={3} />
          </View>
        </View>

         {/* Categories Section */}
         <View>
          {categories.length > 0 && (
            <Categories 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContainer: {
    paddingBottom: 50,
    paddingTop: hp(7)
  },
  headerContainer: {
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatar: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(2.5)
  },
  greetingContainer: {
    marginHorizontal: wp(4),
    marginVertical: hp(2)
  },
  greeting: {
    fontSize: hp(1.7),
    color: '#525252'
  },
  punchline: {
    fontSize: hp(3.8),
    fontWeight: '600',
    color: '#525252'
  },
  highlight: {
    fontSize: hp(3.8),
    fontWeight: '600',
    color: '#f59e0b'
  },
  searchContainer: {
    marginHorizontal: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 6,
    borderRadius: 999
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.7),
    marginBottom: 4,
    paddingLeft: 12,
    letterSpacing: 0.5
  },
  iconContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 999
  }
});