const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");
const multer = require("multer");
const path = require("path");

const app = express();

const storage  = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `post_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения!'), false);
    }
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('')

app.get("/api/posts", async (req, res) => {
    try {
        //users.username на ноуте , users.name пк 16 строчка
        const result = await pool.query(`
      SELECT posts.*, users.username  
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
        // user - пк, username - ноут
        const result = await pool.query("INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username", [email, name, hashedPassword]);

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
                name: user.username
            }
        });
    } catch(err) {
        console.error("Ошибка входа", error);
        res.status(500).json({error: 'Ошибка сервера'});
    }
    
});

app.post("/api/posts/create", upload.single('image'), async (req, res) => {
    try {
        const {title, content, authorId } = req.body;
        
        if(!title || !content || !authorId) {
            return res.status(400).json({error: "Все поля обязательны"});
        }
        const userExists = await pool.query("SELECT id From users WHERE id = $1", [authorId]);
        
        if (userExists.rows.length === 0) {
            return res.status(404).json({error: "Пользователя с таким id не существует"});
        }

        let result;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `/uploads/posts/${req.file.filename}`;
            result = await pool.query(
                `INSERT INTO posts (title, content, author_id, image_url, created_at) 
                VALUES ($1, $2, $3, $4, NOW()) RETURNING *`, [title, content, authorId, imageUrl]);
        } else {
            result = await pool.query("INSERT INTO posts (title, content, author_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [title, content, authorId]);
        }

        
        res.status(201).json({
            message: "Пост создан",
            post: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка создания поста", error);
        res.status(500).json({error: "Ошибка сервера"});
    }
});

app.post("/api/posts/edit", upload.single("image"), async (req, res) => {
    try {
        const {title, content, author_id, post_id } = req.body;

        if(!title || !content || !author_id) {
            return res.status(400).json({error: "Все поля обязательны"});
        }

        const userExists = await pool.query("SELECT id FROM users WHERE id = $1", [author_id]);
        if(userExists.rows.length === 0) {
            return res.status(404).json({error: "Пользователя с таким id не существует"});
        }

        let result;
        let imageUrl = null;

        if(req.file) {
            imageUrl = `/uploads/posts/${req.file.filename}`;
            result = await pool.query("UPDATE posts SET title = $1, content = $2, image_url = $3 WHERE id = $4", [title, content, imageUrl, post_id]);
        } else {
            result = await pool.query("UPDATE posts SET title = $1, content = $2 WHERE id = $3", [title, content, post_id]);
        }
        res.status(201).json({
            message: "Пост отредактирован",
            post: result.rows[0]
        })
    } catch (error) {
        console.log("Ошибка редактирование поста", error);
        res.status(500).json({error: "Ошибка сервера"});
    }
});

app.get("/api/posts/userPosts", async (req, res) => {   
    try {
        const { userId } = req.query;

        const userExists = await pool.query("SELECT * FROM posts WHERE author_id = $1", [userId]);

        if(userExists.rows.length === 0) {
            return res.status(400).json({posts: 0});
        }

        const result = await pool.query("SELECT * FROM posts WHERE author_id = $1", [userId]);

        res.status(201).json({
            posts: result.rows
        });
    } catch(error) {
        console.error("Ошибка запроса постов", error);  
        res.status(500).json({error: "Ошибка сервера"});
    }
});

const port = 5001;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});