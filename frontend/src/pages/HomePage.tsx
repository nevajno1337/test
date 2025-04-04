// src/pages/HomePage.tsx
import { User } from '../services/types';
import { UserProfile } from '../components/UserProfile';
import { SubscriptionList } from '../components/SubscriptionList';
import { useTelegram } from '../hooks/useTelegram';

interface HomePageProps {
  user: User | null;
}

export const HomePage = ({ user }: HomePageProps) => {
  const { tg } = useTelegram();

  if (!user) {
    return (
      <div className="home-page">
        <h2>Добро пожаловать!</h2>
        <p>Пожалуйста, авторизуйтесь через Telegram</p>
        <button onClick={() => tg.expand()}>Развернуть приложение</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <UserProfile user={user} />
      <SubscriptionList userId={user.id} />
    </div>
  );
};