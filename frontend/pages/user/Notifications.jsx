import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { notificationService } from '../../services/notificationService';
import { useBadge } from '../../contexts/BadgeContext';

/* Map NotifType → route the user should land on */
const getNavTarget = (type) => {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t === 'announcement' || t === 'message') return '/messages';
  if (t === 'adoption')    return '/adoption-requests';
  if (t === 'appointment') return '/appointments';
  return null;
};

/* Icon per notification type */
const NotifIcon = ({ type }) => {
  const t = (type || '').toLowerCase();

  if (t === 'adoption') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'hsl(130,100%,28%)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  if (t === 'appointment') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'hsl(210,80%,50%)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  if (t === 'message') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'hsl(260,70%,55%)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  if (t === 'announcement') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'hsl(38,80%,45%)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );

  // General / fallback
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ color: 'hsla(140,100%,7%,0.40)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
};

const TYPE_LABELS = {
  adoption:    'Adoption',
  appointment: 'Appointment',
  message:     'Message',
  announcement:'Announcement',
  general:     'General',
};

const TYPE_BADGE = {
  adoption:    'bg-green-100 text-green-700',
  appointment: 'bg-blue-100 text-blue-700',
  message:     'bg-purple-100 text-purple-700',
  announcement:'bg-yellow-100 text-yellow-700',
  general:     'bg-gray-100 text-gray-600',
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clear } = useBadge();

  useEffect(() => {
    clear('/notifications');
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try { await notificationService.markAsRead(notification.id); } catch {}
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
    // Navigate
    const target = getNavTarget(notification.type);
    if (target) navigate(target);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.allSettled(unread.map(n => notificationService.markAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-14 h-14 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-500 font-medium">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const t = (notification.type || 'general').toLowerCase();
              const hasNav = !!getNavTarget(notification.type);
              const badgeClass = TYPE_BADGE[t] || TYPE_BADGE.general;
              const typeLabel = TYPE_LABELS[t] || 'General';

              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`flex items-start gap-4 bg-white rounded-xl border p-4 transition-all ${
                    hasNav ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
                  } ${!notification.isRead ? 'border-l-4 border-l-primary border-gray-100' : 'border-gray-100'}`}
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'hsla(132,60%,90%,0.6)' }}>
                    <NotifIcon type={notification.type} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badgeClass}`}>
                        {typeLabel}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(notification.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Arrow — shown when navigable */}
                  {hasNav && (
                    <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
