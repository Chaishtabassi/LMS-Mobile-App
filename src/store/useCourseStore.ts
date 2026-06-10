import { create } from 'zustand';
import { Course } from '@/src/types';
import { courseService } from '@/src/services/course';

interface CourseState {
  courses: Course[];
  bookmarkedCourses: string[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: (page?: number, search?: string) => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  loadBookmarks: () => Promise<void>;
  searchCourses: (query: string) => Course[];
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarkedCourses: [],
  isLoading: false,
  error: null,
  
  fetchCourses: async (page = 1, search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const courses = await courseService.getCourses(page, 20, search);
      set({ courses, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  toggleBookmark: async (courseId: string) => {
    try {
      const isAdded = await courseService.toggleBookmark(courseId);
      const { bookmarkedCourses } = get();
      
      if (isAdded) {
        set({ bookmarkedCourses: [...bookmarkedCourses, courseId] });
      } else {
        set({ bookmarkedCourses: bookmarkedCourses.filter(id => id !== courseId) });
      }
      const { courses } = get();
      const updatedCourses = courses.map(course =>
        course.id === courseId
          ? { ...course, isBookmarked: isAdded }
          : course
      );
      set({ courses: updatedCourses });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  },
  
  loadBookmarks: async () => {
    const bookmarks = await courseService.getBookmarks();
    set({ bookmarkedCourses: bookmarks });
  },
  
  searchCourses: (query: string) => {
    const { courses } = get();
    if (!query.trim()) return courses;
    
    const searchTerm = query.toLowerCase();
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.instructor.name.toLowerCase().includes(searchTerm)
    );
  },
}));