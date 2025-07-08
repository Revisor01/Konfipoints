import React, { useState } from 'react';
import { Check, X, MessageSquare, Eye, Save } from 'lucide-react';
import UniversalModal from '../../shared/UniversalModal';
import { approveActivityRequest, rejectActivityRequest } from '../../../services/activityRequest';
import ImageModal from '../../shared/ImageModal';

const RequestManagementModal = ({ 
  isOpen, 
  onClose, 
  request, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [pointsAwarded, setPointsAwarded] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  useState(() => {
    if (request) {
      setPointsAwarded(request.points_requested || '');
      setAdminComment(request.admin_comment || '');
      setAction('');
      setError('');
    }
  }, [request]);

  const handleApprove = async () => {
    if (!pointsAwarded || pointsAwarded <= 0) {
      setError('Bitte gib eine gültige Punktzahl ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await approveActivityRequest(request.id, {
        points_awarded: parseInt(pointsAwarded),
        admin_comment: adminComment.trim()
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminComment.trim()) {
      setError('Bitte gib einen Ablehnungsgrund an');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await rejectActivityRequest(request.id, adminComment.trim());
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (action === 'approve') {
      handleApprove();
    } else if (action === 'reject') {
      handleReject();
    }
  };

  if (!request) return null;

  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';
  const isPending = request.status === 'pending';

  return (
    <>
      <UniversalModal
        isOpen={isOpen}
        onClose={onClose}
        title="Anfrage bearbeiten"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Request Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{request.activity?.name}</h3>
                <p className="text-sm text-gray-600">
                  von {request.konfi?.name} • {new Date(request.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isApproved ? 'bg-green-100 text-green-800' : 
                isRejected ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {isApproved ? 'Genehmigt' : isRejected ? 'Abgelehnt' : 'Ausstehend'}
              </span>
            </div>
            
            <p className="text-gray-800">{request.description}</p>
            
            <div className="flex justify-between text-sm">
              <span>Punkte beantragt: <strong>{request.points_requested}</strong></span>
              {request.points_awarded && (
                <span className="text-green-600">
                  Punkte vergeben: <strong>{request.points_awarded}</strong>
                </span>
              )}
            </div>

            {request.photo_url && (
              <div className="mt-3">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="relative group"
                >
                  <img
                    src={request.photo_url}
                    alt="Aktivitäts-Foto"
                    className="w-full h-40 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Action Selection */}
          {isPending && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Aktion wählen:</h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAction('approve')}
                  className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    action === 'approve' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  <Check size={20} />
                  <span>Genehmigen</span>
                </button>
                
                <button
                  onClick={() => setAction('reject')}
                  className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                    action === 'reject' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-300 hover:border-red-400'
                  }`}
                >
                  <X size={20} />
                  <span>Ablehnen</span>
                </button>
              </div>
            </div>
          )}

          {/* Approve Form */}
          {(action === 'approve' || isApproved) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punkte vergeben *
                </label>
                <input
                  type="number"
                  value={pointsAwarded}
                  onChange={(e) => setPointsAwarded(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Anzahl Punkte"
                  disabled={isApproved}
                />
              </div>
            </div>
          )}

          {/* Comment */}
          {(action || isApproved || isRejected) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare size={16} className="inline mr-1" />
                {action === 'reject' ? 'Ablehnungsgrund *' : 'Kommentar (optional)'}
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={action === 'reject' ? 'Warum wird die Anfrage abgelehnt?' : 'Zusätzliche Informationen...'}
                disabled={isApproved || isRejected}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              {isPending ? 'Abbrechen' : 'Schließen'}
            </button>
            
            {isPending && action && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    {action === 'approve' ? <Check size={16} /> : <X size={16} />}
                    <span>{action === 'approve' ? 'Genehmigen' : 'Ablehnen'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </UniversalModal>

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={request?.photo_url}
        title={`${request?.activity?.name} - ${request?.konfi?.name}`}
      />
    </>
  );
};

export default RequestManagementModal;