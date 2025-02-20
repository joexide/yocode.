import { Platform, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#E0E0E0',
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          backgroundColor: '#2E7D32',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 120 : 92,
          paddingBottom: Platform.OS === 'ios' ? 0 : 0,
          paddingTop: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          elevation: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabel: ({ focused, color }) => (
          <Text 
            style={{ 
              color, 
              fontSize: 12,
              fontWeight: '600',
              marginTop: 0,
              marginBottom: Platform.OS === 'ios' ? 0 : 4,
            }}
          >
            {focused ? ({
              index: 'Garden',
              ai: 'Freddy',
              community: 'Community',
              profile: 'Profile'
            })[focused] : ''}
          </Text>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 36 }}>🏡</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Freddy',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 36 }}>🤖</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 36 }}>📜</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 36 }}>👨‍🌾</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 48 : 44,
  },
});