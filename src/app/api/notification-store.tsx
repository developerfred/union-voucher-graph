type NotificationInfo = {
    token: string;
    url: string;
};

// Map of user FID to notification token and URL
export const notificationTokens = new Map<string, NotificationInfo>();

// Helper functions to manage notification tokens
export function saveNotificationToken(fid: string, token: string, url: string): void {
    notificationTokens.set(fid, { token, url });
}

export function getNotificationInfo(fid: string): NotificationInfo | undefined {
    return notificationTokens.get(fid);
}

export function removeNotificationToken(fid: string): boolean {
    return notificationTokens.delete(fid);
}

export function getAllUserFids(): string[] {
    return Array.from(notificationTokens.keys());
}

