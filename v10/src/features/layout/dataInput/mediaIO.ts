export const readImageFile = (file: File) =>
  new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("image read failed"));
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => {
        resolve({
          src,
          width: img.naturalWidth || 1,
          height: img.naturalHeight || 1,
        });
      };
      img.onerror = () => reject(new Error("image load failed"));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });

export const readImageUrl = (src: string) =>
  new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve({
        src,
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      });
    };
    img.onerror = () => reject(new Error("image url failed"));
    img.src = src;
  });

export const readVideoFile = (file: File) =>
  new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        src,
        width: video.videoWidth || 16,
        height: video.videoHeight || 9,
      });
      URL.revokeObjectURL(src);
    };
    video.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("video load failed"));
    };
    video.src = src;
  });

export const readVideoUrl = (src: string) =>
  new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        src,
        width: video.videoWidth || 16,
        height: video.videoHeight || 9,
      });
    };
    video.onerror = () => reject(new Error("video url failed"));
    video.src = src;
  });
