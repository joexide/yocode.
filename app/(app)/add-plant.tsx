import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { storage } from '@/lib/storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';

const PLANTS = [
  { name: 'Tomato', emoji: '🍅', category: 'Vegetables', wateringDays: 2 },
  { name: 'Carrot', emoji: '🥕', category: 'Vegetables', wateringDays: 3 },
  { name: 'Potato', emoji: '🥔', category: 'Vegetables', wateringDays: 4 },
  { name: 'Lettuce', emoji: '🥬', category: 'Leafy Greens', wateringDays: 1 },
  { name: 'Cucumber', emoji: '🥒', category: 'Vegetables', wateringDays: 2 },
  { name: 'Bell Pepper', emoji: '🫑', category: 'Vegetables', wateringDays: 2 },
  { name: 'Eggplant', emoji: '🍆', category: 'Vegetables', wateringDays: 3 },
  { name: 'Corn', emoji: '🌽', category: 'Vegetables', wateringDays: 3 },
  { name: 'Broccoli', emoji: '🥦', category: 'Vegetables', wateringDays: 2 },
  { name: 'Garlic', emoji: '🧄', category: 'Vegetables', wateringDays: 4 },
  { name: 'Basil', emoji: '🌿', category: 'Herbs', wateringDays: 1 },
  { name: 'Mint', emoji: '🌿', category: 'Herbs', wateringDays: 2 },
  { name: 'Rosemary', emoji: '🌿', category: 'Herbs', wateringDays: 3 },
  { name: 'Thyme', emoji: '🌿', category: 'Herbs', wateringDays: 3 },
  { name: 'Strawberry', emoji: '🍓', category: 'Fruits', wateringDays: 2 },
  { name: 'Blueberry', emoji: '🫐', category: 'Fruits', wateringDays: 3 },
  { name: 'Spinach', emoji: '🥬', category: 'Leafy Greens', wateringDays: 1 },
  { name: 'Kale', emoji: '🥬', category: 'Leafy Greens', wateringDays: 2 },
  { name: 'Swiss Chard', emoji: '🥬', category: 'Leafy Greens', wateringDays: 2 },
  { name: 'Arugula', emoji: '🥬', category: 'Leafy Greens', wateringDays: 1 },
  { name: 'Watercress', emoji: '🥬', category: 'Leafy Greens', wateringDays: 1 },
  { name: 'Cilantro', emoji: '🌿', category: 'Herbs', wateringDays: 2 },
  { name: 'Parsley', emoji: '🌿', category: 'Herbs', wateringDays: 2 },
  { name: 'Sage', emoji: '🌿', category: 'Herbs', wateringDays: 3 },
  { name: 'Oregano', emoji: '🌿', category: 'Herbs', wateringDays: 3 },
  { name: 'Chives', emoji: '🌿', category: 'Herbs', wateringDays: 2 },
  { name: 'Dill', emoji: '🌿', category: 'Herbs', wateringDays: 2 },
  { name: 'Peas', emoji: '🫘', category: 'Vegetables', wateringDays: 2 },
  { name: 'Green Beans', emoji: '🫘', category: 'Vegetables', wateringDays: 2 },
  { name: 'Cauliflower', emoji: '🥦', category: 'Vegetables', wateringDays: 2 },
  { name: 'Brussels Sprouts', emoji: '🥦', category: 'Vegetables', wateringDays: 2 },
  { name: 'Cabbage', emoji: '🥬', category: 'Vegetables', wateringDays: 2 },
  { name: 'Radish', emoji: '🥕', category: 'Vegetables', wateringDays: 1 },
  { name: 'Beet', emoji: '🥕', category: 'Vegetables', wateringDays: 2 },
  { name: 'Turnip', emoji: '🥕', category: 'Vegetables', wateringDays: 2 },
  { name: 'Sweet Potato', emoji: '🥔', category: 'Vegetables', wateringDays: 3 },
  { name: 'Onion', emoji: '🧅', category: 'Vegetables', wateringDays: 3 },
  { name: 'Leek', emoji: '🧅', category: 'Vegetables', wateringDays: 2 },
  { name: 'Asparagus', emoji: '🥬', category: 'Vegetables', wateringDays: 2 },
  { name: 'Celery', emoji: '🥬', category: 'Vegetables', wateringDays: 2 },
  { name: 'Hot Pepper', emoji: '🌶️', category: 'Vegetables', wateringDays: 2 },
  { name: 'Zucchini', emoji: '🥒', category: 'Vegetables', wateringDays: 2 },
  { name: 'Squash', emoji: '🎃', category: 'Vegetables', wateringDays: 3 },
  { name: 'Pumpkin', emoji: '🎃', category: 'Vegetables', wateringDays: 3 },
  { name: 'Watermelon', emoji: '🍉', category: 'Fruits', wateringDays: 3 },
  { name: 'Cantaloupe', emoji: '🍈', category: 'Fruits', wateringDays: 3 },
  { name: 'Honeydew', emoji: '🍈', category: 'Fruits', wateringDays: 3 },
  { name: 'Raspberry', emoji: '🫐', category: 'Fruits', wateringDays: 2 },
  { name: 'Blackberry', emoji: '🫐', category: 'Fruits', wateringDays: 2 },
  { name: 'Grape', emoji: '🍇', category: 'Fruits', wateringDays: 3 },
  { name: 'Fig', emoji: '🫐', category: 'Fruits', wateringDays: 3 },
  { name: 'Lemon', emoji: '🍋', category: 'Fruits', wateringDays: 4 },
  { name: 'Lime', emoji: '🍋', category: 'Fruits', wateringDays: 4 },
  { name: 'Orange', emoji: '🍊', category: 'Fruits', wateringDays: 4 },
  { name: 'Grapefruit', emoji: '🍊', category: 'Fruits', wateringDays: 4 },
  { name: 'Apple', emoji: '🍎', category: 'Fruits', wateringDays: 4 },
  { name: 'Pear', emoji: '🍐', category: 'Fruits', wateringDays: 4 },
  { name: 'Peach', emoji: '🍑', category: 'Fruits', wateringDays: 4 },
  { name: 'Plum', emoji: '🫐', category: 'Fruits', wateringDays: 4 },
  { name: 'Cherry', emoji: '🍒', category: 'Fruits', wateringDays: 4 },
  { name: 'Apricot', emoji: '🍑', category: 'Fruits', wateringDays: 4 },
  { name: 'Avocado', emoji: '🥑', category: 'Fruits', wateringDays: 4 },
];

const CATEGORIES = Array.from(new Set(PLANTS.map(plant => plant.category)));
CATEGORIES.unshift('All');

export default function AddPlantScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [selectedPlant, setSelectedPlant] = useState<typeof PLANTS[0] | null>(null);

  const handleClose = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const filteredPlants = PLANTS.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlantSelect = async (plant: typeof PLANTS[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      setLoading(true);
      const plantsStr = await storage.getItem('plants');
      const plants = JSON.parse(plantsStr || '[]');
      const newPlant = {
        id: Date.now().toString(),
        name: plant.name,
        category: plant.category,
        stage: 'Seedling',
        planting_date: new Date().toISOString(),
        watering_frequency: plant.wateringDays,
      };
      plants.push(newPlant);
      await storage.setItem('plants', JSON.stringify(plants));
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Plant Added!',
        `${plant.name} has been added to your garden. You'll receive watering reminders every ${plant.wateringDays} days.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Failed to save plant. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && selectedPlant) {
      setLoading(true);
      try {
        const plantsStr = await storage.getItem('plants');
        const plants = JSON.parse(plantsStr || '[]');
        plants.push({
          id: Date.now().toString(),
          name: selectedPlant.name,
          category: selectedPlant.category,
          stage: 'Seedling',
          planting_date: selectedDate.toISOString(),
          watering_frequency: selectedPlant.wateringDays,
        });
        await storage.setItem('plants', JSON.stringify(plants));
        
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert(
          'Plant Added!',
          `${selectedPlant.name} has been added to your garden. You'll receive watering reminders every ${selectedPlant.wateringDays} days.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch (err) {
        console.error('Error adding plant:', err);
        setError('Failed to save plant. Please try again.');
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}>
          <MaterialCommunityIcons 
            name={Platform.OS === 'ios' ? 'chevron-down' : 'close'} 
            size={24} 
            color={theme.text} 
          />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Add Plant</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search plants..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoFocus
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor:
                  selectedCategory === category ? '#2E7D32' : theme.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category ? 'white' : theme.textSecondary,
                },
              ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error && (
        <Animated.View 
          entering={FadeIn}
          style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      <ScrollView style={styles.plantsScroll}>
        {filteredPlants.map((plant) => (
          <Pressable
            key={plant.name}
            style={styles.plantItem}
            onPress={() => handlePlantSelect(plant)}>
            <View style={styles.plantInfo}>
              <Text style={styles.plantEmoji}>{plant.emoji}</Text>
              <Text style={[styles.plantName, { color: theme.text }]}>
                {plant.name}
              </Text>
              <Text style={styles.wateringInfo}>
                Water every {plant.wateringDays} days
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          </Pressable>
        ))}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={plantingDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Adding plant to your garden...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 16,
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 44 : 48,
    borderRadius: Platform.OS === 'ios' ? 10 : 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  plantsScroll: {
    flex: 1,
    padding: 16,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center', 
    flex: 1,
    marginRight: 16,
  },
  plantEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Platform.select({ ios: '#000000', android: '#333333' }),
    flex: 1
  },
  wateringInfo: {
    fontSize: 14,
    color: '#666',
    minWidth: 120,
    textAlign: 'right',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
});