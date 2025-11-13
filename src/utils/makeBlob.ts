export const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.9): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob from canvas'));
    }, type, quality);
  });
};