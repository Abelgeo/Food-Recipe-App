import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import Categories from '../components/categories';
import Recipes from '../components/recipes';
import axios from 'axios';

// Spoonacular API constants
const SPOONACULAR_API_KEY = '8886d224ef824a72895299629e4bd955';
const API_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const API_INGREDIENTS_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

// SearchBarComponent (self-contained)
const SearchBarComponent = ({ 
  onSearch, 
  onFilterChange, 
  onClearSearch,
  isSpoonacularSearch,
  initialFilters = { recipeName: true, cuisine: false, ingredients: false }
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterSelection = (filter) => {
    const newFilters = {
      recipeName: filter === 'recipeName',
      cuisine: filter === 'cuisine',
      ingredients: filter === 'ingredients'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    if (localQuery.trim()) {
      onSearch(localQuery);
    }
  };

  const clearInput = () => {
    setLocalQuery('');
    onClearSearch();
  };

  return (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MagnifyingGlassIcon color="gray" size={hp(2.5)} style={styles.searchIcon} />
          <TextInput 
            placeholder='Search any recipe' 
            placeholderTextColor='gray'
            style={styles.searchInput}
            value={localQuery}
            onChangeText={setLocalQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            blurOnSubmit={true}
            autoCorrect={false}
          />
          {localQuery.length > 0 && (
            <TouchableOpacity 
              onPress={clearInput} 
              style={styles.clearButton}
            >
              <XMarkIcon color="gray" size={hp(2)} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.searchButton,
            !localQuery.trim() && styles.searchButtonDisabled
          ]} 
          onPress={handleSearch}
          disabled={!localQuery.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter options */}
      {isSpoonacularSearch && (
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterOption, filters.recipeName && styles.activeFilter]} 
            onPress={() => handleFilterSelection('recipeName')}
          >
            <Text style={filters.recipeName ? styles.activeFilterText : styles.filterText}>
              Recipe Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterOption, filters.cuisine && styles.activeFilter]} 
            onPress={() => handleFilterSelection('cuisine')}
          >
            <Text style={filters.cuisine ? styles.activeFilterText : styles.filterText}>
              Cuisine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterOption, filters.ingredients && styles.activeFilter]} 
            onPress={() => handleFilterSelection('ingredients')}
          >
            <Text style={filters.ingredients ? styles.activeFilterText : styles.filterText}>
              Ingredients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.applyButton,
              !localQuery.trim() && styles.searchButtonDisabled
            ]} 
            onPress={handleSearch}
            disabled={!localQuery.trim()}
          >
            <Text style={styles.searchButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('Beef');
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchByRecipeName, setSearchByRecipeName] = useState(true);
  const [searchByCuisine, setSearchByCuisine] = useState(false);
  const [searchByIngredients, setSearchByIngredients] = useState(false);
  const [isSpoonacularSearch, setIsSpoonacularSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const memoizedNavigation = useMemo(() => navigation, []);

  useEffect(() => {
    getCategories();
    getRecipes();
  }, []);

  const handleChangeCategory = useCallback((category) => {
    setActiveCategory(category);
    setTimeout(() => {
      getRecipes(category);
    }, 0);
    setMeals([]);
    setIsSpoonacularSearch(false);
    setSearchQuery('');
  }, []);

  const getCategories = async () => {
    try {
      const response = await axios.get('https://themealdb.com/api/json/v1/1/categories.php');
      if (response && response.data) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.log('error fetching categories: ', err.message);
    }
  };

  const getRecipes = useCallback(async (category = 'Beef') => {
    setIsLoading(true);
    try {
      if (searchQuery.trim() && isSpoonacularSearch) {
        let url = '';
        
        if (searchByIngredients) {
          url = `${API_INGREDIENTS_URL}?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(searchQuery)}&number=10`;
        } else {
          url = `${API_SEARCH_URL}?apiKey=${SPOONACULAR_API_KEY}&number=10`;
          if (searchByRecipeName) {
            url += `&query=${encodeURIComponent(searchQuery)}`;
          } else if (searchByCuisine) {
            url += `&cuisine=${encodeURIComponent(searchQuery)}`;
          }
        }

        const response = await axios.get(url);
        
        if (response?.data) {
          const results = searchByIngredients ? response.data : response.data.results;
          if (results?.length > 0) {
            const formattedMeals = results.map(item => ({
              idMeal: item.id.toString(),
              strMeal: item.title,
              strMealThumb: item.image,
              isSpoonacular: true
            }));
            setMeals(formattedMeals);
          } else {
            setMeals([]);
          }
        }
      } else {
        const response = await axios.get(`https://themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        if (response?.data?.meals) {
          setMeals(response.data.meals);
        }
      }
    } catch (err) {
      console.log('error fetching recipes:', err.message);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, isSpoonacularSearch, searchByIngredients, searchByRecipeName, searchByCuisine]);

  const handleSearchSubmit = useCallback((query) => {
    setSearchQuery(query);
    setIsSpoonacularSearch(true);
    setActiveCategory('');
    setTimeout(() => {
      getRecipes();
    }, 0);
  }, [getRecipes]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSpoonacularSearch(false);
    setTimeout(() => {
      getRecipes(activeCategory);
    }, 0);
  }, [activeCategory, getRecipes]);

  const handleFilterUpdate = useCallback((newFilters) => {
    setSearchByRecipeName(newFilters.recipeName);
    setSearchByCuisine(newFilters.cuisine);
    setSearchByIngredients(newFilters.ingredients);
  }, []);

  const renderRecipe = useCallback(({ item }) => (
    <Recipes 
      meals={[item]}
      categories={categories}
      navigation={memoizedNavigation}
    />
  ), [categories, memoizedNavigation]);

  const keyExtractor = useCallback((item) => item.idMeal, []);

  const EmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#f59e0b" />
      ) : (
        <Text style={styles.emptyText}>No recipes found</Text>
      )}
    </View>
  ), [isLoading]);

  const HeaderComponent = React.memo(() => (
    <>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
        <BellIcon color='gray' size={hp(4)} />
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello Abel!</Text>
        <Text style={styles.punchline}>Make your own food.</Text>
        <Text style={styles.punchline}>
          Stay at <Text style={styles.highlight}>Home.</Text>
        </Text>
      </View>

      {/* Search Component */}
      <SearchBarComponent
        onSearch={handleSearchSubmit}
        onFilterChange={handleFilterUpdate}
        onClearSearch={clearSearch}
        isSpoonacularSearch={isSpoonacularSearch}
        initialFilters={{
          recipeName: searchByRecipeName,
          cuisine: searchByCuisine,
          ingredients: searchByIngredients
        }}
      />

      {/* Categories Section */}
      {categories.length > 0 && !isSpoonacularSearch && (
        <Categories 
          categories={categories} 
          activeCategory={activeCategory} 
          handleChangeCategory={handleChangeCategory}
        />
      )}

      {/* Recipes Title */}
      <View style={styles.recipesHeaderContainer}>
        <Text style={styles.recipesHeaderText}>
          {isSpoonacularSearch ? 'Search Results' : `${activeCategory} Recipes`}
        </Text>
        {isSpoonacularSearch && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  ));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='dark' />
      <FlatList
        ListHeaderComponent={HeaderComponent}
        data={meals}
        renderItem={renderRecipe}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        ListEmptyComponent={EmptyComponent}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContainer: {
    paddingBottom: hp(10),
    paddingTop: hp(1)
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
    marginVertical: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 999,
    paddingHorizontal: wp(3),
    height: hp(6),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.7),
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  searchButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: hp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: hp(1.7),
    fontWeight: '600',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7
  },
  filterContainer: {
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1),
    borderRadius: hp(1),
    backgroundColor: '#f1f1f1',
  },
  activeFilter: {
    backgroundColor: '#f59e0b',
  },
  filterText: {
    fontSize: hp(1.5),
    color: '#525252',
  },
  activeFilterText: {
    fontSize: hp(1.5),
    color: 'white',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1),
    borderRadius: hp(1),
  },
  recipesHeaderContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recipesHeaderText: {
    fontSize: hp(2.4),
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5
  },
  clearSearchButton: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: hp(1.7),
    color: '#f59e0b',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(10)
  },
  emptyText: {
    fontSize: hp(2),
    color: '#666',
  },
});