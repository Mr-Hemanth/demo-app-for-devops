const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let submissions = []; // store form data here

// Serve HTML form
app.get('/', (req, res) => {
  res.send(`
    <h2>Demo Form</h2>
    <form method="POST" action="/submit">
      <input type="text" name="name" placeholder="Enter your name" required />
      <input type="email" name="email" placeholder="Enter your email" required />
      <button type="submit">Submit</button>
    </form>
    <br/>
    <a href="/data">View All Submissions</a>
  `);
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body;
  submissions.push({ name, email, time: new Date().toISOString() });
  res.send('<p>✅ Submission received! <a href="/">Go back</a></p>');
});

// Endpoint to view stored data
app.get('/data', (req, res) => {
  res.json(submissions);
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
