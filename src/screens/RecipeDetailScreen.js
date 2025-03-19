import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function RecipeDetailScreen({ route, navigation }) {
  const { meal } = route.params; // Get meal data from navigation
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SPOONACULAR_API_KEY = '8886d224ef824a72895299629e4bd955'; // Ensure this is your valid API key

  useEffect(() => {
    getRecipeDetails();
  }, [meal.idMeal]);

  const getRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (meal.isSpoonacular) {
        console.log('Fetching Spoonacular recipe with ID:', meal.idMeal);
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.idMeal}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
        );

        console.log('Spoonacular API Response:', response.data);

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
            nutrition: response.data.nutrition || {}, // Store nutritional information
            servings: response.data.servings || 1, // Store servings for nutrition context
          });
        } else {
          setError('Recipe details not found');
        }
      } else {
        console.log('Fetching MealDB recipe with ID:', meal.idMeal);
        const response = await axios.get(
          `https://themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
        );

        if (response?.data?.meals?.[0]) {
          setRecipeDetails(response.data.meals[0]);
        } else {
          setError('Recipe details not found');
        }
      }
    } catch (err) {
      console.log('Error fetching recipe details:', err.message, err.response?.data);
      setError('Failed to load recipe details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse Spoonacular instructions into an array of steps
  const parseInstructions = (instructions) => {
    if (!instructions) return [];

    // Remove HTML tags and split into steps
    const cleanedInstructions = instructions.replace(/<\/?ol>|<\/?li>/g, '').split('<li>').filter(step => step.trim() !== '');
    return cleanedInstructions.map(step => step.trim());
  };

  // Extract and format ingredients with proper units
  const getIngredients = () => {
    if (!recipeDetails) return [];

    if (recipeDetails.isSpoonacular) {
      // Handle Spoonacular ingredients (extendedIngredients array)
      console.log('Spoonacular Ingredients:', recipeDetails.extendedIngredients);
      return (recipeDetails.extendedIngredients || []).map(ingredient => {
        const amount = ingredient.measures?.us?.amount || ingredient.measures?.metric?.amount || '';
        const unit = ingredient.measures?.us?.unit || ingredient.measures?.metric?.unit || '';
        const name = ingredient.name || '';
        const original = ingredient.original || '';

        // Try to parse the original string for unit and amount if unit is missing
        let formattedIngredient = '';
        if (unit) {
          // Use amount, unit, and name if unit is provided
          formattedIngredient = `${amount} ${unit} ${name}`.trim();
        } else if (original) {
          // Fall back to parsing the original string (e.g., "2 teaspoons curry powder")
          const match = original.match(/(\d+\.?\d*)\s*(\w+)\s*(.*)/);
          if (match) {
            const originalAmount = match[1];
            const originalUnit = match[2];
            const originalName = match[3] || name;
            formattedIngredient = `${originalAmount} ${originalUnit} ${originalName}`.trim();
          } else {
            // If no match, use amount and name with no unit
            formattedIngredient = `${amount} ${name}`.trim();
          }
        } else {
          // Last resort: use amount and name with no unit
          formattedIngredient = `${amount} ${name}`.trim();
        }

        console.log('Formatted Ingredient:', formattedIngredient);
        return formattedIngredient;
      }).filter(ingredient => ingredient !== '') || [];
    } else {
      // Handle MealDB ingredients
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipeDetails[`strIngredient${i}`];
        const measure = recipeDetails[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
          const formattedIngredient = `${measure || ''} ${ingredient}`.trim();
          ingredients.push(formattedIngredient);
        }
      }
      return ingredients;
    }
  };

  // Format nutritional information for display
  const getNutritionInfo = () => {
    if (!recipeDetails?.nutrition || !recipeDetails.nutrition.nutrients) return null;

    const nutrients = recipeDetails.nutrition.nutrients.slice(0, 4); // Show top 4 nutrients for brevity (e.g., calories, protein, fat, carbs)
    return nutrients.map(nutrient => ({
      name: nutrient.name,
      amount: nutrient.amount,
      unit: nutrient.unit,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
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
          style={{
            position: 'absolute',
            top: hp(5),
            left: wp(4),
            zIndex: 1,
            backgroundColor: 'white',
            padding: 8,
            borderRadius: 999,
          }}
        >
          <ChevronLeftIcon size={hp(3.5)} color="#f59e0b" />
        </TouchableOpacity>

        <Image 
          source={{ uri: recipeDetails.strMealThumb }} 
          style={styles.recipeImage} 
        />

        <View style={{ padding: wp(4) }}>
          <Text style={{ 
            fontSize: hp(3), 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: hp(2)
          }}>
            {recipeDetails.strMeal}
          </Text>

          <Text style={{ fontSize: hp(2), color: '#666', marginBottom: hp(2) }}>
            {recipeDetails.strCategory} • {recipeDetails.strArea}
          </Text>

          <Text style={{ fontSize: hp(2.2), fontWeight: 'bold', marginBottom: hp(1) }}>
            Ingredients:
          </Text>
          {getIngredients().map((ingredient, index) => (
            <Text key={index} style={{ fontSize: hp(2), color: '#666', lineHeight: hp(3) }}>
              {ingredient}
            </Text>
          ))}

          <Text style={{ fontSize: hp(2.2), fontWeight: 'bold', marginTop: hp(2), marginBottom: hp(1) }}>
            Instructions:
          </Text>
          {parseInstructions(recipeDetails.strInstructions).map((step, index) => (
            <Text key={index} style={{ fontSize: hp(2), color: '#666', lineHeight: hp(3) }}>
              {index + 1}. {step}
            </Text>
          ))}

          {/* Nutritional Information */}
          {recipeDetails.isSpoonacular && recipeDetails.nutrition && (
            <View style={{ marginTop: hp(2) }}>
              <Text style={{ fontSize: hp(2.2), fontWeight: 'bold', marginBottom: hp(1) }}>
                Nutrition (per serving):
              </Text>
              {getNutritionInfo()?.map((nutrient, index) => (
                <Text key={index} style={{ fontSize: hp(2), color: '#666', lineHeight: hp(3) }}>
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
    backgroundColor: '#f59e0b',
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
  recipeImage: {
    width: wp(100),
    height: hp(30),
    borderRadius: 10,
  },
});