import { execSync } from 'child_process';
import path from 'path';
import https from 'https';
import http from 'http';
import gracefulShutdown from 'http-graceful-shutdown';
const SERVER_PORT = parseInt(process.env.SERVER_PORT ?? '3000', 10);
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
async function declareOptions({
	sops,
	fs,
	logger,
	constants,
	DECRYPT_KEYS,
	SSL_KEY,
	SSL_CERT,
	ciphers
}) {
	let sslKeys;
	try {
		if (DECRYPT_KEYS) {
			sslKeys = await sops.getSSLKeys({
				logger,
				execSync,
				getDirectoryPath: () => path.resolve(process.cwd())
			});
			logger.info('SSL Keys retrieved via sops.getSSLKeys()');
		} else {
			if (!SSL_KEY || !SSL_CERT) {
				throw new Error(
					'SSL_KEY or SSL_CERT environment variable is not set'
				);
			}
			const key = await fs.readFile(SSL_KEY, 'utf8');
			const cert = await fs.readFile(SSL_CERT, 'utf8');
			sslKeys = { key, cert };
			logger.info('Using unencrypted SSL Keys from environment files');
		}
		return {
			key: sslKeys.key,
			cert: sslKeys.cert,
			secureOptions:
				constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
			ciphers: ciphers.join(':'),
			honorCipherOrder: true
		};
	} catch (error) {
		logger.error(`Failed to declare SSL options: ${error}`);
		throw error;
	}
}
// Main function to set up HTTP or HTTPS server
export async function setupHttp({
	app,
	sops,
	fs: fsPromises,
	logger,
	constants,
	getFeatureFlags,
	getRedisClient,
	getSequelizeInstance
}) {
	logger.info('setupHttp() executing');
	const featureFlags = getFeatureFlags();
	let options;
	if (featureFlags.enableSslFlag) {
		logger.info(
			`SSL_FLAG is set to true, setting up HTTPS server on port ${SERVER_PORT}`
		);
		options = await declareOptions({
			sops,
			fs: fsPromises,
			logger,
			constants,
			DECRYPT_KEYS: featureFlags.decryptKeysFlag,
			SSL_KEY: process.env.SERVER_SSL_KEY_PATH || null,
			SSL_CERT: process.env.SERVER_SSL_CERT_PATH || null,
			ciphers
		});
	} else {
		logger.info('SSL_FLAG is set to false, setting up HTTP server');
	}
	function startServer() {
		const server = options
			? https.createServer(options, app)
			: http.createServer(app);
		server.listen(SERVER_PORT, () => {
			logger.info(`Server running on port ${SERVER_PORT}`);
		});
		gracefulShutdown(server, {
			signals: 'SIGINT SIGTERM',
			timeout: 30000,
			onShutdown: async () => {
				logger.info('Cleaning up resources before shutdown');
				const sequelize = getSequelizeInstance();
				try {
					await sequelize.close();
					logger.info('Database connection closed');
				} catch (error) {
					logger.error(`Error closing database connection: ${error}`);
				}
				if (featureFlags.enableRedisFlag) {
					logger.info(
						'REDIS_FLAG is set to true. Closing redis connection'
					);
					try {
						const redisClient = getRedisClient();
						if (redisClient) {
							await redisClient.quit();
							logger.info('Redis connection closed');
						}
					} catch (error) {
						logger.error(
							`Error closing redis connection: ${error}`
						);
					}
				}
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
		});
	}
	return { startServer };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWcvaHR0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUl4QixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sZ0JBQWdCLE1BQU0sd0JBQXdCLENBQUM7QUF3QnRELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFcEUsTUFBTSxPQUFPLEdBQUc7SUFDWiwrQkFBK0I7SUFDL0IsNkJBQTZCO0lBQzdCLCtCQUErQjtJQUMvQiw2QkFBNkI7SUFDN0IsK0JBQStCO0lBQy9CLDZCQUE2QjtJQUM3QiwyQkFBMkI7SUFDM0IseUJBQXlCO0lBQ3pCLDJCQUEyQjtJQUMzQix5QkFBeUI7Q0FDNUIsQ0FBQztBQUVGLEtBQUssVUFBVSxjQUFjLENBQUMsRUFDMUIsSUFBSSxFQUNKLEVBQUUsRUFDRixNQUFNLEVBQ04sU0FBUyxFQUNULFlBQVksRUFDWixPQUFPLEVBQ1AsUUFBUSxFQUNSLE9BQU8sRUFVVjtJQUNHLElBQUksT0FBZ0IsQ0FBQztJQUVyQixJQUFJLENBQUM7UUFDRCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2YsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDNUIsTUFBTTtnQkFDTixRQUFRO2dCQUNSLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3RELENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUM1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LENBQUM7QUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBTZXF1ZWxpemUgfSBmcm9tICdzZXF1ZWxpemUnO1xuaW1wb3J0IHsgU2VjdXJlQ29udGV4dE9wdGlvbnMgfSBmcm9tICd0bHMnO1xuaW1wb3J0IHsgY29uc3RhbnRzIGFzIGNyeXB0b0NvbnN0YW50cyB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgU29wc0RlcGVuZGVuY2llcyBmcm9tICcuLi91dGlscy9zb3BzJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgRmVhdHVyZUZsYWdzIH0gZnJvbSAnLi4vdXRpbHMvZmVhdHVyZUZsYWdzJztcbmltcG9ydCB7IFJlZGlzQ2xpZW50VHlwZSB9IGZyb20gJ3JlZGlzJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCBncmFjZWZ1bFNodXRkb3duIGZyb20gJ2h0dHAtZ3JhY2VmdWwtc2h1dGRvd24nO1xuXG5pbnRlcmZhY2UgU2V0dXBIdHRwUGFyYW1zIHtcbiAgICBhcHA6IEFwcGxpY2F0aW9uO1xuICAgIHNvcHM6IHR5cGVvZiBTb3BzRGVwZW5kZW5jaWVzO1xuICAgIGZzOiB0eXBlb2YgaW1wb3J0KCdmcycpLnByb21pc2VzO1xuICAgIGxvZ2dlcjogTG9nZ2VyO1xuICAgIGNvbnN0YW50czogdHlwZW9mIGNyeXB0b0NvbnN0YW50cztcbiAgICBnZXRGZWF0dXJlRmxhZ3M6ICgpID0+IEZlYXR1cmVGbGFncztcbiAgICBnZXRSZWRpc0NsaWVudDogKCkgPT4gUmVkaXNDbGllbnRUeXBlIHwgbnVsbDtcbiAgICBnZXRTZXF1ZWxpemVJbnN0YW5jZTogKCkgPT4gU2VxdWVsaXplO1xufVxuXG5pbnRlcmZhY2UgU2V0dXBIdHRwUmV0dXJuIHtcbiAgICBzdGFydFNlcnZlcjogKCkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIFNTTEtleXMge1xuICAgIGtleTogc3RyaW5nO1xuICAgIGNlcnQ6IHN0cmluZztcbn1cblxudHlwZSBPcHRpb25zID0gU2VjdXJlQ29udGV4dE9wdGlvbnM7XG5cbmNvbnN0IFNFUlZFUl9QT1JUID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuU0VSVkVSX1BPUlQgPz8gJzMwMDAnLCAxMCk7XG5cbmNvbnN0IGNpcGhlcnMgPSBbXG4gICAgJ0VDREhFLUVDRFNBLUFFUzI1Ni1HQ00tU0hBMzg0JyxcbiAgICAnRUNESEUtUlNBLUFFUzI1Ni1HQ00tU0hBMzg0JyxcbiAgICAnRUNESEUtRUNEU0EtQ0hBQ0hBMjAtUE9MWTEzMDUnLFxuICAgICdFQ0RIRS1SU0EtQ0hBQ0hBMjAtUE9MWTEzMDUnLFxuICAgICdFQ0RIRS1FQ0RTQS1BRVMxMjgtR0NNLVNIQTI1NicsXG4gICAgJ0VDREhFLVJTQS1BRVMxMjgtR0NNLVNIQTI1NicsXG4gICAgJ0VDREhFLUVDRFNBLUFFUzI1Ni1TSEEzODQnLFxuICAgICdFQ0RIRS1SU0EtQUVTMjU2LVNIQTM4NCcsXG4gICAgJ0VDREhFLUVDRFNBLUFFUzEyOC1TSEEyNTYnLFxuICAgICdFQ0RIRS1SU0EtQUVTMTI4LVNIQTI1Nidcbl07XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY2xhcmVPcHRpb25zKHtcbiAgICBzb3BzLFxuICAgIGZzLFxuICAgIGxvZ2dlcixcbiAgICBjb25zdGFudHMsXG4gICAgREVDUllQVF9LRVlTLFxuICAgIFNTTF9LRVksXG4gICAgU1NMX0NFUlQsXG4gICAgY2lwaGVyc1xufToge1xuICAgIHNvcHM6IHR5cGVvZiBTb3BzRGVwZW5kZW5jaWVzO1xuICAgIGZzOiB0eXBlb2YgaW1wb3J0KCdmcycpLnByb21pc2VzO1xuICAgIGxvZ2dlcjogTG9nZ2VyO1xuICAgIGNvbnN0YW50czogdHlwZW9mIGltcG9ydCgnY3J5cHRvJykuY29uc3RhbnRzO1xuICAgIERFQ1JZUFRfS0VZUzogYm9vbGVhbjtcbiAgICBTU0xfS0VZOiBzdHJpbmcgfCBudWxsO1xuICAgIFNTTF9DRVJUOiBzdHJpbmcgfCBudWxsO1xuICAgIGNpcGhlcnM6IHN0cmluZ1tdO1xufSk6IFByb21pc2U8T3B0aW9ucz4ge1xuICAgIGxldCBzc2xLZXlzOiBTU0xLZXlzO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKERFQ1JZUFRfS0VZUykge1xuICAgICAgICAgICAgc3NsS2V5cyA9IGF3YWl0IHNvcHMuZ2V0U1NMS2V5cyh7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLFxuICAgICAgICAgICAgICAgIGV4ZWNTeW5jLFxuICAgICAgICAgICAgICAgIGdldERpcmVjdG9yeVBhdGg6ICgpID0+IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnU1NMIEtleXMgcmV0cmlldmVkIHZpYSBzb3BzLmdldFNTTEtleXMoKScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFTU0xfS0VZIHx8ICFTU0xfQ0VSVCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU1NMX0tFWSBvciBTU0xfQ0VSVCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBmcy5yZWFkRmlsZShTU0xfS0VZLCAndXRmOCcpO1xuICAgICAgICAgICAgY29uc3QgY2VydCA9IGF3YWl0IGZzLnJlYWRGaWxlKFNTTF9DRVJULCAndXRmOCcpO1xuXG4gICAgICAgICAgICBzc2xLZXlzID0geyBrZXksIGNlcnQgfTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB1bmVuY3J5cHRlZCBTU0wgS2V5cyBmcm9tIGVudmlyb25tZW50IGZpbGVzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiBzc2xLZXlzLmtleSxcbiAgICAgICAgICAgIGNlcnQ6IHNzbEtleXMuY2VydCxcbiAgICAgICAgICAgIHNlY3VyZU9wdGlvbnM6XG5cdFx0XHRcdGNvbnN0YW50cy5TU0xfT1BfTk9fVExTdjEgfCBjb25zdGFudHMuU1NMX09QX05PX1RMU3YxXzEsXG4gICAgICAgICAgICBjaXBoZXJzOiBjaXBoZXJzLmpvaW4oJzonKSxcbiAgICAgICAgICAgIGhvbm9yQ2lwaGVyT3JkZXI6IHRydWVcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoYEZhaWxlZCB0byBkZWNsYXJlIFNTTCBvcHRpb25zOiAke2Vycm9yfWApO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5cbi8vIE1haW4gZnVuY3Rpb24gdG8gc2V0IHVwIEhUVFAgb3IgSFRUUFMgc2VydmVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0dXBIdHRwKHtcbiAgICBhcHAsXG4gICAgc29wcyxcbiAgICBmczogZnNQcm9taXNlcyxcbiAgICBsb2dnZXIsXG4gICAgY29uc3RhbnRzLFxuICAgIGdldEZlYXR1cmVGbGFncyxcbiAgICBnZXRSZWRpc0NsaWVudCxcbiAgICBnZXRTZXF1ZWxpemVJbnN0YW5jZVxufTogU2V0dXBIdHRwUGFyYW1zKTogUHJvbWlzZTxTZXR1cEh0dHBSZXR1cm4+IHtcbiAgICBsb2dnZXIuaW5mbygnc2V0dXBIdHRwKCkgZXhlY3V0aW5nJyk7XG5cbiAgICBjb25zdCBmZWF0dXJlRmxhZ3MgPSBnZXRGZWF0dXJlRmxhZ3MoKTtcbiAgICBsZXQgb3B0aW9uczogT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICAgIGlmIChmZWF0dXJlRmxhZ3MuZW5hYmxlU3NsRmxhZykge1xuICAgICAgICBsb2dnZXIuaW5mbyhgU1NMX0ZMQUcgaXMgc2V0IHRvIHRydWUsIHNldHRpbmcgdXAgSFRUUFMgc2VydmVyIG9uIHBvcnQgJHtTRVJWRVJfUE9SVH1gKTtcbiAgICAgICAgb3B0aW9ucyA9IGF3YWl0IGRlY2xhcmVPcHRpb25zKHtcbiAgICAgICAgICAgIHNvcHMsXG4gICAgICAgICAgICBmczogZnNQcm9taXNlcyxcbiAgICAgICAgICAgIGxvZ2dlcixcbiAgICAgICAgICAgIGNvbnN0YW50cyxcbiAgICAgICAgICAgIERFQ1JZUFRfS0VZUzogZmVhdHVyZUZsYWdzLmRlY3J5cHRLZXlzRmxhZyxcbiAgICAgICAgICAgIFNTTF9LRVk6IHByb2Nlc3MuZW52LlNFUlZFUl9TU0xfS0VZX1BBVEggfHwgbnVsbCxcbiAgICAgICAgICAgIFNTTF9DRVJUOiBwcm9jZXNzLmVudi5TRVJWRVJfU1NMX0NFUlRfUEFUSCB8fCBudWxsLFxuICAgICAgICAgICAgY2lwaGVyc1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuaW5mbygnU1NMX0ZMQUcgaXMgc2V0IHRvIGZhbHNlLCBzZXR0aW5nIHVwIEhUVFAgc2VydmVyJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIoKSB7XG4gICAgICAgIGNvbnN0IHNlcnZlciA9IG9wdGlvbnNcbiAgICAgICAgICAgID8gaHR0cHMuY3JlYXRlU2VydmVyKG9wdGlvbnMsIGFwcClcbiAgICAgICAgICAgIDogaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcblxuICAgICAgICBzZXJ2ZXIubGlzdGVuKFNFUlZFUl9QT1JULCAoKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmVyIHJ1bm5pbmcgb24gcG9ydCAke1NFUlZFUl9QT1JUfWApO1xuICAgICAgICB9KTtcblxuICAgICAgICBncmFjZWZ1bFNodXRkb3duKHNlcnZlciwge1xuICAgICAgICAgICAgc2lnbmFsczogJ1NJR0lOVCBTSUdURVJNJyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgICAgICAgb25TaHV0ZG93bjogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdDbGVhbmluZyB1cCByZXNvdXJjZXMgYmVmb3JlIHNodXRkb3duJyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZWxpemU6IFNlcXVlbGl6ZSA9IGdldFNlcXVlbGl6ZUluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBzZXF1ZWxpemUuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RhdGFiYXNlIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBjbG9zaW5nIGRhdGFiYXNlIGNvbm5lY3Rpb246ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVGbGFncy5lbmFibGVSZWRpc0ZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1JFRElTX0ZMQUcgaXMgc2V0IHRvIHRydWUuIENsb3NpbmcgcmVkaXMgY29ubmVjdGlvbicpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWRpc0NsaWVudCA9IGdldFJlZGlzQ2xpZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXNDbGllbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZWRpc0NsaWVudC5xdWl0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1JlZGlzIGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIGNsb3NpbmcgcmVkaXMgY29ubmVjdGlvbjogJHtlcnJvcn1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dnZXIgY2xvc2VkJyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBjbG9zaW5nIGxvZ2dlcjogJHtlcnJvcn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IHN0YXJ0U2VydmVyIH07XG59XG4iXX0=
