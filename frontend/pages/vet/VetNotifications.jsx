import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../../components/VetLayout';
import { vetService } from '../../services/vetService';
import { useBadge } from '../../contexts/BadgeContext';

const TYPE_ICONS = {
  appointment: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  adoption: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  announcement: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
};

const TYPE_COLORS = {
  appointment: 'text-green-700 bg-green-50',
  adoption: 'text-purple-600 bg-purple-50',
  announcement: 'text-yellow-600 bg-yellow-50',
};

const getNavPath = (type) => {
  if (type === 'appointment') return '/vet/appointments';
  if (type === 'adoption') return '/vet/adoptions';
  if (type === 'announcement') return '/vet/services';
  return '/vet/dashboard';
};

const VetNotifications = () => {
  const navigate = useNavigate();
  const { clear } = useBadge();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clear('/vet/notifications');
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await vetService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching vet notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await vetService.markNotificationRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
    navigate(getNavPath(notification.type));
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await vetService.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <VetLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-14 h-14 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-500 font-medium">All caught up</p>
            <p className="text-sm text-gray-400 mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all group ${
                  !notification.isRead
                    ? 'border-l-4 border-l-primary border-gray-100'
                    : 'border-gray-100 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    TYPE_COLORS[notification.type] || 'text-gray-500 bg-gray-100'
                  }`}>
                    {TYPE_ICONS[notification.type] || (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start gap-2">
                    {!notification.isRead && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <button
                          onClick={(e) => handleMarkRead(e, notification.id)}
                          className="text-xs text-primary hover:text-primary-dark font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark read
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetNotifications;
