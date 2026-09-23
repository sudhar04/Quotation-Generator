/** Shared helpers for turning a quotation title into a file name and saving blobs. */

export function documentFileName(title: string | undefined) {
  const cleaned = (title || "Quotation")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "Quotation";
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  // Give the browser a tick to start the download before releasing the URL.
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 2000);
}
