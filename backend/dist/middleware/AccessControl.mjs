import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory.mjs';
export class AccessControlMiddlewareService {
	static instance = null;
	logger;
	constructor(logger) {
		this.logger = logger;
	}
	static async getInstance() {
		if (!AccessControlMiddlewareService.instance) {
			const logger = await LoggerServiceFactory.getLoggerService();
			AccessControlMiddlewareService.instance =
				new AccessControlMiddlewareService(logger);
		}
		return AccessControlMiddlewareService.instance;
	}
	restrictTo(...allowedRoles) {
		return (req, res, next) => {
			const user = req.user;
			if (!user || !allowedRoles.includes(user.role)) {
				res.status(403).json({
					status: 'fail',
					message: 'You do not have permission to access this route'
				});
				return;
			}
			next();
		};
	}
	hasPermission(...requiredPermissions) {
		return (req, res, next) => {
			const user = req.user;
			if (
				!user ||
				!this.checkPermissions(user.permissions, requiredPermissions)
			) {
				res.status(403).json({
					status: 'fail',
					message:
						'You do not have the required permissions to access this route'
				});
				return;
			}
			next();
		};
	}
	checkPermissions(userPermissions, requiredPermissions) {
		return requiredPermissions.every(permission =>
			userPermissions.includes(permission)
		);
	}
	async shutdown() {
		try {
			this.logger?.info(
				'Shutting down AccessControlMiddlewareService...'
			);
			AccessControlMiddlewareService.instance = null;
			this.logger?.info(
				'AccessControlMiddlewareService shutdown completed.'
			);
		} catch (error) {
			this.logger?.error(
				'Error during AccessControlMiddlewareService shutdown',
				error
			);
		}
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzQ29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL0FjY2Vzc0NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFMUYsTUFBTSxPQUFPLDhCQUE4QjtJQUdsQyxNQUFNLENBQUMsUUFBUSxHQUEwQyxJQUFJLENBQUM7SUFFOUQsTUFBTSxDQUE0QjtJQUUxQyxZQUFvQixNQUFpQztRQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXO1FBQzlCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QyxNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0QsOEJBQThCLENBQUMsUUFBUTtnQkFDdEMsSUFBSSw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsT0FBTyw4QkFBOEIsQ0FBQyxRQUFRLENBQUM7SUFDaEQsQ0FBQztJQUVNLFVBQVUsQ0FBQyxHQUFHLFlBQXNCO1FBQzFDLE9BQU8sQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCLEVBQVEsRUFBRTtZQUNoRSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBa0MsQ0FBQztZQUVwRCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDaEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxpREFBaUQ7aUJBQzFELENBQUMsQ0FBQztnQkFDSCxPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDO1FBQ1IsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVNLGFBQWEsQ0FBQyxHQUFHLG1CQUE2QjtRQUNwRCxPQUFPLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQixFQUFRLEVBQUU7WUFDaEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQWtDLENBQUM7WUFFcEQsSUFDQyxDQUFDLElBQUk7Z0JBQ0wsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxFQUM1RCxDQUFDO2dCQUNGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNwQixNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQ04sK0RBQStEO2lCQUNoRSxDQUFDLENBQUM7Z0JBQ0gsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLEVBQUUsQ0FBQztRQUNSLENBQUMsQ0FBQztJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FDdkIsZUFBeUIsRUFDekIsbUJBQTZCO1FBRTdCLE9BQU8sbUJBQW1CLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQzdDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQ3BDLENBQUM7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVE7UUFDcEIsSUFBSSxDQUFDO1lBQ0osSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQ2hCLGlEQUFpRCxDQUNqRCxDQUFDO1lBRUYsOEJBQThCLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUUvQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FDaEIsb0RBQW9ELENBQ3BELENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FDakIsc0RBQXNELEVBQ3RELEtBQUssQ0FDTCxDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQge1xuXHRBY2Nlc3NDb250cm9sTWlkZGxld2FyZVNlcnZpY2VJbnRlcmZhY2UsXG5cdEFwcExvZ2dlclNlcnZpY2VJbnRlcmZhY2Vcbn0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tYWluJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0ZWRVc2VySW50ZXJmYWNlIH0gZnJvbSAnLi4vaW5kZXgvaW50ZXJmYWNlcy9tYWluJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9zdWJmYWN0b3JpZXMvTG9nZ2VyU2VydmljZUZhY3RvcnknO1xuXG5leHBvcnQgY2xhc3MgQWNjZXNzQ29udHJvbE1pZGRsZXdhcmVTZXJ2aWNlXG5cdGltcGxlbWVudHMgQWNjZXNzQ29udHJvbE1pZGRsZXdhcmVTZXJ2aWNlSW50ZXJmYWNlXG57XG5cdHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBBY2Nlc3NDb250cm9sTWlkZGxld2FyZVNlcnZpY2UgfCBudWxsID0gbnVsbDtcblxuXHRwcml2YXRlIGxvZ2dlcjogQXBwTG9nZ2VyU2VydmljZUludGVyZmFjZTtcblxuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGxvZ2dlcjogQXBwTG9nZ2VyU2VydmljZUludGVyZmFjZSkge1xuXHRcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRJbnN0YW5jZSgpOiBQcm9taXNlPEFjY2Vzc0NvbnRyb2xNaWRkbGV3YXJlU2VydmljZT4ge1xuXHRcdGlmICghQWNjZXNzQ29udHJvbE1pZGRsZXdhcmVTZXJ2aWNlLmluc3RhbmNlKSB7XG5cdFx0XHRjb25zdCBsb2dnZXIgPSBhd2FpdCBMb2dnZXJTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXJTZXJ2aWNlKCk7XG5cdFx0XHRBY2Nlc3NDb250cm9sTWlkZGxld2FyZVNlcnZpY2UuaW5zdGFuY2UgPVxuXHRcdFx0XHRuZXcgQWNjZXNzQ29udHJvbE1pZGRsZXdhcmVTZXJ2aWNlKGxvZ2dlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEFjY2Vzc0NvbnRyb2xNaWRkbGV3YXJlU2VydmljZS5pbnN0YW5jZTtcblx0fVxuXG5cdHB1YmxpYyByZXN0cmljdFRvKC4uLmFsbG93ZWRSb2xlczogc3RyaW5nW10pIHtcblx0XHRyZXR1cm4gKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogdm9pZCA9PiB7XG5cdFx0XHRjb25zdCB1c2VyID0gcmVxLnVzZXIgYXMgQXV0aGVudGljYXRlZFVzZXJJbnRlcmZhY2U7XG5cblx0XHRcdGlmICghdXNlciB8fCAhYWxsb3dlZFJvbGVzLmluY2x1ZGVzKHVzZXIucm9sZSkpIHtcblx0XHRcdFx0cmVzLnN0YXR1cyg0MDMpLmpzb24oe1xuXHRcdFx0XHRcdHN0YXR1czogJ2ZhaWwnLFxuXHRcdFx0XHRcdG1lc3NhZ2U6ICdZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBhY2Nlc3MgdGhpcyByb3V0ZSdcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG5leHQoKTtcblx0XHR9O1xuXHR9XG5cblx0cHVibGljIGhhc1Blcm1pc3Npb24oLi4ucmVxdWlyZWRQZXJtaXNzaW9uczogc3RyaW5nW10pIHtcblx0XHRyZXR1cm4gKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogdm9pZCA9PiB7XG5cdFx0XHRjb25zdCB1c2VyID0gcmVxLnVzZXIgYXMgQXV0aGVudGljYXRlZFVzZXJJbnRlcmZhY2U7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0IXVzZXIgfHxcblx0XHRcdFx0IXRoaXMuY2hlY2tQZXJtaXNzaW9ucyh1c2VyLnBlcm1pc3Npb25zLCByZXF1aXJlZFBlcm1pc3Npb25zKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJlcy5zdGF0dXMoNDAzKS5qc29uKHtcblx0XHRcdFx0XHRzdGF0dXM6ICdmYWlsJyxcblx0XHRcdFx0XHRtZXNzYWdlOlxuXHRcdFx0XHRcdFx0J1lvdSBkbyBub3QgaGF2ZSB0aGUgcmVxdWlyZWQgcGVybWlzc2lvbnMgdG8gYWNjZXNzIHRoaXMgcm91dGUnXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRuZXh0KCk7XG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgY2hlY2tQZXJtaXNzaW9ucyhcblx0XHR1c2VyUGVybWlzc2lvbnM6IHN0cmluZ1tdLFxuXHRcdHJlcXVpcmVkUGVybWlzc2lvbnM6IHN0cmluZ1tdXG5cdCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiByZXF1aXJlZFBlcm1pc3Npb25zLmV2ZXJ5KHBlcm1pc3Npb24gPT5cblx0XHRcdHVzZXJQZXJtaXNzaW9ucy5pbmNsdWRlcyhwZXJtaXNzaW9uKVxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMubG9nZ2VyPy5pbmZvKFxuXHRcdFx0XHQnU2h1dHRpbmcgZG93biBBY2Nlc3NDb250cm9sTWlkZGxld2FyZVNlcnZpY2UuLi4nXG5cdFx0XHQpO1xuXG5cdFx0XHRBY2Nlc3NDb250cm9sTWlkZGxld2FyZVNlcnZpY2UuaW5zdGFuY2UgPSBudWxsO1xuXG5cdFx0XHR0aGlzLmxvZ2dlcj8uaW5mbyhcblx0XHRcdFx0J0FjY2Vzc0NvbnRyb2xNaWRkbGV3YXJlU2VydmljZSBzaHV0ZG93biBjb21wbGV0ZWQuJ1xuXHRcdFx0KTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5sb2dnZXI/LmVycm9yKFxuXHRcdFx0XHQnRXJyb3IgZHVyaW5nIEFjY2Vzc0NvbnRyb2xNaWRkbGV3YXJlU2VydmljZSBzaHV0ZG93bicsXG5cdFx0XHRcdGVycm9yXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuIl19
