// CreatePollModal.js
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const CreatePollModal = ({ show, onClose, onCreatePoll, showErrorToast }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    const validOptions = options.filter(opt => opt.trim());
    
    if (!question.trim()) {
      showErrorToast('Frage ist erforderlich');
      return;
    }
    
    if (validOptions.length < 2) {
      showErrorToast('Mindestens 2 Antwortoptionen erforderlich');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions,
      multiple_choice: multipleChoice,
      expires_in_hours: expiresInHours ? parseInt(expiresInHours) : null
    };

    onCreatePoll(pollData);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setMultipleChoice(false);
    setExpiresInHours('');
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Umfrage erstellen</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frage *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Was möchten Sie fragen?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antwortoptionen *
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-2 text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Option hinzufügen
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">Mehrfachauswahl</label>
                <p className="text-xs text-gray-600">Teilnehmer können mehrere Optionen wählen</p>
              </div>
              <button
                onClick={() => setMultipleChoice(!multipleChoice)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  multipleChoice ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  multipleChoice ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Automatisch beenden (optional)
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Nie</option>
                <option value="1">1 Stunde</option>
                <option value="6">6 Stunden</option>
                <option value="24">1 Tag</option>
                <option value="168">1 Woche</option>
              </select>
            </div>
          </div>

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
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium"
            >
              Umfrage erstellen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;