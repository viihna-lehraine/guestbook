import { Fido2Lib } from 'fido2-lib';
import { validateDependencies } from '../utils/helpers.mjs';
import { serviceTTLConfig } from '../config/cache.mjs';
import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory.mjs';
import { ErrorHandlerServiceFactory } from '../index/factory/subfactories/ErrorHandlerServiceFactory.mjs';
import { EnvConfigServiceFactory } from '../index/factory/subfactories/EnvConfigServiceFactory.mjs';
import { CacheLayerServiceFactory } from '../index/factory/subfactories/CacheLayerServiceFactory.mjs';
export class FIDO2Service {
	static instance = null;
	FIDO2 = null;
	logger;
	errorLogger;
	errorHandler;
	envConfig;
	cacheService;
	timeout;
	constructor() {
		this.timeout = this.envConfig.getEnvVariable('fido2Timeout') || 50000;
	}
	static async getInstance() {
		if (!FIDO2Service.instance) {
			const logger = await LoggerServiceFactory.getLoggerService();
			const errorLogger =
				await LoggerServiceFactory.getErrorLoggerService();
			const errorHandler =
				await ErrorHandlerServiceFactory.getErrorHandlerService();
			const envConfig =
				await EnvConfigServiceFactory.getEnvConfigService();
			const cacheService =
				await CacheLayerServiceFactory.getCacheService();
			FIDO2Service.instance = new FIDO2Service();
			FIDO2Service.instance.errorLogger = errorLogger;
			FIDO2Service.instance.errorHandler = errorHandler;
			FIDO2Service.instance.envConfig = envConfig;
			FIDO2Service.instance.cacheService = cacheService;
			FIDO2Service.instance.logger = logger;
		}
		return FIDO2Service.instance;
	}
	async initializeFIDO2Service() {
		const cacheKey = 'FIDO2Lib';
		const cachedFIDO2Lib = await this.cacheService.get(cacheKey, 'auth');
		if (cachedFIDO2Lib) {
			this.FIDO2 = cachedFIDO2Lib;
			this.logger.debug('Loaded Fido2Lib from cache.');
			return;
		}
		try {
			const rpId = this.envConfig.getEnvVariable('rpId');
			const rpName = this.envConfig.getEnvVariable('rpName');
			const challengeSize =
				this.envConfig.getEnvVariable('fidoChallengeSize');
			const cryptoParams =
				this.envConfig.getEnvVariable('fidoCryptoParams');
			const requireResidentKey = this.envConfig.getEnvVariable(
				'fidoAuthRequireResidentKey'
			);
			const userVerification = this.envConfig.getEnvVariable(
				'fidoAuthUserVerification'
			);
			const validUserVerificationValues = [
				'required',
				'preferred',
				'discouraged'
			];
			const timeout = this.timeout;
			if (!validUserVerificationValues.includes(userVerification)) {
				throw new Error(
					'Invalid value for authenticatorUserVerification'
				);
			}
			this.FIDO2 = new Fido2Lib({
				timeout,
				rpId,
				rpName,
				challengeSize,
				cryptoParams,
				authenticatorRequireResidentKey: requireResidentKey,
				authenticatorUserVerification: userVerification
			});
			await this.cacheService.set(
				cacheKey,
				this.FIDO2,
				'auth',
				serviceTTLConfig.FIDO2 || serviceTTLConfig.default
			);
			this.logger.info('Fido2Lib initialized successfully.');
		} catch (error) {
			this.handleError('initializeFido2', error);
		}
	}
	async ensureInitialized() {
		validateDependencies(
			[{ name: 'logger', instance: this.logger }],
			this.logger
		);
		if (!this.FIDO2) {
			this.logger.debug('Fido2Lib is not initialized, initializing now.');
			await this.initializeFIDO2Service();
		} else {
			this.logger.debug('Fido2Lib is already initialized.');
		}
	}
	async generateFIDO2RegistrationOptions(user) {
		const cacheKey = `FIDO2Registration:${user.id}`;
		const cachedOptions = await this.cacheService.get(cacheKey, 'auth');
		if (cachedOptions) {
			this.logger.debug('Loaded registration options from cache.');
			return cachedOptions;
		}
		try {
			validateDependencies(
				[{ name: 'user', instance: user }],
				this.logger
			);
			await this.ensureInitialized();
			const timeout = this.timeout;
			const passkeyRegistrationOptions =
				await this.FIDO2.attestationOptions();
			const registrationOptions = {
				...passkeyRegistrationOptions,
				user: {
					id: Buffer.from(user.id, 'utf-8'),
					name: user.email,
					displayName: user.username
				},
				pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
				timeout,
				attestation: 'direct',
				authenticatorSelection: {
					authenticatorAttachment: 'platform',
					requireResidentKey: true,
					userVerification: 'preferred'
				}
			};
			await this.cacheService.set(
				cacheKey,
				registrationOptions,
				'auth',
				serviceTTLConfig.FIDO2Registration || serviceTTLConfig.default
			);
			this.logger.info(
				'Passkey registration options generated successfully.'
			);
			return registrationOptions;
		} catch (error) {
			this.handleError('generateRegistrationOptions', error);
			return {};
		}
	}
	async verifyFIDO2Registration(attestation, expectedChallenge) {
		try {
			validateDependencies(
				[
					{ name: 'attestation', instance: attestation },
					{ name: 'expectedChallenge', instance: expectedChallenge }
				],
				this.logger
			);
			await this.ensureInitialized();
			const u2fAttestationExpectations = {
				challenge: expectedChallenge,
				origin: this.envConfig.getEnvVariable('rpOrigin'),
				factor: 'either',
				rpId: this.envConfig.getEnvVariable('rpId')
			};
			const result = await this.FIDO2.attestationResult(
				attestation,
				u2fAttestationExpectations
			);
			this.logger.info('Passkey registration verified successfully.');
			return result;
		} catch (error) {
			this.handleError('verifyRegistration', error);
			return {};
		}
	}
	async generateFIDO2AuthenticationOptions(user) {
		const cacheKey = `FIDO2Auth:${user.id}`;
		const cachedOptions = await this.cacheService.get(cacheKey, 'auth');
		if (cachedOptions) {
			this.logger.debug('Loaded authentication options from cache.');
			return cachedOptions;
		}
		try {
			await this.ensureInitialized();
			const userCredentials = user.credential.map(credential => ({
				type: 'public-key',
				id: Buffer.from(credential.credentialId, 'base64').buffer
			}));
			const assertionOptions = await this.FIDO2.assertionOptions();
			const authenticationOptions = {
				...assertionOptions,
				allowCredentials: userCredentials,
				userVerification: 'required',
				timeout: 60000
			};
			await this.cacheService.set(
				cacheKey,
				authenticationOptions,
				'auth',
				serviceTTLConfig.FIDO2Authentication || serviceTTLConfig.default
			);
			this.logger.info(
				'Passkey authentication options generated successfully.'
			);
			return authenticationOptions;
		} catch (error) {
			this.handleError('generateAuthenticationOptions', error);
			return {};
		}
	}
	async verifyAuthentication(
		assertion,
		expectedChallenge,
		publicKey,
		previousCounter,
		id
	) {
		try {
			validateDependencies(
				[
					{ name: 'assertion', instance: assertion },
					{ name: 'expectedChallenge', instance: expectedChallenge },
					{ name: 'publicKey', instance: publicKey },
					{ name: 'previousCounter', instance: previousCounter },
					{ name: 'id', instance: id }
				],
				this.logger
			);
			await this.ensureInitialized();
			const assertionExpectations = {
				challenge: expectedChallenge,
				origin: this.envConfig.getEnvVariable('rpOrigin'),
				factor: 'either',
				publicKey,
				prevCounter: previousCounter,
				userHandle: id
			};
			const result = await this.FIDO2.assertionResult(
				assertion,
				assertionExpectations
			);
			this.logger.info('Passkey authentication verified successfully.');
			return result;
		} catch (error) {
			this.handleError('verifyAuthentication', error);
			return {};
		}
	}
	// *DEV-NOTE* use, for example, when user updates credentials
	async invalidateFido2Cache(userId, action) {
		const cacheKeyRegistration = `FIDO2Registration:${userId}`;
		const cacheKeyAuth = `FIDO2Auth:${userId}`;
		this.logger.info(
			`Invalidating FIDO2 cache for user ${userId} due to ${action}`
		);
		try {
			await this.cacheService.del(cacheKeyRegistration, 'auth');
			await this.cacheService.del(cacheKeyAuth, 'auth');
			this.logger.info(`FIDO2 cache invalidated for user ${userId}`);
		} catch (error) {
			this.handleError('invalidateFido2Cache', error);
		}
	}
	async shutdown() {
		try {
			if (this.FIDO2) {
				this.logger.info(
					'Clearing FIDO2Lib and cache entries before shutdown...'
				);
				this.FIDO2 = null;
				await this.cacheService.del('FIDO2Lib', 'auth');
				this.logger.info(
					'FIDO2 cache and instance cleared successfully.'
				);
				FIDO2Service.instance = null;
				this.logger.info('FIDO2Service shut down successfully.');
			} else {
				this.logger.info(
					'FIDO2Service is already shut down or uninitialized.'
				);
			}
		} catch (error) {
			this.handleError('shutdown', error);
		}
	}
	async handleError(utility, error) {
		const errorMessage = `Error in ${utility}: ${error instanceof Error ? error.message : error}`;
		this.errorLogger.logError(errorMessage);
		const utilityError =
			new this.errorHandler.ErrorClasses.UtilityErrorRecoverable(
				errorMessage,
				{
					exposeToClient: false
				}
			);
		this.errorHandler.handleError({ error: utilityError });
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRklETzIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0aC9GSURPMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBSU4sUUFBUSxFQVFSLE1BQU0sV0FBVyxDQUFDO0FBV25CLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ3RHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBRWxHLE9BQU8sNkJBQTZCLENBQUM7QUFFckMsTUFBTSxPQUFPLFlBQVk7SUFDaEIsTUFBTSxDQUFDLFFBQVEsR0FBd0IsSUFBSSxDQUFDO0lBRTVDLEtBQUssR0FBb0IsSUFBSSxDQUFDO0lBQzlCLE1BQU0sQ0FBNkI7SUFDbkMsV0FBVyxDQUErQjtJQUMxQyxZQUFZLENBQWdDO0lBQzVDLFNBQVMsQ0FBNkI7SUFDdEMsWUFBWSxDQUF5QjtJQUNyQyxPQUFPLENBQVM7SUFFeEI7UUFDQyxJQUFJLENBQUMsT0FBTztZQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBWSxJQUFJLEtBQUssQ0FBQztJQUNyRSxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzdELE1BQU0sV0FBVyxHQUNoQixNQUFNLG9CQUFvQixDQUFDLHFCQUFxQixFQUFF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LElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNmLHFEQUFxRCxDQUNyRCxDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDRixDQUFDO0lBRU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFlLEVBQUUsS0FBYztRQUN4RCxNQUFNLFlBQVksR0FBRyxZQUFZLE9BQU8sS0FBSyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5RixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4QyxNQUFNLFlBQVksR0FDakIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FDekQsWUFBWSxFQUNaO1lBQ0MsY0FBYyxFQUFFLEtBQUs7U0FDckIsQ0FDRCxDQUFDO1FBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QXR0ZXN0YXRpb25SZXN1bHQsXG5cdEV4cGVjdGVkQXNzZXJ0aW9uUmVzdWx0LFxuXHRFeHBlY3RlZEF0dGVzdGF0aW9uUmVzdWx0LFxuXHRGaWRvMkxpYixcblx0UHVibGljS2V5Q3JlZGVudGlhbENyZWF0aW9uT3B0aW9ucyxcblx0UHVibGljS2V5Q3JlZGVudGlhbERlc2NyaXB0b3IsXG5cdFB1YmxpY0tleUNyZWRlbnRpYWxSZXF1ZXN0T3B0aW9ucyxcblx0RmlkbzJBdHRlc3RhdGlvblJlc3VsdCxcblx0RmlkbzJBc3NlcnRpb25SZXN1bHQsXG5cdEFzc2VydGlvblJlc3VsdCxcblx0VXNlclZlcmlmaWNhdGlvblxufSBmcm9tICdmaWRvMi1saWInO1xuaW1wb3J0IHtcblx0QXBwTG9nZ2VyU2VydmljZUludGVyZmFjZSxcblx0Q2FjaGVTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFbnZDb25maWdTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFcnJvckhhbmRsZXJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2UsXG5cdEZJRE8yU2VydmljZUludGVyZmFjZSxcblx0Rmlkb1VzZXJJbnRlcmZhY2Vcbn0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tYWluJztcbmltcG9ydCB7IEZpZG9GYWN0b3IgfSBmcm9tICcuLi9pbmRleC9pbnRlcmZhY2VzL3R5cGVzJztcbmltcG9ydCB7IHZhbGlkYXRlRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgeyBzZXJ2aWNlVFRMQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2NhY2hlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9zdWJmYWN0b3JpZXMvTG9nZ2VyU2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgRXJyb3JIYW5kbGVyU2VydmljZUZhY3RvcnkgfSBmcm9tICcuLi9pbmRleC9mYWN0b3J5L3N1YmZhY3Rvcmllcy9FcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeSc7XG5pbXBvcnQgeyBFbnZDb25maWdTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL0VudkNvbmZpZ1NlcnZpY2VGYWN0b3J5JztcbmltcG9ydCB7IENhY2hlTGF5ZXJTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL0NhY2hlTGF5ZXJTZXJ2aWNlRmFjdG9yeSc7XG5cbmltcG9ydCAnLi4vLi4vdHlwZXMvY3VzdG9tL3l1Yi5kLnRzJztcblxuZXhwb3J0IGNsYXNzIEZJRE8yU2VydmljZSBpbXBsZW1lbnRzIEZJRE8yU2VydmljZUludGVyZmFjZSB7XG5cdHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBGSURPMlNlcnZpY2UgfCBudWxsID0gbnVsbDtcblxuXHRwcml2YXRlIEZJRE8yOiBGaWRvMkxpYiB8IG51bGwgPSBudWxsO1xuXHRwcml2YXRlIGxvZ2dlciE6IEFwcExvZ2dlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZXJyb3JMb2dnZXIhOiBFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZXJyb3JIYW5kbGVyITogRXJyb3JIYW5kbGVyU2VydmljZUludGVyZmFjZTtcblx0cHJpdmF0ZSBlbnZDb25maWchOiBFbnZDb25maWdTZXJ2aWNlSW50ZXJmYWNlO1xuXHRwcml2YXRlIGNhY2hlU2VydmljZSE6IENhY2hlU2VydmljZUludGVyZmFjZTtcblx0cHJpdmF0ZSB0aW1lb3V0OiBudW1iZXI7XG5cblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLnRpbWVvdXQgPVxuXHRcdFx0KHRoaXMuZW52Q29uZmlnLmdldEVudlZhcmlhYmxlKCdmaWRvMlRpbWVvdXQnKSBhcyBudW1iZXIpIHx8IDUwMDAwO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRJbnN0YW5jZSgpOiBQcm9taXNlPEZJRE8yU2VydmljZT4ge1xuXHRcdGlmICghRklETzJTZXJ2aWNlLmluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCBsb2dnZXIgPSBhd2FpdCBMb2dnZXJTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXJTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlcnJvckxvZ2dlciA9XG5cdFx0XHRcdGF3YWl0IExvZ2dlclNlcnZpY2VGYWN0b3J5LmdldEVycm9yTG9nZ2VyU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZXJyb3JIYW5kbGVyID1cblx0XHRcdFx0YXdhaXQgRXJyb3JIYW5kbGVyU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JIYW5kbGVyU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZW52Q29uZmlnID1cblx0XHRcdFx0YXdhaXQgRW52Q29uZmlnU2VydmljZUZhY3RvcnkuZ2V0RW52Q29uZmlnU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgY2FjaGVTZXJ2aWNlID1cblx0XHRcdFx0YXdhaXQgQ2FjaGVMYXllclNlcnZpY2VGYWN0b3J5LmdldENhY2hlU2VydmljZSgpO1xuXG5cdFx0XHRGSURPMlNlcnZpY2UuaW5zdGFuY2UgPSBuZXcgRklETzJTZXJ2aWNlKCk7XG5cdFx0XHRGSURPMlNlcnZpY2UuaW5zdGFuY2UuZXJyb3JMb2dnZXIgPSBlcnJvckxvZ2dlcjtcblx0XHRcdEZJRE8yU2VydmljZS5pbnN0YW5jZS5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cdFx0XHRGSURPMlNlcnZpY2UuaW5zdGFuY2UuZW52Q29uZmlnID0gZW52Q29uZmlnO1xuXHRcdFx0RklETzJTZXJ2aWNlLmluc3RhbmNlLmNhY2hlU2VydmljZSA9IGNhY2hlU2VydmljZTtcblx0XHRcdEZJRE8yU2VydmljZS5pbnN0YW5jZS5sb2dnZXIgPSBsb2dnZXI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEZJRE8yU2VydmljZS5pbnN0YW5jZTtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBpbml0aWFsaXplRklETzJTZXJ2aWNlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGNhY2hlS2V5ID0gJ0ZJRE8yTGliJztcblx0XHRjb25zdCBjYWNoZWRGSURPMkxpYiA9IGF3YWl0IHRoaXMuY2FjaGVTZXJ2aWNlLmdldChjYWNoZUtleSwgJ2F1dGgnKTtcblxuXHRcdGlmIChjYWNoZWRGSURPMkxpYikge1xuXHRcdFx0dGhpcy5GSURPMiA9IGNhY2hlZEZJRE8yTGliIGFzIEZpZG8yTGliO1xuXHRcdFx0dGhpcy5sb2dnZXIuZGVidWcoJ0xvYWRlZCBGaWRvMkxpYiBmcm9tIGNhY2hlLicpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBycElkID0gdGhpcy5lbnZDb25maWcuZ2V0RW52VmFyaWFibGUoJ3JwSWQnKTtcblx0XHRcdGNvbnN0IHJwTmFtZSA9IHRoaXMuZW52Q29uZmlnLmdldEVudlZhcmlhYmxlKCdycE5hbWUnKTtcblx0XHRcdGNvbnN0IGNoYWxsZW5nZVNpemUgPVxuXHRcdFx0XHR0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZSgnZmlkb0NoYWxsZW5nZVNpemUnKTtcblx0XHRcdGNvbnN0IGNyeXB0b1BhcmFtcyA9XG5cdFx0XHRcdHRoaXMuZW52Q29uZmlnLmdldEVudlZhcmlhYmxlKCdmaWRvQ3J5cHRvUGFyYW1zJyk7XG5cdFx0XHRjb25zdCByZXF1aXJlUmVzaWRlbnRLZXkgPSB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZShcblx0XHRcdFx0J2ZpZG9BdXRoUmVxdWlyZVJlc2lkZW50S2V5J1xuXHRcdFx0KTtcblx0XHRcdGNvbnN0IHVzZXJWZXJpZmljYXRpb24gPSB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZShcblx0XHRcdFx0J2ZpZG9BdXRoVXNlclZlcmlmaWNhdGlvbidcblx0XHRcdCk7XG5cdFx0XHRjb25zdCB2YWxpZFVzZXJWZXJpZmljYXRpb25WYWx1ZXM6IFVzZXJWZXJpZmljYXRpb25bXSA9IFtcblx0XHRcdFx0J3JlcXVpcmVkJyxcblx0XHRcdFx0J3ByZWZlcnJlZCcsXG5cdFx0XHRcdCdkaXNjb3VyYWdlZCdcblx0XHRcdF07XG5cdFx0XHRjb25zdCB0aW1lb3V0ID0gdGhpcy50aW1lb3V0O1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdCF2YWxpZFVzZXJWZXJpZmljYXRpb25WYWx1ZXMuaW5jbHVkZXMoXG5cdFx0XHRcdFx0dXNlclZlcmlmaWNhdGlvbiBhcyBVc2VyVmVyaWZpY2F0aW9uXG5cdFx0XHRcdClcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0J0ludmFsaWQgdmFsdWUgZm9yIGF1dGhlbnRpY2F0b3JVc2VyVmVyaWZpY2F0aW9uJ1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLkZJRE8yID0gbmV3IEZpZG8yTGliKHtcblx0XHRcdFx0dGltZW91dCxcblx0XHRcdFx0cnBJZCxcblx0XHRcdFx0cnBOYW1lLFxuXHRcdFx0XHRjaGFsbGVuZ2VTaXplLFxuXHRcdFx0XHRjcnlwdG9QYXJhbXMsXG5cdFx0XHRcdGF1dGhlbnRpY2F0b3JSZXF1aXJlUmVzaWRlbnRLZXk6IHJlcXVpcmVSZXNpZGVudEtleSxcblx0XHRcdFx0YXV0aGVudGljYXRvclVzZXJWZXJpZmljYXRpb246XG5cdFx0XHRcdFx0dXNlclZlcmlmaWNhdGlvbiBhcyBVc2VyVmVyaWZpY2F0aW9uXG5cdFx0XHR9KTtcblx0XHRcdGF3YWl0IHRoaXMuY2FjaGVTZXJ2aWNlLnNldChcblx0XHRcdFx0Y2FjaGVLZXksXG5cdFx0XHRcdHRoaXMuRklETzIsXG5cdFx0XHRcdCdhdXRoJyxcblx0XHRcdFx0c2VydmljZVRUTENvbmZpZy5GSURPMiB8fCBzZXJ2aWNlVFRMQ29uZmlnLmRlZmF1bHRcblx0XHRcdCk7XG5cblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ0ZpZG8yTGliIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5oYW5kbGVFcnJvcignaW5pdGlhbGl6ZUZpZG8yJywgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFt7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogdGhpcy5sb2dnZXIgfV0sXG5cdFx0XHR0aGlzLmxvZ2dlclxuXHRcdCk7XG5cdFx0aWYgKCF0aGlzLkZJRE8yKSB7XG5cdFx0XHR0aGlzLmxvZ2dlci5kZWJ1ZygnRmlkbzJMaWIgaXMgbm90IGluaXRpYWxpemVkLCBpbml0aWFsaXppbmcgbm93LicpO1xuXHRcdFx0YXdhaXQgdGhpcy5pbml0aWFsaXplRklETzJTZXJ2aWNlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9nZ2VyLmRlYnVnKCdGaWRvMkxpYiBpcyBhbHJlYWR5IGluaXRpYWxpemVkLicpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyBnZW5lcmF0ZUZJRE8yUmVnaXN0cmF0aW9uT3B0aW9ucyhcblx0XHR1c2VyOiBGaWRvVXNlckludGVyZmFjZVxuXHQpOiBQcm9taXNlPFB1YmxpY0tleUNyZWRlbnRpYWxDcmVhdGlvbk9wdGlvbnM+IHtcblx0XHRjb25zdCBjYWNoZUtleSA9IGBGSURPMlJlZ2lzdHJhdGlvbjoke3VzZXIuaWR9YDtcblx0XHRjb25zdCBjYWNoZWRPcHRpb25zID0gYXdhaXQgdGhpcy5jYWNoZVNlcnZpY2UuZ2V0KGNhY2hlS2V5LCAnYXV0aCcpO1xuXG5cdFx0aWYgKGNhY2hlZE9wdGlvbnMpIHtcblx0XHRcdHRoaXMubG9nZ2VyLmRlYnVnKCdMb2FkZWQgcmVnaXN0cmF0aW9uIG9wdGlvbnMgZnJvbSBjYWNoZS4nKTtcblx0XHRcdHJldHVybiBjYWNoZWRPcHRpb25zIGFzIFB1YmxpY0tleUNyZWRlbnRpYWxDcmVhdGlvbk9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbeyBuYW1lOiAndXNlcicsIGluc3RhbmNlOiB1c2VyIH1dLFxuXHRcdFx0XHR0aGlzLmxvZ2dlclxuXHRcdFx0KTtcblxuXHRcdFx0YXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuXG5cdFx0XHRjb25zdCB0aW1lb3V0ID0gdGhpcy50aW1lb3V0O1xuXHRcdFx0Y29uc3QgcGFzc2tleVJlZ2lzdHJhdGlvbk9wdGlvbnMgPVxuXHRcdFx0XHRhd2FpdCB0aGlzLkZJRE8yIS5hdHRlc3RhdGlvbk9wdGlvbnMoKTtcblx0XHRcdGNvbnN0IHJlZ2lzdHJhdGlvbk9wdGlvbnM6IFB1YmxpY0tleUNyZWRlbnRpYWxDcmVhdGlvbk9wdGlvbnMgPSB7XG5cdFx0XHRcdC4uLnBhc3NrZXlSZWdpc3RyYXRpb25PcHRpb25zLFxuXHRcdFx0XHR1c2VyOiB7XG5cdFx0XHRcdFx0aWQ6IEJ1ZmZlci5mcm9tKHVzZXIuaWQsICd1dGYtOCcpLFxuXHRcdFx0XHRcdG5hbWU6IHVzZXIuZW1haWwsXG5cdFx0XHRcdFx0ZGlzcGxheU5hbWU6IHVzZXIudXNlcm5hbWVcblx0XHRcdFx0fSxcblx0XHRcdFx0cHViS2V5Q3JlZFBhcmFtczogW3sgdHlwZTogJ3B1YmxpYy1rZXknLCBhbGc6IC03IH1dLFxuXHRcdFx0XHR0aW1lb3V0LFxuXHRcdFx0XHRhdHRlc3RhdGlvbjogJ2RpcmVjdCcsXG5cdFx0XHRcdGF1dGhlbnRpY2F0b3JTZWxlY3Rpb246IHtcblx0XHRcdFx0XHRhdXRoZW50aWNhdG9yQXR0YWNobWVudDogJ3BsYXRmb3JtJyxcblx0XHRcdFx0XHRyZXF1aXJlUmVzaWRlbnRLZXk6IHRydWUsXG5cdFx0XHRcdFx0dXNlclZlcmlmaWNhdGlvbjogJ3ByZWZlcnJlZCdcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0YXdhaXQgdGhpcy5jYWNoZVNlcnZpY2Uuc2V0KFxuXHRcdFx0XHRjYWNoZUtleSxcblx0XHRcdFx0cmVnaXN0cmF0aW9uT3B0aW9ucyxcblx0XHRcdFx0J2F1dGgnLFxuXHRcdFx0XHRzZXJ2aWNlVFRMQ29uZmlnLkZJRE8yUmVnaXN0cmF0aW9uIHx8IHNlcnZpY2VUVExDb25maWcuZGVmYXVsdFxuXHRcdFx0KTtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oXG5cdFx0XHRcdCdQYXNza2V5IHJlZ2lzdHJhdGlvbiBvcHRpb25zIGdlbmVyYXRlZCBzdWNjZXNzZnVsbHkuJ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybiByZWdpc3RyYXRpb25PcHRpb25zO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aGlzLmhhbmRsZUVycm9yKCdnZW5lcmF0ZVJlZ2lzdHJhdGlvbk9wdGlvbnMnLCBlcnJvcik7XG5cdFx0XHRyZXR1cm4ge30gYXMgUHVibGljS2V5Q3JlZGVudGlhbENyZWF0aW9uT3B0aW9ucztcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgdmVyaWZ5RklETzJSZWdpc3RyYXRpb24oXG5cdFx0YXR0ZXN0YXRpb246IEF0dGVzdGF0aW9uUmVzdWx0LFxuXHRcdGV4cGVjdGVkQ2hhbGxlbmdlOiBzdHJpbmdcblx0KTogUHJvbWlzZTxGaWRvMkF0dGVzdGF0aW9uUmVzdWx0PiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAnYXR0ZXN0YXRpb24nLCBpbnN0YW5jZTogYXR0ZXN0YXRpb24gfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdleHBlY3RlZENoYWxsZW5nZScsIGluc3RhbmNlOiBleHBlY3RlZENoYWxsZW5nZSB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHRoaXMubG9nZ2VyXG5cdFx0XHQpO1xuXHRcdFx0YXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuXG5cdFx0XHRjb25zdCB1MmZBdHRlc3RhdGlvbkV4cGVjdGF0aW9uczogRXhwZWN0ZWRBdHRlc3RhdGlvblJlc3VsdCA9IHtcblx0XHRcdFx0Y2hhbGxlbmdlOiBleHBlY3RlZENoYWxsZW5nZSxcblx0XHRcdFx0b3JpZ2luOiB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZSgncnBPcmlnaW4nKSxcblx0XHRcdFx0ZmFjdG9yOiAnZWl0aGVyJyBhcyBGaWRvRmFjdG9yLFxuXHRcdFx0XHRycElkOiB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZSgncnBJZCcpXG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLkZJRE8yIS5hdHRlc3RhdGlvblJlc3VsdChcblx0XHRcdFx0YXR0ZXN0YXRpb24sXG5cdFx0XHRcdHUyZkF0dGVzdGF0aW9uRXhwZWN0YXRpb25zXG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnUGFzc2tleSByZWdpc3RyYXRpb24gdmVyaWZpZWQgc3VjY2Vzc2Z1bGx5LicpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdCBhcyBGaWRvMkF0dGVzdGF0aW9uUmVzdWx0O1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aGlzLmhhbmRsZUVycm9yKCd2ZXJpZnlSZWdpc3RyYXRpb24nLCBlcnJvcik7XG5cdFx0XHRyZXR1cm4ge30gYXMgRmlkbzJBdHRlc3RhdGlvblJlc3VsdDtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgZ2VuZXJhdGVGSURPMkF1dGhlbnRpY2F0aW9uT3B0aW9ucyhcblx0XHR1c2VyOiBGaWRvVXNlckludGVyZmFjZVxuXHQpOiBQcm9taXNlPFB1YmxpY0tleUNyZWRlbnRpYWxSZXF1ZXN0T3B0aW9ucz4ge1xuXHRcdGNvbnN0IGNhY2hlS2V5ID0gYEZJRE8yQXV0aDoke3VzZXIuaWR9YDtcblx0XHRjb25zdCBjYWNoZWRPcHRpb25zID0gYXdhaXQgdGhpcy5jYWNoZVNlcnZpY2UuZ2V0KGNhY2hlS2V5LCAnYXV0aCcpO1xuXG5cdFx0aWYgKGNhY2hlZE9wdGlvbnMpIHtcblx0XHRcdHRoaXMubG9nZ2VyLmRlYnVnKCdMb2FkZWQgYXV0aGVudGljYXRpb24gb3B0aW9ucyBmcm9tIGNhY2hlLicpO1xuXHRcdFx0cmV0dXJuIGNhY2hlZE9wdGlvbnMgYXMgUHVibGljS2V5Q3JlZGVudGlhbFJlcXVlc3RPcHRpb25zO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG5cblx0XHRcdGNvbnN0IHVzZXJDcmVkZW50aWFsczogUHVibGljS2V5Q3JlZGVudGlhbERlc2NyaXB0b3JbXSA9XG5cdFx0XHRcdHVzZXIuY3JlZGVudGlhbC5tYXAoY3JlZGVudGlhbCA9PiAoe1xuXHRcdFx0XHRcdHR5cGU6ICdwdWJsaWMta2V5Jyxcblx0XHRcdFx0XHRpZDogQnVmZmVyLmZyb20oY3JlZGVudGlhbC5jcmVkZW50aWFsSWQsICdiYXNlNjQnKS5idWZmZXJcblx0XHRcdFx0fSkpO1xuXG5cdFx0XHRjb25zdCBhc3NlcnRpb25PcHRpb25zID0gYXdhaXQgdGhpcy5GSURPMiEuYXNzZXJ0aW9uT3B0aW9ucygpO1xuXHRcdFx0Y29uc3QgYXV0aGVudGljYXRpb25PcHRpb25zOiBQdWJsaWNLZXlDcmVkZW50aWFsUmVxdWVzdE9wdGlvbnMgPSB7XG5cdFx0XHRcdC4uLmFzc2VydGlvbk9wdGlvbnMsXG5cdFx0XHRcdGFsbG93Q3JlZGVudGlhbHM6IHVzZXJDcmVkZW50aWFscyxcblx0XHRcdFx0dXNlclZlcmlmaWNhdGlvbjogJ3JlcXVpcmVkJyxcblx0XHRcdFx0dGltZW91dDogNjAwMDBcblx0XHRcdH07XG5cblx0XHRcdGF3YWl0IHRoaXMuY2FjaGVTZXJ2aWNlLnNldChcblx0XHRcdFx0Y2FjaGVLZXksXG5cdFx0XHRcdGF1dGhlbnRpY2F0aW9uT3B0aW9ucyxcblx0XHRcdFx0J2F1dGgnLFxuXHRcdFx0XHRzZXJ2aWNlVFRMQ29uZmlnLkZJRE8yQXV0aGVudGljYXRpb24gfHwgc2VydmljZVRUTENvbmZpZy5kZWZhdWx0XG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbyhcblx0XHRcdFx0J1Bhc3NrZXkgYXV0aGVudGljYXRpb24gb3B0aW9ucyBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5Lidcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gYXV0aGVudGljYXRpb25PcHRpb25zO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aGlzLmhhbmRsZUVycm9yKCdnZW5lcmF0ZUF1dGhlbnRpY2F0aW9uT3B0aW9ucycsIGVycm9yKTtcblx0XHRcdHJldHVybiB7fSBhcyBQdWJsaWNLZXlDcmVkZW50aWFsUmVxdWVzdE9wdGlvbnM7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIHZlcmlmeUF1dGhlbnRpY2F0aW9uKFxuXHRcdGFzc2VydGlvbjogQXNzZXJ0aW9uUmVzdWx0LFxuXHRcdGV4cGVjdGVkQ2hhbGxlbmdlOiBzdHJpbmcsXG5cdFx0cHVibGljS2V5OiBzdHJpbmcsXG5cdFx0cHJldmlvdXNDb3VudGVyOiBudW1iZXIsXG5cdFx0aWQ6IHN0cmluZ1xuXHQpOiBQcm9taXNlPEZpZG8yQXNzZXJ0aW9uUmVzdWx0PiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAnYXNzZXJ0aW9uJywgaW5zdGFuY2U6IGFzc2VydGlvbiB9LFxuXHRcdFx0XHRcdHsgbmFtZTogJ2V4cGVjdGVkQ2hhbGxlbmdlJywgaW5zdGFuY2U6IGV4cGVjdGVkQ2hhbGxlbmdlIH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAncHVibGljS2V5JywgaW5zdGFuY2U6IHB1YmxpY0tleSB9LFxuXHRcdFx0XHRcdHsgbmFtZTogJ3ByZXZpb3VzQ291bnRlcicsIGluc3RhbmNlOiBwcmV2aW91c0NvdW50ZXIgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdpZCcsIGluc3RhbmNlOiBpZCB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHRoaXMubG9nZ2VyXG5cdFx0XHQpO1xuXHRcdFx0YXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuXG5cdFx0XHRjb25zdCBhc3NlcnRpb25FeHBlY3RhdGlvbnM6IEV4cGVjdGVkQXNzZXJ0aW9uUmVzdWx0ID0ge1xuXHRcdFx0XHRjaGFsbGVuZ2U6IGV4cGVjdGVkQ2hhbGxlbmdlLFxuXHRcdFx0XHRvcmlnaW46IHRoaXMuZW52Q29uZmlnLmdldEVudlZhcmlhYmxlKCdycE9yaWdpbicpLFxuXHRcdFx0XHRmYWN0b3I6ICdlaXRoZXInIGFzIEZpZG9GYWN0b3IsXG5cdFx0XHRcdHB1YmxpY0tleSxcblx0XHRcdFx0cHJldkNvdW50ZXI6IHByZXZpb3VzQ291bnRlcixcblx0XHRcdFx0dXNlckhhbmRsZTogaWRcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuRklETzIhLmFzc2VydGlvblJlc3VsdChcblx0XHRcdFx0YXNzZXJ0aW9uLFxuXHRcdFx0XHRhc3NlcnRpb25FeHBlY3RhdGlvbnNcblx0XHRcdCk7XG5cdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdQYXNza2V5IGF1dGhlbnRpY2F0aW9uIHZlcmlmaWVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdHJldHVybiByZXN1bHQgYXMgRmlkbzJBc3NlcnRpb25SZXN1bHQ7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMuaGFuZGxlRXJyb3IoJ3ZlcmlmeUF1dGhlbnRpY2F0aW9uJywgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIHt9IGFzIEZpZG8yQXNzZXJ0aW9uUmVzdWx0O1xuXHRcdH1cblx0fVxuXG5cdC8vICpERVYtTk9URSogdXNlLCBmb3IgZXhhbXBsZSwgd2hlbiB1c2VyIHVwZGF0ZXMgY3JlZGVudGlhbHNcblx0cHVibGljIGFzeW5jIGludmFsaWRhdGVGaWRvMkNhY2hlKFxuXHRcdHVzZXJJZDogc3RyaW5nLFxuXHRcdGFjdGlvbjogc3RyaW5nXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGNhY2hlS2V5UmVnaXN0cmF0aW9uID0gYEZJRE8yUmVnaXN0cmF0aW9uOiR7dXNlcklkfWA7XG5cdFx0Y29uc3QgY2FjaGVLZXlBdXRoID0gYEZJRE8yQXV0aDoke3VzZXJJZH1gO1xuXG5cdFx0dGhpcy5sb2dnZXIuaW5mbyhcblx0XHRcdGBJbnZhbGlkYXRpbmcgRklETzIgY2FjaGUgZm9yIHVzZXIgJHt1c2VySWR9IGR1ZSB0byAke2FjdGlvbn1gXG5cdFx0KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5kZWwoY2FjaGVLZXlSZWdpc3RyYXRpb24sICdhdXRoJyk7XG5cdFx0XHRhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5kZWwoY2FjaGVLZXlBdXRoLCAnYXV0aCcpO1xuXG5cdFx0XHR0aGlzLmxvZ2dlci5pbmZvKGBGSURPMiBjYWNoZSBpbnZhbGlkYXRlZCBmb3IgdXNlciAke3VzZXJJZH1gKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5oYW5kbGVFcnJvcignaW52YWxpZGF0ZUZpZG8yQ2FjaGUnLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIHNodXRkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5GSURPMikge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5pbmZvKFxuXHRcdFx0XHRcdCdDbGVhcmluZyBGSURPMkxpYiBhbmQgY2FjaGUgZW50cmllcyBiZWZvcmUgc2h1dGRvd24uLi4nXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRoaXMuRklETzIgPSBudWxsO1xuXG5cdFx0XHRcdGF3YWl0IHRoaXMuY2FjaGVTZXJ2aWNlLmRlbCgnRklETzJMaWInLCAnYXV0aCcpO1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5pbmZvKFxuXHRcdFx0XHRcdCdGSURPMiBjYWNoZSBhbmQgaW5zdGFuY2UgY2xlYXJlZCBzdWNjZXNzZnVsbHkuJ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRGSURPMlNlcnZpY2UuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdGSURPMlNlcnZpY2Ugc2h1dCBkb3duIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLmluZm8oXG5cdFx0XHRcdFx0J0ZJRE8yU2VydmljZSBpcyBhbHJlYWR5IHNodXQgZG93biBvciB1bmluaXRpYWxpemVkLidcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5oYW5kbGVFcnJvcignc2h1dGRvd24nLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVFcnJvcih1dGlsaXR5OiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgZXJyb3JNZXNzYWdlID0gYEVycm9yIGluICR7dXRpbGl0eX06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBlcnJvcn1gO1xuXHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcblx0XHRjb25zdCB1dGlsaXR5RXJyb3IgPVxuXHRcdFx0bmV3IHRoaXMuZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5VdGlsaXR5RXJyb3JSZWNvdmVyYWJsZShcblx0XHRcdFx0ZXJyb3JNZXNzYWdlLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZXhwb3NlVG9DbGllbnQ6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0dGhpcy5lcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoeyBlcnJvcjogdXRpbGl0eUVycm9yIH0pO1xuXHR9XG59XG4iXX0=
