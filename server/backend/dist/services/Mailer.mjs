import { validateDependencies } from '../utils/helpers.mjs';
import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory.mjs';
import { ErrorHandlerServiceFactory } from '../index/factory/subfactories/ErrorHandlerServiceFactory.mjs';
import { EnvConfigServiceFactory } from '../index/factory/subfactories/EnvConfigServiceFactory.mjs';
import { VaultServiceFactory } from '../index/factory/subfactories/VaultServiceFactory.mjs';
export class MailerService {
	nodemailer;
	emailUser;
	static instance = null;
	logger;
	errorLogger;
	errorHandler;
	envConfig;
	vault;
	transporter = null;
	constructor(nodemailer, emailUser) {
		this.nodemailer = nodemailer;
		this.emailUser = emailUser;
	}
	static async getInstance(deps) {
		deps.validateDependencies(
			[
				{ name: 'nodemailer', instance: deps.nodemailer },
				{ name: 'emailUser', instance: deps.emailUser }
			],
			await LoggerServiceFactory.getLoggerService()
		);
		if (!MailerService.instance) {
			const logger = await LoggerServiceFactory.getLoggerService();
			const errorLogger =
				await LoggerServiceFactory.getErrorLoggerService();
			const errorHandler =
				await ErrorHandlerServiceFactory.getErrorHandlerService();
			const envConfig =
				await EnvConfigServiceFactory.getEnvConfigService();
			const vault = await VaultServiceFactory.getVaultService();
			MailerService.instance = new MailerService(
				deps.nodemailer,
				deps.emailUser
			);
			MailerService.instance.logger = logger;
			MailerService.instance.errorLogger = errorLogger;
			MailerService.instance.errorHandler = errorHandler;
			MailerService.instance.envConfig = envConfig;
			MailerService.instance.vault = vault;
		}
		return MailerService.instance;
	}
	validateMailerDependencies() {
		validateDependencies(
			[
				{ name: 'nodemailer', instance: this.nodemailer },
				{ name: 'emailUser', instance: this.emailUser }
			],
			this.logger
		);
	}
	async createMailTransporter() {
		try {
			this.validateMailerDependencies();
			const smtpToken = this.vault.retrieveSecret(
				'SMTP_TOKEN',
				secret => secret
			);
			if (typeof smtpToken !== 'string') {
				const smtpTokenError =
					new this.errorHandler.ErrorClasses.ConfigurationError(
						'Invalid SMTP token'
					);
				this.errorLogger.logError(smtpTokenError.message);
				this.errorHandler.handleError({ error: smtpTokenError });
				throw smtpTokenError;
			}
			const transportOptions = {
				host: this.envConfig.getEnvVariable('emailHost'),
				port: this.envConfig.getEnvVariable('emailPort'),
				secure: this.envConfig.getEnvVariable('emailSecure'),
				auth: {
					user: this.emailUser,
					pass: smtpToken
				}
			};
			return this.nodemailer.createTransport(transportOptions);
		} catch (depError) {
			const dependencyError =
				new this.errorHandler.ErrorClasses.DependencyErrorRecoverable(
					`Unable to create transporter for Mailer Service\n${depError instanceof Error ? depError.message : 'Unknown error'};`,
					{ exposeToClient: false }
				);
			this.errorLogger.logError(dependencyError.message);
			this.errorHandler.handleError({
				error:
					dependencyError ||
					depError ||
					Error ||
					'Unable to create transporter for Mailer Service'
			});
			throw dependencyError;
		}
	}
	async getTransporter() {
		try {
			this.validateMailerDependencies();
			if (!this.transporter) {
				this.transporter = await this.createMailTransporter();
			}
			return this.transporter;
		} catch (depError) {
			const dependencyError =
				new this.errorHandler.ErrorClasses.DependencyErrorRecoverable(
					`Unable to retrieve transporter for Mailer Service\n${depError instanceof Error ? depError.message : 'Unknown error'};`,
					{
						dependency: 'getTransporter()',
						originalError: depError,
						exposeToClient: false
					}
				);
			this.logger.logError(dependencyError.message);
			this.errorHandler.handleError({
				error: dependencyError || depError || Error || 'Unknown error'
			});
			throw dependencyError;
		}
	}
	async shutdown() {
		try {
			if (this.transporter) {
				this.transporter.close();
				MailerService.instance = null;
				this.logger.info('Mailer service transporter closed.');
			}
		} catch (error) {
			this.errorLogger.logError(
				`Error shutting down Mailer service: ${error instanceof Error ? error.message : error}`
			);
		}
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL01haWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQVd4RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUMxRixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUN0RyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNoRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUV4RixNQUFNLE9BQU8sYUFBYTtJQVVoQjtJQUNBO0lBVkQsTUFBTSxDQUFDLFFBQVEsR0FBeUIsSUFBSSxDQUFDO0lBQzdDLE1BQU0sQ0FBNkI7SUFDbkMsV0FBVyxDQUErQjtJQUMxQyxZQUFZLENBQWdDO0lBQzVDLFNBQVMsQ0FBNkI7SUFDdEMsS0FBSyxDQUF5QjtJQUM5QixXQUFXLEdBQXVCLElBQUksQ0FBQztJQUUvQyxZQUNTLFVBQXVDLEVBQ3ZDLFNBQWlCO1FBRGpCLGVBQVUsR0FBVixVQUFVLENBQTZCO1FBQ3ZDLGNBQVMsR0FBVCxTQUFTLENBQVE7SUFDdkIsQ0FBQztJQUVHLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUM5QixJQUF1QjtRQUV2QixJQUFJLENBQUMsb0JBQW9CLENBQ3hCO1lBQ0MsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtTQUMvQyxFQUNELE1BQU0sb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsQ0FDN0MsQ0FBQztRQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0Is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QUM5RCxDQUFDLENBQUM7WUFDSCxNQUFNLGVBQWUsQ0FBQztRQUN2QixDQUFDO0lBQ0YsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRO1FBQ3BCLElBQUksQ0FBQztZQUNKLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN6QixhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUN4RCxDQUFDO1FBQ0YsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQ3hCLHVDQUF1QyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDdkYsQ0FBQztRQUNILENBQUM7SUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHJhbnNwb3J0ZXIgfSBmcm9tICdub2RlbWFpbGVyJztcbmltcG9ydCB7IHZhbGlkYXRlRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQge1xuXHRBcHBMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFbnZDb25maWdTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2UsXG5cdEVycm9ySGFuZGxlclNlcnZpY2VJbnRlcmZhY2UsXG5cdE1haWxlclNlcnZpY2VEZXBzLFxuXHRNYWlsZXJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRWYXVsdFNlcnZpY2VJbnRlcmZhY2Vcbn0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tYWluJztcbmltcG9ydCBTTVRQVHJhbnNwb3J0IGZyb20gJ25vZGVtYWlsZXIvbGliL3NtdHAtdHJhbnNwb3J0JztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9zdWJmYWN0b3JpZXMvTG9nZ2VyU2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgRXJyb3JIYW5kbGVyU2VydmljZUZhY3RvcnkgfSBmcm9tICcuLi9pbmRleC9mYWN0b3J5L3N1YmZhY3Rvcmllcy9FcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeSc7XG5pbXBvcnQgeyBFbnZDb25maWdTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3Rvcnkvc3ViZmFjdG9yaWVzL0VudkNvbmZpZ1NlcnZpY2VGYWN0b3J5JztcbmltcG9ydCB7IFZhdWx0U2VydmljZUZhY3RvcnkgfSBmcm9tICcuLi9pbmRleC9mYWN0b3J5L3N1YmZhY3Rvcmllcy9WYXVsdFNlcnZpY2VGYWN0b3J5JztcblxuZXhwb3J0IGNsYXNzIE1haWxlclNlcnZpY2UgaW1wbGVtZW50cyBNYWlsZXJTZXJ2aWNlSW50ZXJmYWNlIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IE1haWxlclNlcnZpY2UgfCBudWxsID0gbnVsbDtcblx0cHJpdmF0ZSBsb2dnZXIhOiBBcHBMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlO1xuXHRwcml2YXRlIGVycm9yTG9nZ2VyITogRXJyb3JMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlO1xuXHRwcml2YXRlIGVycm9ySGFuZGxlciE6IEVycm9ySGFuZGxlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZW52Q29uZmlnITogRW52Q29uZmlnU2VydmljZUludGVyZmFjZTtcblx0cHJpdmF0ZSB2YXVsdCE6IFZhdWx0U2VydmljZUludGVyZmFjZTtcblx0cHJpdmF0ZSB0cmFuc3BvcnRlcjogVHJhbnNwb3J0ZXIgfCBudWxsID0gbnVsbDtcblxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgbm9kZW1haWxlcjogdHlwZW9mIGltcG9ydCgnbm9kZW1haWxlcicpLFxuXHRcdHByaXZhdGUgZW1haWxVc2VyOiBzdHJpbmdcblx0KSB7fVxuXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0SW5zdGFuY2UoXG5cdFx0ZGVwczogTWFpbGVyU2VydmljZURlcHNcblx0KTogUHJvbWlzZTxNYWlsZXJTZXJ2aWNlPiB7XG5cdFx0ZGVwcy52YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFtcblx0XHRcdFx0eyBuYW1lOiAnbm9kZW1haWxlcicsIGluc3RhbmNlOiBkZXBzLm5vZGVtYWlsZXIgfSxcblx0XHRcdFx0eyBuYW1lOiAnZW1haWxVc2VyJywgaW5zdGFuY2U6IGRlcHMuZW1haWxVc2VyIH1cblx0XHRcdF0sXG5cdFx0XHRhd2FpdCBMb2dnZXJTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXJTZXJ2aWNlKClcblx0XHQpO1xuXG5cdFx0aWYgKCFNYWlsZXJTZXJ2aWNlLmluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCBsb2dnZXIgPSBhd2FpdCBMb2dnZXJTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXJTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlcnJvckxvZ2dlciA9XG5cdFx0XHRcdGF3YWl0IExvZ2dlclNlcnZpY2VGYWN0b3J5LmdldEVycm9yTG9nZ2VyU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZXJyb3JIYW5kbGVyID1cblx0XHRcdFx0YXdhaXQgRXJyb3JIYW5kbGVyU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JIYW5kbGVyU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZW52Q29uZmlnID1cblx0XHRcdFx0YXdhaXQgRW52Q29uZmlnU2VydmljZUZhY3RvcnkuZ2V0RW52Q29uZmlnU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgdmF1bHQgPSBhd2FpdCBWYXVsdFNlcnZpY2VGYWN0b3J5LmdldFZhdWx0U2VydmljZSgpO1xuXG5cdFx0XHRNYWlsZXJTZXJ2aWNlLmluc3RhbmNlID0gbmV3IE1haWxlclNlcnZpY2UoXG5cdFx0XHRcdGRlcHMubm9kZW1haWxlcixcblx0XHRcdFx0ZGVwcy5lbWFpbFVzZXJcblx0XHRcdCk7XG5cblx0XHRcdE1haWxlclNlcnZpY2UuaW5zdGFuY2UubG9nZ2VyID0gbG9nZ2VyO1xuXHRcdFx0TWFpbGVyU2VydmljZS5pbnN0YW5jZS5lcnJvckxvZ2dlciA9IGVycm9yTG9nZ2VyO1xuXHRcdFx0TWFpbGVyU2VydmljZS5pbnN0YW5jZS5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cdFx0XHRNYWlsZXJTZXJ2aWNlLmluc3RhbmNlLmVudkNvbmZpZyA9IGVudkNvbmZpZztcblx0XHRcdE1haWxlclNlcnZpY2UuaW5zdGFuY2UudmF1bHQgPSB2YXVsdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gTWFpbGVyU2VydmljZS5pbnN0YW5jZTtcblx0fVxuXG5cdHB1YmxpYyB2YWxpZGF0ZU1haWxlckRlcGVuZGVuY2llcygpOiB2b2lkIHtcblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFtcblx0XHRcdFx0eyBuYW1lOiAnbm9kZW1haWxlcicsIGluc3RhbmNlOiB0aGlzLm5vZGVtYWlsZXIgfSxcblx0XHRcdFx0eyBuYW1lOiAnZW1haWxVc2VyJywgaW5zdGFuY2U6IHRoaXMuZW1haWxVc2VyIH1cblx0XHRcdF0sXG5cdFx0XHR0aGlzLmxvZ2dlclxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgY3JlYXRlTWFpbFRyYW5zcG9ydGVyKCk6IFByb21pc2U8VHJhbnNwb3J0ZXI+IHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy52YWxpZGF0ZU1haWxlckRlcGVuZGVuY2llcygpO1xuXG5cdFx0XHRjb25zdCBzbXRwVG9rZW4gPSB0aGlzLnZhdWx0LnJldHJpZXZlU2VjcmV0KFxuXHRcdFx0XHQnU01UUF9UT0tFTicsXG5cdFx0XHRcdHNlY3JldCA9PiBzZWNyZXRcblx0XHRcdCk7XG5cblx0XHRcdGlmICh0eXBlb2Ygc210cFRva2VuICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRjb25zdCBzbXRwVG9rZW5FcnJvciA9XG5cdFx0XHRcdFx0bmV3IHRoaXMuZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5Db25maWd1cmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHQnSW52YWxpZCBTTVRQIHRva2VuJ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3Ioc210cFRva2VuRXJyb3IubWVzc2FnZSk7XG5cdFx0XHRcdHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKHsgZXJyb3I6IHNtdHBUb2tlbkVycm9yIH0pO1xuXHRcdFx0XHR0aHJvdyBzbXRwVG9rZW5FcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgdHJhbnNwb3J0T3B0aW9uczogU01UUFRyYW5zcG9ydC5PcHRpb25zID0ge1xuXHRcdFx0XHRob3N0OiB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZSgnZW1haWxIb3N0JyksXG5cdFx0XHRcdHBvcnQ6IHRoaXMuZW52Q29uZmlnLmdldEVudlZhcmlhYmxlKCdlbWFpbFBvcnQnKSxcblx0XHRcdFx0c2VjdXJlOiB0aGlzLmVudkNvbmZpZy5nZXRFbnZWYXJpYWJsZSgnZW1haWxTZWN1cmUnKSxcblx0XHRcdFx0YXV0aDoge1xuXHRcdFx0XHRcdHVzZXI6IHRoaXMuZW1haWxVc2VyLFxuXHRcdFx0XHRcdHBhc3M6IHNtdHBUb2tlblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5ub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh0cmFuc3BvcnRPcHRpb25zKTtcblx0XHR9IGNhdGNoIChkZXBFcnJvcikge1xuXHRcdFx0Y29uc3QgZGVwZW5kZW5jeUVycm9yID1cblx0XHRcdFx0bmV3IHRoaXMuZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5EZXBlbmRlbmN5RXJyb3JSZWNvdmVyYWJsZShcblx0XHRcdFx0XHRgVW5hYmxlIHRvIGNyZWF0ZSB0cmFuc3BvcnRlciBmb3IgTWFpbGVyIFNlcnZpY2VcXG4ke2RlcEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBkZXBFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfTtgLFxuXHRcdFx0XHRcdHsgZXhwb3NlVG9DbGllbnQ6IGZhbHNlIH1cblx0XHRcdFx0KTtcblx0XHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3IoZGVwZW5kZW5jeUVycm9yLm1lc3NhZ2UpO1xuXHRcdFx0dGhpcy5lcnJvckhhbmRsZXIuaGFuZGxlRXJyb3Ioe1xuXHRcdFx0XHRlcnJvcjpcblx0XHRcdFx0XHRkZXBlbmRlbmN5RXJyb3IgfHxcblx0XHRcdFx0XHRkZXBFcnJvciB8fFxuXHRcdFx0XHRcdEVycm9yIHx8XG5cdFx0XHRcdFx0J1VuYWJsZSB0byBjcmVhdGUgdHJhbnNwb3J0ZXIgZm9yIE1haWxlciBTZXJ2aWNlJ1xuXHRcdFx0fSk7XG5cdFx0XHR0aHJvdyBkZXBlbmRlbmN5RXJyb3I7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGdldFRyYW5zcG9ydGVyKCk6IFByb21pc2U8VHJhbnNwb3J0ZXI+IHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy52YWxpZGF0ZU1haWxlckRlcGVuZGVuY2llcygpO1xuXG5cdFx0XHRpZiAoIXRoaXMudHJhbnNwb3J0ZXIpIHtcblx0XHRcdFx0dGhpcy50cmFuc3BvcnRlciA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpbFRyYW5zcG9ydGVyKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnRlciE7XG5cdFx0fSBjYXRjaCAoZGVwRXJyb3IpIHtcblx0XHRcdGNvbnN0IGRlcGVuZGVuY3lFcnJvciA9XG5cdFx0XHRcdG5ldyB0aGlzLmVycm9ySGFuZGxlci5FcnJvckNsYXNzZXMuRGVwZW5kZW5jeUVycm9yUmVjb3ZlcmFibGUoXG5cdFx0XHRcdFx0YFVuYWJsZSB0byByZXRyaWV2ZSB0cmFuc3BvcnRlciBmb3IgTWFpbGVyIFNlcnZpY2VcXG4ke2RlcEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBkZXBFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfTtgLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRlcGVuZGVuY3k6ICdnZXRUcmFuc3BvcnRlcigpJyxcblx0XHRcdFx0XHRcdG9yaWdpbmFsRXJyb3I6IGRlcEVycm9yLFxuXHRcdFx0XHRcdFx0ZXhwb3NlVG9DbGllbnQ6IGZhbHNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0dGhpcy5sb2dnZXIubG9nRXJyb3IoZGVwZW5kZW5jeUVycm9yLm1lc3NhZ2UpO1xuXHRcdFx0dGhpcy5lcnJvckhhbmRsZXIuaGFuZGxlRXJyb3Ioe1xuXHRcdFx0XHRlcnJvcjogZGVwZW5kZW5jeUVycm9yIHx8IGRlcEVycm9yIHx8IEVycm9yIHx8ICdVbmtub3duIGVycm9yJ1xuXHRcdFx0fSk7XG5cdFx0XHR0aHJvdyBkZXBlbmRlbmN5RXJyb3I7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIHNodXRkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy50cmFuc3BvcnRlcikge1xuXHRcdFx0XHR0aGlzLnRyYW5zcG9ydGVyLmNsb3NlKCk7XG5cdFx0XHRcdE1haWxlclNlcnZpY2UuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdNYWlsZXIgc2VydmljZSB0cmFuc3BvcnRlciBjbG9zZWQuJyk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3IoXG5cdFx0XHRcdGBFcnJvciBzaHV0dGluZyBkb3duIE1haWxlciBzZXJ2aWNlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogZXJyb3J9YFxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==
