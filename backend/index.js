    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const mongoose = require('mongoose');
    const foodRoutes = require('./routes/foods');

    const app = express();
    const PORT = process.env.PORT || 5000;

    const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : '*';
    app.use(cors({ origin: origins }));
    app.use(express.json());

    // Kiểm tra trạng thái backend
    app.get('/health', (req, res) => {
    const dbOk = mongoose.connection.readyState === 1;
    res.status(dbOk ? 200 : 503).json({
        status: dbOk ? 'ok' : 'degraded',
        database: dbOk ? 'connected' : 'disconnected',
    });
    });

    // Mất kết nối DB -> trả 503
    app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Không kết nối được cơ sở dữ liệu' });
    }
    next();
    });

    app.use('/api/foods', foodRoutes);

    // 404
    app.use((req, res) => res.status(404).json({ message: 'Đường dẫn không tồn tại' }));

    // Xử lý lỗi tập trung
    app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(err.errors).map((e) => e.message),
        });
    }
    if (err.name === 'CastError') return res.status(400).json({ message: 'Giá trị không hợp lệ' });
    if (err.code === 11000) return res.status(409).json({ message: 'foodId đã tồn tại' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON không hợp lệ' });
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
    });

    mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Đã kết nối MongoDB Atlas');
        app.listen(PORT, () => console.log(`Backend chạy ở cổng ${PORT}`));
    })
    .catch((err) => {
        console.error('Lỗi kết nối MongoDB:', err.message);
        process.exit(1);
    });