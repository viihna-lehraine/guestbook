import { Application, NextFunction, RequestHandler, Router } from 'express';
import { Session } from 'express-session';
import type {
	AttestationResult,
	Fido2AttestationResult,
	PublicKeyCredentialCreationOptions,
	PublicKeyCredentialRequestOptions
} from 'fido2-lib';
import { JwtPayload } from 'jsonwebtoken';
import { Transporter } from 'nodemailer';
import { Sequelize, WhereOptions } from 'sequelize';
import { Logger as WinstonLogger } from 'winston';
import { EnvVariableTypes, FeatureFlagTypes } from './env';
import {
	ModelOperations,
	UserAttributesInterface,
	UserInstanceInterface
} from './models';
import {
	BackupCodeInterface,
	CacheMetrics,
	FidoUserInterface,
	TOTPSecretInterface,
	YubClientInterface,
	YubicoOTPOptionsInterface
} from './serviceComponents';
import {
	EmailMFAServiceDeps,
	PassportAuthMiddlewareServiceDeps
} from './serviceDeps';
import { AppError, ClientError, ErrorClasses } from '../../errors/ErrorClasses';

import '../../../types/custom/winston-logstash';

export interface AccessControlMiddlewareServiceInterface {
	restrictTo(...allowedRoles: string[]): RequestHandler;
	hasPermission(...requiredPermissions: string[]): RequestHandler;
	shutdown(): Promise<void>;
}

export interface AppLoggerServiceInterface extends WinstonLogger {
	getRedactedLogger(): AppLoggerServiceInterface;
	logDebug(message: string, details?: Record<string, unknown>): void;
	logInfo(message: string, details?: Record<string, unknown>): void;
	logNotice(message: string, details?: Record<string, unknown>): void;
	logWarn(message: string, details?: Record<string, unknown>): void;
	logError(message: string, details?: Record<string, unknown>): void;
	logCritical(message: string, details?: Record<string, unknown>): void;
	cleanUpOldLogs(
		sequelize: Sequelize,
		retentionPeriodDays?: number
	): Promise<void>;
	setAdminId(adminId: number | null): void;
	getErrorDetails(
		getCallerInfo: () => string,
		action: string,
		req?: Request,
		userId?: string | null,
		additionalData?: Record<string, unknown>
	): Record<string, unknown>;
	// setUpSecrets(secrets: VaultServiceInterface): void;
	setErrorHandler(errorHandler: ErrorHandlerServiceInterface): void;
	shutdown(): Promise<void>;
}

export interface AuthControllerInterface {
	initializeAuthMiddleware(): Promise<void>;
	initializeJWTAuthMiddleware(): RequestHandler;
	initializePassportAuthMiddleware(): RequestHandler;
	loginUser(
		email: string,
		password: string
	): Promise<{ success: boolean; token?: string }>;
	generateResetToken(user: UserInstanceInterface): Promise<string | null>;
	validateResetToken(
		userId: string,
		token: string
	): Promise<UserInstanceInterface | null>;
	comparePassword(
		user: UserInstanceInterface,
		password: string
	): Promise<boolean>;
	resetPassword(
		user: UserInstanceInterface,
		newPassword: string
	): Promise<UserInstanceInterface | null>;
	enableMfa(userId: string): Promise<boolean>;
	disableMfa(userId: string): Promise<boolean>;
	recoverPassword(email: string): Promise<void>;
	generateEmailMFACode(email: string): Promise<boolean>;
	verifyEmailMFACode(email: string, email2FACode: string): Promise<boolean>;
	generateTOTP(
		userId: string
	): Promise<{ secret: string; qrCodeUrl: string }>;
	verifyTOTP(userId: string, token: string): Promise<boolean>;
	shutdown(): Promise<void>;
}

export interface BaseRouterInterface {
	getRouter(): Router;
	shutdown(): Promise<void>;
}

export interface BackupCodeServiceInterface {
	generateBackupCodes(id: string): Promise<string[]> | string[];
	verifyBackupCode(id: string, inputCode: string): Promise<boolean>;
	saveBackupCodesToDatabase(
		id: string,
		backupCodes: BackupCodeInterface[]
	): Promise<void>;
	getBackupCodesFromDatabase(
		id: string
	): Promise<BackupCodeInterface[] | undefined>;
	updateBackupCodesInDatabase(
		id: string,
		backupCodes: BackupCodeInterface[]
	): Promise<void>;
	shutdown(): Promise<void>;
}

export interface CacheServiceInterface {
	getCacheMetrics(service: string): CacheMetrics;
	getMemoryCache(
		service: string
	): Map<string, { value: unknown; expiration: number | undefined }> | null;
	get<T>(key: string, service: string): Promise<T | null>;
	set<T>(
		key: string,
		value: T,
		service: string,
		expirationInSeconds?: number
	): Promise<void>;
	del(key: string, service: string): Promise<void>;
	exists(key: string, service: string): Promise<boolean>;
	cleanupExpiredEntries(): void;
	flushCache(service: string): Promise<void>;
	clearNamespace(service: string): Promise<void>;
	closeConnection(): Promise<void>;
	shutdown(): Promise<void>;
}

export interface CSRFMiddlewareServiceInterface {
	initializeCSRFMiddleware(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	shutdown(): void;
}

export interface DatabaseControllerInterface {
	initialize(): Promise<Sequelize>;
	getSequelizeInstance(): Sequelize | null;
	clearIdleConnections(): Promise<void>;
	getEntries<T>(Model: ModelOperations<T>): Promise<T[]>;
	createEntry<T>(Model: ModelOperations<T>, data: T): Promise<T>;
	deleteEntry<T>(Model: ModelOperations<T>, id: number): Promise<boolean>;
	cacheData<T>(key: string, data: T, expiration?: number): Promise<void>;
	queryWithCache<T extends object>(
		query: string,
		cacheKey: string,
		expiration?: number
	): Promise<T | null>;
	getCachedData<T>(key: string): Promise<T | null>;
	clearCache(key: string): Promise<void>;
	getDatabaseInfo(): Promise<Record<string, unknown>>;
	getDatabaseMetrics(serviceName: string): Promise<Record<string, unknown>>;
	shutdown(): Promise<void>;
}

export interface EmailMFAServiceInterface {
	generateEmailMFACode({ bcrypt, jwt }: EmailMFAServiceDeps): Promise<{
		emailMFACode: string;
		emailMFAToken: string;
	}>;
	verifyEmailMFACode(
		token: string,
		emailMFACode: string,
		jwt: EmailMFAServiceDeps['jwt']
	): Promise<boolean>;
	shutdown(): Promise<void>;
}

export interface EnvConfigServiceInterface {
	getEnvVariable<K extends keyof EnvVariableTypes>(
		key: K
	): EnvVariableTypes[K];
	getFeatureFlags(): FeatureFlagTypes;
	shutdown(): Promise<void>;
}

export interface ErrorLoggerServiceInterface extends AppLoggerServiceInterface {
	logAppError(
		error: Error,
		sequelize?: Sequelize,
		details?: Record<string, unknown>
	): void;
	logToDatabase(
		error: Error,
		sequelize: Sequelize,
		retryCount?: number
	): Promise<void>;
	getErrorCount(errorName: string): number;
}

export interface ErrorHandlerServiceInterface {
	ErrorClasses: typeof ErrorClasses;
	ErrorSeverity: typeof import('../../errors/ErrorClasses').ErrorSeverity;
	handleError(params: {
		error: unknown;
		req?: Request;
		details?: Record<string, unknown>;
		severity?: import('../../errors/ErrorClasses').ErrorSeverityType;
		action?: string;
		userId?: string;
		sequelize?: Sequelize;
	}): void;
	expressErrorHandler(): (
		err: AppError | ClientError | Error | Record<string, unknown>,
		req: Request,
		res: Response,
		next: NextFunction
	) => void;
	handleCriticalError(params: {
		error: unknown;
		req?: Request;
		details?: Record<string, unknown>;
	}): void;
	sendClientErrorResponse(params: {
		message: string;
		statusCode?: number;
		res: Response;
		responseId?: string;
	}): Promise<void>;
	initializeGlobalErrorHandlers(): void;
	setShutdownHandler(shutdownFn: () => Promise<void>): void;
	shutdown(): Promise<void>;
}

export interface FIDO2ServiceInterface {
	initializeFIDO2Service(): Promise<void>;
	generateFIDO2RegistrationOptions(
		user: FidoUserInterface
	): Promise<PublicKeyCredentialCreationOptions>;
	verifyFIDO2Registration(
		attestation: AttestationResult,
		expectedChallenge: string
	): Promise<Fido2AttestationResult>;
	generateFIDO2AuthenticationOptions(
		user: FidoUserInterface
	): Promise<PublicKeyCredentialRequestOptions>;
	invalidateFido2Cache(userId: string, action: string): Promise<void>;
	shutdown(): Promise<void>;
}

export interface GatekeeperServiceInterface {
	initialize(): Promise<void>;
	rateLimitMiddleware(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	slowdownMiddleware(): (
		req: Request & { session: Session & { lastRequestTime?: number } },
		res: Response,
		next: NextFunction
	) => void;
	throttleRequests(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void | Response>;
	ipBlacklistMiddleware(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	addIpToBlacklist(ip: string): Promise<void>;
	removeIpFromBlacklist(ip: string): Promise<void>;
	preInitIpBlacklist(): Promise<void>;
	loadIpBlacklist(): Promise<void>;
	temporaryBlacklist(ip: string): Promise<void>;
	isBlacklisted(ip: string): Promise<boolean>;
	isTemporarilyBlacklisted(ip: string): Promise<boolean>;
	isBlacklistedOrTemporarilyBlacklisted(ip: string): Promise<{
		isBlacklisted: boolean;
		isTemporarilyBlacklisted: boolean;
	}>;
	dynamicRateLimiter(): Promise<void>;
	shutdown(): Promise<void>;
}

export interface HelmetMiddlewareServiceInterface {
	initializeHelmetMiddleware(app: Application): Promise<void>;
	applyHelmet(app: Application): Promise<void>;
	applyCSP(app: Application): Promise<void>;
	applyExpectCT(app: Application): Promise<void>;
	applyReferrerPolicy(app: Application): Promise<void>;
	applyPermissionsPolicy(app: Application): Promise<void>;
	applyXssFilter(app: Application): Promise<void>;
	helmetOptions?: typeof import('../../config/middlewareOptions').helmetOptions;
	permissionsPolicyOptions?: {
		[key: string]: string[];
	};
	shutdown(): Promise<void>;
}

export interface HTTPSServerInterface {
	initialize: () => Promise<void>;
	startServer: () => Promise<void>;
	getHTTPSServerInfo(): Promise<Record<string, unknown>>;
	getHTTPSServerMetrics(
		serviceName: string
	): Promise<Record<string, unknown>>;
	shutdownServer: () => Promise<void>;
}

export interface JWTAuthMiddlewareServiceInterface {
	initializeJWTAuthMiddleware(): (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void | Response>;
	shutdown(): Promise<void>;
}

export interface JWTServiceInterface {
	generateJWT(id: string, username: string): Promise<string>;
	verifyJWT(token: string): Promise<string | JwtPayload | null>;
	shutdown(): Promise<void>;
}

export interface MailerServiceInterface {
	getTransporter(): Promise<Transporter>;
	validateMailerDependencies(): void;
	createMailTransporter(): Promise<Transporter>;
	shutdown(): Promise<void>;
}

export interface MiddlewareStatusServiceInterface {
	setStatus(middlewareName: string, status: 'on' | 'off'): void;
	getStatus(middlewareName: string): 'on' | 'off' | undefined | void;
	isMiddlewareOn(middlewareName: string): boolean;
	shutdown(): Promise<void>;
}

export interface MulterUploadServiceInterface {
	setFileSizeLimit(limit: number): void;
	setAllowedMimeTypes(mimeTypes: string[]): void;
	setAllowedExtensions(extensions: string[]): void;
	createMulterUpload(
		validationCallback?: (file: Express.Multer.File) => boolean
	): import('multer').Multer | undefined;
	onUploadSuccess(callback: (file: Express.Multer.File) => void): void;
	shutdown(): void;
}

export interface PassportAuthMiddlewareServiceInterface {
	initializePassportAuthMiddleware({
		passport,
		authenticateOptions,
		validateDependencies
	}: PassportAuthMiddlewareServiceDeps): RequestHandler;
	shutdown(): Promise<void>;
}
export interface PassportServiceInterface {
	configurePassport(
		passport: import('passport').PassportStatic,
		UserModel: typeof import('../../models/User').User
	): Promise<void>;
	shutdown(): Promise<void>;
}

export interface PasswordServiceInterface {
	hashPassword(password: string, pepper: string): Promise<string>;
	comparePassword(
		storedPassword: string,
		providedPassword: string,
		pepper: string
	): Promise<boolean>;
	shutdown(): Promise<void>;
}

export interface RootMiddlewareServiceInterface {
	initialize(): Promise<void>;
	trackResponseTime(req: Request, res: Response, next: NextFunction): void;
	calculateRequestsPerSecond(): void;
	shutdown(): Promise<void>;
	getAverageResponseTime(): number;
}

export interface StaticRouterInterface {
	initializeStaticRouter(): Promise<void>;
	serveNotFoundPage(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void>;
}

export interface TOTPServiceInterface {
	generateTOTPSecret(): TOTPSecretInterface;
	generateTOTPToken(secret: string): Promise<string>;
	verifyTOTPToken(secret: string, token: string): boolean;
	generateQRCode(otpauth_url: string): Promise<string>;
	shutdown(): Promise<void>;
}

export interface UserControllerInterface {
	findOne(
		criteria: WhereOptions<UserAttributesInterface>
	): Promise<UserInstanceInterface | null>;
	findUserByEmail(email: string): Promise<UserInstanceInterface | null>;
	findUserById(userId: string): Promise<UserInstanceInterface | null>;
	createUser(
		userDetails: Omit<UserAttributesInterface, 'id' | 'creationDate'>
	): Promise<UserInstanceInterface | null>;
	updateUser(
		user: UserInstanceInterface,
		updatedDetails: Partial<UserInstanceInterface>
	): Promise<UserInstanceInterface | null>;
	deleteUser(userId: string): Promise<boolean>;
	verifyUserAccount(userId: string): Promise<boolean>;
	shutdown(): Promise<void>;
}

export interface ValidatorServiceInterface {
	validateEntry(req: Request, res: Response, next: NextFunction): void;
	registrationValidationRules(
		req: Request,
		res: Response,
		next: NextFunction
	): void;
	handleValidationErrors(
		req: Request,
		res: Response,
		next: NextFunction
	): Response | void;
}

export interface YubicoOTPServiceInterface {
	initializeYubicoOTP(): Promise<void>;
	init(clientId: string, secretKey: string): YubClientInterface;
	validateYubicoOTP(otp: string): Promise<boolean>;
	generateYubicoOTPOptions(): Promise<YubicoOTPOptionsInterface>;
	shutdown(): Promise<void>;
}
