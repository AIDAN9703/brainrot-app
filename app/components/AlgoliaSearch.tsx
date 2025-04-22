import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { searchWords } from '../services/wordService';
import { getTrendingWords } from '../services/algoliaService';
import { Word } from '../types';
import { PLACEHOLDER_TRENDING_WORDS } from '../services/constants';

const AlgoliaSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load trending words on initial component mount
  useEffect(() => {
    const loadInitialWords = () => {
      try {
        setIsLoading(true);
        // getTrendingWords is synchronous, so no need for await
        const trendingWords = getTrendingWords();
        setResults(trendingWords);
      } catch (error) {
        console.warn('Error fetching initial words:', error);
        // Fallback to placeholders
        setResults(PLACEHOLDER_TRENDING_WORDS);
      } finally {
        setIsLoading(false);
        setInitialLoaded(true);
      }
    };

    if (!initialLoaded) {
      loadInitialWords();
    }
  }, [initialLoaded]);

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // getTrendingWords is synchronous, so no need for await
      setResults(getTrendingWords());
      setIsLoading(false);
      return;
    }

    try {
      const searchResults = await searchWords(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.warn('Search error:', error);
      // Filter placeholder data as fallback
      const filteredResults = PLACEHOLDER_TRENDING_WORDS.filter(
        word => word.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filteredResults);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle search input change
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setIsLoading(true);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Generate a key for each item
  const keyExtractor = (item: Word) => {
    return item.id || `word-${item.word.replace(/\s+/g, '-').toLowerCase()}`;
  };

  // Clear search input
  const clearSearch = useCallback(() => {
    setQuery('');
    // getTrendingWords is synchronous, so no need for await
    setResults(getTrendingWords());
    setIsLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search brainrot words..."
            placeholderTextColor="#9ca3af"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff66b6" />
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>
              {query ? 'Search Results' : 'Trending Words'}
            </Text>
          </View>

          {results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={({ item }) => (
                <Link href={`/word/${item.id}`} asChild>
                  <TouchableOpacity style={styles.resultItem}>
                    <Text style={styles.wordText}>{item.word}</Text>
                    <Text style={styles.definitionText} numberOfLines={2}>
                      {item.definition}
                    </Text>
                    {item.categories && item.categories.length > 0 && (
                      <View style={styles.categoryContainer}>
                        {item.categories.map((category, index) => (
                          <View key={index} style={styles.categoryTag}>
                            <Text style={styles.categoryText}>{category}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                </Link>
              )}
              keyExtractor={keyExtractor}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#ff66b6" style={styles.noResultsIcon} />
              <Text style={styles.noResultsText}>
                {query 
                  ? 'No words found. Try a different search.' 
                  : 'Start typing to search for brainrot words.'}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    padding: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#4b1d3f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#ff66b6',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsIcon: {
    opacity: 0.3,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default AlgoliaSearch; 