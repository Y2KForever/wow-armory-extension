import { ApiCharacter, ApiItems } from '../types/Api';
import { ItemResponse, MediaResponse, TokenResponse } from '../types/BattleNet';
import { getClientCredentials } from '../utils/secretsManager';
import { rgbaToHex, toUnderscores } from '../utils/utils';

class BattleNetApi {
  private static instance: BattleNetApi;
  private accessToken: string | null = null;
  private expiryTime: number | null = null;
  private fetchingPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): BattleNetApi {
    if (!BattleNetApi.instance) {
      BattleNetApi.instance = new BattleNetApi();
    }
    return BattleNetApi.instance;
  }

  private async makeRquest(url: string, method: 'GET' | 'POST' = 'GET', namespace: string): Promise<Response> {
    const token = await this.getAccessToken();

    const response = await fetch(`${url}?locale=en_US`, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Battlenet-Namespace': namespace,
      },
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
        character.namespace === 'retail' ? `profile-${region}` : `${character.namespace}-${region}`,
      );

      const data = (await resp.json()) as MediaResponse;
      return data.assets.reduce((acc, asset) => {
        acc[asset.key] = asset.value;
        return acc;
      }, {} as Record<string, string>);
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
        character.namespace === 'retail' ? `profile-${region}` : `${character.namespace}-${region}`,
      );
      const data = (await resp.json()) as ItemResponse;

      return data.equipped_items.reduce((acc, item) => {
        acc[item.slot.type.toLowerCase()] = {
          type: item.item_subclass.name,
          quality: item.quality.name,
          name: item.name,
          stats:
            item.stats?.map((stat) => ({
              name: stat.type.name,
              value: stat.value,
              color: rgbaToHex(stat.display.color),
              is_equipped_bonus: stat.is_equip_bonus ?? false,
            })) || [],
          spells: item.spells
            ? item.spells.map((spell) => ({
                name: spell.spell.name,
                description: spell.description,
              }))
            : null,
          requirement: item.requirements?.level.display_string || null,
          level: item.level.value,
          transmog: item.transmog?.item.name || null,
        };
        return acc;
      }, {} as ApiItems);
    } catch (err) {
      console.log(`Failed to fetch character item:`, err);
      throw err;
    }
  }
}

export default BattleNetApi;
