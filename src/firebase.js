import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const hasConfig = apiKey && authDomain && projectId;

let app = null;
let auth = null;
let googleProvider = null;

if (hasConfig) {
  try {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
    });
    if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      getAnalytics(app);
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
}

export { auth, googleProvider };

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Sign-in is not configured. Add Firebase env vars in Vercel and redeploy.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return {
    name: result.user.displayName,
    email: result.user.email,
    photo: result.user.photoURL,
  };
};