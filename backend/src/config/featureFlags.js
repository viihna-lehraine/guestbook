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
	secureHeadersFlag: parseBoolean(process.env.FEATURE_SECURE_HEADERS)
};
export default featureFlags;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZUZsYWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvY29uZmlnL2ZlYXR1cmVGbGFncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFDaEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXJELE9BQU8sRUFBRSxDQUFDO0FBY1YsSUFBSSxZQUFZLEdBQWlCO0lBQ2hDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDO0lBQ3BFLFVBQVUsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7SUFDckQsU0FBUyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUNsRCxTQUFTLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBQ2xELGlCQUFpQixFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDO0lBQ25FLGVBQWUsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztJQUMvRCxvQkFBb0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztJQUMxRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztJQUN0RSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztDQUNuRSxDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9hZEVudiBmcm9tICcuL2xvYWRFbnYnO1xuaW1wb3J0IHsgcGFyc2VCb29sZWFuIH0gZnJvbSAnLi4vdXRpbHMvcGFyc2VCb29sZWFuJztcblxubG9hZEVudigpO1xuXG5pbnRlcmZhY2UgRmVhdHVyZUZsYWdzIHtcblx0YXBpUm91dGVzQ3NyZkZsYWc6IGJvb2xlYW47XG5cdGRiU3luY0ZsYWc6IGJvb2xlYW47XG5cdGh0dHAxRmxhZzogYm9vbGVhbjtcblx0aHR0cDJGbGFnOiBib29sZWFuO1xuXHRodHRwc1JlZGlyZWN0RmxhZzogYm9vbGVhbjtcblx0aXBCbGFja2xpc3RGbGFnOiBib29sZWFuO1xuXHRsb2FkU3RhdGljUm91dGVzRmxhZzogYm9vbGVhbjtcblx0bG9hZFRlc3RSb3V0ZXNGbGFnOiBib29sZWFuO1xuXHRzZWN1cmVIZWFkZXJzRmxhZzogYm9vbGVhbjtcbn1cblxubGV0IGZlYXR1cmVGbGFnczogRmVhdHVyZUZsYWdzID0ge1xuXHRhcGlSb3V0ZXNDc3JmRmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfQVBJX1JPVVRFU19DU1JGKSxcblx0ZGJTeW5jRmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfREJfU1lOQyksXG5cdGh0dHAxRmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfSFRUUDEpLFxuXHRodHRwMkZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0hUVFAyKSxcblx0aHR0cHNSZWRpcmVjdEZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX0hUVFBTX1JFRElSRUNUKSxcblx0aXBCbGFja2xpc3RGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9JUF9CTEFDS0xJU1QpLFxuXHRsb2FkU3RhdGljUm91dGVzRmxhZzogcGFyc2VCb29sZWFuKHByb2Nlc3MuZW52LkZFQVRVUkVfTE9BRF9TVEFUSUNfUk9VVEVTKSxcblx0bG9hZFRlc3RSb3V0ZXNGbGFnOiBwYXJzZUJvb2xlYW4ocHJvY2Vzcy5lbnYuRkVBVFVSRV9MT0FEX1RFU1RfUk9VVEVTKSxcblx0c2VjdXJlSGVhZGVyc0ZsYWc6IHBhcnNlQm9vbGVhbihwcm9jZXNzLmVudi5GRUFUVVJFX1NFQ1VSRV9IRUFERVJTKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZmVhdHVyZUZsYWdzO1xuIl19
