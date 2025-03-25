import express from 'express';
import { simulateRequest } from './util.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the LGTM Stack Tutorial Server' });
});

app.get('/slow', async (req, res) => {
  try {
    const result = await simulateRequest();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 