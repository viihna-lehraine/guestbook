import { CacheLayerServiceFactory } from '../index/factory/subfactories/CacheLayerServiceFactory.mjs';
import { ErrorHandlerServiceFactory } from '../index/factory/subfactories/ErrorHandlerServiceFactory.mjs';
import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory.mjs';
import { VaultServiceFactory } from '../index/factory/subfactories/VaultServiceFactory.mjs';
export class EmailMFAService {
	static instance = null;
	cacheService;
	logger;
	errorLogger;
	errorHandler;
	vault;
	constructor() {}
	static async getInstance() {
		if (!EmailMFAService.instance) {
			const cacheService =
				await CacheLayerServiceFactory.getCacheService();
			const logger = await LoggerServiceFactory.getLoggerService();
			const errorLogger =
				await LoggerServiceFactory.getErrorLoggerService();
			const errorHandler =
				await ErrorHandlerServiceFactory.getErrorHandlerService();
			const vault = await VaultServiceFactory.getVaultService();
			EmailMFAService.instance = new EmailMFAService();
			EmailMFAService.instance.cacheService = cacheService;
			EmailMFAService.instance.logger = logger;
			EmailMFAService.instance.errorLogger = errorLogger;
			EmailMFAService.instance.errorHandler = errorHandler;
			EmailMFAService.instance.vault = vault;
		}
		return EmailMFAService.instance;
	}
	async generateEmailMFACode({ bcrypt, jwt }) {
		try {
			const emailMFACode = await bcrypt.genSalt(6);
			const key = await this.vault.retrieveSecret(
				'EMAIL_MFA_KEY',
				secret => secret
			);
			if (typeof key !== 'string') {
				this.logger.warn(
					'Valid Email MFA key not found during email 2FA code generation'
				);
				return { emailMFACode: '', emailMFAToken: '' };
			}
			const emailMFAToken = jwt.sign({ emailMFACode }, key, {
				expiresIn: '30m'
			});
			return { emailMFACode, emailMFAToken };
		} catch (utilError) {
			const utilityError =
				new this.errorHandler.ErrorClasses.UtilityErrorRecoverable(
					`Error generating email 2FA code: ${
						utilError instanceof Error
							? utilError.message
							: utilError
					}`
				);
			this.errorLogger.logError(utilityError.message);
			this.errorHandler.handleError({ error: utilityError });
			return { emailMFACode: '', emailMFAToken: '' };
		}
	}
	async verifyEmailMFACode(email, submittedCode) {
		try {
			const cachedToken = await this.cacheService.get(
				`mfaToken:${email}`,
				'auth'
			);
			if (!cachedToken) {
				this.logger.warn(
					`MFA token not found or expired for email: ${email}`
				);
				throw new this.errorHandler.ErrorClasses.InvalidInputError(
					'MFA token expired or invalid'
				);
			}
			const jwt = await this.loadJwt();
			const emailMFAKey = await this.vault.retrieveSecret(
				'EMAIL_MFA_KEY',
				secret => secret
			);
			if (!emailMFAKey) {
				this.logger.warn(
					'Valid Email MFA key not found during email 2FA code verification'
				);
				return false;
			}
			const decodedToken = jwt.verify(cachedToken, emailMFAKey);
			if (
				!decodedToken ||
				typeof decodedToken.emailMFACode !== 'string'
			) {
				this.logger.warn(
					`Invalid token structure during MFA verification for email: ${email}`
				);
				return false;
			}
			if (decodedToken.emailMFACode !== submittedCode) {
				this.logger.warn(`Invalid MFA code for email: ${email}`);
				return false;
			}
			await this.cacheService.del(`mfaToken:${email}`, 'auth');
			this.logger.info(`MFA verification successful for email: ${email}`);
			return true;
		} catch (error) {
			this.logger.error(`Error verifying MFA for email: ${email}`, {
				error
			});
			throw error;
		}
	}
	async shutdown() {
		try {
			this.logger.info('Clearing MFA tokens from cache...');
			await this.cacheService.clearNamespace('auth');
			EmailMFAService.instance = null;
			this.logger.info('EmailMFAService shutdown successfully.');
		} catch (error) {
			this.errorLogger.logError(
				`Error shutting down EmailMFAService: ${error instanceof Error ? error.message : error}`
			);
		}
	}
	async loadJwt() {
		return (await import('jsonwebtoken')).default;
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1haWxNRkEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0aC9FbWFpbE1GQS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUNsRyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUN0RyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUMxRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUd4RixNQUFNLE9BQU8sZUFBZTtJQUNuQixNQUFNLENBQUMsUUFBUSxHQUEyQixJQUFJLENBQUM7SUFDL0MsWUFBWSxDQUF5QjtJQUNyQyxNQUFNLENBQTZCO0lBQ25DLFdBQVcsQ0FBK0I7SUFDMUMsWUFBWSxDQUFnQztJQUM1QyxLQUFLLENBQXlCO0lBRXRDLGdCQUF1QixDQUFDO0lBRWpCLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVztRQUM5QixJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQy9CLE1BQU0sWUFBWSxHQUNqQixNQUFNLHdCQUF3QixDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2xELE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM3RCxNQUFNLFdBQVcsR0FDaEIsTUFBTSxvQkFBb0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3BELE1BQU0sWUFBWSxHQUNqQixNQUFNLDBCQUEwQixDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUUxRCxlQUFlLENBQUMsUUFBUSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7WUFDakQsZUFBZSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1lBQ3JELGVB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Q0FBQyxDQUFDO1FBQzVELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUN4Qix3Q0FBd0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ3hGLENBQUM7UUFDSCxDQUFDO0lBQ0YsQ0FBQztJQUVTLEtBQUssQ0FBQyxPQUFPO1FBQ3RCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUMvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QXBwTG9nZ2VyU2VydmljZUludGVyZmFjZSxcblx0Q2FjaGVTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFbWFpbE1GQVNlcnZpY2VJbnRlcmZhY2UsXG5cdEVycm9yTG9nZ2VyU2VydmljZUludGVyZmFjZSxcblx0RXJyb3JIYW5kbGVyU2VydmljZUludGVyZmFjZSxcblx0VmF1bHRTZXJ2aWNlSW50ZXJmYWNlXG59IGZyb20gJy4uL2luZGV4L2ludGVyZmFjZXMvbWFpbic7XG5pbXBvcnQgeyBFbWFpbE1GQVNlcnZpY2VEZXBzIH0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tYWluJztcbmltcG9ydCB7IENhY2hlTGF5ZXJTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL0NhY2hlTGF5ZXJTZXJ2aWNlRmFjdG9yeSc7XG5pbXBvcnQgeyBFcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL0Vycm9ySGFuZGxlclNlcnZpY2VGYWN0b3J5JztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9zdWJmYWN0b3JpZXMvTG9nZ2VyU2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgVmF1bHRTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL1ZhdWx0U2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgSnd0UGF5bG9hZCB9IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5cbmV4cG9ydCBjbGFzcyBFbWFpbE1GQVNlcnZpY2UgaW1wbGVtZW50cyBFbWFpbE1GQVNlcnZpY2VJbnRlcmZhY2Uge1xuXHRwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogRW1haWxNRkFTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG5cdHByaXZhdGUgY2FjaGVTZXJ2aWNlITogQ2FjaGVTZXJ2aWNlSW50ZXJmYWNlO1xuXHRwcml2YXRlIGxvZ2dlciE6IEFwcExvZ2dlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZXJyb3JMb2dnZXIhOiBFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZXJyb3JIYW5kbGVyITogRXJyb3JIYW5kbGVyU2VydmljZUludGVyZmFjZTtcblx0cHJpdmF0ZSB2YXVsdCE6IFZhdWx0U2VydmljZUludGVyZmFjZTtcblxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKCkge31cblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGdldEluc3RhbmNlKCk6IFByb21pc2U8RW1haWxNRkFTZXJ2aWNlPiB7XG5cdFx0aWYgKCFFbWFpbE1GQVNlcnZpY2UuaW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IGNhY2hlU2VydmljZSA9XG5cdFx0XHRcdGF3YWl0IENhY2hlTGF5ZXJTZXJ2aWNlRmFjdG9yeS5nZXRDYWNoZVNlcnZpY2UoKTtcblx0XHRcdGNvbnN0IGxvZ2dlciA9IGF3YWl0IExvZ2dlclNlcnZpY2VGYWN0b3J5LmdldExvZ2dlclNlcnZpY2UoKTtcblx0XHRcdGNvbnN0IGVycm9yTG9nZ2VyID1cblx0XHRcdFx0YXdhaXQgTG9nZ2VyU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JMb2dnZXJTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlcnJvckhhbmRsZXIgPVxuXHRcdFx0XHRhd2FpdCBFcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeS5nZXRFcnJvckhhbmRsZXJTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCB2YXVsdCA9IGF3YWl0IFZhdWx0U2VydmljZUZhY3RvcnkuZ2V0VmF1bHRTZXJ2aWNlKCk7XG5cblx0XHRcdEVtYWlsTUZBU2VydmljZS5pbnN0YW5jZSA9IG5ldyBFbWFpbE1GQVNlcnZpY2UoKTtcblx0XHRcdEVtYWlsTUZBU2VydmljZS5pbnN0YW5jZS5jYWNoZVNlcnZpY2UgPSBjYWNoZVNlcnZpY2U7XG5cdFx0XHRFbWFpbE1GQVNlcnZpY2UuaW5zdGFuY2UubG9nZ2VyID0gbG9nZ2VyO1xuXHRcdFx0RW1haWxNRkFTZXJ2aWNlLmluc3RhbmNlLmVycm9yTG9nZ2VyID0gZXJyb3JMb2dnZXI7XG5cdFx0XHRFbWFpbE1GQVNlcnZpY2UuaW5zdGFuY2UuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyO1xuXHRcdFx0RW1haWxNRkFTZXJ2aWNlLmluc3RhbmNlLnZhdWx0ID0gdmF1bHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEVtYWlsTUZBU2VydmljZS5pbnN0YW5jZTtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBnZW5lcmF0ZUVtYWlsTUZBQ29kZSh7XG5cdFx0YmNyeXB0LFxuXHRcdGp3dFxuXHR9OiBFbWFpbE1GQVNlcnZpY2VEZXBzKTogUHJvbWlzZTx7XG5cdFx0ZW1haWxNRkFDb2RlOiBzdHJpbmc7XG5cdFx0ZW1haWxNRkFUb2tlbjogc3RyaW5nO1xuXHR9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGVtYWlsTUZBQ29kZSA9IGF3YWl0IGJjcnlwdC5nZW5TYWx0KDYpO1xuXHRcdFx0Y29uc3Qga2V5ID0gYXdhaXQgdGhpcy52YXVsdC5yZXRyaWV2ZVNlY3JldChcblx0XHRcdFx0J0VNQUlMX01GQV9LRVknLFxuXHRcdFx0XHRzZWNyZXQgPT4gc2VjcmV0XG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0dGhpcy5sb2dnZXIud2Fybihcblx0XHRcdFx0XHQnVmFsaWQgRW1haWwgTUZBIGtleSBub3QgZm91bmQgZHVyaW5nIGVtYWlsIDJGQSBjb2RlIGdlbmVyYXRpb24nXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiB7IGVtYWlsTUZBQ29kZTogJycsIGVtYWlsTUZBVG9rZW46ICcnIH07XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGVtYWlsTUZBVG9rZW4gPSBqd3Quc2lnbih7IGVtYWlsTUZBQ29kZSB9LCBrZXksIHtcblx0XHRcdFx0ZXhwaXJlc0luOiAnMzBtJ1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB7IGVtYWlsTUZBQ29kZSwgZW1haWxNRkFUb2tlbiB9O1xuXHRcdH0gY2F0Y2ggKHV0aWxFcnJvcikge1xuXHRcdFx0Y29uc3QgdXRpbGl0eUVycm9yID1cblx0XHRcdFx0bmV3IHRoaXMuZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5VdGlsaXR5RXJyb3JSZWNvdmVyYWJsZShcblx0XHRcdFx0XHRgRXJyb3IgZ2VuZXJhdGluZyBlbWFpbCAyRkEgY29kZTogJHtcblx0XHRcdFx0XHRcdHV0aWxFcnJvciBpbnN0YW5jZW9mIEVycm9yXG5cdFx0XHRcdFx0XHRcdD8gdXRpbEVycm9yLm1lc3NhZ2Vcblx0XHRcdFx0XHRcdFx0OiB1dGlsRXJyb3Jcblx0XHRcdFx0XHR9YFxuXHRcdFx0XHQpO1xuXHRcdFx0dGhpcy5lcnJvckxvZ2dlci5sb2dFcnJvcih1dGlsaXR5RXJyb3IubWVzc2FnZSk7XG5cdFx0XHR0aGlzLmVycm9ySGFuZGxlci5oYW5kbGVFcnJvcih7IGVycm9yOiB1dGlsaXR5RXJyb3IgfSk7XG5cblx0XHRcdHJldHVybiB7IGVtYWlsTUZBQ29kZTogJycsIGVtYWlsTUZBVG9rZW46ICcnIH07XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIHZlcmlmeUVtYWlsTUZBQ29kZShcblx0XHRlbWFpbDogc3RyaW5nLFxuXHRcdHN1Ym1pdHRlZENvZGU6IHN0cmluZ1xuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY2FjaGVkVG9rZW4gPSBhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5nZXQ8c3RyaW5nPihcblx0XHRcdFx0YG1mYVRva2VuOiR7ZW1haWx9YCxcblx0XHRcdFx0J2F1dGgnXG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAoIWNhY2hlZFRva2VuKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLndhcm4oXG5cdFx0XHRcdFx0YE1GQSB0b2tlbiBub3QgZm91bmQgb3IgZXhwaXJlZCBmb3IgZW1haWw6ICR7ZW1haWx9YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHR0aHJvdyBuZXcgdGhpcy5lcnJvckhhbmRsZXIuRXJyb3JDbGFzc2VzLkludmFsaWRJbnB1dEVycm9yKFxuXHRcdFx0XHRcdCdNRkEgdG9rZW4gZXhwaXJlZCBvciBpbnZhbGlkJ1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBqd3QgPSBhd2FpdCB0aGlzLmxvYWRKd3QoKTtcblx0XHRcdGNvbnN0IGVtYWlsTUZBS2V5ID0gYXdhaXQgdGhpcy52YXVsdC5yZXRyaWV2ZVNlY3JldChcblx0XHRcdFx0J0VNQUlMX01GQV9LRVknLFxuXHRcdFx0XHRzZWNyZXQgPT4gc2VjcmV0XG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAoIWVtYWlsTUZBS2V5KSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLndhcm4oXG5cdFx0XHRcdFx0J1ZhbGlkIEVtYWlsIE1GQSBrZXkgbm90IGZvdW5kIGR1cmluZyBlbWFpbCAyRkEgY29kZSB2ZXJpZmljYXRpb24nXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZGVjb2RlZFRva2VuID0gand0LnZlcmlmeShcblx0XHRcdFx0Y2FjaGVkVG9rZW4sXG5cdFx0XHRcdGVtYWlsTUZBS2V5XG5cdFx0XHQpIGFzIEp3dFBheWxvYWQ7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0IWRlY29kZWRUb2tlbiB8fFxuXHRcdFx0XHR0eXBlb2YgZGVjb2RlZFRva2VuLmVtYWlsTUZBQ29kZSAhPT0gJ3N0cmluZydcblx0XHRcdCkge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdGBJbnZhbGlkIHRva2VuIHN0cnVjdHVyZSBkdXJpbmcgTUZBIHZlcmlmaWNhdGlvbiBmb3IgZW1haWw6ICR7ZW1haWx9YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkZWNvZGVkVG9rZW4uZW1haWxNRkFDb2RlICE9PSBzdWJtaXR0ZWRDb2RlKSB7XG5cdFx0XHRcdHRoaXMubG9nZ2VyLndhcm4oYEludmFsaWQgTUZBIGNvZGUgZm9yIGVtYWlsOiAke2VtYWlsfWApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMuY2FjaGVTZXJ2aWNlLmRlbChgbWZhVG9rZW46JHtlbWFpbH1gLCAnYXV0aCcpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbyhgTUZBIHZlcmlmaWNhdGlvbiBzdWNjZXNzZnVsIGZvciBlbWFpbDogJHtlbWFpbH1gKTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMubG9nZ2VyLmVycm9yKGBFcnJvciB2ZXJpZnlpbmcgTUZBIGZvciBlbWFpbDogJHtlbWFpbH1gLCB7XG5cdFx0XHRcdGVycm9yXG5cdFx0XHR9KTtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyBzaHV0ZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnQ2xlYXJpbmcgTUZBIHRva2VucyBmcm9tIGNhY2hlLi4uJyk7XG5cdFx0XHRhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5jbGVhck5hbWVzcGFjZSgnYXV0aCcpO1xuXG5cdFx0XHRFbWFpbE1GQVNlcnZpY2UuaW5zdGFuY2UgPSBudWxsO1xuXG5cdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdFbWFpbE1GQVNlcnZpY2Ugc2h1dGRvd24gc3VjY2Vzc2Z1bGx5LicpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aGlzLmVycm9yTG9nZ2VyLmxvZ0Vycm9yKFxuXHRcdFx0XHRgRXJyb3Igc2h1dHRpbmcgZG93biBFbWFpbE1GQVNlcnZpY2U6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBlcnJvcn1gXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBsb2FkSnd0KCk6IFByb21pc2U8RW1haWxNRkFTZXJ2aWNlRGVwc1snand0J10+IHtcblx0XHRyZXR1cm4gKGF3YWl0IGltcG9ydCgnanNvbndlYnRva2VuJykpLmRlZmF1bHQ7XG5cdH1cbn1cbiJdfQ==
