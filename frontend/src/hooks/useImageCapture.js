import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { resizeImageForUpload, dataUrlToBlob } from '../services/photo';

const useImageCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  const capturePhoto = async (options = {}) => {
    setIsCapturing(true);
    setError(null);

    try {
      const defaultOptions = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 800,
        height: 600,
        saveToGallery: false,
        ...options
      };

      let image;
      
      if (Capacitor.isNativePlatform()) {
        image = await Camera.getPhoto(defaultOptions);
      } else {
        image = await getPhotoFromWeb();
      }

      if (image?.dataUrl) {
        const blob = dataUrlToBlob(image.dataUrl);
        const processedBlob = await resizeImageForUpload(blob);
        return processedBlob;
      } else {
        throw new Error('Kein Bild aufgenommen');
      }

    } catch (err) {
      const errorMessage = err.message || 'Fehler beim Aufnehmen des Bildes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  };

  const getPhotoFromWeb = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              dataUrl: event.target.result,
              format: file.type.split('/')[1]
            });
          };
          reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
          reader.readAsDataURL(file);
        } else {
          reject(new Error('Keine Datei ausgewählt'));
        }
      };

      input.click();
    });
  };

  const selectFromGallery = async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const options = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 800,
        height: 600
      };

      let image;
      
      if (Capacitor.isNativePlatform()) {
        image = await Camera.getPhoto(options);
      } else {
        image = await selectFromWebGallery();
      }

      if (image?.dataUrl) {
        const blob = dataUrlToBlob(image.dataUrl);
        const processedBlob = await resizeImageForUpload(blob);
        return processedBlob;
      } else {
        throw new Error('Kein Bild ausgewählt');
      }

    } catch (err) {
      const errorMessage = err.message || 'Fehler beim Auswählen des Bildes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromWebGallery = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              dataUrl: event.target.result,
              format: file.type.split('/')[1]
            });
          };
          reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
          reader.readAsDataURL(file);
        } else {
          reject(new Error('Keine Datei ausgewählt'));
        }
      };

      input.click();
    });
  };

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  };

  return {
    capturePhoto,
    selectFromGallery,
    requestPermissions,
    isCapturing,
    error,
    clearError: () => setError(null)
  };
};

export default useImageCapture;