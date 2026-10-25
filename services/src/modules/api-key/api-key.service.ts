import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, isNull } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/database.module';
import { REDIS_CLIENT } from '../../infra/redis.module';
import { randomBytes, randomUUID } from 'crypto';
import argon2 from 'argon2';
import { api_key } from '../../database/schema';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import { CachedKey, LAST_USED_HASH, VERSION } from '../../configs';

const localCache = new LRUCache<string, CachedKey>({ max: 100_000 });

/**
 * API Key 服务
 * 负责为指定用户生成、存储并限额管理 API 密钥。
 * 安全设计：
 *  - 数据库只存 Argon2id 哈希，绝不落明文；
 *  - 明文仅在创建时返回一次，之后无法再次获取；
 *  - 每个用户最多持有 5 个「未撤销」的密钥。
 */
@Injectable()
export class APIKeyService {
  constructor(
    // Drizzle 数据库实例（通过自定义 token 注入）
    @Inject(DRIZZLE_DB) private readonly db: any,
    // Redis 客户端（预留用于限流/缓存）
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * 生成一对「API Key 明文 + 对应的 keyId」
   *
   * 格式：PulseFront_{keyId}_{secret}
   *  - keyId：去掉连字符的 UUID，作为数据库主键，便于索引与定位
   *  - secret：32 字节强随机数，base64url 编码（URL 安全、无特殊字符）
   *
   * @returns plaintextKey 完整明文（仅返回给用户一次）
   * @returns keyId        密钥唯一标识（入库用）
   */
  private generatekey(): { plaintextKey: string; keyId: string } {
    const keyId = randomUUID().replace(/-/g, '');
    const secret = randomBytes(32).toString('base64url');
    const plaintextKey = `PulseFront_${keyId}_${secret}`;
    return { plaintextKey, keyId };
  }
  /**
   * 为指定用户创建一个新的 API Key
   *
   * 流程：
   *  1. 校验配额：该用户未撤销的密钥是否已达 5 个；
   *  2. 生成明文密钥与 keyId；
   *  3. 用 Argon2id 对明文做单向哈希（慢哈希，抗暴力破解）；
   *  4. 提取前缀用于列表展示（避免展示完整 key）；
   *  5. 将哈希、前缀等元数据入库；
   *  6. 把明文一次性返回给调用方。
   *
   * 注意：因为只存哈希，返回的 plaintextKey 若丢失将无法找回，只能重建。
   *
   * @param userId 当前用户 ID
   * @returns { key: string } 完整的 API Key 明文（仅此一次）
   * @throws BadRequestException 当未撤销密钥数量 >= 5 时
   */

  async createApiKey(userId: string) {
    // 1. 统计该用户「未撤销」（revoked_at 为 NULL）的密钥数量
    const [result] = await this.db
      .select({ count: count() })
      .from(api_key)
      .where(and(eq(api_key.user_id, userId), isNull(api_key.revoked_at)));

    // 配额上限：5 个有效密钥
    if (result.count >= 5) {
      throw new BadRequestException('您已达到 5 个 API 密钥的最大上限。');
    }
    // 2. 生成明文密钥与主键
    const { plaintextKey, keyId } = this.generatekey();
    // 3. Argon2id 哈希参数：
    //    timeCost=3     迭代次数（越大越慢越安全）
    //    memoryCost=2^16 即 64 MiB 内存开销（抵抗 GPU/ASIC 暴力破解）
    //    parallelism=1  并行度
    const hash = await argon2.hash(plaintextKey, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 1,
    });
    // 4. 取明文前 18 个字符作为可展示前缀，便于用户识别是哪一把 key
    const prefix = plaintextKey.substring(0, 18) + '...';
    // 5. 入库：只存哈希与元数据，明文不落库
    await this.db.insert(api_key).values({
      id: keyId,
      user_id: userId,
      value: hash,
      prefix: prefix,
    });
    return { key: plaintextKey };
  }

  async listApiKeys(userId: string) {
    return this.db
      .select({
        id: api_key.id,
        prefix: api_key.prefix,
        created_at: api_key.created_at,
        last_used_at: api_key.last_used_at,
        revoked_at: api_key.revoked_at,
      })
      .from(api_key)
      .where(and(eq(api_key.user_id, userId)));
  }

  async deleteApiKey(userId: string, keyId: string) {
    await this.db
      .update(api_key)
      .set({ revoked_at: new Date() })
      .where(and(eq(api_key.user_id, userId), eq(api_key.id, keyId)));
    await this.redis.del(`PulseFront:api_key:${VERSION}:${keyId}`);
    localCache.delete(`${VERSION}:${keyId}`);
  }
  async regenerateApiKey(userId: string, keyId: string) {
    const { plaintextKey, keyId: newKeyId } = this.generatekey();
    const hash = await argon2.hash(plaintextKey, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 1,
    });
    const prefix = plaintextKey.substring(0, 18) + '...';
    await this.db
      .update(api_key)
      .set({
        value: hash,
        prefix: prefix,
        id: newKeyId,
        created_at: new Date(),
        last_used_at: new Date(),
      })
      .where(and(eq(api_key.id, keyId), eq(api_key.user_id, userId)));
    await this.redis.del(`PulseFront:api_key:${VERSION}:${keyId}`);
    localCache.delete(`${VERSION}:${keyId}`);
    return { key: plaintextKey };
  }
  async getApiKeyLastUsed(userId: string, keyId: string) {
    const normalizedKey = keyId.replace(/-/g, '');

    const [owned] = await this.db
      .select({
        id: api_key.id,
        last_used_at: api_key.last_used_at,
      })
      .from(api_key)
      .where(and(eq(api_key.id, normalizedKey), eq(api_key.user_id, userId)))
      .limit(1);
    if (!owned) {
      throw new NotFoundException('API key未找到');
    }

    const redisValue = await this.redis.hget(LAST_USED_HASH, normalizedKey);

    if (redisValue) {
      return { last_used_at: new Date(Number(redisValue)) };
    }

    return { last_used_at: owned.last_used_at ?? null };
  }
}
