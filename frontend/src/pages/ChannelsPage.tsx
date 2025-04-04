// src/pages/MyChannelsPage.tsx
import { useEffect, useState } from 'react';
import { Channel } from '../services/types';
import { Api } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';
import { Link } from 'react-router-dom';

interface MyChannelsPageProps {
  user: User | null;
}

export const MyChannelsPage = ({ user }: MyChannelsPageProps) => {
  const { tg } = useTelegram();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      try {
        // В реальном приложении нужно добавить соответствующий endpoint в API
        const allChannels = await Api.getChannels();
        const userChannels = allChannels.filter(c => c.owner_id === user.id);
        setChannels(userChannels);
      } catch (error) {
        tg.showAlert('Ошибка при загрузке каналов');
        console.error('Fetch channels error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [user, tg]);

  if (!user) {
    return <div>Пожалуйста, авторизуйтесь</div>;
  }

  if (loading) {
    return <div>Загрузка ваших каналов...</div>;
  }

  if (channels.length === 0) {
    return (
      <div className="no-channels">
        <p>У вас пока нет каналов для продвижения</p>
        <Link to="/add-channel" className="add-channel-btn">
          Добавить канал
        </Link>
      </div>
    );
  }

  return (
    <div className="my-channels-page">
      <h2>Мои каналы</h2>
      <div className="channels-list">
        {channels.map(channel => (
          <div key={channel.id} className="channel-item">
            <h3>{channel.title}</h3>
            <p>{channel.description}</p>
            <div className="channel-stats">
              <span>Подписчиков: {channel.subscribers_count}</span>
              <span>Цена: {channel.cost_per_subscriber} баллов</span>
            </div>
          </div>
        ))}
      </div>
      <Link to="/add-channel" className="add-channel-btn">
        Добавить еще канал
      </Link>
    </div>
  );
};