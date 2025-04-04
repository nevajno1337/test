// src/services/types.ts
export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  balance: number;
  created_at: string;
  channels_count?: number;
  active_subscriptions?: number;
}

export interface Channel {
  id: number;
  owner_id: number;
  channel_id: string;
  title: string;
  description?: string;
  subscribers_count: number;
  cost_per_subscriber: number;
  is_active: boolean;
  created_at: string;
  owner_username?: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  channel_id: number;
  subscribed_at: string;
  is_active: boolean;
  points_earned: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'earn' | 'spend';
  description?: string;
  created_at: string;
}