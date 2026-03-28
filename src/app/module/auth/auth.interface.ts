export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
    role?: string;
    isModerator?: boolean;
    profileData?: {
        profilePhoto?: string;
        contactNumber?: string;
        bio?: string;
        address?: string;
        phoneNumber?: string;
        reputationScore?: number;
        socialLinks?: {
            twitter?: string;
            github?: string;
            linkedin?: string;
            website?: string;
            [key: string]: string | undefined;
        };
        assignNotes?: string;
    };
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}