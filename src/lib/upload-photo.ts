/** Browser upload progress; a failed request never reports success. */
export function uploadPhoto(url: string, body: FormData, onProgress: (percent: number) => void): Promise<{ url?: string; publicId?: string; count?: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = 120_000;
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    xhr.onerror = () => reject(new Error("Connection lost. Please try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch { reject(new Error("Upload failed. Please try again.")); return; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error ?? "Upload failed. Please try again."));
    };
    xhr.send(body);
  });
}
