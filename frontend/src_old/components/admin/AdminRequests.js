import React from 'react';
import { 
  Clock, CheckCircle, XCircle, Camera
} from 'lucide-react';

const AdminRequests = ({
  activityRequests,
  loading,
  formatDate,
  showRequestActionSheet,
  setShowRequestActionSheet,
  selectedActionRequest,
  setSelectedActionRequest,
  handleUpdateRequestStatus,
  setSelectedRequest,
  setShowRequestManagementModal,
  setCurrentImageData,
  setShowImageViewer
}) => {
  return (
    <div className="space-y-4">
      {/* Action Sheets */}
      <RequestActionSheet
        show={showRequestActionSheet}
        onClose={() => {
          setShowRequestActionSheet(false);
          setSelectedActionRequest(null);
        }}
        request={selectedActionRequest}
        onApprove={() => handleUpdateRequestStatus(selectedActionRequest.id, 'approved')}
        onReject={(comment) => handleUpdateRequestStatus(selectedActionRequest.id, 'rejected', comment)}
        onEdit={() => {
          setSelectedRequest(selectedActionRequest);
          setShowRequestManagementModal(true);
        }}
        onShowPhoto={() => {
          setCurrentImageData({
            url: `${process.env.REACT_APP_API_URL || '/api'}/activity-requests/${selectedActionRequest.id}/photo`,
            title: `Foto für ${selectedActionRequest.activity_name}`
          });
          setShowImageViewer(true);
        }}
        loading={loading}
      />
      
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Anträge verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'pending').length}</div>
            <div className="text-xs opacity-80">Offen</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'approved').length}</div>
            <div className="text-xs opacity-80">Genehmigt</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'rejected').length}</div>
            <div className="text-xs opacity-80">Abgelehnt</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-700 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Offene Anträge
          </h3>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {activityRequests.filter(r => r.status === 'pending').length}
          </span>
        </div>
        
        <div className="space-y-3">
          {activityRequests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine offenen Anträge</p>
            </div>
          ) : (
            activityRequests.filter(r => r.status === 'pending').map(request => (
              <div 
                key={request.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => {
                  setSelectedActionRequest(request);
                  setShowRequestActionSheet(true);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-base mb-1">{request.konfi_name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{request.activity_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(request.requested_date)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-sm font-medium text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                      {request.activity_points}P
                    </span>
                    <Clock className="w-4 h-4 text-yellow-600" />
                    {request.photo_filename && (
                      <Camera className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
                
                {request.comment && (
                  <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
                    "{request.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Bearbeitete Anträge
          </h3>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Letzte 10
          </span>
        </div>
        
        <div className="space-y-3">
          {activityRequests.filter(r => r.status !== 'pending').slice(0, 10).map(request => (
            <div 
              key={request.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                request.status === 'approved' 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
              }`}
              onClick={() => {
                setSelectedActionRequest(request);
                setShowRequestActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-1">{request.konfi_name}</h4>
                  <p className="text-sm text-gray-600">{request.activity_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
                    {request.activity_points}P
                  </span>
                  {request.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  {request.photo_filename && (
                    <Camera className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
              
              {request.comment && (
                <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
                  "{request.comment}"
                </p>
              )}
            </div>
          ))}
          
          {activityRequests.filter(r => r.status !== 'pending').length === 0 && (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-sm">Noch keine bearbeiteten Anträge</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component
const RequestActionSheet = ({ 
  show, 
  onClose, 
  request, 
  onApprove, 
  onReject, 
  onEdit, 
  onShowPhoto, 
  loading 
}) => {
  if (!show) return null;
  
  const handleReject = () => {
    const comment = prompt('Grund für Ablehnung:');
    if (comment) {
      onReject(comment);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{request?.konfi_name}</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">{request?.activity_name}</p>
          <p className="text-sm text-gray-600">{request?.activity_points} Punkte</p>
          <p className="text-xs text-gray-500">{request?.requested_date}</p>
          {request?.comment && (
            <p className="text-sm text-gray-700 italic mt-2">"{request.comment}"</p>
          )}
        </div>
        
        <div className="space-y-3">
          {request?.photo_filename && (
            <button
              onClick={() => {
                onShowPhoto();
                onClose();
              }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Foto anzeigen
            </button>
          )}
          
          {request?.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  onApprove();
                  onClose();
                }}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Genehmigen
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Ablehnen
              </button>
            </>
          )}
          
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Bearbeiten
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;