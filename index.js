const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// ===== Security & Middleware =====
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiter: max 10 requests per minute per IP
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.'
}));

// ===== MongoDB Connection =====
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/formDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Schema & Model =====
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, trim: true, lowercase: true },
  time: { type: Date, default: Date.now }
});
const Submission = mongoose.model('Submission', submissionSchema);

// ===== Serve HTML Form =====
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demo Form</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.form-container {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 400px;
  text-align: center;
  transition: transform 0.3s ease;
}
.form-container:hover { transform: translateY(-5px); }
h2 { margin-bottom: 25px; color: #333; font-size: 1.8em; }
.input-group { position: relative; margin-bottom: 25px; }
input {
  width: 100%; padding: 12px 15px; border: 1px solid #ccc;
  border-radius: 10px; font-size: 16px; transition: 0.3s;
}
input:focus {
  border-color: #764ba2;
  box-shadow: 0 0 8px rgba(118, 75, 162, 0.4);
  outline: none;
}
button {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: all 0.3s ease;
}
button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}
.link {
  display: block; margin-top: 15px;
  text-decoration: none; color: #764ba2; font-weight: 500;
}
.link:hover { text-decoration: underline; }
#message {
  margin-top: 15px; font-weight: bold; opacity: 0;
  transform: translateY(-10px); transition: all 0.5s ease;
}
#message.show { opacity: 1; transform: translateY(0); }
@media(max-width: 480px){
  .form-container { padding: 30px 20px; }
  h2 { font-size: 1.5em; }
}
</style>
</head>
<body>
<div class="form-container">
  <h2>Submit Your Details</h2>
  <form id="demoForm">
    <div class="input-group"><input type="text" name="name" placeholder="Enter your First Name" required /></div>
    <div class="input-group"><input type="email" name="email" placeholder="Enter your Email" required /></div>
    <button type="submit">Submit</button>
  </form>
  <a class="link" href="/data" target="_blank">View All Submissions</a>
  <p id="message"></p>
</div>
<script>
const form = document.getElementById('demoForm');
const message = document.getElementById('message');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const response = await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if(response.ok){
    message.textContent = '✅ Submission received!';
    message.style.color = 'green';
    message.classList.add('show');
    form.reset();
    setTimeout(()=>message.classList.remove('show'), 3000);
  } else {
    message.textContent = '❌ Something went wrong!';
    message.style.color = 'red';
    message.classList.add('show');
    setTimeout(()=>message.classList.remove('show'), 3000);
  }
});
</script>
</body>
</html>
  `);
});

// ===== Handle Form Submission =====
app.post('/submit',
  body('name').isLength({ min: 1 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email } = req.body;
      const submission = new Submission({ name, email });
      await submission.save();
      res.status(200).json({ message: 'Submission received' });
    } catch (err) {
      next(err);
    }
});

// ===== View Submissions =====
app.get('/data', async (req, res, next) => {
  try {
    const data = await Submission.find().sort({ time: -1 });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== Start Server =====
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
