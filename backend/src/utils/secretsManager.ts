import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ClientCredentials } from '../types/secretManager';

const secretsManagerClient = new SecretsManagerClient();

let clientCredentials;

const getClientCredentials = async (): Promise<ClientCredentials> => {
  if (!clientCredentials) {
    const command = new GetSecretValueCommand({ SecretId: process.env['CLIENT_CREDENTAILS_SECRET'] });
    try {
      const secret = await secretsManagerClient.send(command);
      const parsedSecret = JSON.parse(secret.SecretString ?? '');
      clientCredentials = parsedSecret;
      return clientCredentials;
    } catch (error) {
      throw new Error(error as string);
    }
  }
  return clientCredentials;
};

export { getClientCredentials };
