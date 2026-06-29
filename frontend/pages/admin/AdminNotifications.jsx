import React from 'react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/adminService';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const [reportsData, announcementsData] = await Promise.all([
                adminService.getAllReports(1, 100, 'pending'),
                adminService.getAllAnnouncements(1, 100, 'pending'),
            ]);

            const reportNotifs = reportsData.reports.map(r => ({
                id: `report-${r.id}`,
                type: 'report',
                title: 'New User Report',
                message: `${r.reportedBy} reported ${r.reportedUserName}: "${r.reason}"`,
                link: '/admin/reports',
                createdAt: r.createdAt,
            }));

            const announcementNotifs = announcementsData.announcements.map(a => ({
                id: `announcement-${a.id}`,
                type: 'announcement',
                title: 'New Vet Staff Announcement',
                message: `"${a.title}" submitted by ${a.createdBy} — awaiting your review.`,
                link: '/admin/announcements',
                createdAt: a.createdAt,
            }));

            const all = [...reportNotifs, ...announcementNotifs].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setNotifications(all);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const TYPE_STYLES = {
        report: {
            dot: 'bg-red-500',
            badge: 'bg-red-100 text-red-700',
            border: 'border-red-300',
            icon: (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        announcement: {
            dot: 'bg-yellow-500',
            badge: 'bg-yellow-100 text-yellow-700',
            border: 'border-yellow-300',
            icon: (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
        },
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Notification</h1>
                    {notifications.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {notifications.length} pending
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
                        <p className="text-gray-500 font-medium">No new notifications</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notif => {
                            const style = TYPE_STYLES[notif.type];
                            return (
                                <Link
                                    key={notif.id}
                                    to={notif.link}
                                    className={`flex items-start space-x-4 bg-white rounded-xl shadow-sm border-l-4 ${style.border} border border-gray-100 p-4 hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${style.badge}`}>
                                                {notif.type === 'report' ? 'User Report' : 'Announcement'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
=======
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/adminService';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const [reportsData, announcementsData] = await Promise.all([
                adminService.getAllReports(1, 100, 'pending'),
                adminService.getAllAnnouncements(1, 100, 'pending'),
            ]);

            const reportNotifs = reportsData.reports.map(r => ({
                id: `report-${r.id}`,
                type: 'report',
                title: 'New User Report',
                message: `${r.reportedBy} reported ${r.reportedUserName}: "${r.reason}"`,
                link: '/admin/reports',
                createdAt: r.createdAt,
            }));

            const announcementNotifs = announcementsData.announcements.map(a => ({
                id: `announcement-${a.id}`,
                type: 'announcement',
                title: 'New Vet Staff Announcement',
                message: `"${a.title}" submitted by ${a.createdBy} — awaiting your review.`,
                link: '/admin/announcements',
                createdAt: a.createdAt,
            }));

            const all = [...reportNotifs, ...announcementNotifs].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setNotifications(all);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const TYPE_STYLES = {
        report: {
            dot: 'bg-red-500',
            badge: 'bg-red-100 text-red-700',
            border: 'border-red-300',
            icon: (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        announcement: {
            dot: 'bg-yellow-500',
            badge: 'bg-yellow-100 text-yellow-700',
            border: 'border-yellow-300',
            icon: (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
        },
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Notification</h1>
                    {notifications.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {notifications.length} pending
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
                        <p className="text-gray-500 font-medium">No new notifications</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notif => {
                            const style = TYPE_STYLES[notif.type];
                            return (
                                <Link
                                    key={notif.id}
                                    to={notif.link}
                                    className={`flex items-start space-x-4 bg-white rounded-xl shadow-sm border-l-4 ${style.border} border border-gray-100 p-4 hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${style.badge}`}>
                                                {notif.type === 'report' ? 'User Report' : 'Announcement'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
