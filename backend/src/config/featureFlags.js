import loadEnv from './loadEnv.js';
import { parseBoolean } from '../utils/parseBoolean.js';
loadEnv();
let featureFlags = {
	apiRoutesCsrfFlag: parseBoolean(process.env.FEATURE_API_ROUTES_CSRF),
	dbSyncFlag: parseBoolean(process.env.FEATURE_DB_SYNC),
	http1Flag: parseBoolean(process.env.FEATURE_HTTP1),
	http2Flag: parseBoolean(process.env.FEATURE_HTTP2),
	httpsRedirectFlag: parseBoolean(process.env.FEATURE_HTTPS_REDIRECT),
	ipBlacklistFlag: parseBoolean(process.env.FEATURE_IP_BLACKLIST),
	loadStaticRoutesFlag: parseBoolean(process.env.FEATURE_LOAD_STATIC_ROUTES),
	loadTestRoutesFlag: parseBoolean(process.env.FEATURE_LOAD_TEST_ROUTES),
	secureHeadersFlag: parseBoolean(process.env.FEATURE_SECURE_HEADERS),
	sequelizeLoggingFlag: parseBoolean(process.env.FEATURE_SEQUELIZE_LOGGING)
};
export default featureFlags;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZUZsYWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvY29uZmlnL2ZlYXR1cmVGbGFncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFDaEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXJELE9BQU8sRUFBRSxDQUFDO0FBZVYsSUFBSSxZQUFZLEdBQWlCO0lBQ2hDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDO0lBQ3BFLFVBQVUsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7SUFDckQsU0FBUyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUNsRCxTQUFTLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBQ2xELGlCQUFpQixFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDO0lBQ25FLGVBQWUsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztJQUMvRCxvQkFBb0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztJQUMxRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztJQUN0RSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztJQUNuRSxvQkFBb0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQztDQUN6RSxDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9hZEVudiBmcm9tICcuL2xvYWRFbnYnO1xuaW1wb3J0IHsgcGFyc2VCb29sZWFuIH0gZnJvbSAnLi4vdXRpbHMvcGFyc2VCb29sZWFuJztcblxubG9hZEVudigpO1xuXG5pbnRlcmZhY2UgRmVhdHVyZUZsYWdzIHtcblx0YXBpUm91dGVzQ3NyZkZsYWc6IGJvb2xlYW47XG5cdGRiU3luY0ZsYWc6IGJvb2xlYW47XG5cdGh0dHAxRmxhZzogYm9vbGVhbjtcblx0aHR0cDJGbGFnOiBib29sZWFuO1xuXHRodHRwc1JlZGlyZWN0RmxhZzogYm9vbGVhbjtcblx0aXBCbGFja2xpc3RGbGFnOiBib29sZWFuO1xuXHRsb2FkU3RhdGljUm91dGVzRmxhZzogYm9vbGVhbjtcblx0bG9hZFRlc3RSb3V0ZXNGbGFnOiBib29sZWFuO1xuXHRzZWN1cmVIZWFkZXJzRmxhZzogYm9vbGVhbjtcblx0c2VxdWVsaXplTG9nZ2luZ0ZsYWc6IGJvb2xlYW47XG59XG5cbmxldCBmZWF0dXJlRmxhZ3M6IEZlYXR1cmVGbGFncyA9IHtcblx0YXBpUm91dGVzQ3NyZkZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0FQSV9ST1VURVNfQ1NSRiksXG5cdGRiU3luY0ZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0RCX1NZTkMpLFxuXHRodHRwMUZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0hUVFAxKSxcblx0aHR0cDJGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9IVFRQMiksXG5cdGh0dHBzUmVkaXJlY3RGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9IVFRQU19SRURJUkVDVCksXG5cdGlwQmxhY2tsaXN0RmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfSVBfQkxBQ0tMSVNUKSxcblx0bG9hZFN0YXRpY1JvdXRlc0ZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0xPQURfU1RBVElDX1JPVVRFUyksXG5cdGxvYWRUZXN0Um91dGVzRmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfTE9BRF9URVNUX1JPVVRFUyksXG5cdHNlY3VyZUhlYWRlcnNGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9TRUNVUkVfSEVBREVSUyksXG5cdHNlcXVlbGl6ZUxvZ2dpbmdGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9TRVFVRUxJWkVfTE9HR0lORylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZlYXR1cmVGbGFncztcbiJdfQ==
