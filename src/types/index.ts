export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledCount: number;
  rating: number;
  price: number;
  isBookmarked?: boolean;
  content?: CourseContent;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  email: string;
}

export interface CourseContent {
  id: string;
  title: string;
  sections: CourseSection[];
}

export interface CourseSection {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  contentUrl?: string;
}

export interface Bookmark {
  id: string;
  courseId: string;
  userId: string;
  addedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type RootStackParamList = {
  'index': undefined;
  'login': undefined;
  'register': undefined;
  'profile': undefined;
  'course/[id]': { id: string };
  'webview/[url]': { url: string; title?: string };
  'bookmarks': undefined;
  'settings': undefined;
};