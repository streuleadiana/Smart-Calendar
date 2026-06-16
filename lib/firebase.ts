import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, isSupported, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Cloud Messaging safely
export const messaging = async () => {
    try {
        const supported = await isSupported();
        if (supported) {
            return getMessaging(app);
        }
    } catch (e) {
        console.error("Messaging not supported", e);
    }
    return null;
};

export const cleanPayload = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(cleanPayload);
    }
    const cleanObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value !== undefined) {
                cleanObj[key] = cleanPayload(value);
            }
        }
    }
    return cleanObj;
};

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return null;
    
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const msg = await messaging();
            if (msg) {
                const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    console.warn("VITE_FIREBASE_VAPID_KEY is not set. FCM Push tokens cannot be generated. Local notifications will still work.");
                    return null;
                }
                const token = await getToken(msg, { vapidKey });
                return token;
            }
        }
    } catch (error) {
        console.error('Unable to get permission to notify.', error);
    }
    return null;
};
