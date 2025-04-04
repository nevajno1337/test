// src/components/AddChannelForm.tsx
import { useState } from 'react';
import { Channel } from '../services/types';
import { Api } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';

interface AddChannelFormProps {
  userId: number;
  onSuccess: (channel: Channel) => void;
}

export const AddChannelForm = ({ userId, onSuccess }: AddChannelFormProps) => {
  const { tg } = useTelegram();
  const [formData, setFormData] = useState({
    channel_id: '',
    title: '',
    description: '',
    cost_per_subscriber: 10
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost_per_subscriber' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newChannel = await Api.addChannel({
        owner_id: userId,
        channel_id: formData.channel_id,
        title: formData.title,
        description: formData.description,
        cost_per_subscriber: formData.cost_per_subscriber
      });
      
      onSuccess(newChannel);
      tg.showAlert('Канал успешно добавлен!');
    } catch (error) {
      tg.showAlert('Ошибка при добавлении канала');
      console.error('Add channel error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-channel-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>ID канала (например @channelname)</label>
        <input
          type="text"
          name="channel_id"
          value={formData.channel_id}
          onChange={handleChange}
          required
          placeholder="@mychannel"
        />
      </div>
      
      <div className="form-group">
        <label>Название канала</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Мой крутой канал"
        />
      </div>
      
      <div className="form-group">
        <label>Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="О чем этот канал?"
        />
      </div>
      
      <div className="form-group">
        <label>Баллов за подписку</label>
        <input
          type="number"
          name="cost_per_subscriber"
          min="1"
          max="100"
          value={formData.cost_per_subscriber}
          onChange={handleChange}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Добавление...' : 'Добавить канал'}
      </button>
    </form>
  );
};