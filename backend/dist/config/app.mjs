import { getFeatureFlags } from '../utils/featureFlags';
import setupLogger from './logger';
import { createFeatureEnabler } from './setFeatureFlags';
const logger = setupLogger();
const featureFlags = getFeatureFlags(logger);
const { enableFeatureBasedOnFlag, enableFeatureWithProdOverride } =
	createFeatureEnabler(logger);
export async function initializeApp({
	express,
	session,
	cookieParser,
	cors,
	hpp,
	morgan,
	passport,
	randomBytes,
	path,
	RedisStore,
	initializeStaticRoutes,
	csrfMiddleware,
	errorHandler,
	getRedisClient,
	ipBlacklistMiddleware,
	createTestRouter,
	rateLimitMiddleware,
	setupSecurityHeaders,
	startMemoryMonitor,
	logger,
	staticRootPath
}) {
	const app = express();
	logger.info('Initializing middleware');
	// initialize Morgan logger
	logger.info('Initializing Morgan logger');
	app.use(morgan('combined', { stream: logger.stream }));
	// initialize cookie parser
	logger.info('Initializing cookie parser');
	app.use(cookieParser());
	// initialize CORS
	logger.info('Initializing CORS');
	app.use(cors());
	// initialize HPP
	logger.info('Initializing HPP');
	app.use(hpp());
	// initialize body parser
	logger.info('Initializing body parser');
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(
		session({
			secret: randomBytes(32).toString('hex'),
			resave: false,
			saveUninitialized: true,
			store: featureFlags.enableRedisFlag
				? new RedisStore({
						client: getRedisClient()
					})
				: undefined,
			cookie: {
				secure: featureFlags.enableSslFlag,
				httpOnly: true,
				sameSite: 'strict'
			}
		})
	);
	// initialize passport
	logger.info('Initializing Passport and Passport session');
	app.use(passport.initialize());
	app.use(passport.session());
	// initialize security headers
	enableFeatureWithProdOverride(
		featureFlags.secureHeadersFlag,
		'security headers',
		() => {
			setupSecurityHeaders(app, {
				helmetOptions: {},
				permissionsPolicyOptions: {}
			});
		}
	);
	// initialize static routes
	initializeStaticRoutes(app, staticRootPath);
	// initialize CSRF middlware
	enableFeatureWithProdOverride(
		featureFlags.enableCsrfFlag,
		'CSRF middleware',
		() => app.use(csrfMiddleware)
	);
	// initialize rate limit middleware
	enableFeatureBasedOnFlag(
		featureFlags.enableRateLimitFlag,
		'rate limit middleware',
		() => app.use(rateLimitMiddleware)
	);
	// initialize IP blacklist middleware
	enableFeatureBasedOnFlag(
		featureFlags.enableIpBlacklistFlag,
		'IP blacklist middleware',
		() => app.use(ipBlacklistMiddleware)
	);
	// initialize test router
	enableFeatureBasedOnFlag(
		featureFlags.loadTestRoutesFlag,
		'test router',
		() => createTestRouter(app)
	);
	// initialize memory monitor or Redis session, dependant on flag value
	if (!featureFlags.enableRedisFlag) {
		logger.info('Initializing memory monitor');
		startMemoryMonitor();
	} else {
		logger.info(
			'Redis session is enabled, skipping memory monitor initialization'
		);
	}
	// initialize error handler
	enableFeatureBasedOnFlag(
		featureFlags.enableErrorHandlerFlag,
		'error handler',
		() => app.use(errorHandler)
	);
	return app;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBY0EsT0FBTyxFQUFnQixlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUd0RSxPQUFPLFdBQVcsTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekQsTUFBTSxNQUFNLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQWlCLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzRCxNQUFNLEVBQ0wsd0JBQXdCLEVBQ3hCLDZCQUE2QixFQUM3QixHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBMEJqQyxNQUFNLENBQUMsS0FBSyxVQUFVLGFBQWEsQ0FBQyxFQUNoQyxPQUFPLEVBQ1AsT0FBTyxFQUNQLFlBQVksRUFDWixJQUFJLEVBQ0osR0FBRyxFQUNILE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLElBQUksRUFDSixVQUFVLEVBQ1Ysc0JBQXNCLEVBQ3RCLGNBQWMsRUFDZCxZQUFZLEVBQ1osY0FBYyxFQUNkLHFCQUFxQixFQUNyQixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsTUFBTSxFQUNOLGNBQWMsRUFDQTtJQUNkLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUV2QywyQkFBMkI7SUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3ZDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFELDJCQUEyQjtJQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDdkMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLGtCQUFrQjtJQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDOUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRW5CLGlCQUFpQjtJQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDN0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRWxCLHlCQUF5QjtJQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDckMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhELEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ1osTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxLQUFLO1FBQ2IsaUJBQWlCLEVBQUUsSUFBSTtRQUN2QixLQUFLLEVBQ1YsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUM7WUFDN0MsTUFBTSxFQUFFLGNBQWMsRUFBRTtTQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDVCxNQUFNLEVBQUU7WUFDYixNQUFNLEVBQUUsWUFBWSxDQUFDLGFBQWE7WUFDbEMsUUFBUSxFQUFFLElBQUk7WUFDZCxRQUFRLEVBQUUsUUFBUTtTQUNsQjtLQUNFLENBQUMsQ0FBQyxDQUFDO0lBRVAsc0JBQXNCO0lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUN2RCxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFL0IsOEJBQThCO0lBQzlCLDZCQUE2QixDQUM1QixZQUFZLENBQUMsaUJBQWlCLEVBQzlCLGtCQUFrQixFQUNsQixHQUFHLEVBQUU7UUFDQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUU7WUFDdEIsYUFBYSxFQUFFLEVBQUU7WUFDakIsd0JBQXdCLEVBQUUsRUFBRTtTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVOLDJCQUEyQjtJQUN4QixzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFL0MsNEJBQTRCO0lBQzVCLDZCQUE2QixDQUM1QixZQUFZLENBQUMsY0FBYyxFQUMzQixpQkFBaUIsRUFDakIsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FDN0IsQ0FBQztJQUVGLG1DQUFtQztJQUNuQyx3QkFBd0IsQ0FDdkIsWUFBWSxDQUFDLG1CQUFtQixFQUNoQyx1QkFBdUIsRUFDdkIsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUNsQyxDQUFDO0lBRUYscUNBQXFDO0lBQ3JDLHdCQUF3QixDQUN2QixZQUFZLENBQUMscUJBQXFCLEVBQ2xDLHlCQUF5QixFQUN6QixHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQ3BDLENBQUM7SUFFRix5QkFBeUI7SUFDekIsd0JBQXdCLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUN2RCxhQUFhLEVBQ2IsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQzNCLENBQUM7SUFFRixzRUFBc0U7SUFDdEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDM0Msa0JBQWtCLEVBQUUsQ0FBQztJQUN6QixDQUFDO1NBQU0sQ0FBQztRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQ1Ysa0VBQWtFLENBQ2xFLENBQUM7SUFDSCxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxzQkFBc0IsRUFDM0QsZUFBZSxFQUNmLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQzNCLENBQUM7SUFFQyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcywgeyBBcHBsaWNhdGlvbiB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHNlc3Npb24gZnJvbSAnZXhwcmVzcy1zZXNzaW9uJztcbmltcG9ydCBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBjb29raWVQYXJzZXIgZnJvbSAnY29va2llLXBhcnNlcic7XG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBocHAgZnJvbSAnaHBwJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHBhc3Nwb3J0IGZyb20gJ3Bhc3Nwb3J0JztcbmltcG9ydCBSZWRpc1N0b3JlIGZyb20gJ2Nvbm5lY3QtcmVkaXMnO1xuaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgc2V0dXBTZWN1cml0eUhlYWRlcnMgfSBmcm9tICcuLi9taWRkbGV3YXJlL3NlY3VyaXR5SGVhZGVycyc7XG5pbXBvcnQgeyBpbml0aWFsaXplU3RhdGljUm91dGVzIH0gZnJvbSAnLi4vcm91dGVzL3N0YXRpY1JvdXRlcyc7XG5pbXBvcnQgZXJyb3JIYW5kbGVyIGZyb20gJy4uL21pZGRsZXdhcmUvZXJyb3JIYW5kbGVyJztcbmltcG9ydCB7IGNyZWF0ZUNzcmZNaWRkbGV3YXJlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS9jc3JmJztcbmltcG9ydCB7IEZlYXR1cmVGbGFncywgZ2V0RmVhdHVyZUZsYWdzIH0gZnJvbSAnLi4vdXRpbHMvZmVhdHVyZUZsYWdzJztcbmltcG9ydCB7IGdldFJlZGlzQ2xpZW50IH0gZnJvbSAnLi4vY29uZmlnL3JlZGlzJztcbmltcG9ydCB7IGNyZWF0ZUlwQmxhY2tsaXN0IH0gZnJvbSAnLi4vbWlkZGxld2FyZS9pcEJsYWNrbGlzdCc7XG5pbXBvcnQgc2V0dXBMb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgY3JlYXRlRmVhdHVyZUVuYWJsZXIgfSBmcm9tICcuL3NldEZlYXR1cmVGbGFncyc7XG5cbmNvbnN0IGxvZ2dlciA9IHNldHVwTG9nZ2VyKCk7XG5jb25zdCBmZWF0dXJlRmxhZ3M6IEZlYXR1cmVGbGFncyA9IGdldEZlYXR1cmVGbGFncyhsb2dnZXIpO1xuY29uc3Qge1xuXHRlbmFibGVGZWF0dXJlQmFzZWRPbkZsYWcsXG5cdGVuYWJsZUZlYXR1cmVXaXRoUHJvZE92ZXJyaWRlXG59ID0gY3JlYXRlRmVhdHVyZUVuYWJsZXIobG9nZ2VyKTtcblxuaW50ZXJmYWNlIEFwcERlcGVuZGVuY2llcyB7XG4gICAgZXhwcmVzczogdHlwZW9mIGV4cHJlc3M7XG4gICAgc2Vzc2lvbjogdHlwZW9mIHNlc3Npb247XG4gICAgY29va2llUGFyc2VyOiB0eXBlb2YgY29va2llUGFyc2VyO1xuICAgIGNvcnM6IHR5cGVvZiBjb3JzO1xuICAgIGhwcDogdHlwZW9mIGhwcDtcbiAgICBtb3JnYW46IHR5cGVvZiBtb3JnYW47XG4gICAgcGFzc3BvcnQ6IHR5cGVvZiBwYXNzcG9ydDtcbiAgICByYW5kb21CeXRlczogdHlwZW9mIHJhbmRvbUJ5dGVzO1xuICAgIHBhdGg6IHR5cGVvZiBwYXRoO1xuICAgIFJlZGlzU3RvcmU6IHR5cGVvZiBSZWRpc1N0b3JlO1xuICAgIGluaXRpYWxpemVTdGF0aWNSb3V0ZXM6IHR5cGVvZiBpbml0aWFsaXplU3RhdGljUm91dGVzO1xuICAgIGNzcmZNaWRkbGV3YXJlOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVDc3JmTWlkZGxld2FyZT47XG4gICAgZXJyb3JIYW5kbGVyOiB0eXBlb2YgZXJyb3JIYW5kbGVyO1xuICAgIGdldFJlZGlzQ2xpZW50OiB0eXBlb2YgZ2V0UmVkaXNDbGllbnQ7XG4gICAgaXBCbGFja2xpc3RNaWRkbGV3YXJlOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVJcEJsYWNrbGlzdD5bJ2lwQmxhY2tsaXN0TWlkZGxld2FyZSddO1xuICAgIGNyZWF0ZVRlc3RSb3V0ZXI6IChhcHA6IEFwcGxpY2F0aW9uKSA9PiB2b2lkO1xuICAgIHJhdGVMaW1pdE1pZGRsZXdhcmU6IGFueTtcbiAgICBzZXR1cFNlY3VyaXR5SGVhZGVyczogdHlwZW9mIHNldHVwU2VjdXJpdHlIZWFkZXJzO1xuICAgIHN0YXJ0TWVtb3J5TW9uaXRvcjogKCkgPT4gdm9pZDtcbiAgICBsb2dnZXI6IGFueTtcbiAgICBzdGF0aWNSb290UGF0aDogc3RyaW5nO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUFwcCh7XG4gICAgZXhwcmVzcyxcbiAgICBzZXNzaW9uLFxuICAgIGNvb2tpZVBhcnNlcixcbiAgICBjb3JzLFxuICAgIGhwcCxcbiAgICBtb3JnYW4sXG4gICAgcGFzc3BvcnQsXG4gICAgcmFuZG9tQnl0ZXMsXG4gICAgcGF0aCxcbiAgICBSZWRpc1N0b3JlLFxuICAgIGluaXRpYWxpemVTdGF0aWNSb3V0ZXMsXG4gICAgY3NyZk1pZGRsZXdhcmUsXG4gICAgZXJyb3JIYW5kbGVyLFxuICAgIGdldFJlZGlzQ2xpZW50LFxuICAgIGlwQmxhY2tsaXN0TWlkZGxld2FyZSxcbiAgICBjcmVhdGVUZXN0Um91dGVyLFxuICAgIHJhdGVMaW1pdE1pZGRsZXdhcmUsXG4gICAgc2V0dXBTZWN1cml0eUhlYWRlcnMsXG4gICAgc3RhcnRNZW1vcnlNb25pdG9yLFxuICAgIGxvZ2dlcixcbiAgICBzdGF0aWNSb290UGF0aFxufTogQXBwRGVwZW5kZW5jaWVzKTogUHJvbWlzZTxBcHBsaWNhdGlvbj4ge1xuICAgIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuXHRsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIG1pZGRsZXdhcmUnKTtcblxuXHQvLyBpbml0aWFsaXplIE1vcmdhbiBsb2dnZXJcblx0bG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBNb3JnYW4gbG9nZ2VyJyk7XG4gICAgYXBwLnVzZShtb3JnYW4oJ2NvbWJpbmVkJywgeyBzdHJlYW06IGxvZ2dlci5zdHJlYW0gfSkpO1xuXG5cdC8vIGluaXRpYWxpemUgY29va2llIHBhcnNlclxuXHRsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIGNvb2tpZSBwYXJzZXInKTtcbiAgICBhcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcblxuXHQvLyBpbml0aWFsaXplIENPUlNcblx0bG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBDT1JTJyk7XG4gICAgYXBwLnVzZShjb3JzKCkpO1xuXG5cdC8vIGluaXRpYWxpemUgSFBQXG5cdGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgSFBQJyk7XG4gICAgYXBwLnVzZShocHAoKSk7XG5cblx0Ly8gaW5pdGlhbGl6ZSBib2R5IHBhcnNlclxuXHRsb2dnZXIuaW5mbygnSW5pdGlhbGl6aW5nIGJvZHkgcGFyc2VyJyk7XG4gICAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG4gICAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XG5cbiAgICBhcHAudXNlKHNlc3Npb24oe1xuICAgICAgICBzZWNyZXQ6IHJhbmRvbUJ5dGVzKDMyKS50b1N0cmluZygnaGV4JyksXG4gICAgICAgIHJlc2F2ZTogZmFsc2UsXG4gICAgICAgIHNhdmVVbmluaXRpYWxpemVkOiB0cnVlLFxuICAgICAgICBzdG9yZTpcblx0XHRcdGZlYXR1cmVGbGFncy5lbmFibGVSZWRpc0ZsYWcgPyBuZXcgUmVkaXNTdG9yZSh7XG5cdFx0XHRcdGNsaWVudDogZ2V0UmVkaXNDbGllbnQoKVxuXHRcdFx0fSkgOiB1bmRlZmluZWQsXG4gICAgICAgIGNvb2tpZToge1xuXHRcdFx0c2VjdXJlOiBmZWF0dXJlRmxhZ3MuZW5hYmxlU3NsRmxhZyxcblx0XHRcdGh0dHBPbmx5OiB0cnVlLFxuXHRcdFx0c2FtZVNpdGU6ICdzdHJpY3QnXG5cdFx0fVxuICAgIH0pKTtcblxuXHQvLyBpbml0aWFsaXplIHBhc3Nwb3J0XG5cdGxvZ2dlci5pbmZvKCdJbml0aWFsaXppbmcgUGFzc3BvcnQgYW5kIFBhc3Nwb3J0IHNlc3Npb24nKTtcbiAgICBhcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7XG4gICAgYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpO1xuXG5cdC8vIGluaXRpYWxpemUgc2VjdXJpdHkgaGVhZGVyc1xuXHRlbmFibGVGZWF0dXJlV2l0aFByb2RPdmVycmlkZShcblx0XHRmZWF0dXJlRmxhZ3Muc2VjdXJlSGVhZGVyc0ZsYWcsXG5cdFx0J3NlY3VyaXR5IGhlYWRlcnMnLFxuXHRcdCgpID0+IHtcbiAgICAgICAgc2V0dXBTZWN1cml0eUhlYWRlcnMoYXBwLCB7XG4gICAgICAgICAgICBoZWxtZXRPcHRpb25zOiB7fSxcbiAgICAgICAgICAgIHBlcm1pc3Npb25zUG9saWN5T3B0aW9uczoge30sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cdC8vIGluaXRpYWxpemUgc3RhdGljIHJvdXRlc1xuICAgIGluaXRpYWxpemVTdGF0aWNSb3V0ZXMoYXBwLCBzdGF0aWNSb290UGF0aCk7XG5cblx0Ly8gaW5pdGlhbGl6ZSBDU1JGIG1pZGRsd2FyZVxuXHRlbmFibGVGZWF0dXJlV2l0aFByb2RPdmVycmlkZShcblx0XHRmZWF0dXJlRmxhZ3MuZW5hYmxlQ3NyZkZsYWcsXG5cdFx0J0NTUkYgbWlkZGxld2FyZScsXG5cdFx0KCkgPT4gYXBwLnVzZShjc3JmTWlkZGxld2FyZSlcblx0KTtcblxuXHQvLyBpbml0aWFsaXplIHJhdGUgbGltaXQgbWlkZGxld2FyZVxuXHRlbmFibGVGZWF0dXJlQmFzZWRPbkZsYWcoXG5cdFx0ZmVhdHVyZUZsYWdzLmVuYWJsZVJhdGVMaW1pdEZsYWcsXG5cdFx0J3JhdGUgbGltaXQgbWlkZGxld2FyZScsXG5cdFx0KCkgPT4gYXBwLnVzZShyYXRlTGltaXRNaWRkbGV3YXJlKVxuXHQpO1xuXG5cdC8vIGluaXRpYWxpemUgSVAgYmxhY2tsaXN0IG1pZGRsZXdhcmVcblx0ZW5hYmxlRmVhdHVyZUJhc2VkT25GbGFnKFxuXHRcdGZlYXR1cmVGbGFncy5lbmFibGVJcEJsYWNrbGlzdEZsYWcsXG5cdFx0J0lQIGJsYWNrbGlzdCBtaWRkbGV3YXJlJyxcblx0XHQoKSA9PiBhcHAudXNlKGlwQmxhY2tsaXN0TWlkZGxld2FyZSlcblx0KTtcblxuXHQvLyBpbml0aWFsaXplIHRlc3Qgcm91dGVyXG5cdGVuYWJsZUZlYXR1cmVCYXNlZE9uRmxhZyhmZWF0dXJlRmxhZ3MubG9hZFRlc3RSb3V0ZXNGbGFnLFxuXHRcdCd0ZXN0IHJvdXRlcicsXG5cdFx0KCkgPT4gY3JlYXRlVGVzdFJvdXRlcihhcHApXG5cdCk7XG5cblx0Ly8gaW5pdGlhbGl6ZSBtZW1vcnkgbW9uaXRvciBvciBSZWRpcyBzZXNzaW9uLCBkZXBlbmRhbnQgb24gZmxhZyB2YWx1ZVxuXHRpZiAoIWZlYXR1cmVGbGFncy5lbmFibGVSZWRpc0ZsYWcpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBtZW1vcnkgbW9uaXRvcicpO1xuICAgICAgICBzdGFydE1lbW9yeU1vbml0b3IoKTtcbiAgICB9IGVsc2Uge1xuXHRcdGxvZ2dlci5pbmZvKFxuXHRcdFx0J1JlZGlzIHNlc3Npb24gaXMgZW5hYmxlZCwgc2tpcHBpbmcgbWVtb3J5IG1vbml0b3IgaW5pdGlhbGl6YXRpb24nXG5cdFx0KTtcblx0fVxuXG5cdC8vIGluaXRpYWxpemUgZXJyb3IgaGFuZGxlclxuXHRlbmFibGVGZWF0dXJlQmFzZWRPbkZsYWcoZmVhdHVyZUZsYWdzLmVuYWJsZUVycm9ySGFuZGxlckZsYWcsXG5cdFx0J2Vycm9yIGhhbmRsZXInLFxuXHRcdCgpID0+IGFwcC51c2UoZXJyb3JIYW5kbGVyKVxuXHQpO1xuXG4gICAgcmV0dXJuIGFwcDtcbn1cbiJdfQ==
