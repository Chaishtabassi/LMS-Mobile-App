import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

export function NetworkMonitor() {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setShowBanner(!connected);
      
      if (!connected) {
        setTimeout(() => {
          setShowBanner(true);
        }, 500);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!showBanner) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutUp}
      className="absolute top-0 left-0 right-0 bg-red-600 z-50 shadow-lg"
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center flex-1">
          <WifiOff size={20} color="white" />
          <Text className="text-white ml-2 flex-1">
            No internet connection. Some features may be unavailable.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => NetInfo.refresh()}
          className="ml-2"
        >
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}