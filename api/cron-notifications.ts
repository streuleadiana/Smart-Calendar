import { Request, Response } from 'express';
import webpush from 'web-push';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Required for reading Firestore on the backend)
if (!admin.apps.length) {
    let serviceAccount;
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
             serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        }
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY', e);
    }

    admin.initializeApp({
        credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

// Configure web-push
// Ensure you have generated VAPID keys using: npx web-push generate-vapid-keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
        'mailto:support@smartcalendar.local', // Replace with your email
        publicVapidKey,
        privateVapidKey
    );
}

export default async function handler(req: Request, res: Response) {
    // Basic security check (Optional: Vercel sends a CRON header)
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const now = new Date();
        const currentTimeString = now.toTimeString().substring(0, 5); // 'HH:MM'
        const offsetMinutes = 15; // notify 15 mins before

        // Calculate target time: what time is it 15 minutes from now?
        const targetTime = new Date(now.getTime() + offsetMinutes * 60000);
        const targetTimeString = targetTime.toTimeString().substring(0, 5);
        const todayDateString = targetTime.toISOString().split('T')[0];

        // Retrieve all users to find matching events (In a real app, query optimized by time)
        const usersSnapshot = await db.collection('users').get();
        
        let notificationsSent = 0;

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const pushSubscriptionData = userData.pushSubscription;

            if (!pushSubscriptionData) continue; // Skip users without a saved subscription

            // Parse the subscription
            let pushSubscription: webpush.PushSubscription;
            try {
                pushSubscription = JSON.parse(pushSubscriptionData);
            } catch (e) {
                console.error(`Invalid PushSubscription for user ${userDoc.id}`);
                continue;
            }

            // You would typically query events scheduled for `todayDateString` and `targetTimeString` here
            // Note: If you saved events inside the user document or dynamically fetched them via `db.collectionGroup('events')`,
            // depending on your schema. For demo context, this is where you match events.
            
            // Example match payload
            /*
            const notificationPayload = JSON.stringify({
                title: 'Upcoming Event!',
                body: `Your event starts in 15 minutes!`,
                icon: '/icon-192.png',
                url: '/'
            });

            await webpush.sendNotification(pushSubscription, notificationPayload);
            notificationsSent++;
            */
        }

        return res.status(200).json({ success: true, count: notificationsSent, message: 'Cron job executed successfully' });
    } catch (error) {
        console.error('Error executing cron-notifications', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
