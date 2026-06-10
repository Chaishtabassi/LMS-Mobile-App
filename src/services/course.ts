import { api } from './api';
import { Course, Instructor, ApiResponse, PaginatedResponse } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'user_bookmarks';

class CourseService {
  async getCourses(page: number = 1, limit: number = 20, search?: string): Promise<Course[]> {
    try {
      const [usersResponse, productsResponse] = await Promise.all([
        api.get('/public/randomusers', {
          params: { page, limit, results: limit }
        }),
        api.get('/public/randomproducts', {
          params: { page, limit, results: limit }
        })
      ]);

      console.log('Users response:', JSON.stringify(usersResponse.data, null, 2));
      console.log('Products response:', JSON.stringify(productsResponse.data, null, 2));

      let users = [];
      let products = [];

      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        users = usersResponse.data;
      } else if (usersResponse.data && usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
        users = usersResponse.data.data;
      } else if (usersResponse.data && usersResponse.data.results && Array.isArray(usersResponse.data.results)) {
        users = usersResponse.data.results;
      } else if (usersResponse.data && usersResponse.data.items && Array.isArray(usersResponse.data.items)) {
        users = usersResponse.data.items;
      }

      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data && productsResponse.data.data && Array.isArray(productsResponse.data.data)) {
        products = productsResponse.data.data;
      } else if (productsResponse.data && productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
        products = productsResponse.data.products;
      } else if (productsResponse.data && productsResponse.data.items && Array.isArray(productsResponse.data.items)) {
        products = productsResponse.data.items;
      }

      if (users.length === 0 || products.length === 0) {
        console.log('No data from API, returning mock courses');
        return this.getMockCourses();
      }
      
      const courses: Course[] = products.map((product: any, index: number) => {
        const instructor = users[index % users.length];
        return this.transformToCourse(product, instructor);
      });
      
      const bookmarks = await this.getBookmarks();
      courses.forEach(course => {
        course.isBookmarked = bookmarks.includes(course.id);
      });
      
      return courses;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return this.getMockCourses();
    }
  }

  private getMockCourses(): Course[] {
    return [
      {
        id: '1',
        title: 'React Native Mastery',
        description: 'Learn React Native from scratch to advanced concepts',
        thumbnail: 'https://picsum.photos/id/100/300/200',
        instructor: {
          id: '1',
          name: 'John Doe',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          bio: 'Senior React Native Developer',
          email: 'john@example.com',
        },
        duration: '10 hours',
        level: 'intermediate',
        enrolledCount: 1250,
        rating: 4.8,
        price: 49.99,
        content: {
          id: '1',
          title: 'React Native Mastery',
          sections: [
            { id: '1', title: 'Introduction', duration: '30 min', contentUrl: 'https://example.com/intro' },
            { id: '2', title: 'Core Concepts', duration: '2 hours', contentUrl: 'https://example.com/core' },
            { id: '3', title: 'Advanced Topics', duration: '3 hours', contentUrl: 'https://example.com/advanced' },
          ],
        },
      },
      {
        id: '2',
        title: 'TypeScript for React Developers',
        description: 'Master TypeScript with React',
        thumbnail: 'https://picsum.photos/id/101/300/200',
        instructor: {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          bio: 'TypeScript Expert',
          email: 'jane@example.com',
        },
        duration: '8 hours',
        level: 'beginner',
        enrolledCount: 890,
        rating: 4.9,
        price: 39.99,
        content: {
          id: '2',
          title: 'TypeScript for React',
          sections: [
            { id: '1', title: 'TypeScript Basics', duration: '1 hour', contentUrl: 'https://example.com/typescript' },
            { id: '2', title: 'React with TypeScript', duration: '2 hours', contentUrl: 'https://example.com/react' },
          ],
        },
      },
    ];
  }

  private transformToCourse(product: any, instructor: any): Course {
    return {
      id: product.id?.toString() || Math.random().toString(),
      title: product.title || product.name || 'Untitled Course',
      description: product.description || product.brand || 'No description available',
      thumbnail: product.thumbnail || product.image || 'https://picsum.photos/id/100/300/200',
      instructor: {
        id: instructor.id?.toString() || instructor.login?.uuid || Math.random().toString(),
        name: this.getInstructorName(instructor),
        avatar: instructor.picture?.large || instructor.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: instructor.location?.country || instructor.bio || 'Experienced instructor',
        email: instructor.email || 'instructor@example.com',
      },
      duration: `${Math.floor(Math.random() * 20) + 2} hours`,
      level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
      enrolledCount: Math.floor(Math.random() * 10000),
      rating: 3 + Math.random() * 2,
      price: Math.floor(Math.random() * 100),
      content: {
        id: product.id?.toString() || Math.random().toString(),
        title: product.title || 'Course Content',
        sections: [
          {
            id: '1',
            title: 'Introduction',
            duration: '10 min',
            contentUrl: 'https://example.com/intro',
          },
          {
            id: '2',
            title: 'Main Content',
            duration: '2 hours',
            contentUrl: 'https://example.com/main',
          },
          {
            id: '3',
            title: 'Conclusion',
            duration: '15 min',
            contentUrl: 'https://example.com/conclusion',
          },
        ],
      },
    };
  }

  private getInstructorName(instructor: any): string {
    if (instructor.name) {
      if (typeof instructor.name === 'string') return instructor.name;
      if (instructor.name.first && instructor.name.last) {
        return `${instructor.name.first} ${instructor.name.last}`;
      }
      if (instructor.name.title && instructor.name.first) {
        return `${instructor.name.title} ${instructor.name.first}`;
      }
    }
    if (instructor.username) return instructor.username;
    if (instructor.email) return instructor.email.split('@')[0];
    return 'Anonymous Instructor';
  }

  async getCourseById(id: string): Promise<Course | null> {
    const courses = await this.getCourses(1, 100);
    return courses.find(course => course.id === id) || null;
  }

  async toggleBookmark(courseId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      const index = bookmarks.indexOf(courseId);
      
      if (index > -1) {
        bookmarks.splice(index, 1);
      } else {
        bookmarks.push(courseId);
      }
      
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return index === -1;
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      return false;
    }
  }

  async getBookmarks(): Promise<string[]> {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarksJson ? JSON.parse(bookmarksJson) : [];
    } catch (error) {
      return [];
    }
  }

  async isBookmarked(courseId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.includes(courseId);
  }

  async enrollCourse(courseId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const enrollmentsKey = 'user_enrollments';
      const enrollmentsJson = await AsyncStorage.getItem(enrollmentsKey);
      const enrollments = enrollmentsJson ? JSON.parse(enrollmentsJson) : [];
      
      if (!enrollments.includes(courseId)) {
        enrollments.push(courseId);
        await AsyncStorage.setItem(enrollmentsKey, JSON.stringify(enrollments));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to enroll:', error);
      return false;
    }
  }

  async getEnrolledCourses(): Promise<string[]> {
    try {
      const enrollmentsKey = 'user_enrollments';
      const enrollmentsJson = await AsyncStorage.getItem(enrollmentsKey);
      return enrollmentsJson ? JSON.parse(enrollmentsJson) : [];
    } catch (error) {
      return [];
    }
  }
}

export const courseService = new CourseService();