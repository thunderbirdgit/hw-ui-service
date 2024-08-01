const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Pool } = require('pg');

const client = new SecretManagerServiceClient();

async function getDbCredentials() {
  const projectId = 'nonprod-app-cluster'; // Replace with your GCP project ID
  const secretName = 'test_creds'; // Replace with your secret name

  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  const [version] = await client.accessSecretVersion({ name });
  const secretPayload = version.payload.data.toString('utf8');

  // Parse the JSON secret payload
  return JSON.parse(secretPayload);
}

async function connectToDatabase() {
  const credentials = await getDbCredentials();

  const pool = new Pool({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
  });

  return pool;
}

async function queryTable(tableName) {
  const pool = await connectToDatabase();

  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    console.log(result.rows);
  } catch (err) {
    console.error('Error querying the table:', err);
  } finally {
    await pool.end(); // Close the connection pool
  }
}

// Example usage
queryTable('hello_world_db');
