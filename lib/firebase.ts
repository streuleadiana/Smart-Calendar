import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, isSupported, getToken } from "firebase/messaging";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase config check:", !!firebaseConfig.apiKey, firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const auth = getAuth(app);
export const storage = getStorage(app);
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

export const uploadImageToStorage = async (file: File, folder: string): Promise<string> => {
    if (!auth.currentUser) throw new Error("Trebuie să fii autentificat pentru a încărca imagini.");
    
    // Check if storage bucket config is present
    if (!firebaseConfig.storageBucket) {
        throw new Error("Firebase Storage non-configurat (lipsește 'storageBucket' în configurație).");
    }

    try {
        const uploadPromise = (async () => {
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/${folder}/${filename}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        })();

        // Timeout of 3 seconds to prevent hanging indefinitely or block or rules fail quietly
        const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error("Încărcarea a expirat după 3 secunde (Timeout).")), 3000);
        });

        return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (error: any) {
        console.warn("Firebase Storage upload failed (falling back gracefully):", error);
        throw new Error(error?.message || "Eroare la încărcarea imaginii în Storage.");
    }
};
