// src/components/UserProfile.tsx
import { User } from '../services/types';
import { BalanceWidget } from './BalanceWidget';
import { useTelegram } from '../hooks/useTelegram';

interface UserProfileProps {
  user: User;
  onLogout?: () => void;
}

export const UserProfile = ({ user, onLogout }: UserProfileProps) => {
  const { tg } = useTelegram();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    tg.close();
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Профиль</h2>
        {onLogout && (
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
        )}
      </div>
      
      <div className="profile-info">
        <div className="avatar-placeholder">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="user-details">
          <h3>{user.first_name} {user.last_name}</h3>
          <p>@{user.username}</p>
          <p>ID: {user.telegram_id}</p>
        </div>
      </div>
      
      <BalanceWidget 
        balance={user.balance} 
        telegramId={user.telegram_id} 
        refreshable={true}
      />
      
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-value">{user.channels_count || 0}</span>
          <span className="stat-label">Каналов</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.active_subscriptions || 0}</span>
          <span className="stat-label">Подписок</span>
        </div>
      </div>
    </div>
  );
};