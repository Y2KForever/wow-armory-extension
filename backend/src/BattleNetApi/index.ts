import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ApiCharacter, ApiItems } from '../types/Api';
import { ItemResponse, MediaResponse, TokenResponse } from '../types/BattleNet';
import { getClientCredentials } from '../utils/secretsManager';
import { checkIfImageExist, downloadImage, rgbaToHex, toUnderscores, uploadImage } from '../utils/utils';

class BattleNetApi {
  private static instance: BattleNetApi;
  private accessToken: string | null = null;
  private expiryTime: number | null = null;
  private fetchingPromise: Promise<string> | null = null;
  private static s3Client: S3Client;

  private constructor() {}

  public static getInstance(): BattleNetApi {
    if (!BattleNetApi.instance) {
      BattleNetApi.instance = new BattleNetApi();
    }
    return BattleNetApi.instance;
  }

  public static getS3Client(): S3Client {
    if (!BattleNetApi.s3Client) {
      BattleNetApi.s3Client = new S3Client();
    }
    return BattleNetApi.s3Client;
  }

  private async makeRquest(
    url: string,
    method: 'GET' | 'POST' = 'GET',
    locale: boolean,
    namespace?: string,
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const params = new URLSearchParams(locale ? { locale: 'en_US' } : {});
    const separator = url.includes('?') ? '&' : '?';

    if (namespace) {
      headers['Battlenet-Namespace'] = namespace;
    }

    const response = await fetch(`${url}${separator}${params.toString()}`, {
      method: method,
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  }

  private async fetchNewToken(): Promise<string> {
    const clientCredentialsSecret = await getClientCredentials();
    const response = await fetch('https://oauth.battle.net/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientCredentialsSecret.client_id,
        client_secret: clientCredentialsSecret.client_secret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch API token');
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.expiryTime = Date.now() + data.expires_in * 1000;
    this.fetchingPromise = null;
    return this.accessToken;
  }

  public async getAccessToken(): Promise<string> {
    if (this.accessToken && this.expiryTime && Date.now() < this.expiryTime) {
      return this.accessToken;
    }

    if (!this.fetchingPromise) {
      this.fetchingPromise = this.fetchNewToken();
    }

    return this.fetchingPromise;
  }

  public async fetchCharacterMedia(
    character: ApiCharacter,
    region: string,
    baseUrl: string,
  ): Promise<Record<string, string>> {
    try {
      const url = `https://${region}.${baseUrl}/profile/wow/character/${toUnderscores(
        character.realm.name,
      )}/${character.name.toLowerCase()}/character-media`;
      const resp = await this.makeRquest(
        url,
        'GET',
        true,
        character.namespace === 'retail' ? `profile-${region}` : `${character.namespace}-${region}`,
      );

      const data = (await resp.json()) as MediaResponse;
      const client = BattleNetApi.getS3Client();
      const mediaMap: Record<string, string> = {};

      for (const asset of data.assets) {
        const filename = `${character.id}-${asset.key}.jpg`;
        const s3Key = `characters/${filename}`;
        const imageExist = await checkIfImageExist(s3Key, client);
        if (!imageExist) {
          const imageBuffer = await downloadImage(asset.value);
          await uploadImage(s3Key, imageBuffer, client);
        }
        mediaMap[asset.key] = filename;
      }
      return mediaMap;
    } catch (err) {
      console.log(`Failed to fetch character media:`, err);
      throw err;
    }
  }

  public async fetchCharacterItems(character: ApiCharacter, region: string, baseUrl: string): Promise<ApiItems> {
    try {
      const url = `https://${region}.${baseUrl}/profile/wow/character/${toUnderscores(
        character.realm.name,
      )}/${character.name.toLowerCase()}/equipment`;
      const resp = await this.makeRquest(
        url,
        'GET',
        true,
        character.namespace === 'retail' ? `profile-${region}` : `${character.namespace}-${region}`,
      );
      const data = (await resp.json()) as ItemResponse;

      const client = BattleNetApi.getS3Client();
      const items: ApiItems = {};

      for (const item of data.equipped_items) {
        const slot = item.slot.type.toLowerCase();
        const filename = `${item.item.id.toString()}.jpg`;
        const s3Key = `items/${filename}`;
        const MediaResponse = await this.makeRquest(item.media.key.href, 'GET', false);
        const media = (await MediaResponse.json()) as MediaResponse;
        for (const asset of media.assets) {
          const imageExist = await checkIfImageExist(s3Key, client);
          if (!imageExist) {
            const imageBuffer = await downloadImage(asset.value);
            await uploadImage(s3Key, imageBuffer, client);
          }
        }
        items[slot] = {
          sockets: item.sockets?.map((socket) => socket.socket_type.type) || [],
          type: item.item_subclass.name,
          quality: item.quality.name,
          name: item.name,
          image: filename,
          stats:
            item.stats?.map((stat) => ({
              name: stat.type.name,
              value: stat.value,
              color: rgbaToHex(stat.display.color),
              is_equipped_bonus: stat.is_equip_bonus ?? false,
            })) || [],
          spells:
            item.spells?.map((spell) => ({
              name: spell.spell.name,
              description: spell.description,
            })) || null,
          requirement: item.requirements?.level.display_string || null,
          level: item.level.value,
          transmog: item.transmog?.item.name || null,
        };
      }
      return items;
    } catch (err) {
      console.log(`Failed to fetch character item:`, err);
      throw err;
    }
  }
}

export default BattleNetApi;
