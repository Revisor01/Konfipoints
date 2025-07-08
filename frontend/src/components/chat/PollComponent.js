// PollComponent.js
import React, { useState } from 'react';
import { BarChart3, Users, Clock, Trash2 } from 'lucide-react';

const PollComponent = ({ 
  message, 
  user, 
  api, 
  isOwnMessage, 
  showSender,
  formatDate,
  onDelete 
}) => {
  const [votes, setVotes] = useState(message.votes || []);
  const [userVotes, setUserVotes] = useState(
    message.votes ? message.votes.filter(v => v.user_id === user.id && v.user_type === user.type) : []
  );

  const handleVote = async (optionIndex) => {
    try {
      await api.post(`/chat/polls/${message.id}/vote`, { option_index: optionIndex });
      
      // Update local state
      if (message.multiple_choice) {
        // Toggle vote for multiple choice
        const existingVote = userVotes.find(v => v.option_index === optionIndex);
        if (existingVote) {
          setUserVotes(prev => prev.filter(v => v.option_index !== optionIndex));
          setVotes(prev => prev.filter(v => !(v.user_id === user.id && v.user_type === user.type && v.option_index === optionIndex)));
        } else {
          const newVote = { user_id: user.id, user_type: user.type, option_index: optionIndex, voter_name: user.display_name || user.name };
          setUserVotes(prev => [...prev, newVote]);
          setVotes(prev => [...prev, newVote]);
        }
      } else {
        // Single choice - replace existing vote
        setUserVotes([{ user_id: user.id, user_type: user.type, option_index: optionIndex, voter_name: user.display_name || user.name }]);
        setVotes(prev => [
          ...prev.filter(v => !(v.user_id === user.id && v.user_type === user.type)),
          { user_id: user.id, user_type: user.type, option_index: optionIndex, voter_name: user.display_name || user.name }
        ]);
      }
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  const getVoteCount = (optionIndex) => {
    return votes.filter(v => v.option_index === optionIndex).length;
  };

  const getTotalVotes = () => {
    if (message.multiple_choice) {
      return votes.length;
    } else {
      const uniqueVoters = new Set(votes.map(v => `${v.user_id}-${v.user_type}`));
      return uniqueVoters.size;
    }
  };

  const getVotePercentage = (optionIndex) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return (getVoteCount(optionIndex) / total) * 100;
  };

  const hasUserVoted = (optionIndex) => {
    return userVotes.some(v => v.option_index === optionIndex);
  };

  const isExpired = () => {
    if (!message.expires_at) return false;
    return new Date(message.expires_at) < new Date();
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        {/* Sender Name */}
        {!isOwnMessage && showSender && (
          <p className="text-xs text-gray-600 mb-1 ml-3">
            {message.sender_name}
          </p>
        )}

        {/* Poll Card */}
        <div className={`bg-white border-2 border-green-200 rounded-2xl p-4 ${
          isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm'
        }`}>
          {/* Poll Header */}
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800">Umfrage</span>
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="ml-auto text-gray-400 hover:text-red-500 p-1"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Question */}
          <h3 className="font-bold text-gray-800 mb-4">
            {message.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-4">
            {message.options.map((option, index) => {
              const voteCount = getVoteCount(index);
              const percentage = getVotePercentage(index);
              const userVoted = hasUserVoted(index);
              const canVote = !isExpired();

              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => canVote && handleVote(index)}
                    disabled={isExpired()}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      userVoted 
                        ? 'border-green-500 bg-green-50' 
                        : canVote 
                          ? 'border-gray-200 hover:border-green-300 hover:bg-gray-50' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {voteCount} {voteCount === 1 ? 'Stimme' : 'Stimmen'}
                        </span>
                        {userVoted && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    {/* Vote Bar */}
                    {getTotalVotes() > 0 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Poll Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {getTotalVotes()} {getTotalVotes() === 1 ? 'Teilnehmer' : 'Teilnehmer'}
              </span>
              {message.multiple_choice && (
                <span className="text-blue-600">Mehrfachauswahl</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {message.expires_at && (
                <span className={`flex items-center gap-1 ${isExpired() ? 'text-red-500' : 'text-orange-500'}`}>
                  <Clock className="w-3 h-3" />
                  {isExpired() ? 'Abgelaufen' : `Bis ${formatDate(message.expires_at)}`}
                </span>
              )}
              <span>{formatTime(message.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollComponent;