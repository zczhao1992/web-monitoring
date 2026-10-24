import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, isNull } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/database/database.module';
import { REDIS_CLIENT } from '../../infra/redis.module';
import { randomBytes, randomUUID } from 'crypto';
import agron2 from 'argon2';
import { api_key } from '../../database/schema';
import Redis from 'ioredis';

@Injectable()
export class APIKetService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: any,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private generatekey(): { plaintextKey: string; keyId: string } {
    const keyId = randomUUID().replace(/-/g, '');
    const secret = randomBytes(32).toString('base64url');
    const plaintextKey = `ULOG_${keyId}_${secret}`;
    return { plaintextKey, keyId };
  }

  async createApiKey(userId: string) {
    const [result] = await this.db
      .select({ count: count() })
      .from(api_key)
      .where(and(eq(api_key.user_id, userId), isNull(api_key.revoked_at)));
    if (result.count >= 5) {
      throw new BadRequestException('您已达到 5 个 API 密钥的最大上限。');
    }

    const { plaintextKey, keyId } = this.generatekey();
    const hash = await agron2.hash(plaintextKey, {
      type: agron2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 1,
    });
    const prefix = plaintextKey.substring(0, 18) + ' ... ';

    await this.db.insert(api_key).values({
      id: keyId,
      user_id: userId,
      value: hash,
      prefix: prefix,
    });
    return { key: plaintextKey };
  }
}
