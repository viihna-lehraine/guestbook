import { DataTypes, Model } from 'sequelize';
import { User } from './User.mjs';
import { ServiceFactory } from '../index/factory/ServiceFactory.mjs';
export class AuditLog extends Model {
	auditId;
	id;
	actionType;
	actionDescription;
	affectedResource;
	previousValue;
	newValue;
	ipAddress;
	userAgent;
	auditLogDate;
	auditLogUpdateDate;
}
export async function createAuditLogModel() {
	const logger = await ServiceFactory.getLoggerService();
	const errorLogger = await ServiceFactory.getErrorLoggerService();
	const errorHandler = await ServiceFactory.getErrorHandlerService();
	try {
		const databaseController = await ServiceFactory.getDatabaseController();
		const sequelize = databaseController.getSequelizeInstance();
		if (!sequelize) {
			const databaseError =
				new errorHandler.ErrorClasses.DatabaseErrorRecoverable(
					'Failed to initialize AuditLog model: Sequelize instance not found',
					{ exposeToClient: false }
				);
			errorLogger.logError(databaseError.message);
			errorHandler.handleError({ error: databaseError });
			return null;
		}
		AuditLog.init(
			{
				auditId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
					allowNull: false,
					unique: true
				},
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					unique: true,
					allowNull: true,
					references: {
						model: User,
						key: 'id'
					}
				},
				actionType: {
					type: DataTypes.STRING,
					allowNull: false,
					validate: {
						isIn: [
							[
								'create',
								'update',
								'delete',
								'read',
								'login',
								'logout',
								'other'
							]
						]
					}
				},
				actionDescription: {
					type: DataTypes.TEXT,
					allowNull: true
				},
				affectedResource: {
					type: DataTypes.STRING,
					allowNull: true
				},
				previousValue: {
					type: DataTypes.TEXT,
					allowNull: true
				},
				newValue: {
					type: DataTypes.TEXT,
					allowNull: true
				},
				ipAddress: {
					type: DataTypes.STRING,
					allowNull: false,
					validate: {
						isIP: true
					}
				},
				userAgent: {
					type: DataTypes.STRING,
					allowNull: false
				},
				auditLogDate: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					allowNull: false
				},
				auditLogUpdateDate: {
					type: DataTypes.DATE,
					allowNull: true
				}
			},
			{
				sequelize,
				modelName: 'AuditLog',
				timestamps: true
			}
		);
		logger.debug('AuditLog model initialized successfully');
		return AuditLog;
	} catch (dbError) {
		const databaseError =
			new errorHandler.ErrorClasses.DatabaseErrorRecoverable(
				`Failed to initialize AuditLog model: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
				{
					exposeToClient: false
				}
			);
		errorLogger.logInfo(databaseError.message);
		errorHandler.handleError({ error: databaseError });
		return null;
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVkaXRMb2cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL0F1ZGl0TG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTixTQUFTLEVBR1QsS0FBSyxFQUNMLE1BQU0sV0FBVyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDOUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBR2pFLE1BQU0sT0FBTyxRQUNaLFNBQVEsS0FBbUU7SUFHcEUsT0FBTyxDQUFVO0lBQ2pCLEVBQUUsQ0FBaUI7SUFDbkIsVUFBVSxDQUFVO0lBQ3BCLGlCQUFpQixDQUFpQjtJQUNsQyxnQkFBZ0IsQ0FBaUI7SUFDakMsYUFBYSxDQUFpQjtJQUM5QixRQUFRLENBQWlCO0lBQ3pCLFNBQVMsQ0FBVTtJQUNuQixTQUFTLENBQVU7SUFDbkIsWUFBWSxDQUFRO0lBQ3BCLGtCQUFrQixDQUFlO0NBQ3hDO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxtQkFBbUI7SUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN2RCxNQUFNLFdBQVcsR0FBRyxNQUFNLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ2pFLE1BQU0sWUFBWSxHQUFHLE1BQU0sY0FBYyxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFFbkUsSUFBSSxDQUFDO1FBQ0osTUFBTSxrQkFBa0IsR0FBRyxNQUFNLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3hFLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFNUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sYUFBYSxHQUNsQixJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQ3JELG1FQUFtRSxFQUNuRSxFQUFFLGNBQWMs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T0FBTyxDQUFDLENBQUM7UUFDM0MsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztBQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHREYXRhVHlwZXMsXG5cdEluZmVyQXR0cmlidXRlcyxcblx0SW5mZXJDcmVhdGlvbkF0dHJpYnV0ZXMsXG5cdE1vZGVsXG59IGZyb20gJ3NlcXVlbGl6ZSc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyJztcbmltcG9ydCB7IFNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9TZXJ2aWNlRmFjdG9yeSc7XG5pbXBvcnQgeyBBdWRpdExvZ0F0dHJpYnV0ZXMgfSBmcm9tICcuLi9pbmRleC9pbnRlcmZhY2VzL21vZGVscyc7XG5cbmV4cG9ydCBjbGFzcyBBdWRpdExvZ1xuXHRleHRlbmRzIE1vZGVsPEluZmVyQXR0cmlidXRlczxBdWRpdExvZz4sIEluZmVyQ3JlYXRpb25BdHRyaWJ1dGVzPEF1ZGl0TG9nPj5cblx0aW1wbGVtZW50cyBBdWRpdExvZ0F0dHJpYnV0ZXNcbntcblx0cHVibGljIGF1ZGl0SWQhOiBzdHJpbmc7XG5cdHB1YmxpYyBpZD86IHN0cmluZyB8IG51bGw7XG5cdHB1YmxpYyBhY3Rpb25UeXBlITogc3RyaW5nO1xuXHRwdWJsaWMgYWN0aW9uRGVzY3JpcHRpb24hOiBzdHJpbmcgfCBudWxsO1xuXHRwdWJsaWMgYWZmZWN0ZWRSZXNvdXJjZSE6IHN0cmluZyB8IG51bGw7XG5cdHB1YmxpYyBwcmV2aW91c1ZhbHVlITogc3RyaW5nIHwgbnVsbDtcblx0cHVibGljIG5ld1ZhbHVlITogc3RyaW5nIHwgbnVsbDtcblx0cHVibGljIGlwQWRkcmVzcyE6IHN0cmluZztcblx0cHVibGljIHVzZXJBZ2VudCE6IHN0cmluZztcblx0cHVibGljIGF1ZGl0TG9nRGF0ZSE6IERhdGU7XG5cdHB1YmxpYyBhdWRpdExvZ1VwZGF0ZURhdGU/OiBEYXRlIHwgbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUF1ZGl0TG9nTW9kZWwoKTogUHJvbWlzZTx0eXBlb2YgQXVkaXRMb2cgfCBudWxsPiB7XG5cdGNvbnN0IGxvZ2dlciA9IGF3YWl0IFNlcnZpY2VGYWN0b3J5LmdldExvZ2dlclNlcnZpY2UoKTtcblx0Y29uc3QgZXJyb3JMb2dnZXIgPSBhd2FpdCBTZXJ2aWNlRmFjdG9yeS5nZXRFcnJvckxvZ2dlclNlcnZpY2UoKTtcblx0Y29uc3QgZXJyb3JIYW5kbGVyID0gYXdhaXQgU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JIYW5kbGVyU2VydmljZSgpO1xuXG5cdHRyeSB7XG5cdFx0Y29uc3QgZGF0YWJhc2VDb250cm9sbGVyID0gYXdhaXQgU2VydmljZUZhY3RvcnkuZ2V0RGF0YWJhc2VDb250cm9sbGVyKCk7XG5cdFx0Y29uc3Qgc2VxdWVsaXplID0gZGF0YWJhc2VDb250cm9sbGVyLmdldFNlcXVlbGl6ZUluc3RhbmNlKCk7XG5cblx0XHRpZiAoIXNlcXVlbGl6ZSkge1xuXHRcdFx0Y29uc3QgZGF0YWJhc2VFcnJvciA9XG5cdFx0XHRcdG5ldyBlcnJvckhhbmRsZXIuRXJyb3JDbGFzc2VzLkRhdGFiYXNlRXJyb3JSZWNvdmVyYWJsZShcblx0XHRcdFx0XHQnRmFpbGVkIHRvIGluaXRpYWxpemUgQXVkaXRMb2cgbW9kZWw6IFNlcXVlbGl6ZSBpbnN0YW5jZSBub3QgZm91bmQnLFxuXHRcdFx0XHRcdHsgZXhwb3NlVG9DbGllbnQ6IGZhbHNlIH1cblx0XHRcdFx0KTtcblx0XHRcdGVycm9yTG9nZ2VyLmxvZ0Vycm9yKGRhdGFiYXNlRXJyb3IubWVzc2FnZSk7XG5cdFx0XHRlcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoeyBlcnJvcjogZGF0YWJhc2VFcnJvciB9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdEF1ZGl0TG9nLmluaXQoXG5cdFx0XHR7XG5cdFx0XHRcdGF1ZGl0SWQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuVVVJRCxcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IERhdGFUeXBlcy5VVUlEVjQsXG5cdFx0XHRcdFx0cHJpbWFyeUtleTogdHJ1ZSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHVuaXF1ZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5VVUlELFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLlVVSURWNCxcblx0XHRcdFx0XHR1bmlxdWU6IHRydWUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiB0cnVlLFxuXHRcdFx0XHRcdHJlZmVyZW5jZXM6IHtcblx0XHRcdFx0XHRcdG1vZGVsOiBVc2VyLFxuXHRcdFx0XHRcdFx0a2V5OiAnaWQnXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhY3Rpb25UeXBlOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHZhbGlkYXRlOiB7XG5cdFx0XHRcdFx0XHRpc0luOiBbXG5cdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHQnY3JlYXRlJyxcblx0XHRcdFx0XHRcdFx0XHQndXBkYXRlJyxcblx0XHRcdFx0XHRcdFx0XHQnZGVsZXRlJyxcblx0XHRcdFx0XHRcdFx0XHQncmVhZCcsXG5cdFx0XHRcdFx0XHRcdFx0J2xvZ2luJyxcblx0XHRcdFx0XHRcdFx0XHQnbG9nb3V0Jyxcblx0XHRcdFx0XHRcdFx0XHQnb3RoZXInXG5cdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFjdGlvbkRlc2NyaXB0aW9uOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlRFWFQsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmZmVjdGVkUmVzb3VyY2U6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmV2aW91c1ZhbHVlOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlRFWFQsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5ld1ZhbHVlOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlRFWFQsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGlwQWRkcmVzczoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5TVFJJTkcsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZSxcblx0XHRcdFx0XHR2YWxpZGF0ZToge1xuXHRcdFx0XHRcdFx0aXNJUDogdHJ1ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0dXNlckFnZW50OiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGF1ZGl0TG9nRGF0ZToge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5EQVRFLFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLk5PVyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGF1ZGl0TG9nVXBkYXRlRGF0ZToge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5EQVRFLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzZXF1ZWxpemUsXG5cdFx0XHRcdG1vZGVsTmFtZTogJ0F1ZGl0TG9nJyxcblx0XHRcdFx0dGltZXN0YW1wczogdHJ1ZVxuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHRsb2dnZXIuZGVidWcoJ0F1ZGl0TG9nIG1vZGVsIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xuXHRcdHJldHVybiBBdWRpdExvZztcblx0fSBjYXRjaCAoZGJFcnJvcikge1xuXHRcdGNvbnN0IGRhdGFiYXNlRXJyb3IgPVxuXHRcdFx0bmV3IGVycm9ySGFuZGxlci5FcnJvckNsYXNzZXMuRGF0YWJhc2VFcnJvclJlY292ZXJhYmxlKFxuXHRcdFx0XHRgRmFpbGVkIHRvIGluaXRpYWxpemUgQXVkaXRMb2cgbW9kZWw6ICR7ZGJFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZGJFcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWAsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRleHBvc2VUb0NsaWVudDogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHRlcnJvckxvZ2dlci5sb2dJbmZvKGRhdGFiYXNlRXJyb3IubWVzc2FnZSk7XG5cdFx0ZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKHsgZXJyb3I6IGRhdGFiYXNlRXJyb3IgfSk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cbiJdfQ==
