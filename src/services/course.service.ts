import { apiService } from './api';
import { serviceRegistry } from './config';

export interface Course {
    id: number;
    external_course_id: string;
    title: string;
    description: string;
    date_added: string;
    image_url: string;
}

export interface CourseDetails extends Course {
    lessons: Lesson[];
    comments: Comment[];
    homeworks: Homework[];
    registrations: Registration[];
}

export interface Lesson {
    id: number;
    external_lesson_id: string;
    title: string;
    course: number;
    source_code_url: string;
    date_added: string;
    reading_url: string;
    course_external_id: string;
}

export interface Comment {
    id: number;
    external_comment_id: string;
    content: string;
    date_added: string;
    user_id: string;
    course: number;
    course_external_id: string;
}

export interface Homework {
    id: number;
    external_homework_id: string;
    title: string;
    homework_url: string;
    course: number;
    lesson: number | null;
    description: string;
    course_external_id: string;
    lesson_external_id: string | null;
}

export interface Registration {
    id: number;
    external_id: string;
    user_id: string;
    course: number;
    date_registered: string;
    course_external_id: string;
}

export interface SubmittedHomework {
    id: number;
    external_submitted_homework_id: string;
    user_id: string;
    homework: number;
    submitted_homework_url: string;
    description: string | null;
    date_submitted: string;
    homework_external_id: string;
}

class CourseService {
    async getAllCourses(): Promise<Course[]> {
        console.log('Getting all courses...');

        try {
            // Get random course replica
            const baseUrl = await serviceRegistry.getRandomCourseReplica();
            console.log('Course replica URL:', baseUrl);

            if (!baseUrl) {
                throw new Error('No course service available');
            }

            // Fetch courses
            const courses = await apiService.get<Course[]>(baseUrl, '/courses/');
            console.log('Courses received:', courses);

            return courses || [];

        } catch (error: any) {
            console.error('Failed to fetch courses:', error);
            throw error;
        }
    }

    async getCourseDetails(externalCourseId: string): Promise<CourseDetails> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.get<CourseDetails>(
                baseUrl,
                `/courses/${externalCourseId}/`
            );
        } catch (error) {
            console.error('Failed to fetch course details:', error);
            throw error;
        }
    }

    async createComment(data: {
        external_comment_id: string;
        content: string;
        user_id: string;
        course: string;
    }): Promise<Comment> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.post<Comment>(
                baseUrl,
                '/comments/',
                data
            );
        } catch (error) {
            console.error('Failed to create comment:', error);
            throw error;
        }
    }

    async deleteComment(externalCommentId: string): Promise<void> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            await apiService.delete<any>(
                baseUrl,
                `/comments/${externalCommentId}/`
            );
        } catch (error) {
            console.error('Failed to delete comment:', error);
            throw error;
        }
    }

    async registerToCourse(data: {
        external_id: string;
        user_id: string;
        course: string;
    }): Promise<Registration> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.post<Registration>(
                baseUrl,
                '/register-user/',
                data
            );
        } catch (error) {
            console.error('Failed to register to course:', error);
            throw error;
        }
    }

    async getLessonHomeworks(externalLessonId: string): Promise<Homework[]> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.get<Homework[]>(
                baseUrl,
                `/lessons/${externalLessonId}/homeworks/`
            );
        } catch (error) {
            console.error('Failed to fetch lesson homeworks:', error);
            throw error;
        }
    }

    async submitHomework(data: {
        external_submitted_homework_id: string;
        user_id: string;
        homework: string;
        submitted_homework_url: string;
        description?: string;
    }): Promise<SubmittedHomework> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.post<SubmittedHomework>(
                baseUrl,
                '/submit-homework/',
                data
            );
        } catch (error) {
            console.error('Failed to submit homework:', error);
            throw error;
        }
    }

    async getUserCourseRegistrations(userId: string): Promise<Registration[]> {
        const baseUrl = await serviceRegistry.getRandomCourseReplica();
        if (!baseUrl) {
            throw new Error('No course service available');
        }

        try {
            return await apiService.get<Registration[]>(
                baseUrl,
                `/registrations/?user_id=${userId}`
            );
        } catch (error) {
            console.error('Failed to fetch user registrations:', error);
            throw error;
        }
    }
}

export const courseService = new CourseService();
