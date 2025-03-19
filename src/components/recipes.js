import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Recipes = ({ meals, navigation }) => {
  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetail', { meal: item })}
    >
      <Image 
        source={{ uri: item.strMealThumb }} 
        style={styles.recipeImage} 
      />
      <Text style={styles.recipeTitle} numberOfLines={1}>
        {item.strMeal}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {meals && meals.length > 0 ? (
        <FlatList
          data={meals}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.idMeal}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noRecipesText}>No recipes found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: hp(2),
  },
  recipeItem: {
    flex: 1,
    margin: wp(2),
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: hp(20),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  recipeTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#333',
    padding: wp(2),
    textAlign: 'center',
  },
  noRecipesText: {
    fontSize: hp(2),
    color: '#666',
    textAlign: 'center',
    marginTop: hp(2),
  }
});

export default Recipes;