import { constants } from 'crypto';
import gracefulShutdown from 'http-graceful-shutdown';
import https from 'https';
import setupLogger from './logger.js';
import sops from './sops.js';
import {
	getFeatureFlags,
	getRedisClient,
	getSequelizeInstance,
	initializeDatabase
} from '../index.js';
const logger = setupLogger();
const featureFlags = getFeatureFlags();
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const SSL_FLAG = featureFlags.enableSslFlag;
const REDIS_FLAG = featureFlags.enableRedisFlag;
const ciphers = [
	'ECDHE-ECDSA-AES256-GCM-SHA384',
	'ECDHE-RSA-AES256-GCM-SHA384',
	'ECDHE-ECDSA-CHACHA20-POLY1305',
	'ECDHE-RSA-CHACHA20-POLY1305',
	'ECDHE-ECDSA-AES128-GCM-SHA256',
	'ECDHE-RSA-AES128-GCM-SHA256',
	'ECDHE-ECDSA-AES256-SHA384',
	'ECDHE-RSA-AES256-SHA384',
	'ECDHE-ECDSA-AES128-SHA256',
	'ECDHE-RSA-AES128-SHA256'
];
async function declareOptions() {
	const sslKeys = await sops.getSSLKeys();
	logger.info('SSL keys retrieved');
	try {
		const options = {
			key: sslKeys.key,
			cert: sslKeys.cert,
			allowHTTP1: true,
			secureOptions:
				constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
			ciphers: ciphers.join(':'),
			honorCipherOrder: true
		};
		return options;
	} catch (error) {
		logger.error(`Error declaring options: ${error}`);
		throw new Error('Error declaring options');
	}
}
export async function setupHttp(app) {
	logger.info('setupHttp() executing');
	const options = await declareOptions();
	async function onShutdown() {
		logger.info('Cleaning up resources before shutdown');
		const sequelize = getSequelizeInstance();
		try {
			await sequelize.close();
			logger.info('Database connection closed');
		} catch (error) {
			logger.error(`Error closing database connection: ${error}`);
		}
		if (REDIS_FLAG) {
			logger.info('REDIS_FLAG is true. Closing Redis connection');
		}
		try {
			const redisClient = getRedisClient();
			if (redisClient) {
				await redisClient.quit();
				logger.info('Redis connection closed');
			}
		} catch (error) {
			logger.error(`Error closing Redis connection: ${error}`);
		}
		// Notify monitoring systems here
		// try {
		// } catch (error) {
		// } logger.error(`Error notifying monitoring systems: ${error} `);
		try {
			await new Promise(resolve => {
				logger.close();
				resolve();
			});
			console.log('Logger closed');
		} catch (error) {
			logger.error(`Error closing logger: ${error}`);
		}
	}
	async function startServer() {
		try {
			logger.info(`Starting HTTP server on port ${SERVER_PORT}`);
			logger.info(
				'Initializing database before starting server. Awaiting execution of initializeDatabase()'
			);
			await initializeDatabase();
			let server;
			if (SSL_FLAG) {
				logger.info('SSL_FLAG is true. Starting HTTP server with SSL');
				server = https
					.createServer(options, app)
					.listen(SERVER_PORT, () => {
						logger.info(
							`HTTP1.1 server running on port ${SERVER_PORT}`
						);
					});
			} else {
				logger.info(
					'SSL_FLAG is false. Starting HTTP server without SSL'
				);
				server = app.listen(SERVER_PORT, () => {
					logger.info(
						`HTTP1.1 server running on port ${SERVER_PORT}`
					);
				});
			}
			gracefulShutdown(server, {
				signals: 'SIGINT SIGTERM',
				timeout: 30000,
				development: false,
				onShutdown,
				finally: () => {
					console.log('Server has gracefully shut down');
				}
			});
		} catch (err) {
			if (err instanceof Error) {
				logger.error(`Failed to start server: ${err.message}`);
			} else {
				logger.error('Failed to start server due to an unknown error');
			}
			process.exit(1);
		}
	}
	return { startServer };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWcvaHR0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ25DLE9BQU8sZ0JBQWdCLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sV0FBVyxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLElBQUksTUFBTSxRQUFRLENBQUM7QUFHMUIsT0FBTyxFQUNOLGVBQWUsRUFDZixjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixNQUFNLFVBQVUsQ0FBQztBQVNsQixNQUFNLE1BQU0sR0FBRyxXQUFXLEVBQUUsQ0FBQztBQUM3QixNQUFNLFlBQVksR0FBRyxlQUFlLEVBQUUsQ0FBQztBQUV2QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUM7QUFDcEQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQztBQUM1QyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDO0FBRWhELE1BQU0sT0FBTyxHQUFHO0lBQ2YsK0JBQStCO0lBQy9CLDZCQUE2QjtJQUM3QiwrQkFBK0I7SUFDL0IsNkJBQTZCO0lBQzdCLCtCQUErQjtJQUMvQiw2QkFBNkI7SUFDN0IsMkJBQTJCO0lBQzNCLHlCQUF5QjtJQUN6QiwyQkFBMkI7SUFDM0IseUJBQXlCO0NBQ3pCLENBQUM7QUFFRixLQUFLLFVBQVUsY0FBYztJQUM1QixNQUFNLE9BQU8sR0FBWSxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFFbEMsSUFBSSxDQUFDO1FBQ0osTUFBTSxPQUFPLEdBQUc7WUFDZixHQUFHLEVBQUUsT0FBTyxD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QUFFO29CQUN6QixNQUFNLENBQUMsSUFBSSxDQUNWLGtDQUFrQyxXQUFXLEVBQUUsQ0FDL0MsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUNWLHFEQUFxRCxDQUNyRCxDQUFDO2dCQUVGLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7b0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQ1Ysa0NBQWtDLFdBQVcsRUFBRSxDQUMvQyxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELGdCQUFnQixDQUFDLE1BQU0sRUFBRTtnQkFDeEIsT0FBTyxFQUFFLGdCQUFnQjtnQkFDekIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLFVBQVU7Z0JBQ1YsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQ2hELENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksR0FBRyxZQUFZLEtBQUssRUFBRSxDQUFDO2dCQUMxQixNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN4RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7SUFDRixDQUFDO0lBRUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBsaWNhdGlvbiB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnY3J5cHRvJztcbmltcG9ydCBncmFjZWZ1bFNodXRkb3duIGZyb20gJ2h0dHAtZ3JhY2VmdWwtc2h1dGRvd24nO1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCBzZXR1cExvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgc29wcyBmcm9tICcuL3NvcHMnO1xuaW1wb3J0IHsgU2VxdWVsaXplIH0gZnJvbSAnc2VxdWVsaXplJztcbmltcG9ydCB7IFNlY3VyZUNvbnRleHRPcHRpb25zIH0gZnJvbSAndGxzJztcbmltcG9ydCB7XG5cdGdldEZlYXR1cmVGbGFncyxcblx0Z2V0UmVkaXNDbGllbnQsXG5cdGdldFNlcXVlbGl6ZUluc3RhbmNlLFxuXHRpbml0aWFsaXplRGF0YWJhc2Vcbn0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbnRlcmZhY2UgU1NMS2V5cyB7XG5cdGtleTogc3RyaW5nO1xuXHRjZXJ0OiBzdHJpbmc7XG59XG5cbnR5cGUgT3B0aW9ucyA9IFNlY3VyZUNvbnRleHRPcHRpb25zO1xuXG5jb25zdCBsb2dnZXIgPSBzZXR1cExvZ2dlcigpO1xuY29uc3QgZmVhdHVyZUZsYWdzID0gZ2V0RmVhdHVyZUZsYWdzKCk7XG5cbmNvbnN0IFNFUlZFUl9QT1JUID0gcHJvY2Vzcy5lbnYuU0VSVkVSX1BPUlQgfHwgMzAwMDtcbmNvbnN0IFNTTF9GTEFHID0gZmVhdHVyZUZsYWdzLmVuYWJsZVNzbEZsYWc7XG5jb25zdCBSRURJU19GTEFHID0gZmVhdHVyZUZsYWdzLmVuYWJsZVJlZGlzRmxhZztcblxuY29uc3QgY2lwaGVycyA9IFtcblx0J0VDREhFLUVDRFNBLUFFUzI1Ni1HQ00tU0hBMzg0Jyxcblx0J0VDREhFLVJTQS1BRVMyNTYtR0NNLVNIQTM4NCcsXG5cdCdFQ0RIRS1FQ0RTQS1DSEFDSEEyMC1QT0xZMTMwNScsXG5cdCdFQ0RIRS1SU0EtQ0hBQ0hBMjAtUE9MWTEzMDUnLFxuXHQnRUNESEUtRUNEU0EtQUVTMTI4LUdDTS1TSEEyNTYnLFxuXHQnRUNESEUtUlNBLUFFUzEyOC1HQ00tU0hBMjU2Jyxcblx0J0VDREhFLUVDRFNBLUFFUzI1Ni1TSEEzODQnLFxuXHQnRUNESEUtUlNBLUFFUzI1Ni1TSEEzODQnLFxuXHQnRUNESEUtRUNEU0EtQUVTMTI4LVNIQTI1NicsXG5cdCdFQ0RIRS1SU0EtQUVTMTI4LVNIQTI1Nidcbl07XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY2xhcmVPcHRpb25zKCk6IFByb21pc2U8T3B0aW9ucz4ge1xuXHRjb25zdCBzc2xLZXlzOiBTU0xLZXlzID0gYXdhaXQgc29wcy5nZXRTU0xLZXlzKCk7XG5cdGxvZ2dlci5pbmZvKCdTU0wga2V5cyByZXRyaWV2ZWQnKTtcblxuXHR0cnkge1xuXHRcdGNvbnN0IG9wdGlvbnMgPSB7XG5cdFx0XHRrZXk6IHNzbEtleXMua2V5LFxuXHRcdFx0Y2VydDogc3NsS2V5cy5jZXJ0LFxuXHRcdFx0YWxsb3dIVFRQMTogdHJ1ZSxcblx0XHRcdHNlY3VyZU9wdGlvbnM6XG5cdFx0XHRcdGNvbnN0YW50cy5TU0xfT1BfTk9fVExTdjEgfCBjb25zdGFudHMuU1NMX09QX05PX1RMU3YxXzEsXG5cdFx0XHRjaXBoZXJzOiBjaXBoZXJzLmpvaW4oJzonKSxcblx0XHRcdGhvbm9yQ2lwaGVyT3JkZXI6IHRydWVcblx0XHR9O1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0bG9nZ2VyLmVycm9yKGBFcnJvciBkZWNsYXJpbmcgb3B0aW9uczogJHtlcnJvcn1gKTtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGRlY2xhcmluZyBvcHRpb25zJyk7XG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldHVwSHR0cChhcHA6IEFwcGxpY2F0aW9uKSB7XG5cdGxvZ2dlci5pbmZvKCdzZXR1cEh0dHAoKSBleGVjdXRpbmcnKTtcblxuXHRjb25zdCBvcHRpb25zID0gYXdhaXQgZGVjbGFyZU9wdGlvbnMoKTtcblxuXHRhc3luYyBmdW5jdGlvbiBvblNodXRkb3duKCkge1xuXHRcdGxvZ2dlci5pbmZvKCdDbGVhbmluZyB1cCByZXNvdXJjZXMgYmVmb3JlIHNodXRkb3duJyk7XG5cblx0XHRjb25zdCBzZXF1ZWxpemU6IFNlcXVlbGl6ZSA9IGdldFNlcXVlbGl6ZUluc3RhbmNlKCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgc2VxdWVsaXplLmNsb3NlKCk7XG5cdFx0XHRsb2dnZXIuaW5mbygnRGF0YWJhc2UgY29ubmVjdGlvbiBjbG9zZWQnKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0bG9nZ2VyLmVycm9yKGBFcnJvciBjbG9zaW5nIGRhdGFiYXNlIGNvbm5lY3Rpb246ICR7ZXJyb3J9YCk7XG5cdFx0fVxuXG5cdFx0aWYgKFJFRElTX0ZMQUcpIHtcblx0XHRcdGxvZ2dlci5pbmZvKCdSRURJU19GTEFHIGlzIHRydWUuIENsb3NpbmcgUmVkaXMgY29ubmVjdGlvbicpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVkaXNDbGllbnQgPSBnZXRSZWRpc0NsaWVudCgpO1xuXHRcdFx0aWYgKHJlZGlzQ2xpZW50KSB7XG5cdFx0XHRcdGF3YWl0IHJlZGlzQ2xpZW50LnF1aXQoKTtcblx0XHRcdFx0bG9nZ2VyLmluZm8oJ1JlZGlzIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGxvZ2dlci5lcnJvcihgRXJyb3IgY2xvc2luZyBSZWRpcyBjb25uZWN0aW9uOiAke2Vycm9yfWApO1xuXHRcdH1cblxuXHRcdC8vIE5vdGlmeSBtb25pdG9yaW5nIHN5c3RlbXMgaGVyZVxuXHRcdC8vIHRyeSB7XG5cdFx0Ly8gfSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyB9IGxvZ2dlci5lcnJvcihgRXJyb3Igbm90aWZ5aW5nIG1vbml0b3Jpbmcgc3lzdGVtczogJHtlcnJvcn0gYCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG5cdFx0XHRcdGxvZ2dlci5jbG9zZSgpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnNvbGUubG9nKCdMb2dnZXIgY2xvc2VkJyk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGxvZ2dlci5lcnJvcihgRXJyb3IgY2xvc2luZyBsb2dnZXI6ICR7ZXJyb3J9YCk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGxvZ2dlci5pbmZvKGBTdGFydGluZyBIVFRQIHNlcnZlciBvbiBwb3J0ICR7U0VSVkVSX1BPUlR9YCk7XG5cdFx0XHRsb2dnZXIuaW5mbyhcblx0XHRcdFx0J0luaXRpYWxpemluZyBkYXRhYmFzZSBiZWZvcmUgc3RhcnRpbmcgc2VydmVyLiBBd2FpdGluZyBleGVjdXRpb24gb2YgaW5pdGlhbGl6ZURhdGFiYXNlKCknXG5cdFx0XHQpO1xuXG5cdFx0XHRhd2FpdCBpbml0aWFsaXplRGF0YWJhc2UoKTtcblxuXHRcdFx0bGV0IHNlcnZlcjtcblxuXHRcdFx0aWYgKFNTTF9GTEFHKSB7XG5cdFx0XHRcdGxvZ2dlci5pbmZvKCdTU0xfRkxBRyBpcyB0cnVlLiBTdGFydGluZyBIVFRQIHNlcnZlciB3aXRoIFNTTCcpO1xuXG5cdFx0XHRcdHNlcnZlciA9IGh0dHBzXG5cdFx0XHRcdFx0LmNyZWF0ZVNlcnZlcihvcHRpb25zLCBhcHApXG5cdFx0XHRcdFx0Lmxpc3RlbihTRVJWRVJfUE9SVCwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oXG5cdFx0XHRcdFx0XHRcdGBIVFRQMS4xIHNlcnZlciBydW5uaW5nIG9uIHBvcnQgJHtTRVJWRVJfUE9SVH1gXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bG9nZ2VyLmluZm8oXG5cdFx0XHRcdFx0J1NTTF9GTEFHIGlzIGZhbHNlLiBTdGFydGluZyBIVFRQIHNlcnZlciB3aXRob3V0IFNTTCdcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRzZXJ2ZXIgPSBhcHAubGlzdGVuKFNFUlZFUl9QT1JULCAoKSA9PiB7XG5cdFx0XHRcdFx0bG9nZ2VyLmluZm8oXG5cdFx0XHRcdFx0XHRgSFRUUDEuMSBzZXJ2ZXIgcnVubmluZyBvbiBwb3J0ICR7U0VSVkVSX1BPUlR9YFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRncmFjZWZ1bFNodXRkb3duKHNlcnZlciwge1xuXHRcdFx0XHRzaWduYWxzOiAnU0lHSU5UIFNJR1RFUk0nLFxuXHRcdFx0XHR0aW1lb3V0OiAzMDAwMCxcblx0XHRcdFx0ZGV2ZWxvcG1lbnQ6IGZhbHNlLFxuXHRcdFx0XHRvblNodXRkb3duLFxuXHRcdFx0XHRmaW5hbGx5OiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ1NlcnZlciBoYXMgZ3JhY2VmdWxseSBzaHV0IGRvd24nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdFx0bG9nZ2VyLmVycm9yKGBGYWlsZWQgdG8gc3RhcnQgc2VydmVyOiAke2Vyci5tZXNzYWdlfWApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgc2VydmVyIGR1ZSB0byBhbiB1bmtub3duIGVycm9yJyk7XG5cdFx0XHR9XG5cdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgc3RhcnRTZXJ2ZXIgfTtcbn1cbiJdfQ==
