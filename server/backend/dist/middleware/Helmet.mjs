import helmet from 'helmet';
import {
	cspOptions,
	helmetOptions,
	permissionsPolicyOptions
} from '../config/middlewareOptions.mjs';
import { withRetry } from '../utils/helpers.mjs';
import { LoggerServiceFactory } from '../index/factory/subfactories/LoggerServiceFactory.mjs';
import { ErrorHandlerServiceFactory } from '../index/factory/subfactories/ErrorHandlerServiceFactory.mjs';
export class HelmetMiddlewareService {
	static instance = null;
	logger;
	errorLogger;
	errorHandler;
	constructor(logger, errorLogger, errorHandler) {
		this.logger = logger;
		this.errorLogger = errorLogger;
		this.errorHandler = errorHandler;
	}
	static async getInstance() {
		if (!HelmetMiddlewareService.instance) {
			const logger = await LoggerServiceFactory.getLoggerService();
			const errorLogger =
				await LoggerServiceFactory.getErrorLoggerService();
			const errorHandler =
				await ErrorHandlerServiceFactory.getErrorHandlerService();
			HelmetMiddlewareService.instance = new HelmetMiddlewareService(
				logger,
				errorLogger,
				errorHandler
			);
		}
		return HelmetMiddlewareService.instance;
	}
	async initializeHelmetMiddleware(app) {
		try {
			await withRetry(() => this.applyHelmet(app), 3, 1000);
			await withRetry(() => this.applyCSP(app), 3, 1000);
			await withRetry(() => this.applyReferrerPolicy(app), 3, 1000);
			await withRetry(() => this.applyExpectCT(app), 3, 1000);
			await withRetry(() => this.applyPermissionsPolicy(app), 3, 1000);
			await withRetry(() => this.applyCrossOriginPolicies(app), 3, 1000);
			await withRetry(() => this.applyXssFilter(app), 3, 1000);
			this.logger.info('Helmet middleware initialized successfully');
		} catch (error) {
			this.errorLogger.logError(
				'Failed to initialize Helmet middleware stack'
			);
			this.errorHandler.handleError({ error });
		}
	}
	async applyHelmet(app) {
		try {
			this.logger.info('Applying Helmet middleware');
			app.use(helmet(helmetOptions));
			this.logger.info('Helmet middleware applied successfully');
		} catch (configError) {
			this.handleHelmetError('applyHelmet', configError);
		}
	}
	async applyCSP(app) {
		try {
			this.logger.info('Applying Content Security Policy');
			app.use(
				helmet.contentSecurityPolicy({
					directives: {
						...cspOptions.directives,
						styleSrc: ['self', 'nonce-{NONCE}'],
						scriptSrc: ['self', 'nonce-{NONCE}']
					},
					reportOnly: cspOptions.reportOnly
				})
			);
			this.logger.info('Content Security Policy applied successfully');
		} catch (configError) {
			this.handleHelmetError('applyContentSecurityPolicy', configError);
		}
	}
	async applyExpectCT(app) {
		try {
			app.use((req, res, next) => {
				res.setHeader('Expect-CT', 'enforce, max-age=86400');
				this.logger.info('Expect-CT header set successfully');
				next();
			});
		} catch (configError) {
			this.handleHelmetError('applyExpectCT', configError);
		}
	}
	async applyPermissionsPolicy(app) {
		if (
			permissionsPolicyOptions &&
			typeof permissionsPolicyOptions === 'object'
		) {
			app.use((req, res, next) => {
				try {
					const policies = Object.entries(permissionsPolicyOptions)
						.map(
							([feature, origins]) =>
								`${feature} ${origins.join(' ')}`
						)
						.join(', ');
					res.setHeader('Permissions-Policy', policies);
					this.logger.info(
						'Permissions-Policy header set successfully'
					);
					next();
				} catch (expressError) {
					this.handleHelmetExpressError(
						'Permissions-Policy Middleware',
						expressError,
						req,
						res,
						next
					);
				}
			});
		} else {
			this.logger.warn(
				'Permissions-Policy options are not provided or invalid'
			);
		}
	}
	async applyCrossOriginPolicies(app) {
		try {
			this.logger.info('Applying Cross-Origin policies');
			app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));
			app.use(
				helmet.crossOriginResourcePolicy({ policy: 'same-origin' })
			);
			app.use(
				helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' })
			);
			this.logger.info('Cross-Origin policies applied successfully');
		} catch (configError) {
			this.handleHelmetError('applyCrossOriginPolicies', configError);
		}
	}
	async applyReferrerPolicy(app) {
		try {
			this.logger.info('Applying Referrer-Policy');
			app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
			this.logger.info('Referrer-Policy applied successfully');
		} catch (configError) {
			this.handleHelmetError('applyReferrerPolicy', configError);
		}
	}
	async applyXssFilter(app) {
		try {
			this.logger.info('Applying XSS Filter');
			app.use(helmet.xssFilter());
			this.logger.info('XSS Filter applied successfully');
		} catch (configError) {
			this.handleHelmetError('applyXssFilter', configError);
		}
	}
	async shutdown() {
		try {
			this.logger.info('Shutting down Helmet middleware service...');
			HelmetMiddlewareService.instance = null;
			this.logger.info('Helmet middleware service has been shut down.');
		} catch (error) {
			this.errorLogger.logError(
				`Error shutting down Helmet middleware service: ${error instanceof Error ? error.message : error}`
			);
		}
	}
	handleHelmetError(method, error) {
		const configurationError =
			new this.errorHandler.ErrorClasses.ConfigurationError(
				`Failed to apply security headers in ${method}: ${error instanceof Error ? error.message : 'Unknown error'}`,
				{ exposeToClient: false }
			);
		this.errorLogger.logWarn(configurationError.message);
		this.errorHandler.handleError({ error: configurationError });
	}
	handleHelmetExpressError(middleware, error, req, res, next) {
		const expressMiddlewareError =
			new this.errorHandler.ErrorClasses.ExpressError(
				`Error occurred in ${middleware}: ${error instanceof Error ? error.message : String(error)}`,
				{ exposeToClient: false }
			);
		this.errorLogger.logError(expressMiddlewareError.message);
		this.errorHandler.expressErrorHandler()(
			expressMiddlewareError,
			req,
			res,
			next
		);
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVsbWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvSGVsbWV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUU1QixPQUFPLEVBQ04sVUFBVSxFQUNWLGFBQWEsRUFDYix3QkFBd0IsRUFDeEIsTUFBTSw2QkFBNkIsQ0FBQztBQU9yQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDMUYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFFdEcsTUFBTSxPQUFPLHVCQUF1QjtJQUczQixNQUFNLENBQUMsUUFBUSxHQUFtQyxJQUFJLENBQUM7SUFFdkQsTUFBTSxDQUE0QjtJQUNsQyxXQUFXLENBQThCO0lBQ3pDLFlBQVksQ0FBK0I7SUFFbkQsWUFDQyxNQUFpQyxFQUNqQyxXQUF3QyxFQUN4QyxZQUEwQztRQUUxQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXO1FBQzlCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0QsTUFBTSxXQUFXLEdBQ2hCLE1BQU0sb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFlBQVksR0FDakIsTUFBTSwwQkFBMEIsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBRTNELHVCQUF1QixDQUFDLFFBQVEsR0FBRyxJQUFJLHVCQUF1QixDQUM3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IGZyb20gJ2hlbG1ldCc7XG5pbXBvcnQgeyBBcHBsaWNhdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHtcblx0Y3NwT3B0aW9ucyxcblx0aGVsbWV0T3B0aW9ucyxcblx0cGVybWlzc2lvbnNQb2xpY3lPcHRpb25zXG59IGZyb20gJy4uL2NvbmZpZy9taWRkbGV3YXJlT3B0aW9ucyc7XG5pbXBvcnQge1xuXHRBcHBMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2UsXG5cdEVycm9ySGFuZGxlclNlcnZpY2VJbnRlcmZhY2UsXG5cdEhlbG1ldE1pZGRsZXdhcmVTZXJ2aWNlSW50ZXJmYWNlXG59IGZyb20gJy4uL2luZGV4L2ludGVyZmFjZXMvbWFpbic7XG5pbXBvcnQgeyB3aXRoUmV0cnkgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi4vaW5kZXgvZmFjdG9yeS9zdWJmYWN0b3JpZXMvTG9nZ2VyU2VydmljZUZhY3RvcnknO1xuaW1wb3J0IHsgRXJyb3JIYW5kbGVyU2VydmljZUZhY3RvcnkgfSBmcm9tICcuLi9pbmRleC9mYWN0b3J5L3N1YmZhY3Rvcmllcy9FcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeSc7XG5cbmV4cG9ydCBjbGFzcyBIZWxtZXRNaWRkbGV3YXJlU2VydmljZVxuXHRpbXBsZW1lbnRzIEhlbG1ldE1pZGRsZXdhcmVTZXJ2aWNlSW50ZXJmYWNlXG57XG5cdHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBIZWxtZXRNaWRkbGV3YXJlU2VydmljZSB8IG51bGwgPSBudWxsO1xuXG5cdHByaXZhdGUgbG9nZ2VyOiBBcHBMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlO1xuXHRwcml2YXRlIGVycm9yTG9nZ2VyOiBFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2U7XG5cdHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXJTZXJ2aWNlSW50ZXJmYWNlO1xuXG5cdHByaXZhdGUgY29uc3RydWN0b3IoXG5cdFx0bG9nZ2VyOiBBcHBMb2dnZXJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRcdGVycm9yTG9nZ2VyOiBFcnJvckxvZ2dlclNlcnZpY2VJbnRlcmZhY2UsXG5cdFx0ZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXJTZXJ2aWNlSW50ZXJmYWNlXG5cdCkge1xuXHRcdHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuXHRcdHRoaXMuZXJyb3JMb2dnZXIgPSBlcnJvckxvZ2dlcjtcblx0XHR0aGlzLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0SW5zdGFuY2UoKTogUHJvbWlzZTxIZWxtZXRNaWRkbGV3YXJlU2VydmljZT4ge1xuXHRcdGlmICghSGVsbWV0TWlkZGxld2FyZVNlcnZpY2UuaW5zdGFuY2UpIHtcblx0XHRcdGNvbnN0IGxvZ2dlciA9IGF3YWl0IExvZ2dlclNlcnZpY2VGYWN0b3J5LmdldExvZ2dlclNlcnZpY2UoKTtcblx0XHRcdGNvbnN0IGVycm9yTG9nZ2VyID1cblx0XHRcdFx0YXdhaXQgTG9nZ2VyU2VydmljZUZhY3RvcnkuZ2V0RXJyb3JMb2dnZXJTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlcnJvckhhbmRsZXIgPVxuXHRcdFx0XHRhd2FpdCBFcnJvckhhbmRsZXJTZXJ2aWNlRmFjdG9yeS5nZXRFcnJvckhhbmRsZXJTZXJ2aWNlKCk7XG5cblx0XHRcdEhlbG1ldE1pZGRsZXdhcmVTZXJ2aWNlLmluc3RhbmNlID0gbmV3IEhlbG1ldE1pZGRsZXdhcmVTZXJ2aWNlKFxuXHRcdFx0XHRsb2dnZXIsXG5cdFx0XHRcdGVycm9yTG9nZ2VyLFxuXHRcdFx0XHRlcnJvckhhbmRsZXJcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEhlbG1ldE1pZGRsZXdhcmVTZXJ2aWNlLmluc3RhbmNlO1xuXHR9XG5cblx0cHVibGljIGFzeW5jIGluaXRpYWxpemVIZWxtZXRNaWRkbGV3YXJlKGFwcDogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgd2l0aFJldHJ5KCgpID0+IHRoaXMuYXBwbHlIZWxtZXQoYXBwKSwgMywgMTAwMCk7XG5cdFx0XHRhd2FpdCB3aXRoUmV0cnkoKCkgPT4gdGhpcy5hcHBseUNTUChhcHApLCAzLCAxMDAwKTtcblx0XHRcdGF3YWl0IHdpdGhSZXRyeSgoKSA9PiB0aGlzLmFwcGx5UmVmZXJyZXJQb2xpY3koYXBwKSwgMywgMTAwMCk7XG5cdFx0XHRhd2FpdCB3aXRoUmV0cnkoKCkgPT4gdGhpcy5hcHBseUV4cGVjdENUKGFwcCksIDMsIDEwMDApO1xuXHRcdFx0YXdhaXQgd2l0aFJldHJ5KCgpID0+IHRoaXMuYXBwbHlQZXJtaXNzaW9uc1BvbGljeShhcHApLCAzLCAxMDAwKTtcblx0XHRcdGF3YWl0IHdpdGhSZXRyeSgoKSA9PiB0aGlzLmFwcGx5Q3Jvc3NPcmlnaW5Qb2xpY2llcyhhcHApLCAzLCAxMDAwKTtcblx0XHRcdGF3YWl0IHdpdGhSZXRyeSgoKSA9PiB0aGlzLmFwcGx5WHNzRmlsdGVyKGFwcCksIDMsIDEwMDApO1xuXG5cdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdIZWxtZXQgbWlkZGxld2FyZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHknKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5lcnJvckxvZ2dlci5sb2dFcnJvcihcblx0XHRcdFx0J0ZhaWxlZCB0byBpbml0aWFsaXplIEhlbG1ldCBtaWRkbGV3YXJlIHN0YWNrJ1xuXHRcdFx0KTtcblx0XHRcdHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKHsgZXJyb3IgfSk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGFwcGx5SGVsbWV0KGFwcDogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnQXBwbHlpbmcgSGVsbWV0IG1pZGRsZXdhcmUnKTtcblx0XHRcdGFwcC51c2UoaGVsbWV0KGhlbG1ldE9wdGlvbnMpKTtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ0hlbG1ldCBtaWRkbGV3YXJlIGFwcGxpZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fSBjYXRjaCAoY29uZmlnRXJyb3IpIHtcblx0XHRcdHRoaXMuaGFuZGxlSGVsbWV0RXJyb3IoJ2FwcGx5SGVsbWV0JywgY29uZmlnRXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyBhcHBseUNTUChhcHA6IEFwcGxpY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ0FwcGx5aW5nIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5Jyk7XG5cdFx0XHRhcHAudXNlKFxuXHRcdFx0XHRoZWxtZXQuY29udGVudFNlY3VyaXR5UG9saWN5KHtcblx0XHRcdFx0XHRkaXJlY3RpdmVzOiB7XG5cdFx0XHRcdFx0XHQuLi5jc3BPcHRpb25zLmRpcmVjdGl2ZXMsXG5cdFx0XHRcdFx0XHRzdHlsZVNyYzogWydzZWxmJywgJ25vbmNlLXtOT05DRX0nXSxcblx0XHRcdFx0XHRcdHNjcmlwdFNyYzogWydzZWxmJywgJ25vbmNlLXtOT05DRX0nXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVwb3J0T25seTogY3NwT3B0aW9ucy5yZXBvcnRPbmx5XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnQ29udGVudCBTZWN1cml0eSBQb2xpY3kgYXBwbGllZCBzdWNjZXNzZnVsbHknKTtcblx0XHR9IGNhdGNoIChjb25maWdFcnJvcikge1xuXHRcdFx0dGhpcy5oYW5kbGVIZWxtZXRFcnJvcignYXBwbHlDb250ZW50U2VjdXJpdHlQb2xpY3knLCBjb25maWdFcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGFwcGx5RXhwZWN0Q1QoYXBwOiBBcHBsaWNhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRhcHAudXNlKChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuXHRcdFx0XHRyZXMuc2V0SGVhZGVyKCdFeHBlY3QtQ1QnLCAnZW5mb3JjZSwgbWF4LWFnZT04NjQwMCcpO1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5pbmZvKCdFeHBlY3QtQ1QgaGVhZGVyIHNldCBzdWNjZXNzZnVsbHknKTtcblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAoY29uZmlnRXJyb3IpIHtcblx0XHRcdHRoaXMuaGFuZGxlSGVsbWV0RXJyb3IoJ2FwcGx5RXhwZWN0Q1QnLCBjb25maWdFcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGFwcGx5UGVybWlzc2lvbnNQb2xpY3koYXBwOiBBcHBsaWNhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChcblx0XHRcdHBlcm1pc3Npb25zUG9saWN5T3B0aW9ucyAmJlxuXHRcdFx0dHlwZW9mIHBlcm1pc3Npb25zUG9saWN5T3B0aW9ucyA9PT0gJ29iamVjdCdcblx0XHQpIHtcblx0XHRcdGFwcC51c2UoKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgcG9saWNpZXMgPSBPYmplY3QuZW50cmllcyhwZXJtaXNzaW9uc1BvbGljeU9wdGlvbnMpXG5cdFx0XHRcdFx0XHQubWFwKFxuXHRcdFx0XHRcdFx0XHQoW2ZlYXR1cmUsIG9yaWdpbnNdKSA9PlxuXHRcdFx0XHRcdFx0XHRcdGAke2ZlYXR1cmV9ICR7b3JpZ2lucy5qb2luKCcgJyl9YFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0LmpvaW4oJywgJyk7XG5cblx0XHRcdFx0XHRyZXMuc2V0SGVhZGVyKCdQZXJtaXNzaW9ucy1Qb2xpY3knLCBwb2xpY2llcyk7XG5cdFx0XHRcdFx0dGhpcy5sb2dnZXIuaW5mbyhcblx0XHRcdFx0XHRcdCdQZXJtaXNzaW9ucy1Qb2xpY3kgaGVhZGVyIHNldCBzdWNjZXNzZnVsbHknXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRuZXh0KCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGV4cHJlc3NFcnJvcikge1xuXHRcdFx0XHRcdHRoaXMuaGFuZGxlSGVsbWV0RXhwcmVzc0Vycm9yKFxuXHRcdFx0XHRcdFx0J1Blcm1pc3Npb25zLVBvbGljeSBNaWRkbGV3YXJlJyxcblx0XHRcdFx0XHRcdGV4cHJlc3NFcnJvcixcblx0XHRcdFx0XHRcdHJlcSxcblx0XHRcdFx0XHRcdHJlcyxcblx0XHRcdFx0XHRcdG5leHRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2dnZXIud2Fybihcblx0XHRcdFx0J1Blcm1pc3Npb25zLVBvbGljeSBvcHRpb25zIGFyZSBub3QgcHJvdmlkZWQgb3IgaW52YWxpZCdcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGFwcGx5Q3Jvc3NPcmlnaW5Qb2xpY2llcyhhcHA6IEFwcGxpY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ0FwcGx5aW5nIENyb3NzLU9yaWdpbiBwb2xpY2llcycpO1xuXG5cdFx0XHRhcHAudXNlKGhlbG1ldC5jcm9zc09yaWdpbk9wZW5lclBvbGljeSh7IHBvbGljeTogJ3NhbWUtb3JpZ2luJyB9KSk7XG5cdFx0XHRhcHAudXNlKFxuXHRcdFx0XHRoZWxtZXQuY3Jvc3NPcmlnaW5SZXNvdXJjZVBvbGljeSh7IHBvbGljeTogJ3NhbWUtb3JpZ2luJyB9KVxuXHRcdFx0KTtcblx0XHRcdGFwcC51c2UoXG5cdFx0XHRcdGhlbG1ldC5jcm9zc09yaWdpbkVtYmVkZGVyUG9saWN5KHsgcG9saWN5OiAncmVxdWlyZS1jb3JwJyB9KVxuXHRcdFx0KTtcblxuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnQ3Jvc3MtT3JpZ2luIHBvbGljaWVzIGFwcGxpZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fSBjYXRjaCAoY29uZmlnRXJyb3IpIHtcblx0XHRcdHRoaXMuaGFuZGxlSGVsbWV0RXJyb3IoJ2FwcGx5Q3Jvc3NPcmlnaW5Qb2xpY2llcycsIGNvbmZpZ0Vycm9yKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgYXBwbHlSZWZlcnJlclBvbGljeShhcHA6IEFwcGxpY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ0FwcGx5aW5nIFJlZmVycmVyLVBvbGljeScpO1xuXHRcdFx0YXBwLnVzZShoZWxtZXQucmVmZXJyZXJQb2xpY3koeyBwb2xpY3k6ICdzYW1lLW9yaWdpbicgfSkpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnUmVmZXJyZXItUG9saWN5IGFwcGxpZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fSBjYXRjaCAoY29uZmlnRXJyb3IpIHtcblx0XHRcdHRoaXMuaGFuZGxlSGVsbWV0RXJyb3IoJ2FwcGx5UmVmZXJyZXJQb2xpY3knLCBjb25maWdFcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGFwcGx5WHNzRmlsdGVyKGFwcDogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnQXBwbHlpbmcgWFNTIEZpbHRlcicpO1xuXHRcdFx0YXBwLnVzZShoZWxtZXQueHNzRmlsdGVyKCkpO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnWFNTIEZpbHRlciBhcHBsaWVkIHN1Y2Nlc3NmdWxseScpO1xuXHRcdH0gY2F0Y2ggKGNvbmZpZ0Vycm9yKSB7XG5cdFx0XHR0aGlzLmhhbmRsZUhlbG1ldEVycm9yKCdhcHBseVhzc0ZpbHRlcicsIGNvbmZpZ0Vycm9yKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMubG9nZ2VyLmluZm8oJ1NodXR0aW5nIGRvd24gSGVsbWV0IG1pZGRsZXdhcmUgc2VydmljZS4uLicpO1xuXHRcdFx0SGVsbWV0TWlkZGxld2FyZVNlcnZpY2UuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0dGhpcy5sb2dnZXIuaW5mbygnSGVsbWV0IG1pZGRsZXdhcmUgc2VydmljZSBoYXMgYmVlbiBzaHV0IGRvd24uJyk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3IoXG5cdFx0XHRcdGBFcnJvciBzaHV0dGluZyBkb3duIEhlbG1ldCBtaWRkbGV3YXJlIHNlcnZpY2U6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBlcnJvcn1gXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaGFuZGxlSGVsbWV0RXJyb3IobWV0aG9kOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG5cdFx0Y29uc3QgY29uZmlndXJhdGlvbkVycm9yID1cblx0XHRcdG5ldyB0aGlzLmVycm9ySGFuZGxlci5FcnJvckNsYXNzZXMuQ29uZmlndXJhdGlvbkVycm9yKFxuXHRcdFx0XHRgRmFpbGVkIHRvIGFwcGx5IHNlY3VyaXR5IGhlYWRlcnMgaW4gJHttZXRob2R9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWAsXG5cdFx0XHRcdHsgZXhwb3NlVG9DbGllbnQ6IGZhbHNlIH1cblx0XHRcdCk7XG5cdFx0dGhpcy5lcnJvckxvZ2dlci5sb2dXYXJuKGNvbmZpZ3VyYXRpb25FcnJvci5tZXNzYWdlKTtcblx0XHR0aGlzLmVycm9ySGFuZGxlci5oYW5kbGVFcnJvcih7IGVycm9yOiBjb25maWd1cmF0aW9uRXJyb3IgfSk7XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUhlbG1ldEV4cHJlc3NFcnJvcihcblx0XHRtaWRkbGV3YXJlOiBzdHJpbmcsXG5cdFx0ZXJyb3I6IHVua25vd24sXG5cdFx0cmVxOiBSZXF1ZXN0LFxuXHRcdHJlczogUmVzcG9uc2UsXG5cdFx0bmV4dDogTmV4dEZ1bmN0aW9uXG5cdCk6IHZvaWQge1xuXHRcdGNvbnN0IGV4cHJlc3NNaWRkbGV3YXJlRXJyb3IgPVxuXHRcdFx0bmV3IHRoaXMuZXJyb3JIYW5kbGVyLkVycm9yQ2xhc3Nlcy5FeHByZXNzRXJyb3IoXG5cdFx0XHRcdGBFcnJvciBvY2N1cnJlZCBpbiAke21pZGRsZXdhcmV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gLFxuXHRcdFx0XHR7IGV4cG9zZVRvQ2xpZW50OiBmYWxzZSB9XG5cdFx0XHQpO1xuXHRcdHRoaXMuZXJyb3JMb2dnZXIubG9nRXJyb3IoZXhwcmVzc01pZGRsZXdhcmVFcnJvci5tZXNzYWdlKTtcblx0XHR0aGlzLmVycm9ySGFuZGxlci5leHByZXNzRXJyb3JIYW5kbGVyKCkoXG5cdFx0XHRleHByZXNzTWlkZGxld2FyZUVycm9yLFxuXHRcdFx0cmVxLFxuXHRcdFx0cmVzLFxuXHRcdFx0bmV4dFxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==
