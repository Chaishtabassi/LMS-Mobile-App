import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Heart, Users, Star, Clock } from 'lucide-react-native';
import { Course } from '@/src/types';
import { useCourseStore } from '@/src/store/useCourseStore';
import { notificationService } from '@/src/services/notification';

const { width } = Dimensions.get('window');

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const { toggleBookmark, bookmarkedCourses } = useCourseStore();
  const isBookmarked = bookmarkedCourses.includes(course.id);

  const handleBookmark = async () => {
    await toggleBookmark(course.id);
    const newCount = isBookmarked ? bookmarkedCourses.length - 1 : bookmarkedCourses.length + 1;
    await notificationService.showBookmarkReminder(newCount);
  };

  const getLevelStyle = () => {
    switch (course.level?.toLowerCase()) {
      case 'beginner':
        return styles.beginnerBadge;
      case 'intermediate':
        return styles.intermediateBadge;
      case 'advanced':
        return styles.advancedBadge;
      default:
        return styles.beginnerBadge;
    }
  };

  const getLevelTextStyle = () => {
    switch (course.level?.toLowerCase()) {
      case 'beginner':
        return styles.beginnerText;
      case 'intermediate':
        return styles.intermediateText;
      case 'advanced':
        return styles.advancedText;
      default:
        return styles.beginnerText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Bookmark Button */}
        <TouchableOpacity
          onPress={handleBookmark}
          style={styles.bookmarkButton}
        >
          <Heart
            size={20}
            color={isBookmarked ? '#ef4444' : '#9ca3af'}
            fill={isBookmarked ? '#ef4444' : 'none'}
          />
        </TouchableOpacity>

        {/* Level Badge */}
        <View style={[styles.levelBadge, getLevelStyle()]}>
          <Text style={[styles.levelText, getLevelTextStyle()]}>
            {course.level || 'Beginner'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Instructor & Rating */}
        <View style={styles.header}>
          <Image
            source={{ uri: course.instructor.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.instructorName} numberOfLines={1}>
            {course.instructor.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {course.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.statText}>{course.duration}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Users size={14} color="#6b7280" />
            <Text style={styles.statText}>
              {course.enrolledCount.toLocaleString()} students
            </Text>
          </View>
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${course.price}</Text>
          {course.originalPrice && (
            <Text style={styles.originalPrice}>${course.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  beginnerBadge: {
    backgroundColor: '#DCFCE7',
  },
  intermediateBadge: {
    backgroundColor: '#FEF3C7',
  },
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  beginnerText: {
    color: '#166534',
  },
  intermediateText: {
    color: '#92400E',
  },
  advancedText: {
    color: '#991B1B',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructorName: {
    flex: 1,
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
});