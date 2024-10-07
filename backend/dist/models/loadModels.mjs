import { createAuditLogModel } from './AuditLog.mjs';
import { createBlotEntryModel } from './BlotEntryAttributes.mjs';
import { createDataShareOptionsModel } from './DataShareOptions.mjs';
import { createDeviceModel } from './Device.mjs';
import { createErrorLogModel } from './ErrorLog.mjs';
import { createFailedLoginAttemptsModel } from './FailedLoginAttempts.mjs';
import { createFeatureRequestModel } from './FeatureRequest.mjs';
import { createFeedbackSurveyModel } from './FeedbackSurvey.mjs';
import { createMFASetupModel } from './MFASetup.mjs';
import { createRecoveryMethodModel } from './RecoveryMethod.mjs';
import { createSecurityEventModel } from './SecurityEvent.mjs';
import { createSupportRequestModel } from './SupportRequest.mjs';
import { createUserMFAModel } from './UserMFA.mjs';
import { createUserModel } from './User.mjs';
import { createUserSessionModel } from './UserSession.mjs';
import { validateDependencies } from '../utils/helpers.mjs';
import { ServiceFactory } from '../index/factory/ServiceFactory.mjs';
let res;
export async function loadModels(sequelize) {
	const logger = await ServiceFactory.getLoggerService();
	const errorLogger = await ServiceFactory.getErrorLoggerService();
	const errorHandler = await ServiceFactory.getErrorHandlerService();
	validateDependencies([{ name: 'sequelize', instance: sequelize }], logger);
	try {
		const models = {
			AuditLog: await createAuditLogModel(),
			BlotEntry: await createBlotEntryModel(),
			DataShareOptions: await createDataShareOptionsModel(),
			Device: await createDeviceModel(),
			ErrorLog: await createErrorLogModel(),
			FailedLoginAttempts: await createFailedLoginAttemptsModel(),
			FeatureRequest: await createFeatureRequestModel(),
			FeedbackSurvey: await createFeedbackSurveyModel(),
			MFASetup: await createMFASetupModel(),
			RecoveryMethod: await createRecoveryMethodModel(),
			SecurityEvent: await createSecurityEventModel(),
			SupportRequest: await createSupportRequestModel(),
			User: await createUserModel(),
			UserMFA: await createUserMFAModel(),
			UserSession: await createUserSessionModel()
		};
		for (const [modelName, modelInstance] of Object.entries(models)) {
			if (!modelInstance) {
				const errorMessage = `Model ${modelName} failed to initialize`;
				logger.error(errorMessage);
				return null;
			}
		}
		const User = models.User;
		const AuditLog = models.AuditLog;
		const FailedLoginAttempts = models.FailedLoginAttempts;
		const BlotEntry = models.BlotEntry;
		const RecoveryMethod = models.RecoveryMethod;
		const SecurityEvent = models.SecurityEvent;
		const SupportRequest = models.SupportRequest;
		const UserSession = models.UserSession;
		const UserMFA = models.UserMFA;
		User.hasMany(AuditLog, { foreignKey: 'id', as: 'auditLogs' });
		User.hasMany(FailedLoginAttempts, {
			foreignKey: 'id',
			as: 'failedLoginAttempts'
		});
		User.hasMany(BlotEntry, { foreignKey: 'id', as: 'guestbookEntries' });
		User.hasMany(RecoveryMethod, {
			foreignKey: 'id',
			as: 'recoveryMethods'
		});
		User.hasMany(SecurityEvent, { foreignKey: 'id', as: 'securityEvents' });
		User.hasMany(SupportRequest, {
			foreignKey: 'id',
			as: 'supportRequests'
		});
		User.hasMany(UserSession, { foreignKey: 'id', as: 'sessions' });
		User.hasOne(UserMFA, { foreignKey: 'id', as: 'user' });
		AuditLog.belongsTo(User, { foreignKey: 'id', as: 'user' });
		models.DataShareOptions.belongsTo(User, {
			foreignKey: 'id',
			as: 'user'
		});
		models.Device.belongsTo(User, { foreignKey: 'id', as: 'user' });
		FailedLoginAttempts.belongsTo(User, { foreignKey: 'id', as: 'user' });
		models.FeatureRequest.belongsTo(User, {
			foreignKey: 'id',
			as: 'user'
		});
		BlotEntry.belongsTo(User, { foreignKey: 'id', as: 'user' });
		models.MFASetup.belongsTo(User, { foreignKey: 'id', as: 'user' });
		RecoveryMethod.belongsTo(User, { foreignKey: 'id', as: 'user' });
		SecurityEvent.belongsTo(User, { foreignKey: 'id', as: 'user' });
		SupportRequest.belongsTo(User, { foreignKey: 'id', as: 'user' });
		UserMFA.belongsTo(User, { foreignKey: 'id', as: 'user' });
		UserSession.belongsTo(User, { foreignKey: 'id', as: 'user' });
		return models;
	} catch (dbError) {
		const dbUtil = 'loadModels()';
		const databaseRecoverableError =
			new errorHandler.ErrorClasses.DatabaseErrorRecoverable(
				`Error occurred when attempting to execute ${dbUtil}: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
				{ exposeToClient: false }
			);
		errorLogger.logError(databaseRecoverableError.message);
		await errorHandler.sendClientErrorResponse({
			message: 'Internal Server Error',
			statusCode: 500,
			res
		});
		errorHandler.handleError({
			error:
				databaseRecoverableError || dbError || Error || 'Unknown error'
		});
		return null;
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZE1vZGVscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbG9hZE1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDN0QsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNqRCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0QsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDekMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVqRSxJQUFJLEdBQWEsQ0FBQztBQWdDbEIsTUFBTSxD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QUFDO1FBQ0gsV0FBVyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2RCxNQUFNLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQztZQUMxQyxPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLFVBQVUsRUFBRSxHQUFHO1lBQ2YsR0FBRztTQUNILENBQUMsQ0FBQztRQUNILFlBQVksQ0FBQyxXQUFXLENBQUM7WUFDeEIsS0FBSyxFQUNKLHdCQUF3QixJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksZUFBZTtTQUNoRSxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IFNlcXVlbGl6ZSB9IGZyb20gJ3NlcXVlbGl6ZSc7XG5pbXBvcnQgeyBjcmVhdGVBdWRpdExvZ01vZGVsIH0gZnJvbSAnLi9BdWRpdExvZyc7XG5pbXBvcnQgeyBjcmVhdGVCbG90RW50cnlNb2RlbCB9IGZyb20gJy4vQmxvdEVudHJ5QXR0cmlidXRlcyc7XG5pbXBvcnQgeyBjcmVhdGVEYXRhU2hhcmVPcHRpb25zTW9kZWwgfSBmcm9tICcuL0RhdGFTaGFyZU9wdGlvbnMnO1xuaW1wb3J0IHsgY3JlYXRlRGV2aWNlTW9kZWwgfSBmcm9tICcuL0RldmljZSc7XG5pbXBvcnQgeyBjcmVhdGVFcnJvckxvZ01vZGVsIH0gZnJvbSAnLi9FcnJvckxvZyc7XG5pbXBvcnQgeyBjcmVhdGVGYWlsZWRMb2dpbkF0dGVtcHRzTW9kZWwgfSBmcm9tICcuL0ZhaWxlZExvZ2luQXR0ZW1wdHMnO1xuaW1wb3J0IHsgY3JlYXRlRmVhdHVyZVJlcXVlc3RNb2RlbCB9IGZyb20gJy4vRmVhdHVyZVJlcXVlc3QnO1xuaW1wb3J0IHsgY3JlYXRlRmVlZGJhY2tTdXJ2ZXlNb2RlbCB9IGZyb20gJy4vRmVlZGJhY2tTdXJ2ZXknO1xuaW1wb3J0IHsgY3JlYXRlTUZBU2V0dXBNb2RlbCB9IGZyb20gJy4vTUZBU2V0dXAnO1xuaW1wb3J0IHsgY3JlYXRlUmVjb3ZlcnlNZXRob2RNb2RlbCB9IGZyb20gJy4vUmVjb3ZlcnlNZXRob2QnO1xuaW1wb3J0IHsgY3JlYXRlU2VjdXJpdHlFdmVudE1vZGVsIH0gZnJvbSAnLi9TZWN1cml0eUV2ZW50JztcbmltcG9ydCB7IGNyZWF0ZVN1cHBvcnRSZXF1ZXN0TW9kZWwgfSBmcm9tICcuL1N1cHBvcnRSZXF1ZXN0JztcbmltcG9ydCB7IGNyZWF0ZVVzZXJNRkFNb2RlbCB9IGZyb20gJy4vVXNlck1GQSc7XG5pbXBvcnQgeyBjcmVhdGVVc2VyTW9kZWwgfSBmcm9tICcuL1VzZXInO1xuaW1wb3J0IHsgY3JlYXRlVXNlclNlc3Npb25Nb2RlbCB9IGZyb20gJy4vVXNlclNlc3Npb24nO1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IFNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9TZXJ2aWNlRmFjdG9yeSc7XG5cbmxldCByZXM6IFJlc3BvbnNlO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vZGVscyB7XG5cdEF1ZGl0TG9nOiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZUF1ZGl0TG9nTW9kZWw+PiB8IG51bGw7XG5cdEJsb3RFbnRyeTogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVCbG90RW50cnlNb2RlbD4+IHwgbnVsbDtcblx0RGF0YVNoYXJlT3B0aW9uczogQXdhaXRlZDxcblx0XHRSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVEYXRhU2hhcmVPcHRpb25zTW9kZWw+XG5cdD4gfCBudWxsO1xuXHREZXZpY2U6IEF3YWl0ZWQ8UmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlRGV2aWNlTW9kZWw+PiB8IG51bGw7XG5cdEVycm9yTG9nOiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZUVycm9yTG9nTW9kZWw+PiB8IG51bGw7XG5cdEZhaWxlZExvZ2luQXR0ZW1wdHM6IEF3YWl0ZWQ8XG5cdFx0UmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlRmFpbGVkTG9naW5BdHRlbXB0c01vZGVsPlxuXHQ+IHwgbnVsbDtcblx0RmVhdHVyZVJlcXVlc3Q6IEF3YWl0ZWQ8XG5cdFx0UmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlRmVhdHVyZVJlcXVlc3RNb2RlbD5cblx0PiB8IG51bGw7XG5cdEZlZWRiYWNrU3VydmV5OiBBd2FpdGVkPFxuXHRcdFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZUZlZWRiYWNrU3VydmV5TW9kZWw+XG5cdD4gfCBudWxsO1xuXHRNRkFTZXR1cDogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVNRkFTZXR1cE1vZGVsPj4gfCBudWxsO1xuXHRSZWNvdmVyeU1ldGhvZDogQXdhaXRlZDxcblx0XHRSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVSZWNvdmVyeU1ldGhvZE1vZGVsPlxuXHQ+IHwgbnVsbDtcblx0U2VjdXJpdHlFdmVudDogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTZWN1cml0eUV2ZW50TW9kZWw+PiB8IG51bGw7XG5cdFN1cHBvcnRSZXF1ZXN0OiBBd2FpdGVkPFxuXHRcdFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVN1cHBvcnRSZXF1ZXN0TW9kZWw+XG5cdD4gfCBudWxsO1xuXHRVc2VyOiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVVzZXJNb2RlbD4+IHwgbnVsbDtcblx0VXNlck1GQTogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVVc2VyTUZBTW9kZWw+PiB8IG51bGw7XG5cdFVzZXJTZXNzaW9uOiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVVzZXJTZXNzaW9uTW9kZWw+PiB8IG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTW9kZWxzKHNlcXVlbGl6ZTogU2VxdWVsaXplKTogUHJvbWlzZTxNb2RlbHMgfCBudWxsPiB7XG5cdGNvbnN0IGxvZ2dlciA9IGF3YWl0IFNlcnZpY2VGYWN0b3J5LmdldExvZ2dlclNlcnZpY2UoKTtcblx0Y29uc3QgZXJyb3JMb2dnZXIgPSBhd2FpdCBTZXJ2aWNlRmFjdG9yeS5nZXRFcnJvckxvZ2dlclNlcnZpY2UoKTtcblx0Y29uc3QgZXJyb3JIYW5kbGVyID0gYXdhaXQgU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JIYW5kbGVyU2VydmljZSgpO1xuXG5cdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFt7IG5hbWU6ICdzZXF1ZWxpemUnLCBpbnN0YW5jZTogc2VxdWVsaXplIH1dLCBsb2dnZXIpO1xuXG5cdHRyeSB7XG5cdFx0Y29uc3QgbW9kZWxzOiBNb2RlbHMgPSB7XG5cdFx0XHRBdWRpdExvZzogYXdhaXQgY3JlYXRlQXVkaXRMb2dNb2RlbCgpLFxuXHRcdFx0QmxvdEVudHJ5OiBhd2FpdCBjcmVhdGVCbG90RW50cnlNb2RlbCgpLFxuXHRcdFx0RGF0YVNoYXJlT3B0aW9uczogYXdhaXQgY3JlYXRlRGF0YVNoYXJlT3B0aW9uc01vZGVsKCksXG5cdFx0XHREZXZpY2U6IGF3YWl0IGNyZWF0ZURldmljZU1vZGVsKCksXG5cdFx0XHRFcnJvckxvZzogYXdhaXQgY3JlYXRlRXJyb3JMb2dNb2RlbCgpLFxuXHRcdFx0RmFpbGVkTG9naW5BdHRlbXB0czogYXdhaXQgY3JlYXRlRmFpbGVkTG9naW5BdHRlbXB0c01vZGVsKCksXG5cdFx0XHRGZWF0dXJlUmVxdWVzdDogYXdhaXQgY3JlYXRlRmVhdHVyZVJlcXVlc3RNb2RlbCgpLFxuXHRcdFx0RmVlZGJhY2tTdXJ2ZXk6IGF3YWl0IGNyZWF0ZUZlZWRiYWNrU3VydmV5TW9kZWwoKSxcblx0XHRcdE1GQVNldHVwOiBhd2FpdCBjcmVhdGVNRkFTZXR1cE1vZGVsKCksXG5cdFx0XHRSZWNvdmVyeU1ldGhvZDogYXdhaXQgY3JlYXRlUmVjb3ZlcnlNZXRob2RNb2RlbCgpLFxuXHRcdFx0U2VjdXJpdHlFdmVudDogYXdhaXQgY3JlYXRlU2VjdXJpdHlFdmVudE1vZGVsKCksXG5cdFx0XHRTdXBwb3J0UmVxdWVzdDogYXdhaXQgY3JlYXRlU3VwcG9ydFJlcXVlc3RNb2RlbCgpLFxuXHRcdFx0VXNlcjogYXdhaXQgY3JlYXRlVXNlck1vZGVsKCksXG5cdFx0XHRVc2VyTUZBOiBhd2FpdCBjcmVhdGVVc2VyTUZBTW9kZWwoKSxcblx0XHRcdFVzZXJTZXNzaW9uOiBhd2FpdCBjcmVhdGVVc2VyU2Vzc2lvbk1vZGVsKClcblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBbbW9kZWxOYW1lLCBtb2RlbEluc3RhbmNlXSBvZiBPYmplY3QuZW50cmllcyhtb2RlbHMpKSB7XG5cdFx0XHRpZiAoIW1vZGVsSW5zdGFuY2UpIHtcblx0XHRcdFx0Y29uc3QgZXJyb3JNZXNzYWdlID0gYE1vZGVsICR7bW9kZWxOYW1lfSBmYWlsZWQgdG8gaW5pdGlhbGl6ZWA7XG5cdFx0XHRcdGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBVc2VyID0gbW9kZWxzLlVzZXIhO1xuXHRcdGNvbnN0IEF1ZGl0TG9nID0gbW9kZWxzLkF1ZGl0TG9nITtcblx0XHRjb25zdCBGYWlsZWRMb2dpbkF0dGVtcHRzID0gbW9kZWxzLkZhaWxlZExvZ2luQXR0ZW1wdHMhO1xuXHRcdGNvbnN0IEJsb3RFbnRyeSA9IG1vZGVscy5CbG90RW50cnkhO1xuXHRcdGNvbnN0IFJlY292ZXJ5TWV0aG9kID0gbW9kZWxzLlJlY292ZXJ5TWV0aG9kITtcblx0XHRjb25zdCBTZWN1cml0eUV2ZW50ID0gbW9kZWxzLlNlY3VyaXR5RXZlbnQhO1xuXHRcdGNvbnN0IFN1cHBvcnRSZXF1ZXN0ID0gbW9kZWxzLlN1cHBvcnRSZXF1ZXN0ITtcblx0XHRjb25zdCBVc2VyU2Vzc2lvbiA9IG1vZGVscy5Vc2VyU2Vzc2lvbiE7XG5cdFx0Y29uc3QgVXNlck1GQSA9IG1vZGVscy5Vc2VyTUZBITtcblxuXHRcdFVzZXIuaGFzTWFueShBdWRpdExvZywgeyBmb3JlaWduS2V5OiAnaWQnLCBhczogJ2F1ZGl0TG9ncycgfSk7XG5cdFx0VXNlci5oYXNNYW55KEZhaWxlZExvZ2luQXR0ZW1wdHMsIHtcblx0XHRcdGZvcmVpZ25LZXk6ICdpZCcsXG5cdFx0XHRhczogJ2ZhaWxlZExvZ2luQXR0ZW1wdHMnXG5cdFx0fSk7XG5cdFx0VXNlci5oYXNNYW55KEJsb3RFbnRyeSwgeyBmb3JlaWduS2V5OiAnaWQnLCBhczogJ2d1ZXN0Ym9va0VudHJpZXMnIH0pO1xuXHRcdFVzZXIuaGFzTWFueShSZWNvdmVyeU1ldGhvZCwge1xuXHRcdFx0Zm9yZWlnbktleTogJ2lkJyxcblx0XHRcdGFzOiAncmVjb3ZlcnlNZXRob2RzJ1xuXHRcdH0pO1xuXHRcdFVzZXIuaGFzTWFueShTZWN1cml0eUV2ZW50LCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAnc2VjdXJpdHlFdmVudHMnIH0pO1xuXHRcdFVzZXIuaGFzTWFueShTdXBwb3J0UmVxdWVzdCwge1xuXHRcdFx0Zm9yZWlnbktleTogJ2lkJyxcblx0XHRcdGFzOiAnc3VwcG9ydFJlcXVlc3RzJ1xuXHRcdH0pO1xuXHRcdFVzZXIuaGFzTWFueShVc2VyU2Vzc2lvbiwgeyBmb3JlaWduS2V5OiAnaWQnLCBhczogJ3Nlc3Npb25zJyB9KTtcblx0XHRVc2VyLmhhc09uZShVc2VyTUZBLCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAndXNlcicgfSk7XG5cdFx0QXVkaXRMb2cuYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblx0XHRtb2RlbHMuRGF0YVNoYXJlT3B0aW9ucyEuYmVsb25nc1RvKFVzZXIsIHtcblx0XHRcdGZvcmVpZ25LZXk6ICdpZCcsXG5cdFx0XHRhczogJ3VzZXInXG5cdFx0fSk7XG5cdFx0bW9kZWxzLkRldmljZSEuYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblx0XHRGYWlsZWRMb2dpbkF0dGVtcHRzLmJlbG9uZ3NUbyhVc2VyLCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAndXNlcicgfSk7XG5cdFx0bW9kZWxzLkZlYXR1cmVSZXF1ZXN0IS5iZWxvbmdzVG8oVXNlciwge1xuXHRcdFx0Zm9yZWlnbktleTogJ2lkJyxcblx0XHRcdGFzOiAndXNlcidcblx0XHR9KTtcblx0XHRCbG90RW50cnkuYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblx0XHRtb2RlbHMuTUZBU2V0dXAhLmJlbG9uZ3NUbyhVc2VyLCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAndXNlcicgfSk7XG5cdFx0UmVjb3ZlcnlNZXRob2QuYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblx0XHRTZWN1cml0eUV2ZW50LmJlbG9uZ3NUbyhVc2VyLCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAndXNlcicgfSk7XG5cdFx0U3VwcG9ydFJlcXVlc3QuYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblx0XHRVc2VyTUZBLmJlbG9uZ3NUbyhVc2VyLCB7IGZvcmVpZ25LZXk6ICdpZCcsIGFzOiAndXNlcicgfSk7XG5cdFx0VXNlclNlc3Npb24uYmVsb25nc1RvKFVzZXIsIHsgZm9yZWlnbktleTogJ2lkJywgYXM6ICd1c2VyJyB9KTtcblxuXHRcdHJldHVybiBtb2RlbHM7XG5cdH0gY2F0Y2ggKGRiRXJyb3IpIHtcblx0XHRjb25zdCBkYlV0aWwgPSAnbG9hZE1vZGVscygpJztcblx0XHRjb25zdCBkYXRhYmFzZVJlY292ZXJhYmxlRXJyb3IgPVxuXHRcdFx0bmV3IGVycm9ySGFuZGxlci5FcnJvckNsYXNzZXMuRGF0YWJhc2VFcnJvclJlY292ZXJhYmxlKFxuXHRcdFx0XHRgRXJyb3Igb2NjdXJyZWQgd2hlbiBhdHRlbXB0aW5nIHRvIGV4ZWN1dGUgJHtkYlV0aWx9OiAke2RiRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGRiRXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gLFxuXHRcdFx0XHR7IGV4cG9zZVRvQ2xpZW50OiBmYWxzZSB9XG5cdFx0XHQpO1xuXHRcdGVycm9yTG9nZ2VyLmxvZ0Vycm9yKGRhdGFiYXNlUmVjb3ZlcmFibGVFcnJvci5tZXNzYWdlKTtcblxuXHRcdGF3YWl0IGVycm9ySGFuZGxlci5zZW5kQ2xpZW50RXJyb3JSZXNwb25zZSh7XG5cdFx0XHRtZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcblx0XHRcdHN0YXR1c0NvZGU6IDUwMCxcblx0XHRcdHJlc1xuXHRcdH0pO1xuXHRcdGVycm9ySGFuZGxlci5oYW5kbGVFcnJvcih7XG5cdFx0XHRlcnJvcjpcblx0XHRcdFx0ZGF0YWJhc2VSZWNvdmVyYWJsZUVycm9yIHx8IGRiRXJyb3IgfHwgRXJyb3IgfHwgJ1Vua25vd24gZXJyb3InXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuIl19
