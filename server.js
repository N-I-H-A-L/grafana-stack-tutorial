import express from 'express';
import { simulateRequest } from './util.js';
import promClient from "prom-client";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

//It will start collecting the default metrics set my Prometheus for our server.
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

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

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", promClient.register.contentType);
  const metrics = await promClient.register.metrics();
  res.send(metrics);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 