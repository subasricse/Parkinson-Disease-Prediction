const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const cors = require('cors'); 

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// POST endpoint to handle form submission
app.post('/submitFormData', (req, res) => {
  const formData = req.body;

  // Convert string data to floats
  const floatFormData = {};
  for (const key in formData) {
    floatFormData[key] = parseFloat(formData[key]);
  }

  // Spawn a child process to run the Python script
  const pythonProcess = spawn('python', ['./mlModel.py', JSON.stringify(floatFormData)]);

  let dataBuffer = "";
  let errorBuffer = "";

  // Collect data from the Python script
  pythonProcess.stdout.on('data', (data) => {
    dataBuffer += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorBuffer += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      console.error(`Error: ${errorBuffer}`);
      res.status(500).send('An error occurred while processing the request');
    } else {
      try {
        const predictions = JSON.parse(dataBuffer);
        res.json({ predictions });
      } catch (err) {
        console.error('Error parsing JSON data:', err);
        res.status(500).send('An error occurred while processing the request');
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
