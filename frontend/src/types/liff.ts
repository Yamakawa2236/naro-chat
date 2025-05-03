export interface LiffUserProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

export type UserProfile = LiffUserProfile | {
    displayName: string;
    pictureUrl?: string;
};