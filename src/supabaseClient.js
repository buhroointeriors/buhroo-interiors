// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cwgzqjbgplijfflewmke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Z3pxamJncGxpamZmbGV3bWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjkxNjcsImV4cCI6MjEwMzUwNTE2N30.2lGXhNdQcl7v_LBNpEGDbb_ermY_smeVc7T39Qxz6QA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  },
});