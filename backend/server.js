const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get('')

app.get("/api/posts", async (req, res) => {
    try {
        //users.username на ноуте
        const result = await pool.query(`
      SELECT posts.*, users.name  
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/api/auth/register', async (req ,res) => {
    try {
        const { email, name, password } = req.body;

        if(!email && !name && !password) {
            return res.status(500).json({error: "Все поля обязательны"});
        }
        
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if(userExists.rows.length > 0) {
            return res.status(400).json({error: "Email занят"});
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query("INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name", [email, name, hashedPassword]);

        res.status(201).json({
            message: 'пользователь создан',
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка регистрации: ", error);
        res.status(500).json({error: "Ошибка сервера"})
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if(userResult.rows.length === 0) {
            return res.status(401).json({error: "Пользователь не найден"});
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordValid) {
            return res.status(401).json({error: "неверный пароль"});
        }

        res.json({
            message: "Вход выполнен успешно",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch( err) {
        console.error("Ошибка входа", error);
        res.status(500).json({error: 'Ошибка сервера'});
    }
    
});

app.post("/api/posts/create", async (req, res) => {
    try {
        const {title, content, authorId } = req.body;
        
        if(!title || !content || !authorId) {
            return res.status(400).json({error: "Все поля обязательны"});
        }
        const userExists = await pool.query("SELECT id From users WHERE id = $1", [authorId]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({error: "Пользователя с таким id не существует"});
        }
        const result = await pool.query("INSERT INTO posts (title, content, author_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [title, content, authorId]);
        
        res.status(201).json({
            message: "Пост создан",
            post: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка создания поста", error);
        res.status(500).json({error: "Ошибка сервера"});
    }
});

const port = 5001;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});