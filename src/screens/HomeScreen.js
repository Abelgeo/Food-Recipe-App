import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import Categories from '../components/categories';
import Recipes from '../components/recipes';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import { useNavigation } from '@react-navigation/native';
import { doSignOut } from '../firebase/auth';

const SPOONACULAR_API_KEY = '8886d224ef824a72895299629e4bd955';
const API_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const API_INGREDIENTS_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

const SearchBarComponent = ({
    onSearch,
    onFilterChange,
    onClearSearch,
    isSpoonacularSearch,
    initialFilters = { recipeName: true, cuisine: false, ingredients: false }
}) => {
    const [localQuery, setLocalQuery] = useState('');
    const [filters, setFilters] = useState(initialFilters);

    // Allow only one filter to be active at a time
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
            // Ensure at least one filter is selected
            if (!filters.recipeName && !filters.cuisine && !filters.ingredients) {
                // Default to recipe name if no filter is selected
                const defaultFilters = {
                    recipeName: true,
                    cuisine: false,
                    ingredients: false
                };
                setFilters(defaultFilters);
                onFilterChange(defaultFilters);
            }
            onSearch(localQuery);
        }
    };

    const clearInput = () => {
        setLocalQuery('');
        // Reset filters to initial state
        setFilters(initialFilters);
        onFilterChange(initialFilters);
        onClearSearch();
    };

    return (
        <>
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

            <View style={[
                styles.filterContainer,
                { display: isSpoonacularSearch || localQuery ? 'flex' : 'none' }
            ]}>
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
            </View>
        </>
    );
};

export default function HomeScreen({ navigation }) {
    // State declarations
    const { userLoggedIn, loading, username } = useAuth();
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

    // Auth check effect
    useEffect(() => {
        if (!loading && !userLoggedIn) {
            navigation.replace('Login');
        }
    }, [userLoggedIn, loading, navigation]);

    // Initial fetch effect
    useEffect(() => {
        if (userLoggedIn) {
            getCategories();
            if (!isSpoonacularSearch) {
                getRecipes(activeCategory);
            }
        }
    }, [userLoggedIn]);

    // Search parameters change effect
    useEffect(() => {
        if (userLoggedIn && isSpoonacularSearch && searchQuery) {
            getRecipes();
        }
    }, [searchQuery, searchByRecipeName, searchByCuisine, searchByIngredients, isSpoonacularSearch, userLoggedIn]);

    const handleChangeCategory = useCallback((category) => {
        setActiveCategory(category);
        setMeals([]); // Clear meals immediately
        setIsSpoonacularSearch(false);
        setSearchQuery('');
        getRecipes(category); // Fetch immediately
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
                const params = {
                    apiKey: SPOONACULAR_API_KEY,
                    number: 10
                };

                if (searchByIngredients) {
                    url = API_INGREDIENTS_URL;
                    params.ingredients = searchQuery;
                } else {
                    url = API_SEARCH_URL;
                    if (searchByRecipeName) params.query = searchQuery;
                    if (searchByCuisine) params.cuisine = searchQuery;
                }

                const response = await axios.get(url, { params });

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
                } else {
                    setMeals([]);
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
        setMeals([]); // Clear existing meals
        getRecipes(); // Fetch immediately
    }, [getRecipes]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setIsSpoonacularSearch(false);
        setMeals([]); // Clear meals
        getRecipes(activeCategory); // Fetch immediately
    }, [activeCategory, getRecipes]);

    const handleFilterUpdate = useCallback((newFilters) => {
        setSearchByRecipeName(newFilters.recipeName);
        setSearchByCuisine(newFilters.cuisine);
        setSearchByIngredients(newFilters.ingredients);
    }, []);

    const handleLogout = async () => {
        try {
            await doSignOut();
            navigation.replace('Login');
        } catch (err) {
            console.log('Logout error:', err.message);
        }
    };

    const renderRecipe = useCallback(({ item }) => {
        if (!item || !item.strMeal) {
            return <Text>Invalid recipe data</Text>; // Safeguard for invalid data
        }
        return (
            <Recipes
                meals={[item]}
                categories={categories}
                navigation={memoizedNavigation}
            />
        );
    }, [categories, memoizedNavigation]);

    const keyExtractor = useCallback((item) => item?.idMeal || Math.random().toString(), []);

    const EmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#ef4444" />
            ) : (
                <Text style={styles.emptyText}>No recipes found</Text>
            )}
        </View>
    ), [isLoading]);

    const HeaderComponent = React.memo(({ navigation }) => {
        if (!username && loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            );
        }

        return (
            <>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Image 
                            source={require('../../assets/images/avatar.png')} 
                            style={styles.avatar} 
                        />
                    </TouchableOpacity>
                    <View style={styles.headerIcons}>
                        <BellIcon color='gray' size={hp(4)} style={styles.headerIcon} />
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>
                        Hello {username || 'User'}!
                    </Text>
                    <Text style={styles.punchline}>Make your own food.</Text>
                    <Text style={styles.punchline}>
                        Stay at <Text style={styles.highlight}>Home.</Text>
                    </Text>
                </View>

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

                {categories.length > 0 && !isSpoonacularSearch && (
                    <Categories
                        categories={categories}
                        activeCategory={activeCategory}
                        handleChangeCategory={handleChangeCategory}
                    />
                )}

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
        );
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style='dark' />
            <FlatList
                ListHeaderComponent={<HeaderComponent navigation={navigation} />}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: hp(2)
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
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2)
    },
    headerIcon: {
        marginRight: wp(2)
    },
    avatar: {
        height: hp(5),
        width: hp(5),
        borderRadius: hp(2.5)
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        borderRadius: hp(1)
    },
    logoutText: {
        color: 'white',
        fontSize: hp(1.7),
        fontWeight: '600'
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
        color: '#ef4444'
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
        backgroundColor: '#ef4444',
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
        backgroundColor: '#ef4444',
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
        backgroundColor: '#ef4444',
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
        color: '#ef4444',
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