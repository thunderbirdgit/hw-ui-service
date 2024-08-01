const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Create the client
const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
  const projectId = '42055920053'; // Your GCP project ID
  const secretName = 'test_creds'; // Your secret name
  const versionId = 'latest'; // Version ID (latest)
  const name = `projects/${projectId}/secrets/${secretName}/versions/${versionId}`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString('utf8');
    console.log(`Retrieved secret: ${payload}`);
  } catch (err) {
    console.error(`Error accessing secret: ${err.message}`);
  }
}

accessSecretVersion();
