import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent, verifyAppKeyWithNeynar } from '@farcaster/frame-node';
import { saveNotificationToken, removeNotificationToken } from '../notification-store';

export async function POST(request: NextRequest) {
    try {
        // Get the raw JSON body
        const requestJson = await request.text();

        // Parse and verify the webhook event
        const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);

        // Extract user FID from the signature
        const userFid = data.signer.fid.toString();

        // Handle different event types
        switch (data.payload.event) {
            case 'frame_added':
                console.log(`User ${userFid} added the app`);

                // Save notification token if provided
                if (data.payload.notificationDetails) {
                    saveNotificationToken(
                        userFid,
                        data.payload.notificationDetails.token,
                        data.payload.notificationDetails.url
                    );
                    console.log(`Saved notification token for user ${userFid}`);
                }
                break;

            case 'frame_removed':
                console.log(`User ${userFid} removed the app`);

                // Remove notification token
                removeNotificationToken(userFid);
                break;

            case 'notifications_enabled':
                console.log(`User ${userFid} enabled notifications`);

                // Save new notification token
                if (data.payload.notificationDetails) {
                    saveNotificationToken(
                        userFid,
                        data.payload.notificationDetails.token,
                        data.payload.notificationDetails.url
                    );
                    console.log(`Saved notification token for user ${userFid}`);
                }
                break;

            case 'notifications_disabled':
                console.log(`User ${userFid} disabled notifications`);

                // Remove notification token
                removeNotificationToken(userFid);
                break;

            default:
                console.warn(`Unknown event type: ${data.payload.event}`);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process webhook' },
            { status: 400 }
        );
    }
}