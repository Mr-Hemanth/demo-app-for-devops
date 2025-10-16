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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Form</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #74ebd5, #ACB6E5);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .form-container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
          width: 300px;
        }
        h2 {
          margin-bottom: 20px;
          color: #333;
        }
        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
        }
        button {
          background-color: #6C63FF;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: 0.3s;
        }
        button:hover {
          background-color: #574fd6;
        }
        .link {
          margin-top: 15px;
          display: block;
          color: #6C63FF;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Submit Your Details</h2>
        <form id="demoForm">
          <input type="text" name="name" placeholder="Enter your First name" required />
          <input type="email" name="email" placeholder="Enter your Email" required />
          <button type="submit">Submit</button>
        </form>
        <a class="link" href="/data" target="_blank">View All Submissions</a>
        <p id="message" style="color: green; margin-top: 10px;"></p>
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

          if (response.ok) {
            message.textContent = '✅ Submission received!';
            form.reset();
          } else {
            message.textContent = '❌ Something went wrong!';
            message.style.color = 'red';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body;
  submissions.push({ name, email, time: new Date().toISOString() });
  res.status(200).send({ message: 'Submission received' });
});

// Endpoint to view stored data
app.get('/data', (req, res) => {
  res.json(submissions);
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
