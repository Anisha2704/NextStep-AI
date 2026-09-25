import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationItem from '../../components/notifications/NotificationItem';
import { fetchNotifications, markAllRead, markRead } from '../../store/slices/notificationSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, hasLoaded, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications(50));
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Notifications</h2>
          <p className="mt-1 text-sm text-text-secondary">Updates about your learning and career progress.</p>
        </div>
        <Button variant="outline" size="sm" disabled={!unreadCount} onClick={() => dispatch(markAllRead())}>Mark all as read</Button>
      </header>
      {error && <Alert message={error} />}
      {loading && !hasLoaded ? <LoadingSpinner message="Loading notifications..." /> : notifications.length ? (
        <div className="space-y-3">{notifications.map((item) => <NotificationItem key={item.id} notification={item} onRead={(id) => dispatch(markRead(id))} />)}</div>
      ) : (
        <Card className="py-10 text-center">
          <h3 className="font-semibold text-text-main">You’re all caught up</h3>
          <p className="mt-1 text-sm text-text-secondary">New account, assessment, and learning updates will appear here.</p>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
