const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "blog_db",
    user: 'postgres',
    password: "127312" // "123456" "127312"
});

pool.query('SELECT NOW()', (err, res) => {
    if(err) {
        console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
    } else {
        console.log('✅ Подключено к PostgreSQL! Время:', res.rows[0].now);
    }
});

module.exports = pool;