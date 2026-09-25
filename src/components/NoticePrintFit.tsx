"use client";

import { useEffect } from "react";

/**
 * Makes a notice always print on a single A4 page.
 *
 * On screen the letterhead grows with the message (its own CSS handles that).
 * For printing we can't rely on CSS alone to shrink an over-long notice onto
 * one page, so just before the print dialog opens we measure the sheet at the
 * real A4 printable width and, if it's taller than one page, set a `zoom`
 * factor (via the --print-zoom CSS variable, consumed only inside @media print)
 * that scales the whole sheet down to fit. Short notices keep zoom = 1 and fill
 * the page as usual. The value is cleared again after printing.
 */
export default function NoticePrintFit() {
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>(".notice-sheet");
    if (!sheet) return;

    const PX_PER_MM = 96 / 25.4; // CSS reference pixels per millimetre
    const pageH = 273 * PX_PER_MM; // A4 297mm − 2×10mm margin, ~4mm safety
    const pageW = 190 * PX_PER_MM; // A4 210mm − 2×10mm margin

    const fit = () => {
      // Lay the sheet out at the print width so line-wrapping (and therefore
      // height) matches what the printer will actually produce, then measure.
      const prevWidth = sheet.style.width;
      sheet.style.width = `${pageW}px`;
      const contentH = sheet.scrollHeight + 14; // + frame border allowance
      sheet.style.width = prevWidth;

      const zoom = Math.min(1, pageH / contentH);
      sheet.style.setProperty("--print-zoom", zoom.toFixed(4));
    };

    const reset = () => sheet.style.removeProperty("--print-zoom");

    // beforeprint/afterprint cover Ctrl+P and the on-page Print button in
    // Chromium/Firefox; the matchMedia listener is a Safari fallback.
    window.addEventListener("beforeprint", fit);
    window.addEventListener("afterprint", reset);
    const mq = window.matchMedia("print");
    const onChange = (e: MediaQueryListEvent) => (e.matches ? fit() : reset());
    mq.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("beforeprint", fit);
      window.removeEventListener("afterprint", reset);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  return null;
}
