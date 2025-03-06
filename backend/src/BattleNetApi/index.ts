import { S3Client } from '@aws-sdk/client-s3';
import { ApiCharacter, ApiCharacterStatus, ApiCharacterSummary, ApiCharacterTalents, ApiItems } from '../types/Api';
import {
  CharacterSpecializations,
  CharactersResponse,
  CharacterStatus,
  CharacterSummary,
  ItemResponse,
  MediaResponse,
  Talents,
  TokenResponse,
} from '../types/BattleNet';
import { getClientCredentials } from '../utils/secretsManager';
import { checkIfImageExist, downloadImage, rgbaToHex, toDashes, uploadImage } from '../utils/utils';

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

  private buildCharacterUrl(character: ApiCharacter, region: string, baseUrl: string, endpoint?: string): string {
    const basePath = `https://${region}.${baseUrl}/profile/wow/character/${toDashes(
      character.realm.name,
    )}/${character.name.toLowerCase()}`;
    return endpoint ? `${basePath}/${endpoint}` : basePath;
  }

  private getNamespace(character: ApiCharacter, region: string): string {
    return character.namespace === 'retail' ? `profile-${region}` : `${character.namespace}-${region}`;
  }

  private getActiveLoadout(data: CharacterSpecializations) {
    const activeSpecId = data.active_specialization.id;
    const activeSpec = data.specializations.find((spec) => spec.specialization.id === activeSpecId);
    if (!activeSpec) return null;
    const activeLoadout = activeSpec.loadouts.find((loadout) => loadout.is_active);
    return activeLoadout ?? null;
  }

  private async makeRequest(
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

  private async processMediaAssets(
    assets: { key: string; value: string }[],
    getS3Key: (asset: { key: string; value: string }) => string,
    client: S3Client,
  ): Promise<Record<string, string>> {
    const uploadPromises = assets.map(async (asset) => {
      const s3Key = getS3Key(asset);
      const filename = s3Key.split('/').pop()!;
      const imageExist = await checkIfImageExist(s3Key, client);
      if (!imageExist || filename.includes('main-raw')) {
        const imageBuffer = await downloadImage(asset.value);
        await uploadImage(s3Key, imageBuffer, client);
      }
      return { key: asset.key, filename };
    });
    const results = await Promise.all(uploadPromises);
    return results.reduce((mediaMap, { key, filename }) => {
      mediaMap[key] = filename;
      return mediaMap;
    }, {} as Record<string, string>);
  }

  private async fetchItemMedia(region: string, baseUrl: string, itemId: number): Promise<MediaResponse | null> {
    try {
      const response = await this.makeRequest(
        `https://${region}.${baseUrl}/data/wow/media/item/${itemId}`,
        'GET',
        true,
        `static-${region}`,
      );
      return (await response.json()) as MediaResponse;
    } catch (error) {
      console.error(`Failed to fetch media for item ${itemId}:`, error);
      return null;
    }
  }

  private async processSockets(
    sockets: any[] | undefined,
    itemId: number,
  ): Promise<
    Array<{
      type: string;
      item: { name?: string; value: string };
      image?: string;
    }>
  > {
    if (!sockets || sockets.length === 0) return [];
    const client = BattleNetApi.getS3Client();
    return Promise.all(
      sockets.map(async (socket) => {
        const socketMediaUrl = socket.media?.key.href;
        let processedImage: string | undefined = undefined;
        if (socketMediaUrl) {
          const socketImagesResp = await this.makeRequest(socket.media.key.href, 'GET', false);
          const socketJSON = (await socketImagesResp.json()) as MediaResponse;
          if (socketJSON.assets?.length) {
            const socketImage = socketJSON.assets[0];
            const ext = socketImage.value.split('.').pop()?.toLowerCase() || 'jpg';
            const socketFilename = `${itemId}-${socket.socket_type.type}.${ext}`;
            const socketS3Key = `sockets/${socketFilename}`;
            processedImage = await this.processSocketMedia(socketImage.value, socketS3Key, client);
          }
        }
        return {
          type: socket.socket_type.type,
          item: {
            name: socket.item?.name,
            value: socket.display_string,
          },
          image: processedImage,
        };
      }),
    );
  }

  private async processSocketMedia(socketMediaUrl: string, socketS3Key: string, client: S3Client): Promise<string> {
    const exists = await checkIfImageExist(socketS3Key, client);
    if (!exists) {
      const imageBuffer = await downloadImage(socketMediaUrl);
      await uploadImage(socketS3Key, imageBuffer, client);
    }
    const filename = socketS3Key.split('/').pop()!;
    return filename;
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

  public async fetchCharacters(region: string, baseUrl: string, namespace: string, token: string) {
    const response = await fetch(`https://${region}.${baseUrl}/profile/user/wow?locale=en_US`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Battlenet-Namespace': namespace === 'retail' ? `profile-${region}` : `profile-${namespace}-${region}`,
      },
    });
    if (!response.ok) {
      const resp = await response.text();
      console.log('resp', resp);
      throw new Error(`Error from Battle.net API for namespace: ${namespace}`);
    }

    return (await response.json()) as CharactersResponse;
  }

  public async fetchCharacterMedia(
    character: ApiCharacter,
    region: string,
    baseUrl: string,
  ): Promise<Record<string, string>> {
    try {
      const url = this.buildCharacterUrl(character, region, baseUrl, 'character-media');
      const namespace = this.getNamespace(character, region);
      const resp = await this.makeRequest(url, 'GET', true, namespace);
      const data = (await resp.json()) as MediaResponse;
      const client = BattleNetApi.getS3Client();

      const mediaMap = await this.processMediaAssets(
        data.assets,
        (asset) => `characters/${character.id}-${asset.key}.${asset.value.split('.').pop()?.toLowerCase()}`,
        client,
      );
      return mediaMap;
    } catch (err) {
      console.error(`Failed to fetch character media:`, err);
      throw err;
    }
  }

  public async fetchCharacterStatus(
    character: ApiCharacter,
    region: string,
    baseUrl: string,
  ): Promise<ApiCharacterStatus> {
    const url = this.buildCharacterUrl(character, region, baseUrl, 'status');
    let resp: Response;

    try {
      resp = await this.makeRequest(url, 'GET', true, this.getNamespace(character, region));
    } catch (err: any) {
      if (
        err?.status === 404 ||
        (err?.message && err.message.includes('404')) ||
        err?.message === 'API request failed: Not Found'
      ) {
        return { is_valid: false };
      }
      console.error(`Failed to fetch character status: ${err}`);
      throw err;
    }

    if (resp.status === 404) {
      return { is_valid: false };
    }

    const data = (await resp.json()) as CharacterStatus;

    return { is_valid: data.is_valid };
  }

  public async fetchCharacterSpecializations(
    character: ApiCharacter,
    region: string,
    baseUrl: string,
  ): Promise<ApiCharacterTalents> {
    try {
      const url = this.buildCharacterUrl(character, region, baseUrl, 'specializations');
      const resp = await this.makeRequest(url, 'GET', true, this.getNamespace(character, region));
      const data = (await resp.json()) as CharacterSpecializations;
      const activeSpecId = data.active_specialization?.id;
      const activeHeroTalentId = data.active_hero_talent_tree?.id;

      const activeLoadout = this.getActiveLoadout(data);
      if (!activeLoadout) {
        throw new Error(`Failed to find any active loadout`);
      }

      const extractTalentIds = (talents: Talents[] | undefined): number[] => {
        if (!talents) return [];
        return talents.map((talent) => talent.tooltip?.talent.id).filter((id): id is number => id !== undefined);
      };

      const classTalents = extractTalentIds(activeLoadout.selected_class_talents);
      const specTalents = extractTalentIds(activeLoadout.selected_spec_talents);
      const heroTalents = extractTalentIds(activeLoadout.selected_hero_talents);

      return {
        talents: {
          id: activeSpecId,
          hero_id: activeHeroTalentId,
          class_talents: classTalents,
          spec_talents: specTalents,
          hero_talents: heroTalents,
          loadout_code: activeLoadout.talent_loadout_code,
        },
      };
    } catch (err) {
      console.error(`Failed to fetch specialization, error: ${err}`);
      throw err;
    }
  }

  public async fetchCharacterSummary(
    character: ApiCharacter,
    region: string,
    baseUrl: string,
  ): Promise<ApiCharacterSummary> {
    try {
      const url = this.buildCharacterUrl(character, region, baseUrl);
      const resp = await this.makeRequest(url, 'GET', true, this.getNamespace(character, region));

      const data = (await resp.json()) as CharacterSummary;
      return {
        title: data.active_title?.name ?? null,
        spec: data.active_spec.name,
        achievement_points: data.achievement_points,
        avg_item_level: data.average_item_level,
        equip_item_level: data.equipped_item_level,
        guild_name: data.guild?.name ?? null,
        guild_id: data.guild?.id ?? null,
        last_login: data.last_login_timestamp,
      };
    } catch (err) {
      console.log(`Failed to fetch character summary.`, err);
      throw err;
    }
  }

  public async fetchCharacterItems(character: ApiCharacter, region: string, baseUrl: string): Promise<ApiItems> {
    try {
      const url = this.buildCharacterUrl(character, region, baseUrl, 'equipment');
      const resp = await this.makeRequest(url, 'GET', true, this.getNamespace(character, region));
      const data = (await resp.json()) as ItemResponse;
      const client = BattleNetApi.getS3Client();

      const itemPromises = data.equipped_items.map(async (item) => {
        const slot = item.slot.type.toLowerCase();
        const filename = `${item.item.id}.jpg`;
        const s3Key = `items/${filename}`;
        const imageExist = await checkIfImageExist(s3Key, client);
        if (!imageExist) {
          const media = await this.fetchItemMedia(region, baseUrl, item.item.id);
          if (media) {
            await this.processMediaAssets(media.assets, () => s3Key, client);
          }
        }

        const processedSockets = await this.processSockets(item.sockets, item.item.id);

        return {
          [slot]: {
            enchantments: item.enchantments
              ? item.enchantments.map((enchantment) => enchantment.display_string.replace(/\|A:.*/, ''))
              : null,
            setBonus: item.set?.display_string
              ? {
                  name: item.set.name,
                  amount: item.set.display_string,
                  effects: item.set.effects,
                  items: item.set.items.map((item) => ({
                    name: item.name,
                    is_equipped: item.is_equipped ?? false,
                  })),
                }
              : null,
            sockets: processedSockets,
            type: item.item_subclass.name,
            quality: item.quality.name,
            name: item.name,
            image: filename,
            item_upgrade: item.name_description
              ? {
                  description: item.name_description.display_string ?? '',
                  color: item.name_description.color ? rgbaToHex(item.name_description.color) : '',
                }
              : null,
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
            requirement: item.requirements?.level?.display_string
              ? item.requirements.level.display_string
              : item.requirements?.display_string
              ? item.requirements.display_string
              : null,
            level: item.level.value,
            transmog: item.transmog?.item.name || null,
          },
        };
      });

      const itemsArray = await Promise.all(itemPromises);
      const items: ApiItems = Object.assign({}, ...itemsArray);
      return items;
    } catch (err) {
      console.error(`Failed to fetch character items:`, err);
      throw err;
    }
  }
}

export default BattleNetApi;
