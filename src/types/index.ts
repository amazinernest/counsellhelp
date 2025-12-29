// Type definitions for the counseling app

// User role types
export type UserRole = 'client' | 'counselor';

// Counselor specialty areas
export type Specialty =
    | 'relationship'
    | 'academic'
    | 'career'
    | 'mental_wellbeing'
    | 'family'
    | 'stress_management'
    | 'personal_development';

// Base user profile
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole | null;
    created_at: string;
    onboarding_complete: boolean;
    avatar_url: string | null;
}

// Extended counselor profile
export interface CounselorProfile {
    id: string;
    bio: string;
    specialties: Specialty[];
    years_experience: number;
    is_available: boolean;
    // Joined data
    profile?: Profile;
}

// Extended client profile
export interface ClientProfile {
    id: string;
    area_of_concern: string;
    // Joined data
    profile?: Profile;
}

// Conversation between client and counselor
export interface Conversation {
    id: string;
    client_id: string;
    counselor_id: string;
    created_at: string;
    last_message_at: string;
    // Joined data
    client?: Profile;
    counselor?: Profile;
    counselor_profile?: CounselorProfile;
    last_message?: Message;
}

// Chat message
export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

// Notification types
export type NotificationType = 'new_message' | 'new_request';

// In-app notification
export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

// Navigation param lists
export type RootStackParamList = {
    Auth: undefined;
    Onboarding: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
    RoleSelection: undefined;
};

export type OnboardingStackParamList = {
    CounselorOnboarding: undefined;
    ClientOnboarding: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Counselors: undefined;
    Messages: undefined;
    Profile: undefined;
};

export type MainStackParamList = {
    MainTabs: undefined;
    CounselorProfile: { counselorId: string };
    Chat: { conversationId: string; otherUserName: string };
    EditProfile: undefined;
};
