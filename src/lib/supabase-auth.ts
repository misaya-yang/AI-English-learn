// Supabase Authentication Service
import { supabase, SUPABASE_URL, SUPABASE_DIRECT_URL, SUPABASE_ANON_KEY } from './supabase';
import { buildLocalAuthUserId, isLocalAuthUserId } from './localAuthIdentity';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  dailyGoal: number;
  preferredTopics: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  nativeLanguage: string;
}

const PROFILE_KEY_PREFIX = 'vocabdaily-profile-';
const LOCAL_AUTH_USER_KEY = 'vocabdaily-local-auth-user';
const LOCAL_AUTH_EVENT = 'vocabdaily-local-auth-change';
const DEFAULT_DEMO_EMAIL = 'demo@example.com';
const AUTH_SESSION_TIMEOUT_MS = 2500;
const AUTH_EXPIRY_GRACE_SECONDS = 30;
const SPECIAL_CHARACTER_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

interface StoredSupabaseUser {
  id?: string;
  email?: string;
  displayName?: string;
  user_metadata?: {
    display_name?: string;
  };
  created_at?: string;
}

interface StoredSupabaseSession {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: StoredSupabaseUser;
}

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getSupabaseAuthStorageKey(): string | null {
  try {
    const projectRef = new URL(SUPABASE_DIRECT_URL).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

function getSupabaseAuthStorageKeys(): string[] {
  if (!isBrowserEnvironment()) return [];

  const keys = new Set<string>();
  const expected = getSupabaseAuthStorageKey();
  if (expected) keys.add(expected);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('sb-') && key.endsWith('-auth-token')) {
      keys.add(key);
    }
  }

  return [...keys];
}

function clearSupabaseAuthSessionStorage(): void {
  for (const key of getSupabaseAuthStorageKeys()) {
    localStorage.removeItem(key);
  }
}

function clearStoredAuthCache(includeLocalAuth = false): void {
  if (!isBrowserEnvironment()) return;

  clearSupabaseAuthSessionStorage();
  localStorage.removeItem('supabase_access_token');
  localStorage.removeItem('supabase_refresh_token');
  if (includeLocalAuth || !getLocalAuthUser()) {
    localStorage.removeItem('supabase_user');
  }
  if (includeLocalAuth) {
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function getProfileStorageKey(userId: string): string {
  return `${PROFILE_KEY_PREFIX}${userId}`;
}

function getDefaultProfile(userId: string): UserProfile {
  return {
    userId,
    cefrLevel: 'B1',
    dailyGoal: 10,
    preferredTopics: ['Daily Life', 'Business'],
    learningStyle: 'visual',
    nativeLanguage: 'zh-CN',
  };
}

function loadLocalProfile(userId: string): UserProfile | null {
  const raw = localStorage.getItem(getProfileStorageKey(userId));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: UserProfile): void {
  localStorage.setItem(getProfileStorageKey(profile.userId), JSON.stringify(profile));
}

function isLocalDevelopmentHost(): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  return window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
}

function parseStoredSupabaseSession(raw: string | null): StoredSupabaseSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredSupabaseSession | { currentSession?: StoredSupabaseSession };
    if ('currentSession' in parsed && parsed.currentSession) {
      return parsed.currentSession;
    }
    return parsed as StoredSupabaseSession;
  } catch {
    return null;
  }
}

function getStoredSupabaseSession(): StoredSupabaseSession | null {
  if (!isBrowserEnvironment()) return null;

  for (const key of getSupabaseAuthStorageKeys()) {
    const session = parseStoredSupabaseSession(localStorage.getItem(key));
    if (session?.user?.id) {
      return session;
    }
  }

  return null;
}

function hasAuthCallbackParams(): boolean {
  if (!isBrowserEnvironment()) return false;

  const search = new URLSearchParams(window.location.search);
  return (
    search.has('code') ||
    search.has('error') ||
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token')
  );
}

function isStoredSupabaseSessionFresh(session: StoredSupabaseSession): boolean {
  if (!session.access_token || !session.user?.id) return false;
  if (!session.expires_at) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return session.expires_at > nowSeconds + AUTH_EXPIRY_GRACE_SECONDS;
}

function toAuthUserFromSupabaseUser(user: StoredSupabaseUser): AuthUser | null {
  if (!user.id) return null;

  return {
    id: user.id,
    email: user.email || '',
    displayName: user.displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || '',
    createdAt: user.created_at || new Date().toISOString(),
  };
}

function buildSyntheticSession(user: AuthUser | StoredSupabaseUser) {
  return {
    data: {
      session: {
        user,
      },
    },
    error: null,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(label));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function isDemoAccountEmail(email: string): boolean {
  const configuredDemoEmail =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_EMAIL
      ? String(import.meta.env.VITE_DEMO_EMAIL)
      : DEFAULT_DEMO_EMAIL;

  return email.trim().toLowerCase() === configuredDemoEmail.trim().toLowerCase();
}

function normalizeLocalUserId(email: string): string {
  return buildLocalAuthUserId(email);
}

function ensureLocalAuthUserIdentity(user: AuthUser): AuthUser {
  if (isLocalAuthUserId(user.id)) {
    return user;
  }

  const nextId = normalizeLocalUserId(user.email || DEFAULT_DEMO_EMAIL);
  const migrated = { ...user, id: nextId };
  const previousProfile = loadLocalProfile(user.id);
  if (previousProfile && !loadLocalProfile(nextId)) {
    saveLocalProfile({ ...previousProfile, userId: nextId });
  }
  localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(migrated));
  return migrated;
}

function getLocalAuthUser(): AuthUser | null {
  if (!isBrowserEnvironment()) {
    return null;
  }

  const raw = localStorage.getItem(LOCAL_AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return ensureLocalAuthUserIdentity(JSON.parse(raw) as AuthUser);
  } catch {
    return null;
  }
}

function syncCompatibilityAuthCache(user: AuthUser): void {
  localStorage.setItem('supabase_user', JSON.stringify({
    id: user.id,
    email: user.email,
    user_metadata: {
      display_name: user.displayName,
    },
    created_at: user.createdAt,
  }));
}

function emitLocalAuthChange(user: AuthUser | null): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.dispatchEvent(new CustomEvent<AuthUser | null>(LOCAL_AUTH_EVENT, {
    detail: user,
  }));
}

function persistLocalAuthUser(user: AuthUser): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(user));
  syncCompatibilityAuthCache(user);
  saveLocalProfile(loadLocalProfile(user.id) || getDefaultProfile(user.id));
  emitLocalAuthChange(user);
}

function buildLocalAuthUser(email: string, displayName?: string): AuthUser {
  return {
    id: normalizeLocalUserId(email),
    email,
    displayName: displayName || email.split('@')[0] || 'Local User',
    createdAt: new Date().toISOString(),
  };
}

function shouldUseLocalAuthFallback(error: unknown, email?: string): boolean {
  if (!isLocalDevelopmentHost() && !(email && isDemoAccountEmail(email))) {
    return false;
  }

  return isNetworkResolutionError(error);
}

function isNetworkResolutionError(error: unknown): boolean {
  const message = getErrorMessage(error, '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('name_not_resolved') ||
    message.includes('err_name_not_resolved') ||
    message.includes('networkerror') ||
    message.includes('load failed') ||
    message.includes('connection closed')
  );
}

function createLocalFallbackUser(email: string, displayName?: string): AuthUser {
  const user = buildLocalAuthUser(email, displayName);
  persistLocalAuthUser(user);
  console.warn('Supabase unavailable on localhost, using local auth fallback for development.');
  return user;
}

export function startDemoSession(): AuthUser {
  const demoEmail =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_EMAIL
      ? String(import.meta.env.VITE_DEMO_EMAIL)
      : DEFAULT_DEMO_EMAIL;
  const user = buildLocalAuthUser(demoEmail, 'Demo Learner');

  clearStoredAuthCache(true);
  persistLocalAuthUser(user);
  return user;
}

// Password validation according to i18n best practices
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  // Minimum length (8 for security, 6 for usability)
  if (password.length < 8) {
    errors.push('密码至少需要8个字符');
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('密码需要包含至少一个大写字母');
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('密码需要包含至少一个小写字母');
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('密码需要包含至少一个数字');
  }
  
  // Special character
  if (!SPECIAL_CHARACTER_REGEX.test(password)) {
    errors.push('密码需要包含至少一个特殊字符 (!@#$%^&*等)');
  }
  
  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const score = password.length + 
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (SPECIAL_CHARACTER_REGEX.test(password) ? 1 : 0);
  
  if (score >= 12 && password.length >= 10) {
    strength = 'strong';
  } else if (score >= 8 && password.length >= 8) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function buildUsername(email: string, userId: string, withSuffix = false): string {
  const base = email.split('@')[0]?.trim() || 'learner';
  return withSuffix ? `${base}-${userId.slice(0, 8)}` : base;
}

async function ensureRemoteUserRecord(args: {
  userId: string;
  email: string;
  displayName?: string;
  createdAt?: string;
}): Promise<boolean> {
  if (isLocalAuthUserId(args.userId)) {
    return true;
  }

  const now = new Date().toISOString();
  const payload = {
    id: args.userId,
    email: args.email,
    username: buildUsername(args.email, args.userId),
    display_name: args.displayName || args.email.split('@')[0],
    created_at: args.createdAt || now,
    updated_at: now,
  };

  const { error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' });

  if (!error) {
    return true;
  }

  if (error.code === '23505') {
    const { error: retryError } = await supabase
      .from('users')
      .upsert(
        {
          ...payload,
          username: buildUsername(args.email, args.userId, true),
        },
        { onConflict: 'id' },
      );

    if (!retryError) {
      return true;
    }

    console.warn('Remote user record sync fallback:', retryError);
    return false;
  }

  console.warn('Remote user record sync fallback:', error);
  return false;
}

// Register new user
export async function registerUser(
  email: string, 
  password: string, 
  displayName: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Validate email
    if (!validateEmail(email)) {
      return { user: null, error: '请输入有效的电子邮箱地址' };
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { user: null, error: passwordValidation.errors[0] };
    }
    
    // Check if email already exists in our users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    if (existingUser) {
      return { user: null, error: '此电子邮箱已被注册' };
    }
    
    // Create user in Supabase Auth (skip email confirmation for better UX)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    });
    
    if (authError) {
      console.error('Auth signup error:', authError);
      return { user: null, error: authError.message };
    }
    
    if (!authData.user) {
      return { user: null, error: '注册失败，请稍后重试' };
    }
    
    // Wait a moment for auth trigger to create the row, then upsert explicitly.
    // Supabase update does not fail when it matches 0 rows, so upsert is needed
    // to prevent first-run profile writes from missing their users(id) parent.
    await new Promise(resolve => setTimeout(resolve, 500));
    await ensureRemoteUserRecord({
      userId: authData.user.id,
      email,
      displayName,
      createdAt: authData.user.created_at,
    });

    // Keep a local fallback profile so onboarding/settings work
    // even when project-level RLS or triggers are not fully configured.
    saveLocalProfile(getDefaultProfile(authData.user.id));
    
    const user: AuthUser = {
      id: authData.user.id,
      email: email,
      displayName: displayName,
      createdAt: authData.user.created_at || new Date().toISOString(),
    };

    // Keep compatibility with existing local auth checks.
    if (authData.session?.access_token) {
      localStorage.setItem('supabase_access_token', authData.session.access_token);
      localStorage.setItem('supabase_refresh_token', authData.session.refresh_token);
      localStorage.setItem('supabase_user', JSON.stringify(authData.user));
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Register error:', error);
    if (shouldUseLocalAuthFallback(error, email)) {
      return { user: createLocalFallbackUser(email, displayName), error: null };
    }
    if (isNetworkResolutionError(error)) {
      return { user: null, error: '认证服务暂时不可用，请稍后重试' };
    }
    return { user: null, error: '注册失败，请稍后重试' };
  }
}

// Login user using direct REST API
export async function loginUser(
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Use direct REST API call instead of supabase-js
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login API error:', data);
      
      if (data.msg?.includes('Email not confirmed') || data.error_description?.includes('Email not confirmed')) {
        return { user: null, error: '请检查邮箱验证链接，或重新注册' };
      }
      if (data.msg?.includes('Invalid login credentials') || data.error_description?.includes('Invalid login credentials')) {
        return { user: null, error: '电子邮箱或密码错误' };
      }
      return { user: null, error: data.msg || data.error_description || '登录失败' };
    }
    
    if (!data.user) {
      return { user: null, error: '登录失败，请稍后重试' };
    }
    
    // Store session in localStorage for persistence
    if (data.access_token) {
      localStorage.setItem('supabase_access_token', data.access_token);
      localStorage.setItem('supabase_refresh_token', data.refresh_token);
      localStorage.setItem('supabase_user', JSON.stringify(data.user));

      // Keep supabase-js session in sync so refresh/reload works.
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    }
    
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      displayName: data.user.user_metadata?.display_name || email.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString(),
    };

    await ensureRemoteUserRecord({
      userId: user.id,
      email: user.email || email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    });
    
    return { user, error: null };
  } catch (error: unknown) {
    console.error('Login catch error:', error);
    if (shouldUseLocalAuthFallback(error, email)) {
      return { user: createLocalFallbackUser(email), error: null };
    }
    if (isNetworkResolutionError(error)) {
      return { user: null, error: '认证服务暂时不可用，请稍后重试' };
    }
    return { user: null, error: getErrorMessage(error, '登录失败，请稍后重试') };
  }
}

// Reset password — sends a password reset email via Supabase
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    if (shouldUseLocalAuthFallback(err)) {
      return { success: false, error: '当前本地开发环境无法连接 Supabase，暂时不能发送重置邮件' };
    }
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send reset email' };
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('Supabase sign out failed, clearing local auth state instead:', error);
  }
  clearStoredAuthCache(true);
  emitLocalAuthChange(null);
}

export async function getAuthSession() {
  const localUser = getLocalAuthUser();
  if (localUser) {
    syncCompatibilityAuthCache(localUser);
    return buildSyntheticSession(localUser);
  }

  const storedSession = getStoredSupabaseSession();
  if (storedSession) {
    if (!isStoredSupabaseSessionFresh(storedSession)) {
      console.warn('Stored Supabase auth session is expired or malformed; clearing cached auth state.');
      clearStoredAuthCache();
      return {
        data: { session: null },
        error: null,
      };
    }

    if (storedSession.user) {
      localStorage.setItem('supabase_user', JSON.stringify(storedSession.user));
      return {
        data: {
          session: storedSession,
        },
        error: null,
      };
    }
  }

  if (hasAuthCallbackParams()) {
    try {
      const session = await withTimeout(
        supabase.auth.getSession(),
        AUTH_SESSION_TIMEOUT_MS,
        'Auth session check timed out',
      );
      if (session.data.session) {
        return session;
      }
    } catch (error) {
      console.warn('Get auth session failed during callback; clearing cached auth state:', error);
      clearStoredAuthCache();
    }
  }

  clearStoredAuthCache();
  return {
    data: {
      session: null,
    },
    error: null,
  };
}

// Get current user from active Supabase session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { session },
    } = await getAuthSession();

    if (!session) {
      const localUser = getLocalAuthUser();
      if (localUser) {
        syncCompatibilityAuthCache(localUser);
        return localUser;
      }
      clearStoredAuthCache();
      return null;
    }

    const user = session.user as StoredSupabaseUser;
    const authUser = toAuthUserFromSupabaseUser(user);
    if (!authUser) {
      clearStoredAuthCache();
      return null;
    }

    localStorage.setItem('supabase_user', JSON.stringify(user));
    return authUser;
  } catch (error) {
    console.error('Get current user error:', error);
    const localUser = getLocalAuthUser();
    if (localUser) {
      syncCompatibilityAuthCache(localUser);
      return localUser;
    }
    return null;
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isLocalAuthUserId(userId)) {
    return loadLocalProfile(userId) || getDefaultProfile(userId);
  }

  try {
    // Add timeout for profile fetch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
    });
    
    const { data, error } = await Promise.race([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      timeoutPromise
    ]);
    
    if (error || !data) {
      return loadLocalProfile(userId);
    }

    const profile = {
      userId: data.user_id,
      cefrLevel: data.cefr_level,
      dailyGoal: data.daily_goal,
      preferredTopics: data.preferred_topics || [],
      learningStyle: data.learning_style,
      nativeLanguage: data.native_language,
    };
    saveLocalProfile(profile);
    return profile;
  } catch (error) {
    console.warn('Get profile fallback:', error);
    return loadLocalProfile(userId);
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<boolean> {
  const currentLocal = loadLocalProfile(userId) || getDefaultProfile(userId);
  const nextLocal: UserProfile = {
    ...currentLocal,
    ...updates,
    userId,
  };
  saveLocalProfile(nextLocal);

  if (isLocalAuthUserId(userId)) {
    return true;
  }

  try {
    const mappedUpdates: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (updates.cefrLevel !== undefined) mappedUpdates.cefr_level = updates.cefrLevel;
    if (updates.dailyGoal !== undefined) mappedUpdates.daily_goal = updates.dailyGoal;
    if (updates.preferredTopics !== undefined) mappedUpdates.preferred_topics = updates.preferredTopics;
    if (updates.learningStyle !== undefined) mappedUpdates.learning_style = updates.learningStyle;
    if (updates.nativeLanguage !== undefined) mappedUpdates.native_language = updates.nativeLanguage;

    const { error } = await supabase
      .from('profiles')
      .upsert(mappedUpdates, { onConflict: 'user_id' });
    
    if (error) {
      console.warn('Update profile remote fallback:', error);
    }
    return true;
  } catch (error) {
    console.warn('Update profile fallback:', error);
    return true;
  }
}

// Update user display name
export async function updateUserDisplayName(
  userId: string, 
  displayName: string
): Promise<boolean> {
  if (isLocalAuthUserId(userId)) {
    const localUser = getLocalAuthUser();
    if (localUser?.id === userId) {
      persistLocalAuthUser({ ...localUser, displayName });
    }
    return true;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Update display name error:', error);
    return false;
  }
}

// Check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  const {
    data: { session },
  } = await getAuthSession();

  return !!session;
}

// Subscribe to auth changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabaseSubscription = supabase.auth.onAuthStateChange((_event, session) => {
    const authUser = session?.user;
    if (!authUser) {
      const localUser = getLocalAuthUser();
      if (localUser) {
        syncCompatibilityAuthCache(localUser);
        callback(localUser);
        return;
      }

      clearStoredAuthCache();
      callback(null);
      return;
    }

    localStorage.setItem('supabase_user', JSON.stringify(authUser));
    if (session.access_token) {
      localStorage.setItem('supabase_access_token', session.access_token);
    }
    if (session.refresh_token) {
      localStorage.setItem('supabase_refresh_token', session.refresh_token);
    }

    callback({
      id: authUser.id,
      email: authUser.email || '',
      displayName: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || '',
      createdAt: authUser.created_at || new Date().toISOString(),
    });
  });

  const handleLocalAuthChange = (event: Event) => {
    const localUser = (event as CustomEvent<AuthUser | null>).detail;
    callback(localUser);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(LOCAL_AUTH_EVENT, handleLocalAuthChange as EventListener);
  }

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          supabaseSubscription.data.subscription.unsubscribe();
          if (typeof window !== 'undefined') {
            window.removeEventListener(LOCAL_AUTH_EVENT, handleLocalAuthChange as EventListener);
          }
        },
      },
    },
  };
}
