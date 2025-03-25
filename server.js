import express from 'express';
import { simulateRequest } from './util.js';
import promClient from "prom-client";
import responseTime from 'response-time';
import { createLogger, transports } from 'winston';
import LokiTransport from 'winston-loki';

const options = {
  transports: [
    new LokiTransport({
      //Push the logs to this URL, URL at which Loki server is running.
      host: "http://127.0.0.1:3100"
    })
  ]
};

//Logs will be pushed using this logger.
const logger = createLogger(options);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

//It will start collecting the default metrics set my Prometheus for our server.
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const reqResTime = new promClient.Histogram({
  name: "http_express_req_res_time",
  help: "This tells how much time is taken by the request and response of a request.",
  labelNames: ["method", "route", "status_code"],
  buckets: [100, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500], //buckets refers to the datapoints of the graph.
});

//To store total number of requests
const totalRequestCounter = new promClient.Counter({
  name: "total_requests",
  help: "This tells the total number of requests received.",
});

app.use(responseTime((req, res, time) => {
  //Increment the count
  totalRequestCounter.inc();
  reqResTime.labels({
    method: req.method,
    route: req.url,
    status_code: req.statusCode,
  })
  .observe(time);
}));

// Basic root endpoint
app.get('/', (req, res) => {
  logger.info("Requested for root route.")
  res.json({ message: 'Welcome to the LGTM Stack Tutorial Server' });
});

app.get('/slow', async (req, res) => {
  try {
    const result = await simulateRequest();
    res.json(result);
  } catch (error) {
    logger.error(`Error in /slow route: ${error.message}`);
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