import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '@/src/services/course';
import { useCourseStore } from '@/src/store/useCourseStore';
import { Course } from '@/src/types';
import { notificationService } from '@/src/services/notification';
import {
  Heart,
  Users,
  Star,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  Share2,
  Trophy,
  Target,
  ChevronRight,
  Lock,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();
  const { toggleBookmark, bookmarkedCourses } = useCourseStore();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCourse();
    checkEnrollment();
  }, [id]);

  const loadCourse = async () => {
    setIsLoading(true);
    try {
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    const enrolled = await courseService.getEnrolledCourses();
    setIsEnrolled(enrolled.includes(id));
  };

  const handleBookmark = async () => {
    if (!course) return;
    await toggleBookmark(course.id);
    const newCount = bookmarkedCourses.length + (course.isBookmarked ? -1 : 1);
    await notificationService.showBookmarkReminder(newCount);
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    Alert.alert(
      'Enroll in Course',
      `You're about to enroll in "${course.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enroll Now',
          onPress: async () => {
            const success = await courseService.enrollCourse(course.id);
            if (success) {
              setIsEnrolled(true);
              Alert.alert('Success!', 'Welcome to the course! 🎉');
              await notificationService.sendCourseRecommendation(course.title);
            } else {
              Alert.alert('Error', 'Failed to enroll. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!course) return;
    try {
      await Share.share({
        message: `Check out this amazing course: ${course.title}\n${course.description}`,
        title: course.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (isLoading || !course) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const isBookmarked = bookmarkedCourses.includes(course.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronRight size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.gradientOverlay} />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.actionButton}
            >
              <ChevronRight size={24} color="#1F2937" />
            </TouchableOpacity>
            
            <View style={styles.rightActions}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionButton}
              >
                <Share2 size={22} color="#1F2937" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBookmark}
                style={styles.actionButton}
              >
                <Heart
                  size={22}
                  color={isBookmarked ? '#EF4444' : '#1F2937'}
                  fill={isBookmarked ? '#EF4444' : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroTextContainer}>
            <View style={styles.badgeContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{course.level || 'Beginner'}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>⭐ {course.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{course.title}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Instructor Card */}
          <View style={styles.card}>
            <View style={styles.instructorRow}>
              <Image
                source={{ uri: course.instructor.avatar }}
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{course.instructor.name}</Text>
                <Text style={styles.instructorBio}>{course.instructor.bio}</Text>
                <View style={styles.instructorRating}>
                  <Star size={14} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.instructorRatingText}>4.9 Instructor Rating</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>{course.enrolledCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            
            <View style={styles.statCard}>
              <Clock size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>{course.duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statCard}>
              <BookOpen size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>{course.content?.sections.length || 0}</Text>
              <Text style={styles.statLabel}>Sections</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* What You'll Learn */}
          <View style={styles.learningContainer}>
            <View style={styles.learningHeader}>
              <Trophy size={24} color="#3B82F6" />
              <Text style={styles.learningTitle}>What You'll Learn</Text>
            </View>
            <View style={styles.learningList}>
              {course.learningObjectives?.slice(0, 4).map((objective, index) => (
                <View key={index} style={styles.learningItem}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={styles.learningText}>{objective}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Course Content Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            
            {course.content?.sections.map((section, index) => (
              <TouchableOpacity
                key={section.id}
                onPress={() => setActiveSection(activeSection === section.id ? null : section.id)}
                style={styles.sectionCard}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitle}>
                      {index + 1}. {section.title}
                    </Text>
                    <Text style={styles.sectionMeta}>
                      {section.duration} • {section.lessonsCount || 0} lessons
                    </Text>
                  </View>
                  {isEnrolled ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Lock size={18} color="#9CA3AF" />
                  )}
                </View>
                
                {activeSection === section.id && section.lessons && (
                  <View style={styles.lessonsContainer}>
                    {section.lessons.map((lesson, idx) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => {
                          if (isEnrolled) {
                            router.push({
                              pathname: '/webview/[url]',
                              params: { url: lesson.contentUrl, title: lesson.title }
                            });
                          }
                        }}
                      >
                        <Play size={14} color={isEnrolled ? "#3B82F6" : "#9CA3AF"} />
                        <Text style={[styles.lessonTitle, !isEnrolled && styles.lessonTitleLocked]}>
                          {lesson.title}
                        </Text>
                        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <View style={styles.requirementsList}>
                {course.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Target size={18} color="#3B82F6" />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.bottomButton}>
        {isEnrolled ? (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/webview/[url]',
              params: { url: course.content?.sections[0]?.contentUrl, title: course.title }
            })}
            style={styles.enrollButton}
          >
            <Play size={20} color="white" />
            <Text style={styles.buttonText}>Continue Learning</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>One-time payment</Text>
              <Text style={styles.priceAmount}>${course.price}</Text>
            </View>
            <TouchableOpacity
              onPress={handleEnroll}
              style={styles.enrollButton}
            >
              <Text style={styles.buttonText}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: height * 0.4,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  actionButtons: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingBadgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  instructorRow: {
    flexDirection: 'row',
  },
  instructorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  instructorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  instructorBio: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  instructorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  instructorRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  learningContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  learningList: {
    gap: 12,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  learningText: {
    flex: 1,
    color: '#374151',
    marginLeft: 8,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  lessonTitleLocked: {
    color: '#9CA3AF',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementText: {
    flex: 1,
    color: '#6B7280',
    marginLeft: 8,
    fontSize: 14,
  },
  bottomButton: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  enrollButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});