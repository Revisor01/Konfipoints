// CreateChatModal.js
import React, { useState, useEffect } from 'react';
import { X, Users, MessageCircle } from 'lucide-react';

const CreateChatModal = ({ 
  show, 
  onClose, 
  user, 
  api, 
  onChatCreated, 
  showErrorToast 
}) => {
  const [chatType, setChatType] = useState('direct');
  const [chatName, setChatName] = useState('');
  const [selectedJahrgang, setSelectedJahrgang] = useState('');
  const [selectedKonfis, setSelectedKonfis] = useState([]);
  const [jahrgaenge, setJahrgaenge] = useState([]);
  const [konfis, setKonfis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadJahrgaenge();
      loadKonfis();
    }
  }, [show]);

  const loadJahrgaenge = async () => {
    try {
      const response = await api.get('/jahrgaenge');
      setJahrgaenge(response.data);
    } catch (err) {
      showErrorToast('Fehler beim Laden der Jahrgänge');
    }
  };

  const loadKonfis = async () => {
    try {
      const response = await api.get('/konfis');
      setKonfis(response.data);
    } catch (err) {
      showErrorToast('Fehler beim Laden der Konfis');
    }
  };

  const handleSubmit = async () => {
    if (chatType === 'direct' && selectedKonfis.length === 0) {
      showErrorToast('Bitte mindestens einen Konfi auswählen');
      return;
    }

    if (chatType === 'group' && !chatName.trim()) {
      showErrorToast('Bitte einen Gruppennamen eingeben');
      return;
    }

    setLoading(true);
    try {
      const chatData = {
        type: chatType,
        name: chatType === 'group' ? chatName : `Chat mit ${selectedKonfis.map(id => konfis.find(k => k.id === id)?.name).join(', ')}`,
        participants: selectedKonfis,
        jahrgang_id: chatType === 'jahrgang' ? selectedJahrgang : null
      };

      await api.post('/chat/rooms', chatData);
      onChatCreated();
    } catch (err) {
      showErrorToast('Fehler beim Erstellen des Chats');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Neuen Chat erstellen</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Chat Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat-Typ
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="direct"
                  checked={chatType === 'direct'}
                  onChange={(e) => setChatType(e.target.value)}
                  className="mr-3"
                />
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                <div>
                  <div className="font-medium">Direktnachricht</div>
                  <div className="text-sm text-gray-600">Privater Chat mit ausgewählten Konfis</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="group"
                  checked={chatType === 'group'}
                  onChange={(e) => setChatType(e.target.value)}
                  className="mr-3"
                />
                <Users className="w-5 h-5 mr-2 text-green-500" />
                <div>
                  <div className="font-medium">Gruppenchat</div>
                  <div className="text-sm text-gray-600">Chat mit mehreren Teilnehmern</div>
                </div>
              </label>
            </div>
          </div>

          {/* Group Name */}
          {chatType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gruppenname *
              </label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="z.B. Projektteam"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Participant Selection */}
          {(chatType === 'direct' || chatType === 'group') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teilnehmer auswählen *
              </label>
              
              {/* Jahrgang Filter */}
              <select
                value={selectedJahrgang}
                onChange={(e) => setSelectedJahrgang(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Jahrgänge</option>
                {jahrgaenge.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>

              {/* Konfi List */}
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {konfis
                  .filter(konfi => !selectedJahrgang || konfi.jahrgang_id === parseInt(selectedJahrgang))
                  .map(konfi => (
                    <label key={konfi.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedKonfis.includes(konfi.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKonfis([...selectedKonfis, konfi.id]);
                          } else {
                            setSelectedKonfis(selectedKonfis.filter(id => id !== konfi.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{konfi.name}</div>
                        <div className="text-sm text-gray-600">{konfi.jahrgang}</div>
                      </div>
                    </label>
                  ))}
              </div>
              
              {selectedKonfis.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  {selectedKonfis.length} {selectedKonfis.length === 1 ? 'Teilnehmer' : 'Teilnehmer'} ausgewählt
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {loading ? 'Erstelle...' : 'Chat erstellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;