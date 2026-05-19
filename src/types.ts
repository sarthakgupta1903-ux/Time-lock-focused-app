/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO string
  createdAt: string;
  category: 'work' | 'personal' | 'health' | 'other';
  reminderTime?: string; // ISO string
  recurrence?: 'none' | 'daily' | 'alternate';
  lastCompletedAt?: string; // ISO string
}

export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  profession: 'student' | 'corporate' | 'creative' | 'entrepreneur' | 'other';
  isSetupComplete: boolean;
  permissions: {
    usageStats: boolean;
    notifications: boolean;
    accessibility: boolean;
    overlay: boolean;
  };
}

export interface UsageLog {
  id: string;
  timestamp: string;
  appId: string;
  durationMinutes: number;
  type: 'usage' | 'unlock' | 'lock';
}

export interface LockedApp {
  id: string;
  name: string;
  icon: string;
  isLocked: boolean;
  unlockTime: string; // HH:mm
  usageLimit: number; // minutes
  category: 'social' | 'entertainment' | 'gaming' | 'utility';
  hoursSpentToday: number;
}

export interface OTPState {
  code: string;
  expiresAt: string;
  isAvailable: boolean;
  targetAppId?: string;
}

export interface TaskSuggestion {
  title: string;
  category: Task['category'];
  priority: Task['priority'];
  reason: string;
}
