import type { Quotation } from "@/models/quotation";
import { PAGE_H, PAGE_W } from "./paginate";
import { documentFileName, saveBlob } from "./download";

const A4_MM = { width: 210, height: 297 };

/** Strip editor-only chrome from a cloned page so only the document remains. */
function cleanClone(page: HTMLElement) {
  page.querySelectorAll(".qs-no-print").forEach((node) => node.remove());
  page.style.transform = "none";
  page.style.margin = "0";
  page.style.boxShadow = "none";
  page.style.borderRadius = "0";
  page.style.width = `${PAGE_W}px`;
  page.style.height = `${PAGE_H}px`;
  page.style.background = "#fff";

  page.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.removeAttribute("draggable");
    if (!el.classList.length) return;
    // Remove selection/hover highlights that only exist while editing.
    [...el.classList].forEach((token) => {
      if (
        token.startsWith("bg-[") ||
        token.startsWith("shadow-[") ||
        token.startsWith("hover:") ||
        token.startsWith("group")
      )
        el.classList.remove(token);
    });
  });
}

async function waitForImages(root: HTMLElement) {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.addEventListener("load", () => resolve(), { once: true });
          // A broken/blocked logo must not stop the export.
          img.addEventListener("error", () => resolve(), { once: true });
          window.setTimeout(resolve, 8000);
        }),
    ),
  );
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts are best-effort */
    }
  }
}

/**
 * Render the A4 pages currently rendered in the editor into a real A4 PDF blob.
 * Uses the live DOM so the export always matches the current editor state.
 */
export async function buildPdf(): Promise<Blob> {
  const livePages = [...document.querySelectorAll<HTMLElement>(".qs-page")];
  if (!livePages.length)
    throw new Error("No document pages were found on screen. Open the quotation and try again.");

  const stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  stage.style.cssText = `position:fixed;top:0;left:-${PAGE_W + 500}px;width:${PAGE_W}px;background:#fff;z-index:-1;`;

  const clones = livePages.map((page) => {
    const clone = page.cloneNode(true) as HTMLElement;
    cleanClone(clone);
    stage.appendChild(clone);
    return clone;
  });
  document.body.appendChild(stage);

  try {
    await waitForImages(stage);

    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let i = 0; i < clones.length; i += 1) {
      const canvas = await html2canvas(clones[i], {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: PAGE_W,
      });
      if (!canvas.width || !canvas.height)
        throw new Error(`Page ${i + 1} could not be rendered to an image.`);
      const data = canvas.toDataURL("image/jpeg", 0.95);
      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(data, "JPEG", 0, 0, A4_MM.width, A4_MM.height, undefined, "FAST");
    }

    const blob = pdf.output("blob");
    if (!blob || blob.size === 0) throw new Error("The generated PDF was empty.");
    return blob;
  } finally {
    stage.remove();
  }
}

export async function downloadPdf(q: Quotation) {
  const blob = await buildPdf();
  saveBlob(blob, `${documentFileName(q.title)}.pdf`);
}
