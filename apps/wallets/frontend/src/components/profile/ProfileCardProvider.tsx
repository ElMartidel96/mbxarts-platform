'use client';

/**
 * ProfileCardProvider - Context provider for ProfileCard system (Wallets)
 *
 * Adapted from DAO's ProfileCardProvider. Uses thirdweb-compat layer
 * and Wallets' useProfile hook (cross-platform API).
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useAccount } from '@/lib/thirdweb-compat';
import { useProfile, usePublicProfile } from '@/hooks/useProfile';
import type { ProfileData } from '@/hooks/useProfile';

export type ProfileLevel = 1 | 2 | 3 | 4 | null;

interface ProfileCardContextValue {
  currentLevel: ProfileLevel;
  profile: ProfileData | null;
  isOwnProfile: boolean;
  isLoading: boolean;
  isError: boolean;
  isLocked: boolean;
  isShareFlowActive: boolean;
  isStandalone: boolean;
  thumbnailRef: RefObject<HTMLDivElement | null>;

  openLevel: (level: ProfileLevel) => void;
  closeLevel: () => void;
  goToLevel: (level: ProfileLevel) => void;
  nextLevel: () => void;
  prevLevel: () => void;
  lockLevel: () => void;
  unlockLevel: () => void;
  openShareFlow: () => void;
  closeShareFlow: () => void;
}

const ProfileCardContext = createContext<ProfileCardContextValue | null>(null);

export function useProfileCard() {
  const context = useContext(ProfileCardContext);
  if (!context) {
    throw new Error('useProfileCard must be used within ProfileCardProvider');
  }
  return context;
}

interface ProfileCardProviderProps {
  children: ReactNode;
  wallet?: string;
  initialLevel?: ProfileLevel;
  isStandalone?: boolean;
  onLevelChange?: (level: ProfileLevel) => void;
  onStandaloneClose?: () => void;
}

export function ProfileCardProvider({
  children,
  wallet: walletProp,
  initialLevel = 1,
  isStandalone = false,
  onLevelChange,
  onStandaloneClose,
}: ProfileCardProviderProps) {
  const { address: connectedAddress, isConnected } = useAccount();

  const targetWallet = walletProp || connectedAddress;
  const isOwnProfile = !walletProp || (isConnected && walletProp?.toLowerCase() === connectedAddress?.toLowerCase());

  const [currentLevel, setCurrentLevel] = useState<ProfileLevel>(initialLevel);
  const [isLocked, setIsLocked] = useState(false);
  const [isShareFlowActive, setIsShareFlowActive] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement | null>(null);

  const ownProfile = useProfile(isOwnProfile ? targetWallet : undefined);
  const publicProfile = usePublicProfile(!isOwnProfile ? targetWallet : undefined);

  const profile = useMemo<ProfileData | null>(() => {
    const source = isOwnProfile ? ownProfile.profile : publicProfile.profile;
    return source || null;
  }, [isOwnProfile, ownProfile.profile, publicProfile.profile]);

  const isLoading = isOwnProfile ? ownProfile.isLoading : publicProfile.isLoading;
  const isError = isOwnProfile ? ownProfile.isError : publicProfile.isError;

  const openLevel = useCallback((level: ProfileLevel) => {
    setCurrentLevel(level);
    onLevelChange?.(level);
  }, [onLevelChange]);

  const closeLevel = useCallback(() => {
    if (isStandalone && onStandaloneClose) {
      onStandaloneClose();
      return;
    }
    setCurrentLevel(1);
    setIsLocked(false);
    onLevelChange?.(1);
  }, [isStandalone, onStandaloneClose, onLevelChange]);

  const goToLevel = useCallback((level: ProfileLevel) => {
    setCurrentLevel(level);
    setIsLocked(true);
    onLevelChange?.(level);
  }, [onLevelChange]);

  const nextLevel = useCallback(() => {
    setCurrentLevel((prev) => {
      if (prev === null || prev >= 4) return prev;
      const next = (prev + 1) as ProfileLevel;
      onLevelChange?.(next);
      return next;
    });
  }, [onLevelChange]);

  const prevLevel = useCallback(() => {
    setCurrentLevel((prev) => {
      if (prev === null || prev <= 1) return prev;
      const next = (prev - 1) as ProfileLevel;
      onLevelChange?.(next);
      return next;
    });
  }, [onLevelChange]);

  const lockLevel = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockLevel = useCallback(() => {
    setIsLocked(false);
  }, []);

  const openShareFlow = useCallback(() => {
    setIsShareFlowActive(true);
    setCurrentLevel(2);
    setIsLocked(true);
    onLevelChange?.(2);
  }, [onLevelChange]);

  const closeShareFlow = useCallback(() => {
    setIsShareFlowActive(false);
    setCurrentLevel(4);
    setIsLocked(true);
    onLevelChange?.(4);
  }, [onLevelChange]);

  const value = useMemo<ProfileCardContextValue>(
    () => ({
      currentLevel,
      profile,
      isOwnProfile,
      isLoading,
      isError,
      isLocked,
      isShareFlowActive,
      isStandalone,
      thumbnailRef,
      openLevel,
      closeLevel,
      goToLevel,
      nextLevel,
      prevLevel,
      lockLevel,
      unlockLevel,
      openShareFlow,
      closeShareFlow,
    }),
    [currentLevel, profile, isOwnProfile, isLoading, isError, isLocked, isShareFlowActive, isStandalone, openLevel, closeLevel, goToLevel, nextLevel, prevLevel, lockLevel, unlockLevel, openShareFlow, closeShareFlow]
  );

  return (
    <ProfileCardContext.Provider value={value}>
      {children}
    </ProfileCardContext.Provider>
  );
}

export default ProfileCardProvider;
