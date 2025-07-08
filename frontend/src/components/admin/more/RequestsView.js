// frontend/src/components/admin/more/RequestsView.js
import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Camera, MessageSquare } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import api from '../../../services/api';
import { formatShortDate } from '../../../utils/formatters';
import Modal from '../../shared/Modal';

const RequestsView = ({ requests, onUpdate, onBack }) => {
  const { setSuccess, setError } = useApp();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [loading, setLoading] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const handleQuickApprove = async (request) => {
    try {
      await api.put(`/activity-requests/${request.id}`, {
        status: 'approved',
        admin_comment: ''
      });
      setSuccess('Antrag genehmigt');
      onUpdate();
    } catch (err) {
      setError('Fehler beim Genehmigen');
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!adminComment.trim()) {
      setError('Begründung erforderlich');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/activity-requests/${selectedRequest.id}`, {
        status: 'rejected',
        admin_comment: adminComment
      });
      setSuccess('Antrag abgelehnt');
      setShowModal(false);
      onUpdate();
    } catch (err) {
      setError('Fehler beim Ablehnen');
    } finally {
      setLoading(false);
    }
  };

  const showPhoto = async (requestId) => {
    window.open(`${api.defaults.baseURL}/activity-requests/${requestId}/photo`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Anträge verwalten</h1>
            <p className="text-sm text-gray-600">
              {pendingRequests.length} {pendingRequests.length === 1 ? 'offener Antrag' : 'offene Anträge'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-orange-600 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Offene Anträge
            </h2>
            {pendingRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleQuickApprove(request)}
                onReject={() => handleReject(request)}
                onShowPhoto={() => showPhoto(request.id)}
                isPending
              />
            ))}
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-600">Bearbeitete Anträge</h2>
            {processedRequests.slice(0, 20).map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onShowPhoto={() => showPhoto(request.id)}
              />
            ))}
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Anträge vorhanden</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Antrag ablehnen"
        onSubmit={handleModalSubmit}
        submitButtonText="Ablehnen"
        submitDisabled={!adminComment.trim()}
        loading={loading}
      >
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium">{selectedRequest?.konfi_name}</p>
            <p className="text-sm text-gray-600">
              {selectedRequest?.activity_name} • {formatShortDate(selectedRequest?.requested_date)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Begründung für Ablehnung *
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Bitte begründen Sie die Ablehnung..."
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onApprove, onReject, onShowPhoto, isPending }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${isPending ? 'border-2 border-yellow-300' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-medium">{request.konfi_name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {request.activity_name} ({request.activity_points} Punkte)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatShortDate(request.requested_date)}
          </div>
          
          {request.comment && (
            <div className="mt-2 text-sm text-gray-700 italic flex items-start gap-1">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              "{request.comment}"
            </div>
          )}
          
          {request.admin_comment && !isPending && (
            <div className="mt-2 text-sm text-blue-600">
              Admin: {request.admin_comment}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isPending && (
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
            </span>
          )}
          
          {request.photo_filename && (
            <button
              onClick={onShowPhoto}
              className="p-2 bg-blue-100 text-blue-700 rounded"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
          
          {isPending && (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                className="p-2 bg-green-500 text-white rounded"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={onReject}
                className="p-2 bg-red-500 text-white rounded"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsView;