// Добавляем в src/services/api.ts
export const Api = {
  // ... существующие методы ...
  
  async getUserSubscriptions(user_id: number): Promise<Array<Subscription & { channel: Channel }>> {
    const response = await fetch(`${API_URL}/subscriptions?user_id=${user_id}`);
    return response.json();
  },

  async deactivateSubscription(subscription_id: number): Promise<void> {
    await fetch(`${API_URL}/subscriptions/${subscription_id}`, {
      method: 'DELETE',
    });
  },
};