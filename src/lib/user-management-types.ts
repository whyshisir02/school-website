export const ASSIGNABLE_PERMISSIONS = { GALLERY: "Gallery and albums", NOTICES: "Notices and announcements", FACULTY: "Faculty and staff", INQUIRIES: "Parent inquiries", HERO: "Homepage photos", MESSAGES: "Leadership messages" } as const;
export type ManagedUser = { id: string; email: string; name: string; role: string; permissions: string[]; isActive: boolean; passwordReady: boolean; tokenVersion: number; createdAt: string };
export type UserInput = { id: string; email: string; name: string; permissions: string[]; tokenVersion: number };
