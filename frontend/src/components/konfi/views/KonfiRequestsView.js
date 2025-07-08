import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle, Eye, Camera } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { getKonfiActivityRequests } from '../../../services/activityRequest';
import ActivityRequestForm from '../../shared/Forms/ActivityRequestForm';
import BottomSheet from '../../shared/BottomSheet';
import ImageModal from '../../shared/ImageModal';
import usePullToRefresh from '../../../hooks/usePullToRefresh';

const KonfiRequestsView = () => {
  const { user, setError, setSuccess } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { containerRef, isRefreshing, refreshIndicatorStyle, shouldShowIndicator } = usePullToRefresh(
    loadRequests,
    100,
    true
  );

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getKonfiActivityRequests(user.id);
      setRequests(data);
    } catch (err) {
      setError('Fehler beim Laden der Anfragen');
    } finally {
      setLoading(false);
    }
  }

  const handleRequestSuccess = () => {
    setSuccess('Anfrage erfolgreich gesendet!');
    setShowRequestForm(false);
    loadRequests();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return 'Ausstehend';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleImageClick = (imageUrl, title) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meine Anfragen</h2>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Neue Anfrage</span>
        </button>
      </div>

      <div ref={containerRef} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {shouldShowIndicator && (
          <div 
            className="flex justify-center py-2 transition-all duration-300"
            style={refreshIndicatorStyle}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Anfragen
            </h3>
            <p className="text-gray-600 mb-4">
              Erstelle deine erste Aktivitäts-Anfrage
            </p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Anfrage erstellen
            </button>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {request.activity?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(request.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  {getStatusIcon(request.status)}
                </div>
              </div>

              <p className="text-gray-800">{request.description}</p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 font-medium">
                  {request.points_requested} Punkte beantragt
                </span>
                {request.points_awarded && (
                  <span className="text-green-600 font-medium">
                    {request.points_awarded} Punkte erhalten
                  </span>
                )}
              </div>

              {request.photo_url && (
                <div className="mt-3">
                  <img
                    src={request.photo_url}
                    alt="Aktivitäts-Foto"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(request.photo_url, request.activity?.name)}
                  />
                </div>
              )}

              {request.admin_comment && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Admin-Kommentar:</strong> {request.admin_comment}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={16} />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomSheet
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        title="Neue Aktivitäts-Anfrage"
        height="75vh"
      >
        <div className="p-4">
          <ActivityRequestForm
            konfiId={user?.id}
            onSuccess={handleRequestSuccess}
            onCancel={() => setShowRequestForm(false)}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Anfrage Details"
        height="auto"
      >
        {selectedRequest && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedRequest.activity?.name}</h3>
              <p className="text-sm text-gray-600">
                Eingereicht am {new Date(selectedRequest.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Beschreibung:</h4>
              <p className="text-gray-800">{selectedRequest.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-semibold">{getStatusText(selectedRequest.status)}</div>
              </div>
              <div>
                <span className="text-gray-600">Punkte beantragt:</span>
                <div className="font-semibold">{selectedRequest.points_requested}</div>
              </div>
            </div>

            {selectedRequest.admin_comment && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Admin-Kommentar:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.admin_comment}
                </p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={selectedImage?.url}
        title={selectedImage?.title}
      />
    </div>
  );
};

export default KonfiRequestsView;