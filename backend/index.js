// backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Инициализация базы данных
const db = new sqlite3.Database('./database/arbitrage.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            balance INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Остальные таблицы из schema.sql
    `, (err) => {
        if (err) console.error('Database initialization error:', err);
    });
}

// API Endpoints

// Регистрация/авторизация пользователя
app.post('/api/user', (req, res) => {
    const { telegram_id, username, first_name, last_name } = req.body;
    
    db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (user) {
            return res.json(user);
        } else {
            db.run(
                'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
                [telegram_id, username, first_name, last_name],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json(newUser);
                    });
                }
            );
        }
    });
});

// Получение информации о пользователе
app.get('/api/user/:telegram_id', (req, res) => {
    const { telegram_id } = req.params;
    
    db.get(`
        SELECT u.*, 
               (SELECT COUNT(*) FROM channels WHERE owner_id = u.id) as channels_count,
               (SELECT COUNT(*) FROM subscriptions WHERE user_id = u.id AND is_active = 1) as active_subscriptions
        FROM users u
        WHERE u.telegram_id = ?
    `, [telegram_id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    });
});

// Добавление канала для продвижения
app.post('/api/channels', (req, res) => {
    const { owner_id, channel_id, title, description, cost_per_subscriber } = req.body;
    
    db.run(
        'INSERT INTO channels (owner_id, channel_id, title, description, cost_per_subscriber) VALUES (?, ?, ?, ?, ?)',
        [owner_id, channel_id, title, description, cost_per_subscriber],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            db.get('SELECT * FROM channels WHERE id = ?', [this.lastID], (err, channel) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(channel);
            });
        }
    );
});

// Получение списка каналов для подписки
app.get('/api/channels', (req, res) => {
    db.all(`
        SELECT c.*, u.username as owner_username 
        FROM channels c
        JOIN users u ON c.owner_id = u.id
        WHERE c.is_active = 1
        ORDER BY c.created_at DESC
    `, (err, channels) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(channels);
    });
});

// Подписка на канал
app.post('/api/subscribe', (req, res) => {
    const { user_id, channel_id } = req.body;
    
    // Проверяем, не подписан ли уже пользователь
    db.get('SELECT * FROM subscriptions WHERE user_id = ? AND channel_id = ?', [user_id, channel_id], (err, existing) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (existing) {
            return res.status(400).json({ error: 'Already subscribed' });
        }
        
        // Получаем информацию о канале
        db.get('SELECT * FROM channels WHERE id = ?', [channel_id], (err, channel) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!channel) {
                return res.status(404).json({ error: 'Channel not found' });
            }
            
            // Создаем подписку
            db.run(
                'INSERT INTO subscriptions (user_id, channel_id, points_earned) VALUES (?, ?, ?)',
                [user_id, channel_id, channel.cost_per_subscriber],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    // Обновляем баланс пользователя
                    db.run(
                        'UPDATE users SET balance = balance + ? WHERE id = ?',
                        [channel.cost_per_subscriber, user_id],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            
                            // Записываем транзакцию
                            db.run(
                                'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
                                [user_id, channel.cost_per_subscriber, 'earn', `Subscription to ${channel.title}`],
                                function(err) {
                                    if (err) {
                                        console.error('Transaction record error:', err);
                                    }
                                    
                                    // Возвращаем обновленную информацию о пользователе
                                    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, user) => {
                                        if (err) {
                                            return res.status(500).json({ error: err.message });
                                        }
                                        res.json({ 
                                            user, 
                                            subscription: { 
                                                channel_id, 
                                                points_earned: channel.cost_per_subscriber 
                                            } 
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    db.close();
    process.exit();
});