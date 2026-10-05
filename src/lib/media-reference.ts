export function referencesMedia(publicId: string, settings: unknown, noticeCount: number, galleryCount: number, staffCount = 0): boolean {
  return staffCount > 0 || galleryCount > 0 || noticeCount > 0 || JSON.stringify(settings ?? {}).includes(publicId);
}
