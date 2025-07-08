import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Check, AlertTriangle } from 'lucide-react';
import useImageCapture from '../../../hooks/useImageCapture';
import { createActivityRequest } from '../../../services/activityRequest';
import { getActivities } from '../../../services/activity';

const ActivityRequestForm = ({ 
  konfiId, 
  onSuccess, 
  onCancel, 
  initialData = null,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    activity_id: '',
    description: '',
    photo: null,
    points_requested: '',
    ...initialData
  });
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  const { capturePhoto, selectFromGallery, isCapturing, error: captureError } = useImageCapture();

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (captureError) {
      setError(captureError);
    }
  }, [captureError]);

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      setError('Fehler beim Laden der Aktivitäten');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const handleActivityChange = (e) => {
    const activityId = e.target.value;
    const selectedActivity = activities.find(a => a.id === parseInt(activityId));
    
    setFormData(prev => ({
      ...prev,
      activity_id: activityId,
      points_requested: selectedActivity?.points || ''
    }));
    
    if (error) setError('');
  };

  const handlePhotoCapture = async () => {
    try {
      setError('');
      const photo = await capturePhoto();
      setFormData(prev => ({ ...prev, photo }));
      
      const preview = URL.createObjectURL(photo);
      setPhotoPreview(preview);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhotoSelect = async () => {
    try {
      setError('');
      const photo = await selectFromGallery();
      setFormData(prev => ({ ...prev, photo }));
      
      const preview = URL.createObjectURL(photo);
      setPhotoPreview(preview);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const validateForm = () => {
    if (!formData.activity_id) {
      setError('Bitte wähle eine Aktivität aus');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Bitte beschreibe deine Aktivität');
      return false;
    }
    
    if (formData.description.length < 10) {
      setError('Die Beschreibung sollte mindestens 10 Zeichen lang sein');
      return false;
    }
    
    if (!formData.photo) {
      setError('Bitte füge ein Foto hinzu');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const requestData = {
        ...formData,
        konfi_id: konfiId
      };
      
      await createActivityRequest(requestData);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedActivity = activities.find(a => a.id === parseInt(formData.activity_id));

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aktivität *
        </label>
        {loadingActivities ? (
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : (
          <select
            name="activity_id"
            value={formData.activity_id}
            onChange={handleActivityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Aktivität auswählen...</option>
            {activities.map(activity => (
              <option key={activity.id} value={activity.id}>
                {activity.name} ({activity.points} Punkte)
              </option>
            ))}
          </select>
        )}
        {selectedActivity && (
          <p className="mt-1 text-sm text-gray-600">
            {selectedActivity.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punkte beantragt
        </label>
        <input
          type="number"
          name="points_requested"
          value={formData.points_requested}
          onChange={handleInputChange}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Anzahl Punkte"
        />
        <p className="mt-1 text-xs text-gray-500">
          Standardwert wird automatisch gesetzt
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Beschreibung *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Beschreibe deine Aktivität ausführlich..."
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/500 Zeichen
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto *
        </label>
        
        {!photoPreview ? (
          <div className="space-y-3">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handlePhotoCapture}
                disabled={isCapturing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Camera size={20} />
                <span>{isCapturing ? 'Aufnehmen...' : 'Foto aufnehmen'}</span>
              </button>
              
              <button
                type="button"
                onClick={handlePhotoSelect}
                disabled={isCapturing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Upload size={20} />
                <span>Foto wählen</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG oder WebP • Max. 5MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Foto Vorschau"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          Abbrechen
        </button>
        
        <button
          type="submit"
          disabled={loading || isCapturing}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Wird gesendet...</span>
            </>
          ) : (
            <>
              <Check size={20} />
              <span>Anfrage senden</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ActivityRequestForm;