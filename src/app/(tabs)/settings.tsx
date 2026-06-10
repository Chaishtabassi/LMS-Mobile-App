import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '@/src/services/notification';
import { 
  Bell, 
  Moon, 
  Database, 
  Info, 
  Shield, 
  Trash2,
  ChevronRight,
  Volume2,
  Wifi,
  HelpCircle,
  Share2
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications_enabled');
      const savedDarkMode = await AsyncStorage.getItem('dark_mode_enabled');
      const savedAutoPlay = await AsyncStorage.getItem('auto_play_enabled');
      const savedWifiOnly = await AsyncStorage.getItem('download_over_wifi');
      
      if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
      if (savedAutoPlay !== null) setAutoPlay(savedAutoPlay === 'true');
      if (savedWifiOnly !== null) setDownloadOverWifi(savedWifiOnly === 'true');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await saveSetting('notifications_enabled', value);
    
    if (value) {
      await notificationService.requestPermissions();
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will reset all app data including bookmarks and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'App data reset successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightElement, danger = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <Icon size={22} color={danger ? '#EF4444' : '#3B82F6'} />
        <View style={styles.settingItemTextContainer}>
          <Text style={[styles.settingItemTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  const SwitchItem = ({ icon: Icon, title, subtitle, value, onValueChange }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <Icon size={22} color="#3B82F6" />
        <View style={styles.settingItemTextContainer}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
        thumbColor={value ? '#3B82F6' : '#F3F4F6'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <View style={styles.sectionCard}>
            <SwitchItem
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive updates about your courses"
              value={notifications}
              onValueChange={handleNotificationsToggle}
            />
            
            <SwitchItem
              icon={Moon}
              title="Dark Mode"
              subtitle="Switch to dark theme"
              value={darkMode}
              onValueChange={(value: boolean) => {
                setDarkMode(value);
                saveSetting('dark_mode_enabled', value);
              }}
            />
            
            <SwitchItem
              icon={Volume2}
              title="Auto-play Videos"
              subtitle="Automatically play video lessons"
              value={autoPlay}
              onValueChange={(value: boolean) => {
                setAutoPlay(value);
                saveSetting('auto_play_enabled', value);
              }}
            />
            
            <SwitchItem
              icon={Wifi}
              title="Download over Wi-Fi only"
              subtitle="Use Wi-Fi only for downloads"
              value={downloadOverWifi}
              onValueChange={(value: boolean) => {
                setDownloadOverWifi(value);
                saveSetting('download_over_wifi', value);
              }}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          
          <View style={styles.sectionCard}>
            <SettingItem
              icon={Database}
              title="Clear Cache"
              subtitle="Clear temporary data"
              onPress={handleClearCache}
            />
            
            <SettingItem
              icon={Trash2}
              title="Reset App"
              subtitle="Reset all app data"
              onPress={handleResetApp}
              danger={true}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          
          <View style={styles.sectionCard}>
            <SettingItem
              icon={HelpCircle}
              title="Help Center"
              subtitle="Get help with the app"
              onPress={() => Alert.alert('Help', 'Help center coming soon!')}
            />
            
            <SettingItem
              icon={Share2}
              title="Share App"
              subtitle="Share with friends"
              onPress={() => Alert.alert('Share', 'Sharing feature coming soon!')}
            />
            
            <SettingItem
              icon={Info}
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('About', 'LMS Mobile App v1.0.0')}
            />
            
            <SettingItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon!')}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 LMS Mobile App</Text>
          <Text style={styles.footerSubtext}>All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingItemTextContainer: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingItemSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});