const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const jwt = require('jsonwebtoken');
const app = express();

//jwt
const JWT_SECRET = 'blog-secret-key-2024';

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}


const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ error: "Токен отсутствует" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Неверный токен" });
    }
};
// jwt

const postStorage  = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `post_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadPost = multer({ 
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения!'), false);
    }
  }
});

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');  // отдельная папка
    },
    filename: (req, file, cb) => {
        const uniqueName = `avatar_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB для аватаров
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



app.get("/api/posts", async (req, res) => {
    try {
        //users.username на ноуте , users.name пк 16 строчка
        const result = await pool.query(`
      SELECT posts.*, users.name, users.avatar_url   
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: error.message});
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

        const token = generateToken(user.id);
        res.json({
            message: "Вход выполнен успешно",
            user: {
                id: user.id,
                email: user.email,
                username: user.name,
                avatar_url: user.avatar_url
            },
            token: token
        });
    } catch(error) {
        console.error("Ошибка входа", error);
        res.status(500).json({error: 'Ошибка сервера'});
    }
    
});

app.post("/api/posts/create", authMiddleware, uploadPost.single('image'), async (req, res) => {
    try {
        const {title, content} = req.body;
        const authorId = req.userId;

        if(!title || !content) {
            return res.status(400).json({error: "Все поля обязательны"});
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

app.post("/api/user/edit", authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const { newName } = req.body;
        const user_id = req.userId;

        if(!newName) {
            return res.status(500).json({error: "Имя обязательно"});
        }

        let result;
        let imageUrl = null;

        if(req.file) {
            imageUrl = `/uploads/avatars/${req.file.filename}`;
            result = await pool.query("UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING id, name, email, avatar_url", [ newName, imageUrl, user_id]);
        } else {
            result = await pool.query("UPDATE users SET name = $1 WHERE id = $2  RETURNING id, name, email, avatar_url", [ newName, user_id]);
        }

        res.status(200).json({
            message: "Личные данные отредактированы",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Ошибка редактирование профиля", error);
        res.status(500).json({error: "Ошибка сервера"});
    }
});

app.post('/api/auth/register', uploadAvatar.single("avatar"), async (req ,res) => {
    try {
        const { email, name, password } = req.body;

        if(!email && !name && !password) {
            return res.status(500).json({error: "Все поля обязательны"});
        }
        
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if(userExists.rows.length > 0) {
            return res.status(400).json({error: "Email занят"});
        }
        
        let result;
        let imageUrl = null;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        if(req.file) {
            imageUrl = `/uploads/avatars/${req.file.filename}`;
            result = await pool.query("INSERT INTO users (email, name, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, email, name, avatar_url", [email, name, hashedPassword, imageUrl]);
        } else {
            result = await pool.query("INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name", [email, name, hashedPassword]);
        }
        
        const token = generateToken(result.rows[0].id);

        // user - пк, username - ноут

        res.status(201).json({
            message: 'пользователь создан',
            user: result.rows[0],
            token: token
        });
    } catch (error) {
        console.error("Ошибка регистрации: ", error);
        res.status(500).json({error: "Ошибка сервера"})
    }
});

app.post("/api/posts/edit", authMiddleware, uploadPost.single("image"), async (req, res) => {
    try {
        const {title, content, post_id } = req.body;
        const author_id = req.userId;
        
        if(!title || !content || !post_id) {
            return res.status(400).json({error: "Все поля обязательны"});
        }

        const postCheck = await pool.query("SELECT author_id FROM posts WHERE id = $1", [post_id]);

        if (postCheck.rows.length === 0) {
            return res.status(404).json({error: "Пост не найден"});
        }

        if (postCheck.rows[0].author_id !== author_id) {
            return res.status(403).json({error: "Нет прав на редактирование"});
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

app.get("/api/posts/userPosts", authMiddleware, async (req, res) => {   
    try {
        const userId = req.userId;

        const result = await pool.query("SELECT * FROM posts WHERE author_id = $1", [userId]);

        res.status(200).json({
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