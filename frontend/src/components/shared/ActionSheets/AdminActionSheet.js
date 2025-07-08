import React from 'react';
import { Edit, Trash2, Key, Eye, Shield, Mail } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const AdminActionSheet = ({ 
  isOpen, 
  onClose, 
  admin, 
  onEdit, 
  onDelete, 
  onResetPassword,
  onViewDetails,
  onChangePermissions,
  currentUser,
  isLoading = false 
}) => {
  if (!admin) return null;

  const isCurrentUser = currentUser?.id === admin.id;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(admin);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'email',
      label: 'E-Mail senden',
      icon: Mail,
      onClick: () => {
        window.location.href = `mailto:${admin.email}`;
        onClose();
      },
      className: 'text-indigo-600 hover:bg-indigo-50',
      disabled: !admin.email
    },
    {
      id: 'permissions',
      label: 'Berechtigungen verwalten',
      icon: Shield,
      onClick: () => {
        onChangePermissions?.(admin);
        onClose();
      },
      className: 'text-purple-600 hover:bg-purple-50',
      disabled: isCurrentUser
    },
    {
      id: 'edit',
      label: 'Bearbeiten',
      icon: Edit,
      onClick: () => {
        onEdit?.(admin);
        onClose();
      },
      className: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'reset-password',
      label: 'Passwort zurücksetzen',
      icon: Key,
      onClick: () => {
        onResetPassword?.(admin);
        onClose();
      },
      className: 'text-yellow-600 hover:bg-yellow-50'
    }
  ];

  // Delete option only for other admins, not current user
  if (!isCurrentUser) {
    actions.push({
      id: 'delete',
      label: 'Löschen',
      icon: Trash2,
      onClick: () => {
        onDelete?.(admin);
        onClose();
      },
      className: 'text-red-600 hover:bg-red-50'
    });
  }

  const getPermissionText = (permissions) => {
    if (!permissions || permissions.length === 0) {
      return 'Standard-Berechtigungen';
    }
    return permissions.join(', ');
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      className="max-h-[80vh]"
    >
      <div className="p-4 space-y-4">
        <div className="border-b pb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold">
              {admin.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {admin.name}
                </h3>
                {isCurrentUser && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    Du
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {admin.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Berechtigungen:</span>
              <div className="font-medium">
                {getPermissionText(admin.permissions)}
              </div>
            </div>
            
            {admin.last_login && (
              <div>
                <span className="text-gray-600">Letzter Login:</span>
                <div className="font-medium">
                  {new Date(admin.last_login).toLocaleDateString('de-DE')}
                </div>
              </div>
            )}
            
            {admin.created_at && (
              <div>
                <span className="text-gray-600">Erstellt:</span>
                <div className="font-medium">
                  {new Date(admin.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={isLoading || action.disabled}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.className}`}
            >
              <action.icon size={20} />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {isCurrentUser && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 text-center">
              Du kannst dich nicht selbst löschen oder deine eigenen Berechtigungen ändern
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full p-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default AdminActionSheet;