// Пример использования в AddChannelPage.tsx
import { AddChannelForm } from '../components/AddChannelForm';
import { useTelegram } from '../hooks/useTelegram';

export const AddChannelPage = ({ user }: { user: User | null }) => {
  const { tg } = useTelegram();
  
  if (!user) {
    return <div>Пожалуйста, авторизуйтесь</div>;
  }

  const handleSuccess = (channel: Channel) => {
    tg.close();
  };

  return (
    <div className="add-channel-page">
      <h2>Добавить канал для продвижения</h2>
      <AddChannelForm userId={user.id} onSuccess={handleSuccess} />
    </div>
  );
};