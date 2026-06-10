import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Mail, Lock, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-12">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
                <BookOpen size={40} color="#2563eb" />
              </View>
              <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
              <Text className="text-gray-600 mt-2 text-center">
                Start your learning journey today
              </Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <User size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-900"
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <Mail size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-900"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <Lock size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-900"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <Lock size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-900"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                className="bg-primary-600 rounded-xl py-4 mt-6"
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="text-primary-600 font-semibold">Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}