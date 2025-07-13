// PollComponent.js
import React, { useState } from 'react';
import { 
  IonCard,
  IonButton,
  IonIcon,
  IonBadge,
  IonProgressBar
} from '@ionic/react';
import { 
  barChart, 
  people, 
  time, 
  trash, 
  checkmark 
} from 'ionicons/icons';

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
    <div style={{
      display: 'flex',
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{
        maxWidth: '80%'
      }}>
        {/* Sender Name */}
        {!isOwnMessage && showSender && (
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '4px',
            marginLeft: '12px',
            margin: '0 0 4px 12px'
          }}>
            {message.sender_name}
          </p>
        )}

        {/* Poll Card */}
        <IonCard style={{
          backgroundColor: 'white',
          border: '2px solid #bbf7d0',
          borderRadius: '16px',
          padding: '16px',
          borderBottomRightRadius: isOwnMessage ? '4px' : '16px',
          borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
          margin: '0',
          '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Poll Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <IonIcon icon={barChart} style={{ fontSize: '20px', color: '#059669' }} />
            <span style={{
              fontWeight: 'bold',
              color: '#065f46'
            }}>Umfrage</span>
            {onDelete && (
              <IonButton
                onClick={() => onDelete(message.id)}
                fill="clear"
                size="small"
                style={{
                  '--color': '#9ca3af',
                  '--color-hover': '#ef4444',
                  marginLeft: 'auto'
                }}
              >
                <IonIcon icon={trash} />
              </IonButton>
            )}
          </div>

          {/* Question */}
          <h3 style={{
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            {message.question}
          </h3>

          {/* Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {message.options.map((option, index) => {
              const voteCount = getVoteCount(index);
              const percentage = getVotePercentage(index);
              const userVoted = hasUserVoted(index);
              const canVote = !isExpired();

              return (
                <div key={index} style={{ position: 'relative' }}>
                  <IonButton
                    onClick={() => canVote && handleVote(index)}
                    disabled={isExpired()}
                    fill="outline"
                    expand="block"
                    style={{
                      '--border-color': userVoted ? '#10b981' : '#e5e7eb',
                      '--background': userVoted ? '#ecfdf5' : (canVote ? 'white' : '#f9fafb'),
                      '--background-hover': canVote ? '#f9fafb' : undefined,
                      '--color': '#1f2937',
                      textAlign: 'left',
                      height: 'auto',
                      minHeight: '60px'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      padding: '8px 0'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: '500',
                          flex: 1,
                          textAlign: 'left'
                        }}>{option}</span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                          }}>
                            {voteCount} {voteCount === 1 ? 'Stimme' : 'Stimmen'}
                          </span>
                          {userVoted && (
                            <IonIcon 
                              icon={checkmark} 
                              style={{ 
                                color: '#10b981',
                                fontSize: '16px'
                              }} 
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Vote Progress Bar */}
                      {getTotalVotes() > 0 && (
                        <IonProgressBar
                          value={percentage / 100}
                          color="success"
                          style={{
                            height: '8px',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </div>
                  </IonButton>
                </div>
              );
            })}
          </div>

          {/* Poll Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <IonIcon icon={people} style={{ fontSize: '12px' }} />
                {getTotalVotes()} {getTotalVotes() === 1 ? 'Teilnehmer' : 'Teilnehmer'}
              </span>
              {message.multiple_choice && (
                <IonBadge color="primary" style={{ fontSize: '0.75rem' }}>
                  Mehrfachauswahl
                </IonBadge>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {message.expires_at && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isExpired() ? '#ef4444' : '#f59e0b'
                }}>
                  <IonIcon icon={time} style={{ fontSize: '12px' }} />
                  {isExpired() ? 'Abgelaufen' : `Bis ${formatDate(message.expires_at)}`}
                </span>
              )}
              <span>{formatTime(message.created_at)}</span>
            </div>
          </div>
        </IonCard>
      </div>
    </div>
  );
};

export default PollComponent;