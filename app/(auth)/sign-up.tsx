import React, { useState } from 'react';
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
} from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInUp,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password);
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError('Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(1000)} 
        style={styles.background} 
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons
            name={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
            size={Platform.OS === 'ios' ? 28 : 24}
            color="black"
          />
        </Pressable>

        <View style={styles.header}>
          <Animated.Image
            entering={SlideInUp.springify().damping(12)}
            source={{ uri: 'https://t4.ftcdn.net/jpg/05/84/42/05/360_F_584420563_EtxHV66FTD3pZEEaRuZG0FHRav5hEETZ.jpg' }}
            style={styles.logoImage}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.titleBlack}>Join</Text>
            <Text style={styles.titleGreen}>InPlanted</Text>
          </View>
          <Text style={styles.subtitle}>
            Start your gardening journey
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <Animated.View 
              entering={FadeIn} 
              style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleSignUp}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
              </>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text style={styles.link}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 20,
    marginLeft: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    display: 'none',
  },
  logoImage: {
    width: 100,
    height: 120,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  titleBlack: {
    fontSize: 32,
    fontWeight: '800',
    color: 'black',
    letterSpacing: -1,
  },
  titleGreen: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    letterSpacing: -0.5,
  },
  form: {
    padding: 24,
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
    fontSize: 16,
    color: '#333',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonPressed: {
    backgroundColor: '#1B5E20',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
});