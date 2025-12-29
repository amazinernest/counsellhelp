// Supabase client configuration
// This file initializes the Supabase client with proper authentication persistence

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for Supabase that properly handles AsyncStorage
const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        await AsyncStorage.removeItem(key);
    },
};

// Create Supabase client with custom storage adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
