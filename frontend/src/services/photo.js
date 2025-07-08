export const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

export const validateImageSize = (file, maxSizeMB = 5) => {
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`Datei ist zu groß. Maximale Größe: ${maxSizeMB}MB`);
  }
  return true;
};

export const validateImageType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Nur JPEG, PNG und WebP Dateien sind erlaubt');
  }
  return true;
};

export const resizeImageForUpload = async (file) => {
  try {
    validateImageType(file);
    validateImageSize(file, 10);
    
    const compressedFile = await compressImage(file);
    
    if (compressedFile.size > 5 * 1024 * 1024) {
      const furtherCompressed = await compressImage(file, 600, 450, 0.6);
      return furtherCompressed;
    }
    
    return compressedFile;
  } catch (error) {
    throw new Error(`Fehler bei der Bildverarbeitung: ${error.message}`);
  }
};