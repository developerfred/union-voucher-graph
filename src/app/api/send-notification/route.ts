import { NextRequest, NextResponse } from 'next/server';
import { getNotificationInfo, getAllUserFids } from '../notification-store';

export async function POST(request: NextRequest) {
    try {
        const { fid, title, body, targetUrl } = await request.json();

        if (!fid || !title || !body) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get notification token for the user
        const userNotification = getNotificationInfo(fid.toString());

        if (!userNotification) {
            return NextResponse.json(
                { success: false, error: 'User has not enabled notifications' },
                { status: 404 }
            );
        }

        // Send notification to the user
        const { url, token } = userNotification;

        const notificationResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tokens: [token],
                notification: {
                    title,
                    body,
                    targetUrl: targetUrl || 'https://union-vouch.aipop.fun',
                },
            }),
        });

        if (!notificationResponse.ok) {
            const errorData = await notificationResponse.json();
            console.error('Error sending notification:', errorData);

            return NextResponse.json(
                { success: false, error: 'Failed to send notification' },
                { status: notificationResponse.status }
            );
        }

        const responseData = await notificationResponse.json();

        return NextResponse.json({
            success: true,
            data: responseData
        }, { status: 200 });
    } catch (error) {
        console.error('Error handling notification request:', error);

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Endpoint to broadcast a notification to all users
export async function PUT(request: NextRequest) {
    try {
        const { title, body, targetUrl } = await request.json();

        if (!title || !body) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get all user FIDs
        const userFids = getAllUserFids();

        if (userFids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No users with notifications enabled' },
                { status: 404 }
            );
        }

        // Group users by notification URL for batch processing
        const usersByUrl = new Map<string, { url: string, tokens: string[] }>();

        for (const fid of userFids) {
            const userNotification = getNotificationInfo(fid);

            if (userNotification) {
                const { url, token } = userNotification;

                if (!usersByUrl.has(url)) {
                    usersByUrl.set(url, { url, tokens: [] });
                }

                usersByUrl.get(url)?.tokens.push(token);
            }
        }

        // Send notifications in batches (by URL)
        const results = [];

        for (const { url, tokens } of usersByUrl.values()) {
            // Process in batches of 100 (API limit)
            for (let i = 0; i < tokens.length; i += 100) {
                const batch = tokens.slice(i, i + 100);

                const notificationResponse = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tokens: batch,
                        notification: {
                            title,
                            body,
                            targetUrl: targetUrl || 'https://union-vouch.aipop.fun',
                        },
                    }),
                });

                if (notificationResponse.ok) {
                    const data = await notificationResponse.json();
                    results.push({ success: true, count: batch.length, data });
                } else {
                    const error = await notificationResponse.json();
                    results.push({ success: false, count: batch.length, error });
                }
            }
        }

        return NextResponse.json({
            success: true,
            totalUsers: userFids.length,
            results
        }, { status: 200 });
    } catch (error) {
        console.error('Error handling broadcast notification request:', error);

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}