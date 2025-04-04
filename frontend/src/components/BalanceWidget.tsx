// src/components/BalanceWidget.tsx
import { useEffect, useState } from 'react';
import { User } from '../services/types';
import { Api } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';

interface BalanceWidgetProps {
  balance: number;
  telegramId?: number;
  refreshable?: boolean;
}

export const BalanceWidget = ({ balance, telegramId, refreshable = false }: BalanceWidgetProps) => {
  const { tg } = useTelegram();
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [loading, setLoading] = useState(false);

  const refreshBalance = async () => {
    if (!telegramId) return;
    
    setLoading(true);
    try {
      const user = await Api.getUser(telegramId);
      setCurrentBalance(user.balance);
    } catch (error) {
      tg.showAlert('Не удалось обновить баланс');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-widget">
      <div className="balance-header">
        <h3>Ваш баланс</h3>
        {refreshable && (
          <button 
            onClick={refreshBalance} 
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? '...' : '⟳'}
          </button>
        )}
      </div>
      <div className="balance-amount">
        {currentBalance} баллов
      </div>
      <div className="balance-hint">
        Подписывайтесь на каналы, чтобы зарабатывать баллы
      </div>
    </div>
  );
};