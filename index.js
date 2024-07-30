const express = require('express');
const { Pool } = require('pg');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Secret Manager client
const client = new SecretManagerServiceClient();

async function getDbCredentials() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/YOUR_PROJECT_ID/secrets/my-postgres-password/versions/latest',
  });
  const password = version.payload.data.toString('utf8');
  return password;
}

(async () => {
  const password = await getDbCredentials();
  const pool = new Pool({
    user: 'dev_api_db_creds',
    host: '104.198.20.225',  // Replace with your instance IP
    database: 'hello_world_db',
    password: password,
    port: 5432,
  });

  app.get('/', async (req, res) => {
    const result = await pool.query('SELECT message FROM greetings LIMIT 1');
    res.send(result.rows[0].message || 'Hello World');
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();
