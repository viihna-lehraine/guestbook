import { Model, DataTypes } from 'sequelize';
import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
import { User } from './User.mjs';
class RecoveryMethod extends Model {
	id;
	isRecoveryActive;
	recoveryId;
	recoveryMethod;
	backupCodes;
	recoveryLastUpdated;
}
export default function createRecoveryMethodModel(sequelize, logger) {
	try {
		validateDependencies(
			[{ name: 'sequelize', instance: sequelize }],
			logger || console
		);
		RecoveryMethod.init(
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
				isRecoveryActive: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
					allowNull: false
				},
				recoveryId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
					allowNull: false,
					unique: true
				},
				recoveryMethod: {
					type: DataTypes.ENUM('email', 'backupCodes'),
					allowNull: true
				},
				backupCodes: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				recoveryLastUpdated: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					allowNull: false
				}
			},
			{
				sequelize,
				modelName: 'RecoveryMethod',
				timestamps: true
			}
		);
		return RecoveryMethod;
	} catch (error) {
		processError(error, logger || console);
		throw error;
	}
}
export { RecoveryMethod };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlcnlNZXRob2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL1JlY292ZXJ5TWV0aG9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTixLQUFLLEVBQ0wsU0FBUyxFQUVULE1BQU0sV0FBVyxDQUFDO0FBRW5CLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBVzlCLE1BQU0sY0FDTCxTQUFRLEtBR1A7SUFHTSxFQUFFLENBQVU7SUFDWixnQkFBZ0IsQ0FBVztJQUMzQixVQUFVLENBQVU7SUFDcEIsY0FBYyxDQUFrQztJQUNoRCxXQUFXLENBQW1CO0lBQzlCLG1CQUFtQixDQUEwQjtDQUNwRDtBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUseUJBQXlCLENBQ2hELFNBQW9CLEVBQ3BCLE1BQWM7SUFFZCxJQUFJLENBQUM7UUFDSixvQkFBb0IsQ0FDbkIsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQzVDLE1BQU0sSUFBSSxPQUFPLENBQ2pCLENBQUM7UUFFRixjQUFjLENBQUMsSUFBSSxDQUNsQjtZQUNDLEVBQUUsRUFBRTtnQkFDSCxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7Z0JBQ3BCLFlBQVksRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDOUIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixNQUFNLEVBQUUsSUFBSTtnQkFDWixVQUFVLEVBQUU7b0JBQ1gsS0FBSyxFQUFFLElBQUk7b0JBQ1gsR0FBRyxFQUFFLElBQUk7aUJBQ1Q7YUFDRDtZQUNELGdCQUFnQixFQUFFO2dCQUNqQixJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU87Z0JBQ3ZCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixTQUFTLEVBQUUsS0FBSzthQUNoQjtZQUNELFVBQVUsRUFBRTtnQkFDWCxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7Z0JBQ3BCLFlBQVksRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDOUIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixNQUFNLEVBQUUsSUFBSTthQUNaO1lBQ0QsY0FBYyxFQUFFO2dCQUNmLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUM7Z0JBQzVDLFNBQVMsRUFBRSxJQUFJO2FBQ2Y7WUFDRCxXQUFXLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztnQkFDdkMsU0FBUyxFQUFFLElBQUk7YUFDZjtZQUNELG1CQUFtQixFQUFFO2dCQUNwQixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7Z0JBQ3BCLFlBQVksRUFBRSxTQUFTLENBQUMsR0FBRztnQkFDM0IsU0FBUyxFQUFFLEtBQUs7YUFDaEI7U0FDRCxFQUNEO1lBQ0MsU0FBUztZQUNULFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0IsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FDRCxDQUFDO1FBRUYsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUM7UUFDdkMsTUFBTSxLQUFLLENBQUM7SUFDYixDQUFDO0FBQ0YsQ0FBQztBQUVELE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdENyZWF0aW9uT3B0aW9uYWwsXG5cdEluZmVyQXR0cmlidXRlcyxcblx0SW5mZXJDcmVhdGlvbkF0dHJpYnV0ZXMsXG5cdE1vZGVsLFxuXHREYXRhVHlwZXMsXG5cdFNlcXVlbGl6ZVxufSBmcm9tICdzZXF1ZWxpemUnO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5pbXBvcnQgeyB2YWxpZGF0ZURlcGVuZGVuY2llcyB9IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRlRGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IHByb2Nlc3NFcnJvciB9IGZyb20gJy4uL3V0aWxzL3Byb2Nlc3NFcnJvcic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyJztcblxuaW50ZXJmYWNlIFJlY292ZXJ5TWV0aG9kQXR0cmlidXRlcyB7XG5cdGlkOiBzdHJpbmc7IC8vIFVVSUQgZm9yIHJlY292ZXJ5IG1ldGhvZCwgcHJpbWFyeSBrZXkgKGZyb20gVXNlciBtb2RlbClcblx0aXNSZWNvdmVyeUFjdGl2ZTogYm9vbGVhbjtcblx0cmVjb3ZlcnlJZDogc3RyaW5nOyAvLyBVVUlEIGZvciByZWNvdmVyeSBtZXRob2QsIHByaW1hcnkga2V5XG5cdHJlY292ZXJ5TWV0aG9kPzogJ2VtYWlsJyB8ICdiYWNrdXBDb2RlcycgfCBudWxsO1xuXHRiYWNrdXBDb2Rlcz86IHN0cmluZ1tdIHwgbnVsbDtcblx0cmVjb3ZlcnlMYXN0VXBkYXRlZDogRGF0ZTtcbn1cblxuY2xhc3MgUmVjb3ZlcnlNZXRob2Rcblx0ZXh0ZW5kcyBNb2RlbDxcblx0XHRJbmZlckF0dHJpYnV0ZXM8UmVjb3ZlcnlNZXRob2Q+LFxuXHRcdEluZmVyQ3JlYXRpb25BdHRyaWJ1dGVzPFJlY292ZXJ5TWV0aG9kPlxuXHQ+XG5cdGltcGxlbWVudHMgUmVjb3ZlcnlNZXRob2RBdHRyaWJ1dGVzXG57XG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblx0cHVibGljIGlzUmVjb3ZlcnlBY3RpdmUhOiBib29sZWFuO1xuXHRwdWJsaWMgcmVjb3ZlcnlJZCE6IHN0cmluZztcblx0cHVibGljIHJlY292ZXJ5TWV0aG9kPzogJ2VtYWlsJyB8ICdiYWNrdXBDb2RlcycgfCBudWxsO1xuXHRwdWJsaWMgYmFja3VwQ29kZXMhOiBzdHJpbmdbXSB8IG51bGw7XG5cdHB1YmxpYyByZWNvdmVyeUxhc3RVcGRhdGVkITogQ3JlYXRpb25PcHRpb25hbDxEYXRlPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUmVjb3ZlcnlNZXRob2RNb2RlbChcblx0c2VxdWVsaXplOiBTZXF1ZWxpemUsXG5cdGxvZ2dlcjogTG9nZ2VyXG4pOiB0eXBlb2YgUmVjb3ZlcnlNZXRob2Qge1xuXHR0cnkge1xuXHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0W3sgbmFtZTogJ3NlcXVlbGl6ZScsIGluc3RhbmNlOiBzZXF1ZWxpemUgfV0sXG5cdFx0XHRsb2dnZXIgfHwgY29uc29sZVxuXHRcdCk7XG5cblx0XHRSZWNvdmVyeU1ldGhvZC5pbml0KFxuXHRcdFx0e1xuXHRcdFx0XHRpZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5VVUlELFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLlVVSURWNCxcblx0XHRcdFx0XHRwcmltYXJ5S2V5OiB0cnVlLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdFx0dW5pcXVlOiB0cnVlLFxuXHRcdFx0XHRcdHJlZmVyZW5jZXM6IHtcblx0XHRcdFx0XHRcdG1vZGVsOiBVc2VyLFxuXHRcdFx0XHRcdFx0a2V5OiAnaWQnXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc1JlY292ZXJ5QWN0aXZlOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkJPT0xFQU4sXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlY292ZXJ5SWQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuVVVJRCxcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IERhdGFUeXBlcy5VVUlEVjQsXG5cdFx0XHRcdFx0cHJpbWFyeUtleTogdHJ1ZSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHVuaXF1ZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZWNvdmVyeU1ldGhvZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5FTlVNKCdlbWFpbCcsICdiYWNrdXBDb2RlcycpLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRiYWNrdXBDb2Rlczoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5BUlJBWShEYXRhVHlwZXMuU1RSSU5HKSxcblx0XHRcdFx0XHRhbGxvd051bGw6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0cmVjb3ZlcnlMYXN0VXBkYXRlZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5EQVRFLFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLk5PVyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNlcXVlbGl6ZSxcblx0XHRcdFx0bW9kZWxOYW1lOiAnUmVjb3ZlcnlNZXRob2QnLFxuXHRcdFx0XHR0aW1lc3RhbXBzOiB0cnVlXG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdHJldHVybiBSZWNvdmVyeU1ldGhvZDtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlciB8fCBjb25zb2xlKTtcblx0XHR0aHJvdyBlcnJvcjtcblx0fVxufVxuXG5leHBvcnQgeyBSZWNvdmVyeU1ldGhvZCB9O1xuIl19
