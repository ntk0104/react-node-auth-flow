const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const {jwtDecode} = require("jwt-decode");

const app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Hoặc bạn có thể chỉ định origin cụ thể
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Dùng để lưu trữ các thông tin user (thay thế bằng cơ sở dữ liệu thực tế)
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

const posts = [
  { id: 1, title: "ABC", content: "ABC content" },
  { id: 2, title: "DEF", content: "DEF content" },
];

// Biến lưu trữ refreshToken, thường lưu trên cơ sở dữ liệu
let refreshToken = null;
console.log("🚀 ~ file: index.js:16 ~ refreshToken:", refreshToken)

// Middleware kiểm tra accessToken có hợp lệ hay không
function verifyAccessToken(req, res, next) {
  const accessToken = req.headers.authorization;
  console.log("🚀 ~ file: index.js:21 ~ verifyAccessToken ~ accessToken:", accessToken)

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(accessToken, "your-secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Expired or invalid token" });
  }
}

// API /login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("🚀 ~ file: index.js:37 ~ app.post ~ req.body:", req.body)
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const accessToken = jwt.sign({ userId: user.id }, "your-secret-key", {
      expiresIn: "10s",
    });
    refreshToken = jwt.sign({ userId: user.id }, "refresh-secret-key", {
      expiresIn: "1d",
    });

    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// API /refreshToken
app.post("/refreshToken", (req, res) => {
  const refreshTokenFromBody = req.body.refreshToken;
  console.log("🚀 ~ file: index.js:71 ~ app.post ~ refreshTokenFromBody:", refreshTokenFromBody)
  console.log("🚀 ~ file: index.js:70 ~ app.post ~ refreshToken:", refreshToken)
  console.log("🚀 ~ file: index.js:70 ~ app.post ~ refreshToken == refreshTokenFromBody:", refreshToken == refreshTokenFromBody)

  if (refreshTokenFromBody === refreshToken) {
    const userInfo = jwtDecode(refreshToken);
    console.log("🚀 ~ file: index.js:75 ~ app.post ~ userInfo:", userInfo)
    const accessToken = jwt.sign(
      { userId: userInfo.userId },
      "your-secret-key",
      { expiresIn: "1m" }
    );
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "Invalid refreshToken" });
  }
});

// API /users (yêu cầu accessToken hợp lệ)
app.get("/users", verifyAccessToken, (req, res) => {
  const usersList = users.map((user) => ({
    id: user.id,
    username: user.username,
  }));
  res.json(usersList);
});

// API /posts (yêu cầu accessToken hợp lệ)
app.get("/posts", verifyAccessToken, (req, res) => {
  res.json(posts);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
