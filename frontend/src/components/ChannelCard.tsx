// src/components/ChannelCard.tsx
import { Channel } from '../services/types';
import { Api } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';

interface ChannelCardProps {
  channel: Channel;
  user: User | null;
  onSubscribe: () => void;
}

export const ChannelCard = ({ channel, user, onSubscribe }: ChannelCardProps) => {
  const { tg } = useTelegram();
  
  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      const result = await Api.subscribeToChannel(user.id, channel.id);
      onSubscribe();
      tg.showAlert(`Вы подписались на канал и получили ${channel.cost_per_subscriber} баллов!`);
    } catch (error) {
      tg.showAlert('Ошибка при подписке. Попробуйте позже.');
    }
  };

  return (
    <div className="channel-card">
      <h3>{channel.title}</h3>
      <p>{channel.description}</p>
      <div className="channel-meta">
        <span>Владелец: @{channel.owner_username}</span>
        <span>Баллов за подписку: {channel.cost_per_subscriber}</span>
      </div>
      <button onClick={handleSubscribe} disabled={!user}>
        Подписаться за {channel.cost_per_subscriber} баллов
      </button>
    </div>
  );
};