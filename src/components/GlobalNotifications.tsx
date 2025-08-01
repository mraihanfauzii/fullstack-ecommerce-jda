"use client";

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { removeNotification } from '@/redux/features/notificationSlice';

export default function GlobalNotifications() {
  const notifications = useAppSelector((state) => state.notification.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Array untuk menyimpan semua timeout ID yang dibuat di dalam effect ini
    const timeouts: NodeJS.Timeout[] = [];

    // Membuat timer untuk setiap notifikasi
    notifications.forEach((notif) => {
      const timeoutId = setTimeout(() => {
        dispatch(removeNotification(notif.id));
      }, 5000); // Notifikasi hilang setelah 5 detik

      // Simpan ID timeout agar bisa dibersihkan nanti
      timeouts.push(timeoutId);
    });

    // Cleanup function: membersihkan semua timer saat komponen unmount
    // atau jika daftar notifikasi berubah (re-render)
    return () => {
      timeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, [notifications, dispatch]); // Rerun effect jika notifikasi atau dispatch berubah

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getNotificationStyles(notif.type)} text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between pointer-events-auto`}
          role="alert"
        >
          <span>{notif.message}</span>
          <button
            onClick={() => dispatch(removeNotification(notif.id))}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}