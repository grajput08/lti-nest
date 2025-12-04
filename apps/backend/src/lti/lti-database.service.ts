/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec);

@Injectable()
export class LTIDatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('LTIDatabaseService');
  private deployed = false;
  private readonly ExpireTime = {
    idtoken: 3600 * 24 * 1000,
    contexttoken: 3600 * 24 * 1000,
    accesstoken: 3600 * 1000,
    nonce: 10 * 1000,
    state: 600 * 1000,
  };

  constructor() {
    super();
  }

  async onModuleInit() {
    this.logger.log('Connecting Prisma + running migrations...');
    try {
      await this.$connect();
      this.logger.log('Performing migrations');
      await execPromise('npx prisma migrate deploy');
      await this.cleanup();
      this.deployed = true;
      this.logger.log('Database setup complete');
    } catch (error) {
      this.logger.error('Error setting up database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('DB Disconnecting...');
    await this.$disconnect();
    this.deployed = false;
    this.logger.log('Closed database connection');
  }

  /**
   * @description Setup method required by LTI library
   * Ensures database is connected and ready
   */
  async setup() {
    if (this.deployed) {
      return this;
    }
    try {
      // Ensure connection is established
      await this.$connect();
      if (!this.deployed) {
        this.logger.log('Performing migrations');
        await execPromise('npx prisma migrate deploy');
        await this.cleanup();
        this.deployed = true;
        this.logger.log('Database setup complete');
      }
    } catch (error) {
      this.logger.error('Error setting up database:', error);
      throw error;
    }
    return this;
  }

  /**
   * @description Close method required by LTI library
   * Closes the database connection
   */
  async Close() {
    await this.$disconnect();
    this.deployed = false;
    this.logger.log('Database connection closed');
  }

  /** 🧹 Auto cleanup expired records every 1 hour */
  @Cron('0 * * * *')
  async cleanup() {
    this.logger.debug('Running expired token cleanup...');
    const now = new Date();

    // Calculate cutoff dates for each type
    const idTokenCutoff = new Date(now.getTime() - this.ExpireTime.idtoken);
    const contextTokenCutoff = new Date(
      now.getTime() - this.ExpireTime.contexttoken,
    );
    const accessTokenCutoff = new Date(
      now.getTime() - this.ExpireTime.accesstoken,
    );
    const nonceCutoff = new Date(now.getTime() - this.ExpireTime.nonce);
    const stateCutoff = new Date(now.getTime() - this.ExpireTime.state);

    // Delete expired records
    const deletedIdTokens = await this.idToken.deleteMany({
      where: { createdAt: { lte: idTokenCutoff } },
    });
    this.logger.debug(`Expired idtoken: ${deletedIdTokens.count}`);

    const deletedContextTokens = await this.contextToken.deleteMany({
      where: { createdAt: { lte: contextTokenCutoff } },
    });
    this.logger.debug(`Expired contexttoken: ${deletedContextTokens.count}`);

    const deletedAccessTokens = await this.accessToken.deleteMany({
      where: { createdAt: { lte: accessTokenCutoff } },
    });
    this.logger.debug(`Expired accesstoken: ${deletedAccessTokens.count}`);

    const deletedNonces = await this.nonce.deleteMany({
      where: { createdAt: { lte: nonceCutoff } },
    });
    this.logger.debug(`Expired nonce: ${deletedNonces.count}`);

    const deletedStates = await this.state.deleteMany({
      where: { createdAt: { lte: stateCutoff } },
    });
    this.logger.debug(`Expired state: ${deletedStates.count}`);
  }

  private ensureDeployed() {
    if (!this.deployed) throw new Error('PROVIDER_NOT_DEPLOYED');
  }

  /**
   * @description Get item or entire database.
   * @param {String} ENCRYPTIONKEY - Encryptionkey of the database, false if none
   * @param {String} table - The name of the table from where to query
   * @param {Object} [info] - Info for the item being searched for
   */
  async Get(ENCRYPTIONKEY: string, table: string, info: object) {
    this.ensureDeployed();
    if (!table) throw new Error('MISSING_PARAMETER');

    // Convert table name to PascalCase for Prisma model names
    const modelName = this.getModelName(table);
    const model = (this as any)[modelName] as {
      findMany: (args: { where: object }) => Promise<any[]>;
      delete: (args: { where: { id: string } }) => Promise<any>;
    };
    const items = await model.findMany({
      where: info || {},
    });

    // Filter out expired items and decrypt if needed
    const result: any[] = [];
    const now = Date.now();

    for (const item of items) {
      // Check if item is expired
      if (
        ['accesstoken', 'idtoken', 'contexttoken', 'nonce', 'state'].includes(
          table,
        )
      ) {
        const itemWithDate = item;
        if (itemWithDate.createdAt) {
          const createdAt = Date.parse(itemWithDate.createdAt.toString());
          const elapsedTime = now - createdAt;
          if (elapsedTime >= this.ExpireTime[table]) {
            // Delete expired item
            await model.delete({ where: { id: itemWithDate.id } });
            continue;
          }
        }
      }

      // Decrypt if encryption key is provided
      const itemWithData = item;
      if (ENCRYPTIONKEY && itemWithData.data && itemWithData.iv) {
        const decrypted = JSON.parse(
          this.Decrypt(itemWithData.data, itemWithData.iv, ENCRYPTIONKEY),
        );
        const decryptedItem = {
          ...decrypted,
          createdAt: itemWithData.createdAt
            ? Date.parse(itemWithData.createdAt.toString())
            : undefined,
        };
        result.push(decryptedItem);
      } else {
        result.push(item);
      }
    }

    // Check if query was successful
    if (result.length === 0) return false;
    return result;
  }

  /**
   * @description Insert item in database.
   * @param {String} ENCRYPTIONKEY - Encryptionkey of the database, false if none.
   * @param {String} table - The name of the table from where to query
   * @param {Object} item - The item Object you want to insert in the database.
   * @param {Object} [index] - Key that should be used as index in case of Encrypted document.
   */
  async Insert(
    ENCRYPTIONKEY: string,
    table: string,
    item: object,
    index: object,
  ) {
    this.ensureDeployed();
    if (!table || !item || (ENCRYPTIONKEY && !index))
      throw new Error('MISSING_PARAMS');

    const modelName = this.getModelName(table);
    const model = (this as any)[modelName] as {
      create: (args: { data: any }) => Promise<any>;
    };

    // Encrypt if encryption key is present
    let newDocData = item;
    if (ENCRYPTIONKEY) {
      const encrypted = this.Encrypt(JSON.stringify(item), ENCRYPTIONKEY);
      newDocData = {
        ...index,
        iv: encrypted.iv,
        data: encrypted.data,
      };
    }

    await model.create({ data: newDocData });
    return true;
  }

  /**
   * @description Replace item in database.
   * @param {String} ENCRYPTIONKEY - Encryptionkey of the database, false if none.
   * @param {String} table - The name of the table from where to query
   * @param {Object} info - Info for the item being searched for.
   * @param {Object} item - The item Object you want to insert in the database.
   * @param {Object} [index] - Key that should be used as index in case of Encrypted document.
   */
  async Replace(
    ENCRYPTIONKEY: string,
    table: string,
    info: object,
    item: object,
    index: object,
  ) {
    this.ensureDeployed();
    if (!table || !item || (ENCRYPTIONKEY && !index))
      throw new Error('MISSING_PARAMS');

    await this.Delete(table, info);

    // Encrypt if encryption key is present
    let newDocData = item;
    if (ENCRYPTIONKEY) {
      const encrypted = this.Encrypt(JSON.stringify(item), ENCRYPTIONKEY);
      newDocData = {
        ...index,
        iv: encrypted.iv,
        data: encrypted.data,
      };
    }

    const modelName = this.getModelName(table);
    const model = (this as any)[modelName] as {
      create: (args: { data: any }) => Promise<any>;
    };
    await model.create({ data: newDocData });
    return true;
  }

  /**
   * @description Assign value to item in database
   * @param {String} ENCRYPTIONKEY - Encryptionkey of the database, false if none.
   * @param {String} table - The name of the table from where to query
   * @param {Object} info - Info for the item being modified.
   * @param {Object} modification - The modification you want to make.
   */
  async Modify(
    ENCRYPTIONKEY: string,
    table: string,
    info: object,
    modification: object,
  ) {
    this.ensureDeployed();
    if (!table || !info || !modification) throw new Error('MISSING_PARAMS');

    const modelName = this.getModelName(table);
    const model = (this as any)[modelName] as {
      findFirst: (args: { where: object }) => Promise<any>;
      updateMany: (args: { where: object; data: any }) => Promise<any>;
    };

    // Encrypt if encryption key is present
    let newMod = modification;
    if (ENCRYPTIONKEY) {
      const item = await model.findFirst({ where: info });
      if (item) {
        const decrypted = JSON.parse(
          this.Decrypt(item.data, item.iv, ENCRYPTIONKEY),
        );
        decrypted[Object.keys(modification)[0]] =
          Object.values(modification)[0];
        newMod = this.Encrypt(JSON.stringify(decrypted), ENCRYPTIONKEY);
      }
    }

    await model.updateMany({ where: info, data: newMod });
    return true;
  }

  /**
   * @description Delete item in database
   * @param {String} table - The name of the table from where to query
   * @param {Object} [info] - Info for the item being deleted.
   */
  async Delete(table: string, info: object) {
    this.ensureDeployed();
    if (!table || !info) throw new Error('Missing argument.');

    const modelName = this.getModelName(table);
    const model = (this as any)[modelName] as {
      delete: (args: { where: any }) => Promise<any>;
      deleteMany: (args: { where: object }) => Promise<any>;
    };

    // For tables with a single primary key that might be in the info object
    if (
      ['nonce', 'state', 'publickey', 'privatekey', 'platformStatus'].includes(
        table,
      )
    ) {
      const primaryKey =
        table === 'platformStatus'
          ? 'id'
          : table === 'nonce'
            ? 'nonce'
            : table === 'state'
              ? 'state'
              : 'kid';
      const infoAny = info;
      if (infoAny[primaryKey]) {
        await model.delete({
          where: { [primaryKey]: infoAny[primaryKey] },
        });
        return true;
      }
    }

    // For other tables or when not deleting by primary key
    await model.deleteMany({ where: info });
    return true;
  }

  /**
   * @description Encrypts data.
   * @param {String} data - Data to be encrypted
   * @param {String} secret - Secret used in the encryption
   */
  Encrypt(data: string, secret: string) {
    const hash = crypto.createHash('sha256');
    hash.update(secret);
    const key = hash.digest().slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
  }

  /**
   * @description Decrypts data.
   * @param {String} data - Data to be decrypted
   * @param {String} _iv - Encryption iv
   * @param {String} secret - Secret used in the encryption
   */
  Decrypt(data: string, _iv: string, secret: string) {
    const hash = crypto.createHash('sha256');
    hash.update(secret);
    const key = hash.digest().slice(0, 32);
    const iv = Buffer.from(_iv, 'hex');
    const encryptedText = Buffer.from(data, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  /**
   * @description Helper method to convert table name to Prisma model name
   * @private
   * @param {String} table - The table name
   * @returns {String} The corresponding Prisma model name
   */
  private getModelName(table: string): string {
    // Map table names to Prisma model names (camelCase)
    const modelMap = {
      idtoken: 'idToken',
      contexttoken: 'contextToken',
      platform: 'platform',
      platformStatus: 'platformStatus',
      publickey: 'publicKey',
      privatekey: 'privateKey',
      accesstoken: 'accessToken',
      nonce: 'nonce',
      state: 'state',
    };
    return modelMap[table] || table;
  }
}
