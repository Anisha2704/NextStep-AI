import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const NotificationItem = ({ notification, onRead, compact = false }) => (
  <div className={`flex items-start gap-3 ${notification.readAt ? 'bg-card' : 'bg-primary-light/40'} ${compact ? 'p-3' : 'rounded-xl border border-border p-4'}`}>
    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.readAt ? 'bg-border' : 'bg-primary'}`} aria-label={notification.readAt ? 'Read' : 'Unread'} />
    <div className="min-w-0 flex-1">
      <Link to={notification.link} onClick={() => onRead(notification.id)} className="font-semibold text-text-main hover:text-primary focus:outline-none focus:underline">
        {notification.title}
      </Link>
      <p className="mt-1 text-sm leading-5 text-text-secondary">{notification.message}</p>
      <time className="mt-2 block text-xs text-text-secondary" dateTime={notification.createdAt}>
        {new Date(notification.createdAt).toLocaleString()}
      </time>
    </div>
    {!notification.readAt && <button type="button" onClick={() => onRead(notification.id)} className="rounded-md p-1 text-text-secondary hover:bg-primary-light hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Mark ${notification.title} as read`}>
      <Check size={16} />
    </button>}
  </div>
);

export default NotificationItem;
