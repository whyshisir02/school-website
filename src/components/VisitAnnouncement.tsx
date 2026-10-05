"use client";
import { useEffect, useState } from "react";
import AnnouncementDialog, { type PopupPoster } from "./AnnouncementDialog";

export default function VisitAnnouncement() {
  const [poster, setPoster] = useState<PopupPoster | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // This layout persists across public navigation. No storage means a reload/new visit shows it again.
    async function load() {
      try {
        const response = await fetch("/api/announcements/active", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!data?.url) return;
        const image = new window.Image();
        image.src = data.url;
        await image.decode();
        if (active && (data.expiresAt === null || Date.now() < data.expiresAt)) setPoster(data);
      } catch { /* An unavailable poster must never block the school website. */ }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, []);
  return poster ? <AnnouncementDialog poster={poster} onClose={() => setPoster(null)} /> : null;
}
