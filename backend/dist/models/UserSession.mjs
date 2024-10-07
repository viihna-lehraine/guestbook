import { Model, DataTypes } from 'sequelize';
import { User } from './User.mjs';
import { validateDependencies } from '../utils/helpers.mjs';
import { ServiceFactory } from '../index/factory/ServiceFactory.mjs';
export class UserSession extends Model {
	id;
	sessionId;
	ipAddress;
	userAgent;
	createdAt;
	updatedAt;
	expiresAt;
	isActive;
}
export async function createUserSessionModel() {
	const logger = await ServiceFactory.getLoggerService();
	const errorLogger = await ServiceFactory.getErrorLoggerService();
	const errorHandler = await ServiceFactory.getErrorHandlerService();
	try {
		const databaseController = await ServiceFactory.getDatabaseController();
		const sequelize = databaseController.getSequelizeInstance();
		if (!sequelize) {
			const databaseError =
				new errorHandler.ErrorClasses.DatabaseErrorRecoverable(
					'Failed to initialize UserSession model: Sequelize instance not found',
					{ exposeToClient: false }
				);
			errorLogger.logError(databaseError.message);
			errorHandler.handleError({ error: databaseError });
			return null;
		}
		validateDependencies(
			[{ name: 'sequelize', instance: sequelize }],
			logger
		);
		UserSession.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
					allowNull: false,
					unique: true,
					references: {
						model: User,
						key: 'id'
					}
				},
				sessionId: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false,
					unique: true
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
				createdAt: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					allowNull: false
				},
				updatedAt: {
					type: DataTypes.DATE,
					allowNull: true,
					defaultValue: undefined
				},
				expiresAt: {
					type: DataTypes.DATE,
					allowNull: false
				},
				isActive: {
					type: DataTypes.BOOLEAN,
					defaultValue: true,
					allowNull: false
				}
			},
			{
				sequelize,
				modelName: 'UserSession',
				timestamps: true,
				hooks: {
					beforeCreate: session => {
						try {
							session.expiresAt = new Date(
								session.createdAt.getTime() + 60 * 60000
							); // default: session expires after 60 minutes
							logger.debug(
								'Session expiration time set to 60 minutes'
							);
						} catch (error) {
							errorHandler.handleError({ error });
							throw error;
						}
					},
					beforeUpdate: session => {
						try {
							session.updatedAt = new Date();
							logger.debug('Session updatedAt field updated');
						} catch (error) {
							errorHandler.handleError({ error });
							throw error;
						}
					}
				}
			}
		);
		return UserSession;
	} catch (dbError) {
		const databaseError =
			new errorHandler.ErrorClasses.DatabaseErrorRecoverable(
				`Failed to initialize UserSession model: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
				{
					exposeToClient: false
				}
			);
		errorLogger.logError(databaseError.message);
		errorHandler.handleError({ error: databaseError });
		return {};
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL1VzZXJTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTixLQUFLLEVBQ0wsU0FBUyxFQUNULE1BQU0sV0FBVyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDOUIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBR2pFLE1BQU0sT0FBTyxXQUNaLFNBQVEsS0FHUDtJQUdNLEVBQUUsQ0FBVTtJQUNaLFNBQVMsQ0FBVTtJQUNuQixTQUFTLENBQVU7SUFDbkIsU0FBUyxDQUFVO0lBQ25CLFNBQVMsQ0FBMEI7SUFDbkMsU0FBUyxDQUFlO0lBQ3hCLFNBQVMsQ0FBUTtJQUNqQixRQUFRLENBQVc7Q0FDMUI7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLHNCQUFzQjtJQUczQyxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3ZELE1BQU0sV0FBVyxHQUFHLE1BQU0sY0FBYyxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDakUsTUFBTSxZQUFZLEdBQUcsTUFBTSxjQUFjLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUVuRSxJQUFJLENBQUM7UUFDSixNQUFNLGtCQUFrQixHQUFHLE1BQU0sY0FBYyxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDeEUsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUU1RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEIsTUFBTSxhQUFhLEdBQ2xCLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FDckQsc0VBQXNFLEVBQ3RFLEVBQUUsY0FBYyxFQUFFLEtBQUss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QkFDaEIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7d0JBQ3BDLE1BQU0sS0FBSyxDQUFDO29CQUNiLENBQUM7Z0JBQ0YsQ0FBQzthQUNEO1NBQ0QsQ0FDRCxDQUFDO1FBRUYsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQUFDLE9BQU8sT0FBTyxFQUFFLENBQUM7UUFDbEIsTUFBTSxhQUFhLEdBQ2xCLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FDckQsMkNBQTJDLE9BQU8sWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUN6RztZQUNDLGNBQWMsRUFBRSxLQUFLO1NBQ3JCLENBQ0QsQ0FBQztRQUNILFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNuRCxPQUFPLEVBQXdCLENBQUM7SUFDakMsQ0FBQztBQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRDcmVhdGlvbk9wdGlvbmFsLFxuXHRJbmZlckF0dHJpYnV0ZXMsXG5cdEluZmVyQ3JlYXRpb25BdHRyaWJ1dGVzLFxuXHRNb2RlbCxcblx0RGF0YVR5cGVzXG59IGZyb20gJ3NlcXVlbGl6ZSc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyJztcbmltcG9ydCB7IHZhbGlkYXRlRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgeyBTZXJ2aWNlRmFjdG9yeSB9IGZyb20gJy4uL2luZGV4L2ZhY3RvcnkvU2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgVXNlclNlc3Npb25BdHRyaWJ1dGVzIH0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tb2RlbHMnO1xuXG5leHBvcnQgY2xhc3MgVXNlclNlc3Npb25cblx0ZXh0ZW5kcyBNb2RlbDxcblx0XHRJbmZlckF0dHJpYnV0ZXM8VXNlclNlc3Npb24+LFxuXHRcdEluZmVyQ3JlYXRpb25BdHRyaWJ1dGVzPFVzZXJTZXNzaW9uPlxuXHQ+XG5cdGltcGxlbWVudHMgVXNlclNlc3Npb25BdHRyaWJ1dGVzXG57XG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblx0cHVibGljIHNlc3Npb25JZCE6IG51bWJlcjtcblx0cHVibGljIGlwQWRkcmVzcyE6IHN0cmluZztcblx0cHVibGljIHVzZXJBZ2VudCE6IHN0cmluZztcblx0cHVibGljIGNyZWF0ZWRBdCE6IENyZWF0aW9uT3B0aW9uYWw8RGF0ZT47XG5cdHB1YmxpYyB1cGRhdGVkQXQhOiBEYXRlIHwgbnVsbDtcblx0cHVibGljIGV4cGlyZXNBdCE6IERhdGU7XG5cdHB1YmxpYyBpc0FjdGl2ZSE6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVVc2VyU2Vzc2lvbk1vZGVsKCk6IFByb21pc2U8XG5cdHR5cGVvZiBVc2VyU2Vzc2lvbiB8IG51bGxcbj4ge1xuXHRjb25zdCBsb2dnZXIgPSBhd2FpdCBTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXJTZXJ2aWNlKCk7XG5cdGNvbnN0IGVycm9yTG9nZ2VyID0gYXdhaXQgU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JMb2dnZXJTZXJ2aWNlKCk7XG5cdGNvbnN0IGVycm9ySGFuZGxlciA9IGF3YWl0IFNlcnZpY2VGYWN0b3J5LmdldEVycm9ySGFuZGxlclNlcnZpY2UoKTtcblxuXHR0cnkge1xuXHRcdGNvbnN0IGRhdGFiYXNlQ29udHJvbGxlciA9IGF3YWl0IFNlcnZpY2VGYWN0b3J5LmdldERhdGFiYXNlQ29udHJvbGxlcigpO1xuXHRcdGNvbnN0IHNlcXVlbGl6ZSA9IGRhdGFiYXNlQ29udHJvbGxlci5nZXRTZXF1ZWxpemVJbnN0YW5jZSgpO1xuXG5cdFx0aWYgKCFzZXF1ZWxpemUpIHtcblx0XHRcdGNvbnN0IGRhdGFiYXNlRXJyb3IgPVxuXHRcdFx0XHRuZXcgZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5EYXRhYmFzZUVycm9yUmVjb3ZlcmFibGUoXG5cdFx0XHRcdFx0J0ZhaWxlZCB0byBpbml0aWFsaXplIFVzZXJTZXNzaW9uIG1vZGVsOiBTZXF1ZWxpemUgaW5zdGFuY2Ugbm90IGZvdW5kJyxcblx0XHRcdFx0XHR7IGV4cG9zZVRvQ2xpZW50OiBmYWxzZSB9XG5cdFx0XHRcdCk7XG5cdFx0XHRlcnJvckxvZ2dlci5sb2dFcnJvcihkYXRhYmFzZUVycm9yLm1lc3NhZ2UpO1xuXHRcdFx0ZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKHsgZXJyb3I6IGRhdGFiYXNlRXJyb3IgfSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0XHRbeyBuYW1lOiAnc2VxdWVsaXplJywgaW5zdGFuY2U6IHNlcXVlbGl6ZSB9XSxcblx0XHRcdGxvZ2dlclxuXHRcdCk7XG5cblx0XHRVc2VyU2Vzc2lvbi5pbml0KFxuXHRcdFx0e1xuXHRcdFx0XHRpZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5VVUlELFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLlVVSURWNCxcblx0XHRcdFx0XHRwcmltYXJ5S2V5OiB0cnVlLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdFx0dW5pcXVlOiB0cnVlLFxuXHRcdFx0XHRcdHJlZmVyZW5jZXM6IHtcblx0XHRcdFx0XHRcdG1vZGVsOiBVc2VyLFxuXHRcdFx0XHRcdFx0a2V5OiAnaWQnXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXNzaW9uSWQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuSU5URUdFUixcblx0XHRcdFx0XHRwcmltYXJ5S2V5OiB0cnVlLFxuXHRcdFx0XHRcdGF1dG9JbmNyZW1lbnQ6IHRydWUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZSxcblx0XHRcdFx0XHR1bmlxdWU6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0aXBBZGRyZXNzOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHZhbGlkYXRlOiB7XG5cdFx0XHRcdFx0XHRpc0lQOiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR1c2VyQWdlbnQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0Y3JlYXRlZEF0OiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBEYXRhVHlwZXMuTk9XLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0dXBkYXRlZEF0OiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiB0cnVlLFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGV4cGlyZXNBdDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5EQVRFLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0aXNBY3RpdmU6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuQk9PTEVBTixcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IHRydWUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzZXF1ZWxpemUsXG5cdFx0XHRcdG1vZGVsTmFtZTogJ1VzZXJTZXNzaW9uJyxcblx0XHRcdFx0dGltZXN0YW1wczogdHJ1ZSxcblx0XHRcdFx0aG9va3M6IHtcblx0XHRcdFx0XHRiZWZvcmVDcmVhdGU6IChzZXNzaW9uOiBVc2VyU2Vzc2lvbikgPT4ge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0c2Vzc2lvbi5leHBpcmVzQXQgPSBuZXcgRGF0ZShcblx0XHRcdFx0XHRcdFx0XHQoc2Vzc2lvbi5jcmVhdGVkQXQgYXMgRGF0ZSkuZ2V0VGltZSgpICtcblx0XHRcdFx0XHRcdFx0XHRcdDYwICogNjAwMDBcblx0XHRcdFx0XHRcdFx0KTsgLy8gZGVmYXVsdDogc2Vzc2lvbiBleHBpcmVzIGFmdGVyIDYwIG1pbnV0ZXNcblx0XHRcdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKFxuXHRcdFx0XHRcdFx0XHRcdCdTZXNzaW9uIGV4cGlyYXRpb24gdGltZSBzZXQgdG8gNjAgbWludXRlcydcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdGVycm9ySGFuZGxlci5oYW5kbGVFcnJvcih7IGVycm9yIH0pO1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGJlZm9yZVVwZGF0ZTogKHNlc3Npb246IFVzZXJTZXNzaW9uKSA9PiB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRzZXNzaW9uLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZygnU2Vzc2lvbiB1cGRhdGVkQXQgZmllbGQgdXBkYXRlZCcpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0ZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKHsgZXJyb3IgfSk7XG5cdFx0XHRcdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gVXNlclNlc3Npb247XG5cdH0gY2F0Y2ggKGRiRXJyb3IpIHtcblx0XHRjb25zdCBkYXRhYmFzZUVycm9yID1cblx0XHRcdG5ldyBlcnJvckhhbmRsZXIuRXJyb3JDbGFzc2VzLkRhdGFiYXNlRXJyb3JSZWNvdmVyYWJsZShcblx0XHRcdFx0YEZhaWxlZCB0byBpbml0aWFsaXplIFVzZXJTZXNzaW9uIG1vZGVsOiAke2RiRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGRiRXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZXhwb3NlVG9DbGllbnQ6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0ZXJyb3JMb2dnZXIubG9nRXJyb3IoZGF0YWJhc2VFcnJvci5tZXNzYWdlKTtcblx0XHRlcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoeyBlcnJvcjogZGF0YWJhc2VFcnJvciB9KTtcblx0XHRyZXR1cm4ge30gYXMgdHlwZW9mIFVzZXJTZXNzaW9uO1xuXHR9XG59XG4iXX0=
