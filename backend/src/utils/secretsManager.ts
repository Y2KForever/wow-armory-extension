import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ClientCredentials, TwitchExtensionSecretType } from '../types/SecretManager';

const secretsManagerClient = new SecretsManagerClient();

let clientCredentials;
let twitchExtensionSecret;

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

const getTwitchExtensionSecret = async (): Promise<TwitchExtensionSecretType> => {
  if (!twitchExtensionSecret) {
    const command = new GetSecretValueCommand({ SecretId: process.env['TWITCH_EXTENSION_SECRET'] });
    try {
      const secret = await secretsManagerClient.send(command);
      const parsedSecret = JSON.parse(secret.SecretString ?? '');
      twitchExtensionSecret = parsedSecret;
      return twitchExtensionSecret;
    } catch (error) {
      throw new Error(error as string);
    }
  }
  return twitchExtensionSecret;
};

export { getClientCredentials, getTwitchExtensionSecret };
