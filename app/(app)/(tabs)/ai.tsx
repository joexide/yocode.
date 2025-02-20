import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { chatWithFreddy, analyzeImage } from '@/lib/openrouter';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Message = {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  image?: string;
};

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Freddy, your gardening AI assistant. I can help you with plant care, identification, and scheduling. You can also send me photos of your plants for analysis! 🌱",
      type: 'assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isThinking, setIsThinking] = useState(false);

 
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable camera and photo library access in your device settings.',
          [
            { 
              text: 'Open Settings',
              onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings(),
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    })();
  }, []);

  const handleSend = async () => {
    if (loading || (!input.trim() && !selectedImage)) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim() || 'Can you identify this plant and provide care instructions?',
      type: 'user',
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsThinking(true);
    setLoading(true);
    setError(null);

   
    const startTime = Date.now();

    try {
      let aiResponse: string;
      
      if (userMessage.image) {
       
        const imagePrompt = input.trim() || 
          'Please analyze this plant image and provide:\n' +
          '1. Plant identification if possible\n' +
          '2. Current health assessment\n' +
          '3. Growth stage evaluation\n' +
          '4. Care recommendations\n' +
          '5. Any visible issues or concerns';
        
        aiResponse = await analyzeImage(
          userMessage.image,
          imagePrompt
        );
      } else {
        aiResponse = await chatWithFreddy(
          messages
            .concat(userMessage)
            .map(msg => ({
              role: msg.type as 'user' | 'assistant',
              content: msg.content
            }))
        );
      }


      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        type: 'assistant',
      };

      setMessages((prev) => [...prev, aiMessage]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Camera error:', err);
      const message = err instanceof Error ? err.message : 'Failed to take picture';
      Alert.alert(
        'Camera Error',
        message,
        [{ text: 'OK' }]
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱<Text style={styles.boldText}>Freddy</Text></Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}>
        {messages.map((message) => (
          <Animated.View
            key={message.id}
            entering={FadeIn}
            layout={Layout}
            style={[
              styles.message,
              message.type === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}>
            {message.image && (
              <Image
                source={{ uri: message.image }}
                style={styles.messageImage}
                contentFit="cover"
              />
            )}
            <Text style={[
              styles.messageText,
              { color: message.type === 'user' ? 'white' : '#333' },
            ]}>
              {message.content}
            </Text>
          </Animated.View>
        ))}
        {loading && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.message, styles.assistantMessage]}>
            <View style={styles.thinkingContainer}>
              <ActivityIndicator color="#2E7D32" size="small" />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          </Animated.View>
        )}
        {error && (
          <Animated.View
            entering={FadeIn}
            style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
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
              onPress={() => setSelectedImage(null)}>
              <Text style={styles.removeImageText}>✕</Text>
            </Pressable>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <Pressable
            style={styles.cameraButton}
            onPress={handleCamera}>
            <Text style={styles.cameraButtonText}>📸</Text>
          </Pressable>
          
          <TextInput
            style={styles.input}
            placeholder="Ask Freddy..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          
          <Pressable
            style={[
              styles.sendButton,
              (!input.trim() && !selectedImage) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={(!input.trim() && !selectedImage) || loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.sendButtonText}>📨</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 8,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    color: '#666',
    fontSize: 14,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
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
  removeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    fontSize: 24,
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
});