import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '@/src/services/course';
import { 
  LogOut, 
  Mail, 
  Calendar, 
  BookOpen, 
  Bookmark, 
  Award, 
  Settings,
  TrendingUp,
  Clock,
  ChevronRight,
  User
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const bookmarks = await courseService.getBookmarks();
      const enrolled = await courseService.getEnrolledCourses();
      const completed = await courseService.getCompletedCourses();
      setBookmarkCount(bookmarks.length);
      setEnrolledCount(enrolled.length);
      setCompletedCount(completed.length);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Cover */}
        <View style={styles.headerCover}>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <TouchableOpacity style={styles.avatarContainer}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.username ? getInitials(user.username) : 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator}>
                <User size={12} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>
              {user?.username || 'User'}
            </Text>
            <View style={styles.emailContainer}>
              <Mail size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={styles.editButton}
            >
              <Settings size={16} color="white" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BookOpen size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{enrolledCount}</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
              <View style={styles.statTrend}>
                <Text style={styles.trendUpText}>+12% this month</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Bookmark size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{bookmarkCount}</Text>
              <Text style={styles.statLabel}>Bookmarked</Text>
              <View style={styles.statTrend}>
                <Text style={styles.trendNeutralText}>Ready to learn</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Award size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={styles.statTrend}>
                <Text style={styles.trendUpText}>Keep going!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Learning Progress */}
        <View style={styles.sectionContainer}>
          <View style={styles.progressCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <TrendingUp size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Learning Progress</Text>
              </View>
              <Text style={styles.viewAllText}>View All</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Completion</Text>
                  <Text style={styles.progressPercentage}>35%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '35%' }]} />
                </View>
              </View>
              
              <View style={styles.statsDivider} />
              
              <View style={styles.statsRowSmall}>
                <View style={styles.statItemSmall}>
                  <Text style={styles.statNumberSmall}>12</Text>
                  <Text style={styles.statLabelSmall}>Hours spent</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.statItemSmall}>
                  <Text style={styles.statNumberSmall}>4</Text>
                  <Text style={styles.statLabelSmall}>Certificates</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.statItemSmall}>
                  <Text style={styles.statNumberSmall}>8</Text>
                  <Text style={styles.statLabelSmall}>Active courses</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.activityCard}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            
            <View style={styles.activityList}>
              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Completed "React Native Basics"</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Started "Advanced JavaScript"</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Earned "JavaScript" certificate</Text>
                  <Text style={styles.activityTime}>3 days ago</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.sectionContainer}>
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={styles.settingsItem}
            >
              <View style={styles.settingsItemLeft}>
                <Settings size={20} color="#3B82F6" />
                <Text style={styles.settingsItemText}>Account Settings</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleLogout}
              style={[styles.settingsItem, styles.logoutItem]}
            >
              <View style={styles.settingsItemLeft}>
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
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
  centeredContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCover: {
    backgroundColor: '#3B82F6',
    paddingTop: 32,
    paddingBottom: 48,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  editButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statTrend: {
    marginTop: 8,
  },
  trendUpText: {
    fontSize: 10,
    color: '#10B981',
  },
  trendNeutralText: {
    fontSize: 10,
    color: '#3B82F6',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  statsRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItemSmall: {
    alignItems: 'center',
    flex: 1,
  },
  statNumberSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabelSmall: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: '#F3F4F6',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
  },
});