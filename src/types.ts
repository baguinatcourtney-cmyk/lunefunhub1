/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  sex: string;
  age: number;
  country: string;
  luneSince: string;
  avatar?: string; // emoji
  coins?: number;
  rank?: string; // New Moon, Crescent Moon, Half Moon, Full Moon
  bias?: string;
  biasWrecker?: string;
  stanlist?: string;
  socials?: {
    twitter?: string;
    tiktok?: string;
    instagram?: string;
  };
  luneCode?: string;
  unlockedAvatars?: string[];
  hasEnteredHub?: boolean;
}

export type ThemeType = 'darkMoon' | 'spring' | 'summer' | 'autumn' | 'winter' | 'desert';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  rank: string;
  date: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface MemberProfile {
  name: string;
  emoji: string;
  color: string;
  bgClass: string;
  glowColor: string;
  mbti: string;
  mbtiNotes: string;
  personalInfo: {
    birthday: string;
    birthplace: string;
    nationality: string;
    bloodType: string;
    height: string;
    [key: string]: string;
  };
  personality: string[];
  history: string;
  funFacts?: string[];
  socialMedia: {
    instagram?: string;
    twitter?: string;
  };
}

export interface SongItem {
  id: number;
  title: string;
  year: number;
  album: string;
  spotifyUrl: string;
  trackId: string;
  pictureUrl: string;
  singleCoverUrl?: string;
}

export interface SnapTheme {
  id: string;
  name: string;
  unlocked: boolean;
  cost: number;
  bgStyle: string;
  overlayText: string;
  decorations: string[];
}

export interface MateQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    scores: { [memberName: string]: number };
  }[];
}
