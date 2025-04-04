// src/components/SubscriptionList.tsx
import { useEffect, useState } from 'react';
import { Subscription, Channel } from '../services/types';
import { Api } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';

interface SubscriptionListProps {
  userId: number;
}

export const SubscriptionList = ({ userId }: SubscriptionListProps) => {
  const { tg } = useTelegram();
  const [subscriptions, setSubscriptions] = useState<Array<Subscription & { channel: Channel }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // В реальном приложении нужно добавить соответствующий endpoint в API
        // Здесь упрощенная реализация для демонстрации
        const user = await Api.getUser(userId);
        const allChannels = await Api.getChannels();
        
        // Фильтруем каналы, на которые подписан пользователь
        const userSubscriptions = allChannels
          .filter(channel => {
            // В реальном приложении нужно проверять подписки через API
            return Math.random() > 0.5; // Примерная логика для демонстрации
          })
          .map(channel => ({
            id: Math.random(), // Временный ID для демонстрации
            user_id: userId,
            channel_id: channel.id,
            subscribed_at: new Date().toISOString(),
            is_active: true,
            points_earned: channel.cost_per_subscriber,
            channel: channel
          }));
        
        setSubscriptions(userSubscriptions);
      } catch (error) {
        tg.showAlert('Ошибка при загрузке подписок');
        console.error('Fetch subscriptions error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [userId, tg]);

  if (loading) {
    return <div>Загрузка ваших подписок...</div>;
  }

  if (subscriptions.length === 0) {
    return <div>Вы еще не подписаны ни на один канал</div>;
  }

  return (
    <div className="subscription-list">
      <h3>Ваши активные подписки</h3>
      <div className="subscriptions">
        {subscriptions.map(sub => (
          <div key={sub.id} className="subscription-item">
            <div className="channel-info">
              <h4>{sub.channel.title}</h4>
              <p>{sub.channel.description}</p>
            </div>
            <div className="subscription-meta">
              <span>Получено баллов: {sub.points_earned}</span>
              <span>Подписаны: {new Date(sub.subscribed_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};