const express = require('express');
const jwt = require('json-web-token');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Load JWT keys
const publicKey = fs.readFileSync(path.join(__dirname, 'public-key.pem'), 'utf8');
const privateKey = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');

// In-memory user storage
const users = {};

// Serve robots.txt and audit.log from project root
const staticFiles = ['robots.txt', 'audit.log'];

staticFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    const filePath = path.join(__dirname, file);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send(`${file} not found`);
      }
    });
  });
});

// ---------- GENERATE ADMIN ACCOUNT ----------
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

(async () => {
  const adminPassword = generateRandomPassword(12);
  const hash = await bcrypt.hash(adminPassword, 10);
  users['admin'] = { passwordHash: hash, admin: true };
  console.log(`Admin account created! Username: admin | Password: ${adminPassword}`);
})();

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Error-handling middleware (must be last)
app.use((err, req, res, next) => {
  // Optional: log internally without exposing details
  if (process.env.NODE_ENV !== 'production') {
    console.error(err); // full stack in dev only
  } else {
    // In production, you could log to a file or external service
    // console.error(err);  // or send to monitoring
  }

  // Respond with a generic message
  res.status(500).json({ error: "Internal Server Error" });
});

// ---------- COMMON COFFEE-THEME CSS ----------
const commonCSS = `
body { font-family: 'Open Sans', sans-serif; background: #f3f0e6;
       display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.container { background: #d9cbb3; padding: 2rem; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); width: 100%; max-width: 500px; }
h1 { text-align: center; color: #4b3621; margin-bottom: 1.5rem; font-family: 'Caveat', cursive; }
input { width: 100%; padding: 0.7rem; margin-bottom: 1rem; border-radius: 12px;
        border: 1px solid #a67c52; font-size: 1rem; }
button { width: 100%; padding: 0.7rem; border-radius: 12px; border: none;
         background: #4b3621; color: #fffaf0; font-size: 1rem; cursor: pointer; transition: 0.2s; }
button:hover { background: #6f4e37; }
a { color: #4b3621; text-decoration: none; } a:hover { text-decoration: underline; }
.message { margin-top: 1rem; padding: 0.8rem; border-radius: 6px; text-align: center; display: none; }
.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
pre { background: #f4f1ed; padding: 1rem; border-radius: 6px; overflow-x: auto; }
.admin-panel { margin-top: 1rem; padding: 1rem; border-radius: 6px;
               background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
.flag { margin-top: 1rem; padding: 1rem; border-radius: 6px;
       background: #e0f7fa; color: #006064; font-weight: bold; text-align: center; }
`;

// ---------------- HOMEPAGE ----------------
app.get('/', (req, res) => {
  res.send(`
<html>
<head>
<title>Java Brew Café</title>
<style>
body {
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  background: #f3f0e6;
  color: #4b3621;
}
header {
  background: #6f4e37;
  color: #fffaf0;
  padding: 2rem 1rem;
  text-align: center;
}
header h1 {
  font-family: 'Caveat', cursive;
  font-size: 3rem;
  margin: 0;
}
nav {
  margin-top: 1rem;
}
nav a {
  color: #fffaf0;
  text-decoration: none;
  margin: 0 1rem;
  font-weight: bold;
}
nav a:hover {
  text-decoration: underline;
}
section {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.service-card {
  background: #d9cbb3;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.service-card:hover {
  transform: translateY(-5px);
}
.service-card h3 {
  margin-top: 0;
  color: #4b3621;
}
footer {
  text-align: center;
  padding: 2rem 1rem;
  background: #6f4e37;
  color: #fffaf0;
  margin-top: 3rem;
}
button.cta {
  background: #4b3621;
  color: #fffaf0;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
}
button.cta:hover {
  background: #6f4e37;
}
</style>
</head>
<body>
<header>
  <h1>Java Brew Café ☕</h1>
  <nav>
    <a href="/register">Register</a>
    <a href="/login">Login</a>
    <a href="/dashboard">Dashboard</a>
  </nav>
</header>

<section>
  <h2>Welcome to Java Brew Café!</h2>
  <p>Your one-stop shop for expertly brewed coffee, delivered right to your doorstep, or enjoyed in our cozy café. Discover the perfect cup today!</p>

  <div class="service-card">
    <h3>☕ Freshly Brewed Coffee</h3>
    <p>Enjoy our signature blends made from premium beans roasted to perfection. Available for dine-in or takeaway.</p>
  </div>

  <div class="service-card">
    <h3>🚚 Coffee Delivery</h3>
    <p>Get your favorite coffee delivered hot and fresh directly to your home or office.</p>
  </div>

  <div class="service-card">
    <h3>🎓 Coffee Workshops</h3>
    <p>Learn the art of coffee making from our expert baristas in hands-on workshops.</p>
  </div>

  <div class="service-card">
    <h3>🛒 Coffee Merchandise</h3>
    <p>Grab our exclusive mugs, beans, and brewing equipment to enjoy café-quality coffee at home.</p>
  </div>

  <p style="text-align:center; margin-top:2rem;">
    <button class="cta" onclick="window.location.href='/register'">Join Our Coffee Club</button>
  </p>
</section>

<footer>
  &copy; ${new Date().getFullYear()} Java Brew Café. All rights reserved.
</footer>
</body>
</html>
`);
});

// ---------------- REGISTER PAGE ----------------
app.get('/register', (req, res) => {
  res.send(`
<html>
<head><title>Register</title><style>${commonCSS}</style></head>
<body>
<div class="container">
<h1>Register</h1>
<form id="registerForm">
  <input name="username" placeholder="Username" required><br>
  <input type="password" name="password" placeholder="Password" required><br>
  <button type="submit">Register</button>
</form>
<div id="message" class="message"></div>
<p>Already have an account? <a href="/login">Login</a></p>

<!-- Back to Homepage Link -->
<p style="text-align:center; margin-top:1rem;">
  <a href="/" class="back-home">&larr; Back to Homepage</a>
</p>

</div>

<script>
const form = document.getElementById('registerForm');
const messageBox = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await response.text();
    if (text.includes('Registered!')) {
      messageBox.textContent = 'Successfully registered! Redirecting to login...';
      messageBox.className = 'message success';
      messageBox.style.display = 'block';
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } else {
      messageBox.textContent = text;
      messageBox.className = 'message error';
      messageBox.style.display = 'block';
    }
  } catch (err) {
    messageBox.textContent = 'Error creating account';
    messageBox.className = 'message error';
    messageBox.style.display = 'block';
  }
});
</script>
</body></html>
`);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Missing username or password");
  if (users[username]) return res.send("User already exists");

  const hash = await bcrypt.hash(password, 10);
  users[username] = { passwordHash: hash };
  res.send("Registered!");
});

// ---------------- LOGIN PAGE ----------------
app.get('/login', (req, res) => {
  res.send(`
<html>
<head><title>Login</title><style>${commonCSS}</style></head>
<body>
<div class="container">
<h1>Login</h1>
<form id="loginForm">
  <input name="username" placeholder="Username" required><br>
  <input type="password" name="password" placeholder="Password" required><br>
  <button type="submit">Login</button>
</form>
<div id="message" class="message"></div>
<p>Don’t have an account? <a href="/register">Register</a></p>

<!-- Back to Homepage Link -->
<p style="text-align:center; margin-top:1rem;">
  <a href="/" class="back-home">&larr; Back to Homepage</a>
</p>

</div>

<script>
const form = document.getElementById('loginForm');
const messageBox = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const text = await response.text();
    if (text.includes('Success')) {
      messageBox.textContent = 'Login successful! Redirecting to dashboard...';
      messageBox.className = 'message success';
      messageBox.style.display = 'block';
      setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } else {
      messageBox.textContent = text;
      messageBox.className = 'message error';
      messageBox.style.display = 'block';
    }
  } catch (err) {
    messageBox.textContent = 'Error during login';
    messageBox.className = 'message error';
    messageBox.style.display = 'block';
  }
});
</script>
</body></html>
`);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.send("Invalid credentials");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.send("Invalid credentials");

  const payload = { username, admin: !!user.admin };
  jwt.encode(privateKey, payload, 'RS256', (err, token) => {
    if (err) return res.send("Token generation failed");

    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    res.send("Success");
  });
});

// ---------------- DASHBOARD ----------------
app.get('/dashboard', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.redirect('/login');

  jwt.decode(publicKey, token, (err, decoded) => {
    if (err) return res.send("Invalid token. Please <a href='/login'>login</a> again.");

    let adminPanel = '';
    let ctfFlag = '';
    if (decoded.admin) {
      adminPanel = `
        <div class="admin-panel">
          <h3>Barista Control Panel</h3>
          <p>Admin-only tools and secret brews.</p>
        </div>
      `;
      ctfFlag = `
        <div class="flag">
          ☕ QOTD: flag{this_is_the_admin_secret_flag} ☕
        </div>
      `;
    }

    // Embed JWT 
    res.send(`
<html>
<head><title>Coffee Dashboard</title>
<style>
${commonCSS}
.logout-container { margin-top: 2rem; } /* Gap between flag and logout */
.hidden-token { display: none; } /* Hidden in source */
</style>
</head>
<body>
<div class="container">
<h1>Welcome, ${decoded.username}</h1>
<!-- MAKE SURE TO DELETE FROM PROD! NO NEED TO EXPOSE TO END USER -->
<span class="hidden-token" id="user-jwt">${token}</span>
<pre>${JSON.stringify(decoded, null, 2)}</pre>
${adminPanel}
${ctfFlag}
<div class="logout-container">
  <form action="/logout"><button type="submit">Logout</button></form>
</div>
<!-- Back to Homepage Link -->
<p style="text-align:center; margin-top:1rem;">
  <a href="/" class="back-home">&larr; Back to Homepage</a>
</p>
</div>
</body></html>
`);
  });
});

// ---------------- LOGOUT ----------------
app.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/login');
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`Coffee-themed server running at http://localhost:${port}`);
});