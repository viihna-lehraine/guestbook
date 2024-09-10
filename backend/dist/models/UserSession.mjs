import { Model, DataTypes } from 'sequelize';
import { User } from './User.mjs';
import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
class UserSession extends Model {
	id;
	sessionId;
	ipAddress;
	userAgent;
	createdAt;
	updatedAt;
	expiresAt;
	isActive;
}
export default function createUserSessionModel(sequelize, logger) {
	try {
		validateDependencies(
			[
				{ name: 'sequelize', instance: sequelize },
				{ name: 'logger', instance: logger }
			],
			logger || console
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
							processError(error, logger || console);
							throw error;
						}
					},
					beforeUpdate: session => {
						try {
							session.updatedAt = new Date();
							logger.debug('Session updatedAt field updated');
						} catch (error) {
							processError(error, logger || console);
							throw error;
						}
					}
				}
			}
		);
		return UserSession;
	} catch (error) {
		processError(error, logger || console);
		throw error;
	}
}
export { UserSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL1VzZXJTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJTixLQUFLLEVBQ0wsU0FBUyxFQUVULE1BQU0sV0FBVyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFOUIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBYXJELE1BQU0sV0FDTCxTQUFRLEtBR1A7SUFHTSxFQUFFLENBQVU7SUFDWixTQUFTLENBQVU7SUFDbkIsU0FBUyxDQUFVO0lBQ25CLFNBQVMsQ0FBVTtJQUNuQixTQUFTLENBQTBCO0lBQ25DLFNBQVMsQ0FBZTtJQUN4QixTQUFTLENBQVE7SUFDakIsUUFBUSxDQUFXO0NBQzFCO0FBRUQsTUFBTSxDQUFDLE9BQU8sVUFBVSxzQkFBc0IsQ0FDN0MsU0FBb0IsRUFDcEIsTUFBYztJQUVkLElBQUksQ0FBQztRQUNKLG9CQUFvQixDQUNuQjtZQUNDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO1lBQzFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO1NBQ3BDLEVBQ0QsTUFBTSxJQUFJLE9BQU8sQ0FDakIsQ0FBQztRQUVGLFdBQVcsQ0FBQyxJQUFJLENBQ2Y7WUFDQyxFQUFFLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO2dCQUNwQixZQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU07Z0JBQzlCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsS0FBSztnQkFDaEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osVUFBVSxFQUFFO29CQUNYLEtBQUssRUFBRSxJQUFJO29CQUNYLEdBQUcsRUFBRSxJQUFJO2lCQUNUO2FBQ0Q7WUFDRCxTQUFTLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPO2dCQUN2QixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixNQUFNLEVBQUUsSUFBSTthQUNaO1lBQ0QsU0FBUyxFQUFFO2dCQUNWLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDdEIsU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLEVBQUUsSUFBSTtpQkFDVjthQUNEO1lBQ0QsU0FBUyxFQUFFO2dCQUNWLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDdEIsU0FBUyxFQUFFLEtBQUs7YUFDaEI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO2dCQUNwQixZQUFZLEVBQUUsU0FBUyxDQUFDLEdBQUc7Z0JBQzNCLFNBQVMsRUFBRSxLQUFLO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFO2dCQUNWLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtnQkFDcEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsWUFBWSxFQUFFLFNBQVM7YUFDdkI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO2dCQUNwQixTQUFTLEVBQUUsS0FBSzthQUNoQjtZQUNELFFBQVEsRUFBRTtnQkFDVCxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU87Z0JBQ3ZCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixTQUFTLEVBQUUsS0FBSzthQUNoQjtTQUNELEVBQ0Q7WUFDQyxTQUFTO1lBQ1QsU0FBUyxFQUFFLGFBQWE7WUFDeEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsS0FBSyxFQUFFO2dCQUNOLFlBQVksRUFBRSxDQUFDLE9BQW9CLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxDQUFDO3dCQUNKLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQzFCLE9BQU8sQ0FBQyxTQUFrQixDQUFDLE9BQU8sRUFBRTs0QkFDcEMsRUFBRSxHQUFHLEtBQUssQ0FDWCxDQUFDLENBQUMsNENBQTRDO3dCQUMvQyxNQUFNLENBQUMsS0FBSyxDQUNYLDJDQUEyQyxDQUMzQyxDQUFDO29CQUNILENBQUM7b0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzt3QkFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUM7d0JBQ3ZDLE1BQU0sS0FBSyxDQUFDO29CQUNiLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxZQUFZLEVBQUUsQ0FBQyxPQUFvQixFQUFFLEVBQUU7b0JBQ3RDLElBQUksQ0FBQzt3QkFDSixPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztvQkFDakQsQ0FBQztvQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO3dCQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQzt3QkFDdkMsTUFBTSxLQUFLLENBQUM7b0JBQ2IsQ0FBQztnQkFDRixDQUFDO2FBQ0Q7U0FDRCxDQUNELENBQUM7UUFFRixPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUN2QyxNQUFNLEtBQUssQ0FBQztJQUNiLENBQUM7QUFDRixDQUFDO0FBRUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0Q3JlYXRpb25PcHRpb25hbCxcblx0SW5mZXJBdHRyaWJ1dGVzLFxuXHRJbmZlckNyZWF0aW9uQXR0cmlidXRlcyxcblx0TW9kZWwsXG5cdERhdGFUeXBlcyxcblx0U2VxdWVsaXplXG59IGZyb20gJ3NlcXVlbGl6ZSc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4uL2NvbmZpZy9sb2dnZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZURlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBwcm9jZXNzRXJyb3IgfSBmcm9tICcuLi91dGlscy9wcm9jZXNzRXJyb3InO1xuXG5pbnRlcmZhY2UgVXNlclNlc3Npb25BdHRyaWJ1dGVzIHtcblx0aWQ6IHN0cmluZzsgLy8gVVVJRCBmb3IgdGhlIHNlc3Npb24gcmVjb3JkLCBwcmltYXJ5IGtleSAoZnJvbSBVc2VyIG1vZGVsKVxuXHRzZXNzaW9uSWQ6IG51bWJlcjtcblx0aXBBZGRyZXNzOiBzdHJpbmc7XG5cdHVzZXJBZ2VudDogc3RyaW5nO1xuXHRjcmVhdGVkQXQ6IERhdGU7XG5cdHVwZGF0ZWRBdD86IERhdGUgfCBudWxsO1xuXHRleHBpcmVzQXQ6IERhdGU7XG5cdGlzQWN0aXZlOiBib29sZWFuO1xufVxuXG5jbGFzcyBVc2VyU2Vzc2lvblxuXHRleHRlbmRzIE1vZGVsPFxuXHRcdEluZmVyQXR0cmlidXRlczxVc2VyU2Vzc2lvbj4sXG5cdFx0SW5mZXJDcmVhdGlvbkF0dHJpYnV0ZXM8VXNlclNlc3Npb24+XG5cdD5cblx0aW1wbGVtZW50cyBVc2VyU2Vzc2lvbkF0dHJpYnV0ZXNcbntcblx0cHVibGljIGlkITogc3RyaW5nO1xuXHRwdWJsaWMgc2Vzc2lvbklkITogbnVtYmVyO1xuXHRwdWJsaWMgaXBBZGRyZXNzITogc3RyaW5nO1xuXHRwdWJsaWMgdXNlckFnZW50ITogc3RyaW5nO1xuXHRwdWJsaWMgY3JlYXRlZEF0ITogQ3JlYXRpb25PcHRpb25hbDxEYXRlPjtcblx0cHVibGljIHVwZGF0ZWRBdCE6IERhdGUgfCBudWxsO1xuXHRwdWJsaWMgZXhwaXJlc0F0ITogRGF0ZTtcblx0cHVibGljIGlzQWN0aXZlITogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVXNlclNlc3Npb25Nb2RlbChcblx0c2VxdWVsaXplOiBTZXF1ZWxpemUsXG5cdGxvZ2dlcjogTG9nZ2VyXG4pOiB0eXBlb2YgVXNlclNlc3Npb24ge1xuXHR0cnkge1xuXHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0W1xuXHRcdFx0XHR7IG5hbWU6ICdzZXF1ZWxpemUnLCBpbnN0YW5jZTogc2VxdWVsaXplIH0sXG5cdFx0XHRcdHsgbmFtZTogJ2xvZ2dlcicsIGluc3RhbmNlOiBsb2dnZXIgfVxuXHRcdFx0XSxcblx0XHRcdGxvZ2dlciB8fCBjb25zb2xlXG5cdFx0KTtcblxuXHRcdFVzZXJTZXNzaW9uLmluaXQoXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlVVSUQsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBEYXRhVHlwZXMuVVVJRFY0LFxuXHRcdFx0XHRcdHByaW1hcnlLZXk6IHRydWUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZSxcblx0XHRcdFx0XHR1bmlxdWU6IHRydWUsXG5cdFx0XHRcdFx0cmVmZXJlbmNlczoge1xuXHRcdFx0XHRcdFx0bW9kZWw6IFVzZXIsXG5cdFx0XHRcdFx0XHRrZXk6ICdpZCdcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNlc3Npb25JZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5JTlRFR0VSLFxuXHRcdFx0XHRcdHByaW1hcnlLZXk6IHRydWUsXG5cdFx0XHRcdFx0YXV0b0luY3JlbWVudDogdHJ1ZSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHVuaXF1ZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpcEFkZHJlc3M6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdFx0dmFsaWRhdGU6IHtcblx0XHRcdFx0XHRcdGlzSVA6IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHVzZXJBZ2VudDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5TVFJJTkcsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjcmVhdGVkQXQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuREFURSxcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IERhdGFUeXBlcy5OT1csXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR1cGRhdGVkQXQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuREFURSxcblx0XHRcdFx0XHRhbGxvd051bGw6IHRydWUsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXhwaXJlc0F0OiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc0FjdGl2ZToge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5CT09MRUFOLFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNlcXVlbGl6ZSxcblx0XHRcdFx0bW9kZWxOYW1lOiAnVXNlclNlc3Npb24nLFxuXHRcdFx0XHR0aW1lc3RhbXBzOiB0cnVlLFxuXHRcdFx0XHRob29rczoge1xuXHRcdFx0XHRcdGJlZm9yZUNyZWF0ZTogKHNlc3Npb246IFVzZXJTZXNzaW9uKSA9PiB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRzZXNzaW9uLmV4cGlyZXNBdCA9IG5ldyBEYXRlKFxuXHRcdFx0XHRcdFx0XHRcdChzZXNzaW9uLmNyZWF0ZWRBdCBhcyBEYXRlKS5nZXRUaW1lKCkgK1xuXHRcdFx0XHRcdFx0XHRcdFx0NjAgKiA2MDAwMFxuXHRcdFx0XHRcdFx0XHQpOyAvLyBkZWZhdWx0OiBzZXNzaW9uIGV4cGlyZXMgYWZ0ZXIgNjAgbWludXRlc1xuXHRcdFx0XHRcdFx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHRcdFx0XHRcdFx0J1Nlc3Npb24gZXhwaXJhdGlvbiB0aW1lIHNldCB0byA2MCBtaW51dGVzJ1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIgfHwgY29uc29sZSk7XG5cdFx0XHRcdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YmVmb3JlVXBkYXRlOiAoc2Vzc2lvbjogVXNlclNlc3Npb24pID0+IHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHNlc3Npb24udXBkYXRlZEF0ID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKCdTZXNzaW9uIHVwZGF0ZWRBdCBmaWVsZCB1cGRhdGVkJyk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlciB8fCBjb25zb2xlKTtcblx0XHRcdFx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdHJldHVybiBVc2VyU2Vzc2lvbjtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlciB8fCBjb25zb2xlKTtcblx0XHR0aHJvdyBlcnJvcjtcblx0fVxufVxuXG5leHBvcnQgeyBVc2VyU2Vzc2lvbiB9O1xuIl19
