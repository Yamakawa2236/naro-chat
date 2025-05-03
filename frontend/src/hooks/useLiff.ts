// src/hooks/useLiff.ts
import { useState, useEffect } from 'react';
import liff from '@line/liff';
import type { LiffUserProfile, UserProfile } from '../types/liff';

interface UseLiffResult {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  liffError: string | null;
  isLoading: boolean;
  isLiffEnvironment: boolean;
}

const checkLiffEnvironment = (): boolean => {
    if (typeof window !== 'undefined') {
        return window.location.search.includes('liff.state=') || liff.isInClient();
    }
    return false;
};


export const useLiff = (): UseLiffResult => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiffEnvironment, setIsLiffEnvironment] = useState<boolean>(false);

  useEffect(() => {
    setIsLiffEnvironment(checkLiffEnvironment());

    const initializeLiff = async () => {
      setIsLoading(true);
      setLiffError(null);
      const liffId = import.meta.env.VITE_LIFF_ID;
      if (!liffId) {
        const errorMsg = 'LIFF ID is not configured (VITE_LIFF_ID).';
        setLiffError(errorMsg);
        setIsLoading(false);

        if (!checkLiffEnvironment()) {
          console.warn("Running locally without LIFF ID. Using mock user.");
          setIsLoggedIn(true);
          setUserProfile({
            displayName: 'Local Developer (No LIFF ID)',
            pictureUrl: 'https://via.placeholder.com/40'
          });
        }
        return;
      }

      try {
        console.log(`Initializing LIFF with ID: ${liffId}`);
        await liff.init({ liffId });
        console.log('LIFF initialized successfully.');

        const inLiff = liff.isInClient();
        setIsLiffEnvironment(inLiff);

        if (liff.isLoggedIn()) {
          console.log('User is logged in.');
          setIsLoggedIn(true);
          try {
            const profile: LiffUserProfile = await liff.getProfile();
            console.log('Fetched profile:', profile);
            setUserProfile(profile);
          } catch (profileError) {
            console.error('Failed to fetch LIFF profile:', profileError);
            setLiffError('Failed to fetch user profile after login.');
          }
        } else {
          console.log('User is not logged in.');
          setIsLoggedIn(false);
          if (inLiff) {
            console.log('Not logged in within LIFF browser, attempting liff.login()...');
            liff.login();
            return;
          } else {
            console.warn("Running locally and not logged into LIFF. Using mock user.");
            setIsLoggedIn(true);
            setUserProfile({
              displayName: 'Local Developer',
              pictureUrl: 'https://via.placeholder.com/40'
            });
          }
        }
      } catch (error: any) {
        console.error('LIFF initialization or processing failed:', error);
        setLiffError(`LIFF Error: ${error?.message || String(error)}`);
        if (!checkLiffEnvironment()) {
          console.warn("LIFF initialization failed locally. Using mock user.");
          setIsLoggedIn(true);
          setUserProfile({
            displayName: 'Local Developer (LIFF Init Failed)',
            pictureUrl: 'https://via.placeholder.com/40'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeLiff();
  }, []);

  return { isLoggedIn, userProfile, liffError, isLoading, isLiffEnvironment };
};