const express = require('express');
const { Pool } = require('pg');
const { collectDefaultMetrics, register, Counter, Histogram } = require('prom-client')

const app = express();
const metricsApp = express();
const port = process.env.PORT || 3080;
const metricsPort = process.env.METRICS_PORT || 3081;

// Retrieve database credentials from environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Collect default metrics
collectDefaultMetrics({ register });

// Create a custom counter metric
const requestCounter = new Counter({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
});

// Create a custom histogram metric for response times
const responseTimeHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5], // Define your buckets
});

// Middleware to count requests and measure response time
app.use((req, res, next) => {
  requestCounter.inc(); // Increment the request counter
  const end = responseTimeHistogram.startTimer(); // Start the timer
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path }); // Observe the response time
  });
  next();
});

// Metrics endpoint
metricsApp.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM messages');
    res.send(result.rows);
});

app.listen(port, () => {
    console.log(`Node.js app listening at http://localhost:${port}`);
});

metricsApp.listen(metricsPort, () => {
  console.log(`Metrics server is running on http://localhost:${metricsPort}/metrics`);
});

