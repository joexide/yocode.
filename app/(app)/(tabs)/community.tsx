import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeIn,
  Layout,
  SlideOutRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { storage } from '@/lib/storage';

type CommunityPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  category: string;
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [category, setCategory] = useState('All');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const categories = ['All', 'Questions', 'Tips', 'Progress', 'General'];

  useEffect(() => {
    fetchPosts();
  }, [category]);
  
  useEffect(() => {
    const loadUserId = async () => {
      const userId = await storage.getItem('user_id');
      setCurrentUserId(userId);
    };
    loadUserId();
  }, []);

  const fetchPosts = async () => {
    try {
      const storedPostsStr = await storage.getItem('community_posts');
      const storedPosts = JSON.parse(storedPostsStr || '[]');
      const filteredPosts = category === 'All' 
        ? storedPosts 
        : storedPosts.filter((post: CommunityPost) => post.category === category);
      setPosts(filteredPosts.sort((a: CommunityPost, b: CommunityPost) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const storedPostsStr = await storage.getItem('community_posts');
              const storedPosts = JSON.parse(storedPostsStr || '[]');
              const updatedPosts = storedPosts.filter((post: CommunityPost) => post.id !== postId);
              await storage.setItem('community_posts', JSON.stringify(updatedPosts));
              setPosts(updatedPosts);
              
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              }
            } catch (err) {
              setError('Failed to delete post. Please try again.');
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSending(true);

    try {
      const userId = await storage.getItem('user_id') || Date.now().toString();
      if (!(await storage.getItem('user_id'))) {
        await storage.setItem('user_id', userId);
      }

      const newPost = {
        id: Date.now().toString(),
        user_id: userId,
        title: 'New Post',
        content: message.trim(),
        category: category === 'All' ? 'General' : category,
        image_url: selectedImage,
        created_at: new Date().toISOString(),
      };

      const storedPostsStr = await storage.getItem('community_posts');
      const storedPosts = JSON.parse(storedPostsStr || '[]');
      storedPosts.unshift(newPost);
      await storage.setItem('community_posts', JSON.stringify(storedPosts));

      setMessage('');
      setSelectedImage(null);
      await fetchPosts();
      scrollViewRef.current?.scrollToEnd({ animated: true });
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } catch (err) {
      console.error('Error sending post:', err);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}><Text style={styles.boldText}>Community</Text></Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryButton,
                cat === category && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  cat === category && styles.categoryButtonTextActive
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.postsContainer}
          contentContainerStyle={styles.postsContent}>
          {posts.map((post) => (
            <Swipeable
              key={post.id}
              renderRightActions={() => (
                <Animated.View style={styles.deleteAction}>
                  <MaterialCommunityIcons name="delete" size={24} color="white" />
                </Animated.View>
              )}
              onSwipeableOpen={() => handleDeletePost(post.id)}
              overshootRight={false}>
              <Animated.View
                entering={FadeIn}
                exiting={SlideOutRight}
                layout={Layout}
                style={styles.postCard}>
                <View style={styles.postHeader}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={40}
                    color="#2E7D32"
                  />
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postAuthor}>
                      You
                    </Text>
                    <Text style={styles.postTime}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                {post.image_url && (
                  <Image
                    source={{ uri: post.image_url }}
                    style={styles.postImage}
                    contentFit="cover"
                  />
                )}
                
                <Text style={styles.postContent}>{post.content}</Text>
              </Animated.View>
            </Swipeable>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { marginBottom: Platform.OS === 'ios' ? 90 : 60 }]}>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <MaterialCommunityIcons name="close" size={20} color="white" />
              </Pressable>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <Pressable
              style={styles.imageButton}
              onPress={handleImagePick}>
              <Text style={{ fontSize: 24 }}>📸</Text>
            </Pressable>
            
            <TextInput
              style={styles.input}
              placeholder="Share something with the community..."
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            
            <Pressable
              style={[
                styles.sendButton,
                (!message.trim() && !selectedImage) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={(!message.trim() && !selectedImage) || sending}
            >
              {sending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.sendButtonText}>📨</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
  },
  boldText: {
    fontWeight: '800',
  },
  categoriesContainer: {
    display: 'none'
  },
  categoriesContent: {
    display: 'none'
  },
  categoryButton: {
    display: 'none'
  },
  categoryButtonActive: {
    display: 'none'
  },
  categoryButtonText: {
    display: 'none'
  },
  categoryButtonTextActive: {
    display: 'none'
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    padding: 8,
  },
  postsContainer: {
    flex: 1,
  },
  postsContent: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  selectedImageContainer: {
    marginBottom: 8,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 24,
  },
  deleteAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});