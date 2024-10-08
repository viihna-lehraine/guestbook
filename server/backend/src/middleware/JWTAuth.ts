import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import lockfile from 'proper-lockfile';
import {
	AppLoggerServiceInterface,
	CacheServiceInterface,
	EnvConfigServiceInterface,
	ErrorHandlerServiceInterface,
	ErrorLoggerServiceInterface,
	GatekeeperServiceInterface,
	JWTAuthMiddlewareServiceInterface
} from '../index/interfaces/main';
import { HandleErrorStaticParameters } from '../index/interfaces/main';
import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory';
import { ErrorHandlerServiceFactory } from '../index/factory/subfactories/ErrorHandlerServiceFactory';
import { GatekeeperServiceFactory } from '../index/factory/subfactories/GatekeeperServiceFactory';
import { CacheLayerServiceFactory } from '../index/factory/subfactories/CacheLayerServiceFactory';
import { EnvConfigServiceFactory } from '../index/factory/subfactories/EnvConfigServiceFactory';
import { AuthServiceFactory } from '../index/factory/subfactories/AuthServiceFactory';

export class JWTAuthMiddlewareService
	implements JWTAuthMiddlewareServiceInterface
{
	private static instance: JWTAuthMiddlewareService | null = null;

	private logger: AppLoggerServiceInterface;
	private errorLogger: ErrorLoggerServiceInterface;
	private errorHandler: ErrorHandlerServiceInterface;
	private gatekeeperService: GatekeeperServiceInterface;
	private cacheService: CacheServiceInterface;

	private expiredTokens: Set<string> = new Set();
	private revokedTokens: Set<string> = new Set();
	private expiryListFilePath: string;
	private revocationListFilePath: string;
	private expiryListCacheKey = 'tokenExpirationList';
	private revocationListCacheKey = 'tokenRevocationList';
	private cacheDuration: number;
	private cleanupExpiredTokensInterval: NodeJS.Timeout | null = null;
	private cleanupRevokedTokensInterval: NodeJS.Timeout | null = null;

	private constructor(
		logger: AppLoggerServiceInterface,
		errorLogger: ErrorLoggerServiceInterface,
		errorHandler: ErrorHandlerServiceInterface,
		gatekeeperService: GatekeeperServiceInterface,
		cacheService: CacheServiceInterface,
		envConfig: EnvConfigServiceInterface
	) {
		this.logger = logger;
		this.errorLogger = errorLogger;
		this.errorHandler = errorHandler;
		this.gatekeeperService = gatekeeperService;
		this.cacheService = cacheService;

		this.expiryListFilePath = envConfig.getEnvVariable(
			'tokenExpiryListPath'
		);
		this.revocationListFilePath = envConfig.getEnvVariable(
			'tokenRevokedListPath'
		);
		this.cacheDuration =
			envConfig.getEnvVariable('tokenCacheDuration') || 3600;

		this.loadExpiredTokens();
		this.loadRevokedTokens();
		this.cleanupExpiredTokensInterval = setInterval(
			() => this.cleanupExpiredTokens(),
			60 * 1000
		);
		this.cleanupRevokedTokensInterval = setInterval(
			() => this.cleanupRevokedTokens(),
			60 * 1000
		);
	}

	public static async getInstance(): Promise<JWTAuthMiddlewareService> {
		if (!JWTAuthMiddlewareService.instance) {
			const logger = await LoggerServiceFactory.getLoggerService();
			const errorLogger =
				await LoggerServiceFactory.getErrorLoggerService();
			const errorHandler =
				await ErrorHandlerServiceFactory.getErrorHandlerService();
			const gatekeeperService =
				await GatekeeperServiceFactory.getGatekeeperService();
			const cacheService =
				await CacheLayerServiceFactory.getCacheService();
			const envConfig =
				await EnvConfigServiceFactory.getEnvConfigService();

			JWTAuthMiddlewareService.instance = new JWTAuthMiddlewareService(
				logger,
				errorLogger,
				errorHandler,
				gatekeeperService,
				cacheService,
				envConfig
			);
		}

		return JWTAuthMiddlewareService.instance;
	}

	public initializeJWTAuthMiddleware(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void | Response> {
		return async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<void | Response> => {
			try {
				const ip = req.ip;

				if (!ip) {
					this.logger.warn('No IP address found in request');
					return res.status(403).json({ error: 'Access denied' });
				}

				if (await this.gatekeeperService.isTemporarilyBlacklisted(ip)) {
					this.logger.warn(`IP ${ip} is temporarily blacklisted.`);
					return res
						.status(403)
						.json({ error: 'Access temporarily denied' });
				}

				if (await this.gatekeeperService.isBlacklisted(ip)) {
					this.logger.warn(`IP ${ip} is blacklisted.`);
					return res.status(403).json({ error: 'Access denied' });
				}

				const authHeader = req.headers.authorization;
				const token = authHeader?.split(' ')[1];

				if (!token) {
					this.errorLogger.logWarn(
						'No JWT token found in the authorization header'
					);
					return res.sendStatus(403);
				}

				if (await this.isTokenRevoked(token)) {
					this.logger.warn(`JWT token is revoked: ${token}`);
					return res.status(403).json({ error: 'Token revoked' });
				}

				if (await this.isTokenExpired(token)) {
					this.logger.warn(`JWT token has expired: ${token}`);
					return res.status(403).json({ error: 'Token expired' });
				}

				const jwtService = await AuthServiceFactory.getJWTService();
				const user = await jwtService.verifyJWT(token);

				if (!user) {
					this.logger.warn('Invalid JWT token');
					return res.status(403).json({ error: 'Invalid token' });
				}

				req.user = user;
				next();
			} catch (expressError) {
				const expressMiddlewareError =
					new this.errorHandler.ErrorClasses.ExpressError(
						`Error in JWTAuthMiddleware: ${expressError instanceof Error ? expressError.message : String(expressError)}`,
						{
							middleware: 'JWTAuthMiddleware',
							originalError: expressError
						}
					);
				this.errorLogger.logError(expressMiddlewareError.message);

				if (expressError instanceof Error) {
					this.errorHandler.expressErrorHandler()(
						expressError,
						req,
						res,
						next
					);
				} else {
					this.errorHandler.handleError({
						...HandleErrorStaticParameters,
						error: expressMiddlewareError
					});
				}
				res.sendStatus(500);
			}
		};
	}

	private async isTokenExpired(token: string): Promise<boolean> {
		let isExpired = await this.cacheService.get<boolean>(
			`expiredToken:${token}`,
			'bouncerService'
		);

		if (isExpired === null) {
			isExpired = false;

			await this.cacheService.set(
				`expiredToken:${token}`,
				isExpired,
				'bouncerService',
				this.cacheDuration
			);
		}
		return isExpired;
	}

	private async isTokenRevoked(token: string): Promise<boolean> {
		const revokedTokens = await this.getCachedTokenList(
			this.revocationListCacheKey,
			this.loadRevokedTokens.bind(this)
		);

		return revokedTokens.has(token);
	}

	public async expireToken(token: string, ttl: number): Promise<void> {
		const remainingTime = ttl - Math.floor(Date.now() / 1000);

		await this.cacheService.set(
			`expiredToken:${token}`,
			true,
			'bouncerService',
			Math.min(this.cacheDuration, remainingTime)
		);

		this.expiredTokens.add(token);
		await this.saveExpiredTokens();
	}

	public async revokeToken(token: string): Promise<void> {
		const revokedTokens = await this.loadRevokedTokens();

		revokedTokens.add(token);

		await this.saveRevokedTokens(revokedTokens);
		await this.cacheService.del(
			this.revocationListCacheKey,
			'bouncerService'
		);
	}

	private async getCachedTokenList(
		cacheKey: string,
		fileLoader: () => Promise<Set<string>>
	): Promise<Set<string>> {
		let tokenList = await this.cacheService.get<string[]>(
			cacheKey,
			'bouncerService'
		);

		if (!tokenList) {
			const tokenSet = await fileLoader();
			tokenList = Array.from(tokenSet);

			await this.cacheService.set(
				cacheKey,
				tokenList,
				'bouncerService',
				this.cacheDuration
			);
		}

		return new Set(tokenList);
	}

	private async loadRevokedTokens(): Promise<Set<string>> {
		const revokedTokens = new Set<string>();
		try {
			if (await fs.promises.stat(this.revocationListFilePath)) {
				const fileData = await fs.promises.readFile(
					this.revocationListFilePath,
					'utf8'
				);
				const tokenList: string[] = JSON.parse(fileData);
				tokenList.forEach(token => revokedTokens.add(token));
				this.logger.info('Token revocation list loaded successfully.');
			}
		} catch (error) {
			this.logger.error(`Error loading token revocation list: ${error}`);
		}
		return revokedTokens;
	}

	private async loadExpiredTokens(): Promise<Set<string>> {
		const expiredTokens = new Set<string>();
		try {
			if (await fs.promises.stat(this.expiryListFilePath)) {
				const fileData = await fs.promises.readFile(
					this.expiryListFilePath,
					'utf8'
				);
				const tokenList: string[] = JSON.parse(fileData);
				tokenList.forEach(token => expiredTokens.add(token));
				this.logger.info('Expired token list loaded successfully.');
			}
		} catch (error) {
			this.logger.error(`Error loading expired token list: ${error}`);
		}
		return expiredTokens;
	}

	private async saveExpiredTokens(): Promise<void> {
		await this.withFileLock(this.expiryListFilePath, async () => {
			const tokenList = Array.from(this.expiredTokens);

			await fs.promises.writeFile(
				this.expiryListFilePath,
				JSON.stringify(tokenList)
			);
			this.logger.info('Expired token list saved successfully.');

			await this.cacheService.del(
				this.expiryListCacheKey,
				'bouncerService'
			);
		});
	}

	private async saveRevokedTokens(tokens: Set<string>): Promise<void> {
		await this.withFileLock(this.revocationListFilePath, async () => {
			const tokenList = Array.from(tokens);
			await fs.promises.writeFile(
				this.revocationListFilePath,
				JSON.stringify(tokenList)
			);
			this.logger.info('Revoked token list saved successfully.');
		});

		await this.cacheService.del(
			this.revocationListCacheKey,
			'bouncerService'
		);
	}

	private async cleanupExpiredTokens(): Promise<void> {
		const now = Date.now();
		this.expiredTokens.forEach(token => {
			const tokenData = jwt.decode(token);

			if (
				tokenData &&
				typeof tokenData !== 'string' &&
				tokenData.exp &&
				tokenData.exp * 1000 < now
			) {
				this.expiredTokens.delete(token);
				this.logger.info(`Removed expired token: ${token}`);
			}
		});

		await this.saveExpiredTokens();
	}

	private async cleanupRevokedTokens(): Promise<void> {
		const envConfig = await EnvConfigServiceFactory.getEnvConfigService();
		const revocationRetentionPeriod =
			envConfig.getEnvVariable('revokedTokenRetentionPeriod') ||
			30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const now = Date.now();
		let revokedTokenRemoved = false;

		this.revokedTokens.forEach(token => {
			const tokenData = jwt.decode(token);

			if (
				tokenData &&
				typeof tokenData !== 'string' &&
				tokenData.iat &&
				tokenData.iat * 1000 < now - revocationRetentionPeriod
			) {
				this.revokedTokens.delete(token);
				revokedTokenRemoved = true;
				this.logger.info(`Removed revoked token: ${token}`);
			}
		});

		if (revokedTokenRemoved) {
			await this.saveRevokedTokens(this.revokedTokens);
			this.logger.info('Revoked tokens cleanup completed and saved.');
		} else {
			this.logger.info('No revoked tokens required cleanup.');
		}
	}

	private async withFileLock(
		filePath: string,
		operation: () => Promise<void>
	): Promise<void> {
		let release: () => void = () => {};
		try {
			release = await lockfile.lock(filePath);
			await operation();
		} catch (error) {
			this.logger.error(
				`Error during file operation with lock: ${error}`
			);
		} finally {
			if (release) {
				release();
			}
		}
	}

	public async shutdown(): Promise<void> {
		try {
			if (this.cleanupExpiredTokensInterval) {
				clearInterval(this.cleanupExpiredTokensInterval);
			}
			if (this.cleanupRevokedTokensInterval) {
				clearInterval(this.cleanupRevokedTokensInterval);
			}

			await this.cacheService.del(
				this.expiryListCacheKey,
				'gatekeeperService'
			);
			await this.cacheService.del(
				this.revocationListCacheKey,
				'gatekeeperService'
			);

			JWTAuthMiddlewareService.instance = null;
			this.logger.info('JWTAuthMiddlewareService shutdown successfully.');
		} catch (error) {
			this.errorLogger.logError(
				`Error shutting down JWTAuthMiddlewareService: ${error instanceof Error ? error.message : error}`
			);
		}
	}
}
