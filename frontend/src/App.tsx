// src/App.tsx
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import HomePage from './pages/HomePage';
import ChannelsPage from './pages/ChannelsPage';
import MyChannelsPage from './pages/MyChannelsPage';
import AddChannelPage from './pages/AddChannelPage';
import { User } from './services/types';
import { Api } from './services/api';
import './styles.css';

function App() {
  const { tg, user: tgUser } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    tg.ready();
    tg.expand();
    
    const initUser = async () => {
      if (tgUser) {
        try {
          const userData = await Api.registerUser({
            telegram_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name
          });
          setUser(userData);
        } catch (error) {
          console.error('User initialization error:', error);
          tg.showAlert('Ошибка при авторизации');
        }
      }
    };
    
    initUser();
  }, [tg, tgUser]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/channels" element={<ChannelsPage user={user} />} />
        <Route path="/my-channels" element={<MyChannelsPage user={user} />} />
        <Route 
          path="/add-channel" 
          element={<AddChannelPage user={user} />} 
        />
      </Routes>
    </div>
  );
}

export default App;