import { Model, DataTypes } from 'sequelize';
class SecurityEvent extends Model {
	id;
	eventId;
	eventType;
	eventDescription;
	ipAddress;
	userAgent;
	securityEventDate;
	securityEventLastUpdated;
}
export default function createSecurityEventModel(sequelize) {
	SecurityEvent.init(
		{
			id: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true
			},
			eventId: {
				type: DataTypes.STRING,
				allowNull: false
			},
			eventType: {
				type: DataTypes.STRING,
				allowNull: false
			},
			eventDescription: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			ipAddress: {
				type: DataTypes.STRING,
				allowNull: false
			},
			userAgent: {
				type: DataTypes.STRING,
				allowNull: false
			},
			securityEventDate: {
				type: DataTypes.DATE,
				allowNull: false
			},
			securityEventLastUpdated: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			}
		},
		{
			sequelize,
			tableName: 'SecurityEvents',
			timestamps: false
		}
	);
	return SecurityEvent;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHlFdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvU2VjdXJpdHlFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBSU4sS0FBSyxFQUNMLFNBQVMsRUFFVCxNQUFNLFdBQVcsQ0FBQztBQWFuQixNQUFNLGFBQ0wsU0FBUSxLQUdQO0lBR0QsRUFBRSxDQUFVO0lBQ1osT0FBTyxDQUFVO0lBQ2pCLFNBQVMsQ0FBVTtJQUNuQixnQkFBZ0IsQ0FBaUI7SUFDakMsU0FBUyxDQUFVO0lBQ25CLFNBQVMsQ0FBVTtJQUNuQixpQkFBaUIsQ0FBUTtJQUN6Qix3QkFBd0IsQ0FBMEI7Q0FDbEQ7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLHdCQUF3QixDQUMvQyxTQUFvQjtJQUVwQixhQUFhLENBQUMsSUFBSSxDQUNqQjtRQUNDLEVBQUUsRUFBRTtZQUNILElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsS0FBSztZQUNoQixVQUFVLEVBQUUsSUFBSTtTQUNoQjtRQUNELE9BQU8sRUFBRTtZQUNSLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsS0FBSztTQUNoQjtRQUNELFNBQVMsRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsS0FBSztTQUNoQjtRQUNELGdCQUFnQixFQUFFO1lBQ2pCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtZQUNwQixTQUFTLEVBQUUsSUFBSTtTQUNmO1FBQ0QsU0FBUyxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3RCLFNBQVMsRUFBRSxLQUFLO1NBQ2hCO1FBQ0QsU0FBUyxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3RCLFNBQVMsRUFBRSxLQUFLO1NBQ2hCO1FBQ0QsaUJBQWlCLEVBQUU7WUFDbEIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxLQUFLO1NBQ2hCO1FBQ0Qsd0JBQXdCLEVBQUU7WUFDekIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFlBQVksRUFBRSxTQUFTLENBQUMsR0FBRztTQUMzQjtLQUNELEVBQ0Q7UUFDQyxTQUFTO1FBQ1QsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixVQUFVLEVBQUUsS0FBSztLQUNqQixDQUNELENBQUM7SUFFRixPQUFPLGFBQWEsQ0FBQztBQUN0QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0Q3JlYXRpb25PcHRpb25hbCxcblx0SW5mZXJBdHRyaWJ1dGVzLFxuXHRJbmZlckNyZWF0aW9uQXR0cmlidXRlcyxcblx0TW9kZWwsXG5cdERhdGFUeXBlcyxcblx0U2VxdWVsaXplXG59IGZyb20gJ3NlcXVlbGl6ZSc7XG5cbmludGVyZmFjZSBTZWN1cml0eUV2ZW50QXR0cmlidXRlcyB7XG5cdGlkOiBzdHJpbmc7XG5cdGV2ZW50SWQ6IHN0cmluZztcblx0ZXZlbnRUeXBlOiBzdHJpbmc7XG5cdGV2ZW50RGVzY3JpcHRpb24/OiBzdHJpbmcgfCBudWxsO1xuXHRpcEFkZHJlc3M6IHN0cmluZztcblx0dXNlckFnZW50OiBzdHJpbmc7XG5cdHNlY3VyaXR5RXZlbnREYXRlOiBEYXRlO1xuXHRzZWN1cml0eUV2ZW50TGFzdFVwZGF0ZWQ6IERhdGU7XG59XG5cbmNsYXNzIFNlY3VyaXR5RXZlbnRcblx0ZXh0ZW5kcyBNb2RlbDxcblx0XHRJbmZlckF0dHJpYnV0ZXM8U2VjdXJpdHlFdmVudD4sXG5cdFx0SW5mZXJDcmVhdGlvbkF0dHJpYnV0ZXM8U2VjdXJpdHlFdmVudD5cblx0PlxuXHRpbXBsZW1lbnRzIFNlY3VyaXR5RXZlbnRBdHRyaWJ1dGVzXG57XG5cdGlkITogc3RyaW5nO1xuXHRldmVudElkITogc3RyaW5nO1xuXHRldmVudFR5cGUhOiBzdHJpbmc7XG5cdGV2ZW50RGVzY3JpcHRpb24hOiBzdHJpbmcgfCBudWxsO1xuXHRpcEFkZHJlc3MhOiBzdHJpbmc7XG5cdHVzZXJBZ2VudCE6IHN0cmluZztcblx0c2VjdXJpdHlFdmVudERhdGUhOiBEYXRlO1xuXHRzZWN1cml0eUV2ZW50TGFzdFVwZGF0ZWQhOiBDcmVhdGlvbk9wdGlvbmFsPERhdGU+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTZWN1cml0eUV2ZW50TW9kZWwoXG5cdHNlcXVlbGl6ZTogU2VxdWVsaXplXG4pOiB0eXBlb2YgU2VjdXJpdHlFdmVudCB7XG5cdFNlY3VyaXR5RXZlbnQuaW5pdChcblx0XHR7XG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRwcmltYXJ5S2V5OiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0ZXZlbnRJZDoge1xuXHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0ZXZlbnRUeXBlOiB7XG5cdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5TVFJJTkcsXG5cdFx0XHRcdGFsbG93TnVsbDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRldmVudERlc2NyaXB0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5URVhULFxuXHRcdFx0XHRhbGxvd051bGw6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRpcEFkZHJlc3M6IHtcblx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdHVzZXJBZ2VudDoge1xuXHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0c2VjdXJpdHlFdmVudERhdGU6IHtcblx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdGFsbG93TnVsbDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRzZWN1cml0eUV2ZW50TGFzdFVwZGF0ZWQ6IHtcblx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogRGF0YVR5cGVzLk5PV1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c2VxdWVsaXplLFxuXHRcdFx0dGFibGVOYW1lOiAnU2VjdXJpdHlFdmVudHMnLFxuXHRcdFx0dGltZXN0YW1wczogZmFsc2Vcblx0XHR9XG5cdCk7XG5cblx0cmV0dXJuIFNlY3VyaXR5RXZlbnQ7XG59XG4iXX0=
