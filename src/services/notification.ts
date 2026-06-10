import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to get notification permissions:', error);
      return false;
    }
  }

  async showBookmarkReminder(bookmarkCount: number): Promise<void> {
    if (bookmarkCount >= 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Great progress!',
          body: `You've bookmarked ${bookmarkCount} courses. Ready to start learning?`,
          data: { screen: 'bookmarks' },
        },
        trigger: null,
      });
    }
  }

  async scheduleInactivityReminder(): Promise<void> {
    const lastOpened = await AsyncStorage.getItem('last_app_opened');
    const now = Date.now();
    
    if (lastOpened) {
      const lastOpenedTime = parseInt(lastOpened);
      const hoursSinceLastOpen = (now - lastOpenedTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastOpen >= 24) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '👋 Miss you!',
            body: 'You haven\'t opened the app in a while. Come back and continue your learning journey!',
            data: { screen: 'index' },
          },
          trigger: {
            seconds: 1,
          },
        });
      }
    }
    
    await this.scheduleDailyReminder();
  }

  private async scheduleDailyReminder(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Daily Learning Goal',
        body: 'Spend 10 minutes learning something new today!',
        data: { screen: 'index' },
      },
      trigger: {
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });
  }

  async updateLastOpened(): Promise<void> {
    await AsyncStorage.setItem('last_app_opened', Date.now().toString());
  }

  async sendCourseRecommendation(courseTitle: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎓 Recommended for you',
        body: `Based on your interests, you might like "${courseTitle}"`,
        data: { screen: 'index' },
      },
      trigger: null,
    });
  }
}

export const notificationService = new NotificationService();