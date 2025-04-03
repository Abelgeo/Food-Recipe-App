import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { AirbnbRating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecipeDetailScreen({ route, navigation }) {
  const { meal } = route.params;
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isRecipeReady, setIsRecipeReady] = useState(false);

  const SPOONACULAR_API_KEY = '8886d224ef824a72895299629e4bd955';

  useEffect(() => {
    getRecipeDetails();
    // Clean up any existing undefined ratings
    cleanUpUndefinedRatings();
  }, [meal.idMeal]);

  useEffect(() => {
    if (recipeDetails?.id) {
      loadSavedRating();
      fetchAverageRating();
    }
  }, [recipeDetails?.id]);

  const getRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRecipeReady(false);

      if (meal.isSpoonacular) {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.idMeal}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
        );

        if (response?.data) {
          setRecipeDetails({
            id: response.data.id,
            strMeal: meal.strMeal || response.data.title,
            strMealThumb: meal.strMealThumb || response.data.image,
            strCategory: 'Spoonacular Recipe',
            strArea: 'International',
            strInstructions: response.data.instructions || 'Instructions not available for this recipe.',
            extendedIngredients: response.data.extendedIngredients || [],
            isSpoonacular: true,
            nutrition: response.data.nutrition || {},
            servings: response.data.servings || 1,
          });
          setIsRecipeReady(true);
        } else {
          setError('Recipe details not found');
        }
      } else {
        const response = await axios.get(
          `https://themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
        );

        if (response?.data?.meals?.[0]) {
          setRecipeDetails(response.data.meals[0]);
          setIsRecipeReady(true);
        } else {
          setError('Recipe details not found');
        }
      }
    } catch (err) {
      console.log('Error fetching recipe details:', err.message);
      setError('Failed to load recipe details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRating = async () => {
    try {
      setIsRatingLoading(true);
      const savedRating = await AsyncStorage.getItem(`recipe_rating_${recipeDetails.id}`);
      if (savedRating) {
        setUserRating(parseFloat(savedRating));
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setIsRatingLoading(false);
    }
  };

  const saveRating = async (value) => {
    try {
      if (!recipeDetails?.id) {
        console.warn('Attempted to save rating before recipe ID was available');
        return;
      }

      setIsRatingLoading(true);
      await AsyncStorage.setItem(`recipe_rating_${recipeDetails.id}`, value.toString());
      setUserRating(value);
      console.log(`Rating ${value} saved for recipe ${recipeDetails.id}`);
      
      // In a real app, you would also send to your backend here
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsRatingLoading(false);
    }
  };

  const cleanUpUndefinedRatings = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const undefinedKeys = allKeys.filter(key => 
        key.startsWith('recipe_rating_') && key.includes('undefined')
      );
      
      if (undefinedKeys.length > 0) {
        await AsyncStorage.multiRemove(undefinedKeys);
        console.log(`Cleaned up ${undefinedKeys.length} undefined ratings`);
      }
    } catch (error) {
      console.error('Error cleaning up ratings:', error);
    }
  };

  const fetchAverageRating = async () => {
    try {
      // Simulate API call with mock data
      setTimeout(() => {
        setAverageRating(4.2);
        setRatingCount(15);
      }, 500);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const parseInstructions = (instructions) => {
    if (!instructions) return [];
    const cleanedInstructions = instructions.replace(/<\/?ol>|<\/?li>/g, '').split('<li>').filter(step => step.trim() !== '');
    return cleanedInstructions.map(step => step.trim());
  };

  const getIngredients = () => {
    if (!recipeDetails) return [];

    if (recipeDetails.isSpoonacular) {
      return (recipeDetails.extendedIngredients || []).map(ingredient => {
        const amount = ingredient.measures?.us?.amount || ingredient.measures?.metric?.amount || '';
        const unit = ingredient.measures?.us?.unit || ingredient.measures?.metric?.unit || '';
        const name = ingredient.name || '';
        const original = ingredient.original || '';

        let formattedIngredient = '';
        if (unit) {
          formattedIngredient = `${amount} ${unit} ${name}`.trim();
        } else if (original) {
          const match = original.match(/(\d+\.?\d*)\s*(\w+)\s*(.*)/);
          if (match) {
            formattedIngredient = `${match[1]} ${match[2]} ${match[3] || name}`.trim();
          } else {
            formattedIngredient = `${amount} ${name}`.trim();
          }
        } else {
          formattedIngredient = `${amount} ${name}`.trim();
        }
        return formattedIngredient;
      }).filter(ingredient => ingredient !== '') || [];
    } else {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipeDetails[`strIngredient${i}`];
        const measure = recipeDetails[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
          ingredients.push(`${measure || ''} ${ingredient}`.trim());
        }
      }
      return ingredients;
    }
  };

  const getNutritionInfo = () => {
    if (!recipeDetails?.nutrition || !recipeDetails.nutrition.nutrients) return null;
    const nutrients = recipeDetails.nutrition.nutrients.slice(0, 4);
    return nutrients.map(nutrient => ({
      name: nutrient.name,
      amount: nutrient.amount,
      unit: nutrient.unit,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading recipe details...</Text>
      </View>
    );
  }

  if (error || !recipeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load recipe'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={getRecipeDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeftIcon size={hp(3.5)} color="#ef4444" />
        </TouchableOpacity>

        <Image 
          source={{ uri: recipeDetails.strMealThumb }} 
          style={styles.recipeImage} 
        />

        <View style={styles.contentContainer}>
          <Text style={styles.recipeTitle}>
            {recipeDetails.strMeal}
          </Text>

          <Text style={styles.recipeMeta}>
            {recipeDetails.strCategory} • {recipeDetails.strArea}
          </Text>

          {/* Ratings Section */}
          <View style={styles.ratingContainer}>
            <Text style={styles.sectionTitle}>
              Ratings
            </Text>
            
            {ratingCount > 0 && (
              <View style={styles.averageRatingContainer}>
                <AirbnbRating
                  count={5}
                  defaultRating={averageRating}
                  size={hp(2.5)}
                  showRating={false}
                  isDisabled={true}
                  selectedColor="#ef4444"
                  starContainerStyle={styles.averageRatingStars}
                />
                <Text style={styles.averageRatingText}>
                  ({averageRating.toFixed(1)}) from {ratingCount} rating{ratingCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            <Text style={styles.ratingPrompt}>
              {userRating ? 'Your Rating:' : 'Rate this recipe:'}
            </Text>
            
            {isRatingLoading ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <AirbnbRating
                count={5}
                reviews={["Terrible", "Bad", "OK", "Good", "Excellent"]}
                defaultRating={userRating || 0}
                size={hp(3.5)}
                onFinishRating={saveRating}
                selectedColor="#ef4444"
                isDisabled={!isRecipeReady}
              />
            )}
          </View>

          <Text style={styles.sectionTitle}>
            Ingredients:
          </Text>
          {getIngredients().map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>
              • {ingredient}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>
            Instructions:
          </Text>
          {parseInstructions(recipeDetails.strInstructions).map((step, index) => (
            <Text key={index} style={styles.instructionText}>
              {index + 1}. {step}
            </Text>
          ))}

          {recipeDetails.isSpoonacular && recipeDetails.nutrition && (
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>
                Nutrition (per serving):
              </Text>
              {getNutritionInfo()?.map((nutrient, index) => (
                <Text key={index} style={styles.nutritionText}>
                  {nutrient.name}: {nutrient.amount} {nutrient.unit}
                </Text>
              ))}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(2),
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp(4)
  },
  errorText: {
    fontSize: hp(2),
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: hp(2)
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: hp(1.5)
  },
  retryButtonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600'
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: hp(5),
    left: wp(4),
    zIndex: 1,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 999,
  },
  recipeImage: {
    width: wp(100),
    height: hp(30),
    borderRadius: 10,
  },
  contentContainer: {
    padding: wp(4)
  },
  recipeTitle: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(2)
  },
  recipeMeta: {
    fontSize: hp(2),
    color: '#666',
    marginBottom: hp(2)
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    marginBottom: hp(1)
  },
  ingredientText: {
    fontSize: hp(2),
    color: '#666',
    lineHeight: hp(3),
    marginLeft: wp(2)
  },
  instructionText: {
    fontSize: hp(2),
    color: '#666',
    lineHeight: hp(3),
    marginBottom: hp(1)
  },
  nutritionContainer: {
    marginTop: hp(2)
  },
  nutritionText: {
    fontSize: hp(2),
    color: '#666',
    lineHeight: hp(3)
  },
  ratingContainer: {
    marginTop: hp(2),
    padding: wp(4),
    backgroundColor: '#f8f8f8',
    borderRadius: hp(1),
    marginBottom: hp(2)
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1)
  },
  averageRatingStars: {
    marginRight: wp(2)
  },
  averageRatingText: {
    fontSize: hp(2),
    color: '#666'
  },
  ratingPrompt: {
    fontSize: hp(2),
    marginBottom: hp(1)
  }
});