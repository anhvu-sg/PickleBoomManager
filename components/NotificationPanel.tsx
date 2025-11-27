import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, Check, Info, AlertCircle, Settings } from 'lucide-react';

interface NotificationPanelProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onClearAll
}) => {
  const [permission, setPermission] = React.useState(Notification.permission);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 top-16 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800">Notifications</h3>
          <p className="text-xs text-gray-500">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {permission === 'default' && (
        <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="text-xs text-blue-700 font-medium">Get real-time alerts?</span>
          <button 
            onClick={requestPermission}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center">
            <Bell className="w-8 h-8 mb-2 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                onClick={() => onMarkAsRead(notification.id)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  !notification.read ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                    notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.type === 'success' ? <Check className="w-3 h-3" /> :
                     notification.type === 'warning' ? <AlertCircle className="w-3 h-3" /> :
                     <Info className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;