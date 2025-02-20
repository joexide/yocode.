import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideOutRight,
  Layout,
} from 'react-native-reanimated';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { storage } from '@/lib/storage';
import { generatePlantSchedule } from '@/lib/openrouter';
import * as Notifications from 'expo-notifications';

type Plant = {
  id: string;
  name: string;
  category: string;
  stage: string;
  planting_date: string;
  harvest_date?: string;
  next_watering?: string;
  watering_frequency: number;
  plant_number?: number;
};
const PLANT_EMOJIS: { [key: string]: string } = {
  'Tomato': '🍅',
  'Carrot': '🥕',
  'Potato': '🥔',
  'Lettuce': '🥬',
  'Cucumber': '🥒',
  'Bell Pepper': '🫑',
  'Eggplant': '🍆',
  'Corn': '🌽',
  'Broccoli': '🥦',
  'Garlic': '🧄',
  'Basil': '🌿',
  'Mint': '🌿',
  'Rosemary': '🌿',
  'Thyme': '🌿',
  'Strawberry': '🍓',
  'Blueberry': '🫐',
};

export default function HomeScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPlants();
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error refreshing plants:', err);
      setError('Failed to refresh plants');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const updatePlantSchedules = async (plants: Plant[]) => {
    const updatedPlants = await Promise.all(plants.map(async (plant, index) => {
      try {
        const schedule = await generatePlantSchedule(
          plant.name,
          new Date(plant.planting_date)
        );
        
        return {
          ...plant,
          harvest_date: schedule.harvestDate.toISOString(),
          next_watering: schedule.wateringSchedule.nextDate.toISOString(),
          plant_number: index + 1,
        };
      } catch (error) {
        console.error(`Failed to generate schedule for ${plant.name}:`, error);
        return plant;
      }
    }));

    await storage.setItem('plants', JSON.stringify(updatedPlants));
    return updatedPlants;
  };

  useEffect(() => {
    setupNotifications();
    fetchPlants();
  }, []);

  const setupNotifications = async () => {
    if (Platform.OS === 'web') return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications to receive watering reminders.'
      );
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const scheduleWateringReminder = async (plant: Plant) => {
    if (Platform.OS === 'web') return;

    const trigger = new Date(plant.next_watering);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Water! 💧',
        body: `Your ${plant.name} needs watering today!`,
        data: { plantId: plant.id },
      },
      trigger,
    });
  };

  const fetchPlants = async () => {
    try {
      const storedPlantsStr = await storage.getItem('plants');
      const storedPlants = JSON.parse(storedPlantsStr || '[]');
      const plantsWithSchedules = await updatePlantSchedules(storedPlants);
      setPlants(plantsWithSchedules);
    } catch (err) {
      console.error('Error fetching plants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
      const storedPlantsStr = await storage.getItem('plants');
      const storedPlants = JSON.parse(storedPlantsStr || '[]');
      const updatedPlants = storedPlants.filter((plant: Plant) => plant.id !== plantId);
      await storage.setItem('plants', JSON.stringify(updatedPlants));
      setPlants(updatedPlants);

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (Platform.OS !== 'web') {
        await Notifications.cancelScheduledNotificationAsync(plantId);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete plant');
    }
  };

  const handleAddPlant = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/add-plant');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading your garden...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add a Plant</Text>
        <Pressable
          style={styles.addButton}
          onPress={handleAddPlant}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.contentContainer,
          plants.length === 0 && styles.emptyContentContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2E7D32"
            colors={['#2E7D32']}
          />
        }>
        {plants.length === 0 ? (
          <Animated.View 
            entering={FadeIn} 
            style={styles.emptyState}>
            <MaterialCommunityIcons name="sprout" size={48} color="#2E7D32" />
            <Text style={styles.emptyStateText}>
              Your garden is empty. Tap + to add your first plant!
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.agendaContainer}>
            <View style={styles.agendaHeader}>
              <Text style={styles.agendaTitle}>Garden Journal</Text>
              <Text style={styles.agendaDate}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            {plants.map((plant, index) => (
              <Swipeable
                key={plant.id}
                renderRightActions={() => (
                  <Animated.View style={styles.deleteAction}>
                    <MaterialCommunityIcons name="delete" size={24} color="white" />
                  </Animated.View>
                )}
                onSwipeableOpen={() => handleDeletePlant(plant.id)}
                overshootRight={false}>
                <Animated.View
                  entering={FadeIn}
                  exiting={SlideOutRight}
                  layout={Layout}
                  style={styles.plantItem}>
                  <View style={styles.plantNumber}>
                    <Text style={styles.plantNumberText}>
                      {plant.plant_number}
                    </Text>
                  </View>
                  <View style={styles.plantInfo}>
                    <View style={styles.plantNameContainer}>
                      <View style={styles.plantName}>
                        <Text style={styles.plantEmoji}>
                          {PLANT_EMOJIS[plant.name] || '🌱'}
                        </Text>
                        <Text style={[styles.plantName, { marginLeft: 8 }]}>
                          {plant.name}
                        </Text>
                      </View>
                      <Text style={styles.plantDate}>
                        Planted: {new Date(plant.planting_date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.plantStage}>
                        Stage: {plant.stage}
                      </Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      {plant.harvest_date && (
                        <Pressable style={styles.scheduleButton}>
                          <Text style={styles.scheduleText}>🗓️ Harvest: {new Date(plant.harvest_date).toLocaleDateString()}</Text>
                        </Pressable>
                      )}
                      {plant.next_watering && (
                        <Pressable style={styles.scheduleButton}>
                          <Text style={styles.scheduleText}>💧 Water: {new Date(plant.next_watering).toLocaleDateString()}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Animated.View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '500',
    marginTop: -2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#2E7D32',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    margin: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  agendaContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
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
  agendaHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  agendaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  agendaDate: {
    fontSize: 14,
    color: '#666',
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  plantNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  plantNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  plantEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  plantInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plantNameContainer: {
    flex: 1,
    marginRight: 16,
  },
  scheduleInfo: {
    alignItems: 'flex-end',
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  plantStage: {
    fontSize: 14,
    color: '#666',
  },
  scheduleButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 12,
    color: '#666',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  deleteAction: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});