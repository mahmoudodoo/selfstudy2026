import { apiService } from './api';
import { serviceRegistry } from './config';
import { normalizePaginatedResponse, type PaginatedResponse } from '@/utils/api-utils';

export interface Course {
    id?: number;
    external_course_id: string;
    title: string;
    description: string;
    date_added?: string;
    image_url: string;
    lessons_count?: number;
    comments_count?: number;
}

export interface Lesson {
    id?: number;
    external_lesson_id: string;
    title: string;
    course?: string;
    course_external_id?: string;
    source_code_url?: string;
    reading_url?: string;
    date_added?: string;
    homeworks?: Homework[];
}

export interface Comment {
    id?: number;
    external_comment_id: string;
    content: string;
    date_added?: string;
    user_id: string;
    course?: string;
    course_external_id?: string;
}

export interface Homework {
    id?: number;
    external_homework_id: string;
    title: string;
    homework_url: string;
    course?: string;
    course_external_id?: string;
    lesson?: string;
    lesson_external_id?: string;
    description: string;
}

export interface SubmittedHomework {
    id?: number;
    external_submitted_homework_id: string;
    user_id: string;
    homework: string;
    homework_external_id?: string;
    submitted_homework_url: string;
    description?: string;
    date_submitted?: string;
}

export interface CourseRegistration {
    id?: number;
    external_id: string;
    user_id: string;
    course: string;
    course_external_id?: string;
    date_registered?: string;
}

export interface CourseFilters {
    search?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
}

class CourseService {
    private readonly APP_ID = 19;

    async getCourseReplicas(): Promise<string[]> {
        return serviceRegistry.getServiceReplicas(this.APP_ID, 'course');
    }

    async getRandomCourseReplica(): Promise<string | null> {
        const replicas = await this.getCourseReplicas();
        return serviceRegistry.getRandomReplica(replicas);
    }

    // Courses
    async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const params = new URLSearchParams();
            if (filters?.search) params.append('search', filters.search);
            if (filters?.page) params.append('page', filters.page.toString());
            if (filters?.page_size) params.append('page_size', filters.page_size.toString());
            if (filters?.ordering) params.append('ordering', filters.ordering);

            const query = params.toString();
            const endpoint = query ? `/courses/?${query}` : '/courses/';

            console.log('🔍 [CourseService] Fetching courses from:', `${baseUrl}${endpoint}`);
            console.log('📋 [CourseService] Filters:', filters);

            const response = await apiService.get<any>(baseUrl, endpoint);

            console.log('✅ [CourseService] Response received:', {
                count: response.count,
                resultsLength: response.results?.length,
                next: response.next,
                previous: response.previous
            });

            return normalizePaginatedResponse<Course>(response);
        } catch (error) {
            console.error('❌ [CourseService] Failed to fetch courses:', error);
            throw error;
        }
    }

    async getCourse(courseId: string): Promise<Course> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            return await apiService.get<Course>(baseUrl, `/courses/${courseId}/`);
        } catch (error) {
            console.error('Failed to fetch course:', error);
            throw error;
        }
    }

    // Get course by ID (internal ID)
    async getCourseById(courseId: number): Promise<Course> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            // First get all courses and find by internal ID
            const response = await apiService.get<any>(baseUrl, '/courses/');
            const courses = normalizePaginatedResponse<Course>(response).results;
            const course = courses.find(c => c.id === courseId);
            if (!course) throw new Error(`Course with ID ${courseId} not found`);
            return course;
        } catch (error) {
            console.error('Failed to fetch course by ID:', error);
            throw error;
        }
    }

    // Lessons
    async getCourseLessons(courseId: string): Promise<Lesson[]> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const response = await apiService.get<any>(baseUrl, `/lessons/?course_id=${courseId}`);
            return normalizePaginatedResponse<Lesson>(response).results;
        } catch (error) {
            console.error('Failed to fetch course lessons:', error);
            throw error;
        }
    }

    async getLesson(lessonId: string): Promise<Lesson> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            return await apiService.get<Lesson>(baseUrl, `/lessons/${lessonId}/`);
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
            throw error;
        }
    }

    // Comments
    async getCourseComments(courseId: string): Promise<Comment[]> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const response = await apiService.get<any>(baseUrl, `/comments/?course_id=${courseId}`);
            return normalizePaginatedResponse<Comment>(response).results;
        } catch (error) {
            console.error('Failed to fetch course comments:', error);
            throw error;
        }
    }

    async createComment(commentData: Partial<Comment>): Promise<Comment> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            console.log('Creating comment with data:', commentData);

            // Based on your Django models, the serializer expects 'course' to be the internal ID
            // Let's get all courses first to find the matching internal ID
            const allCourses = await this.getCourses({ page_size: 100 });
            const course = allCourses.results.find(c => c.external_course_id === commentData.course);

            if (!course || !course.id) {
                throw new Error('Course not found or missing internal ID');
            }

            // Create the comment with the internal course ID
            const commentPayload = {
                external_comment_id: commentData.external_comment_id,
                content: commentData.content,
                user_id: commentData.user_id,
                course: course.id // Use internal ID
            };

            console.log('Sending comment payload:', commentPayload);
            const response = await apiService.post<Comment>(baseUrl, '/comments/', commentPayload);
            console.log('Comment created successfully:', response);
            return response;
        } catch (error: any) {
            console.error('Failed to create comment:', error);
            console.error('Error details:', error.data);
            throw error;
        }
    }

    async updateComment(commentId: string, commentData: Partial<Comment>): Promise<Comment> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            return await apiService.put<Comment>(baseUrl, `/comments/${commentId}/`, commentData);
        } catch (error) {
            console.error('Failed to update comment:', error);
            throw error;
        }
    }

    async deleteComment(commentId: string): Promise<void> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            await apiService.delete(baseUrl, `/comments/${commentId}/`);
        } catch (error) {
            console.error('Failed to delete comment:', error);
            throw error;
        }
    }

    // Homeworks
    async getLessonHomeworks(lessonId: string): Promise<Homework[]> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const response = await apiService.get<any>(baseUrl, `/homeworks/?lesson_id=${lessonId}`);
            return normalizePaginatedResponse<Homework>(response).results;
        } catch (error) {
            console.error('Failed to fetch lesson homeworks:', error);
            throw error;
        }
    }

    async getHomework(homeworkId: string): Promise<Homework> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            return await apiService.get<Homework>(baseUrl, `/homeworks/${homeworkId}/`);
        } catch (error) {
            console.error('Failed to fetch homework:', error);
            throw error;
        }
    }

    // Submissions
    async submitHomework(submissionData: Partial<SubmittedHomework>): Promise<SubmittedHomework> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            return await apiService.post<SubmittedHomework>(baseUrl, '/submit-homework/', submissionData);
        } catch (error) {
            console.error('Failed to submit homework:', error);
            throw error;
        }
    }

    async getUserSubmissions(userId: string, homeworkId?: string): Promise<SubmittedHomework[]> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const query = homeworkId ? `?user_id=${userId}&homework_id=${homeworkId}` : `?user_id=${userId}`;
            const response = await apiService.get<any>(baseUrl, `/submitted-homeworks/${query}`);
            return normalizePaginatedResponse<SubmittedHomework>(response).results;
        } catch (error) {
            console.error('Failed to fetch user submissions:', error);
            throw error;
        }
    }

    // Registrations
    async getUserRegistrations(userId: string): Promise<CourseRegistration[]> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const response = await apiService.get<any>(baseUrl, `/registrations/?user_id=${userId}`);
            return normalizePaginatedResponse<CourseRegistration>(response).results;
        } catch (error) {
            console.error('Failed to fetch user registrations:', error);
            throw error;
        }
    }

    async isUserRegisteredForCourse(userId: string, courseId: string): Promise<boolean> {
        const baseUrl = await this.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service replicas available');
        }

        try {
            const registrations = await this.getUserRegistrations(userId);
            return registrations.some(reg => reg.course_external_id === courseId || reg.course === courseId);
        } catch (error) {
            console.error('Failed to check registration:', error);
            return false;
        }
    }
}

export const courseService = new CourseService();
