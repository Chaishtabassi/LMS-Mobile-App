import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCourseStore } from '@/src/store/useCourseStore';
import { courseService } from '@/src/services/course';
import { CourseCard } from '@/src/components/CourseCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Heart, Search, Filter } from 'lucide-react-native';

export default function BookmarksScreen() {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { courses, loadBookmarks } = useCourseStore();
  const router = useRouter();

  useEffect(() => {
    loadBookmarkedCourses();
  }, [courses]);

  const loadBookmarkedCourses = async () => {
    setIsLoading(true);
    try {
      await loadBookmarks();
      const bookmarks = await courseService.getBookmarks();
      const filteredCourses = courses.filter(course =>
        bookmarks.includes(course.id)
      );
      setBookmarkedCourses(filteredCourses);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarkedCourses();
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Heart size={24} color="#3B82F6" fill="#3B82F6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {bookmarkedCourses.length} course{bookmarkedCourses.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {bookmarkedCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Heart size={64} color="#3B82F6" />
          </View>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyText}>
            Save courses you're interested in by tapping the heart icon on any course
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search bookmarks...</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={bookmarkedCourses}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={[styles.cardContainer, index === 0 && styles.firstCard]}>
                <CourseCard
                  course={item}
                  onPress={() => router.push(`/course/${item.id}`)}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
            }
          />
        </>
      )}
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
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerIcon: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 48,
    padding: 20,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  browseButton: {
    marginTop: 32,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: 8,
  },
  firstCard: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
});