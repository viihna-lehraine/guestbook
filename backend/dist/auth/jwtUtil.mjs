import jwt from 'jsonwebtoken';
import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
import sops from '../utils/sops.mjs';
import { execSync } from 'child_process';
export function createJwtUtil(logger) {
	let secrets;
	const loadSecrets = async () => {
		try {
			validateDependencies(
				[
					{ name: 'logger', instance: logger },
					{ name: 'execSync', instance: execSync }
				],
				logger
			);
			const secrets = await sops.getSecrets({
				logger,
				execSync,
				getDirectoryPath: () => process.cwd()
			});
			validateDependencies(
				[{ name: 'secrets.JWT_SECRET', instance: secrets.JWT_SECRET }],
				logger
			);
			return secrets;
		} catch (error) {
			processError(error, logger);
			throw new Error('Failed to load secrets');
		}
	};
	const loadAndCacheSecrets = async () => {
		if (!secrets) {
			logger.info('Secrets not found. Loading secrets...');
			try {
				secrets = await loadSecrets();
			} catch (error) {
				processError(error, logger);
				throw new Error('Failed to load and cache secrets');
			}
		}
	};
	const generateJwt = async user => {
		try {
			validateDependencies([{ name: 'user', instance: user }], logger);
			await loadAndCacheSecrets();
			if (!secrets.JWT_SECRET) {
				logger.error('JWT_SECRET is not available.');
				throw new Error('JWT_SECRET is not available.');
			}
			return jwt.sign(
				{ id: user.id, username: user.username },
				secrets.JWT_SECRET,
				{ expiresIn: '1h' }
			);
		} catch (error) {
			processError(error, logger);
			throw new Error('Failed to generate JWT token');
		}
	};
	const verifyJwt = async token => {
		try {
			validateDependencies([{ name: 'token', instance: token }], logger);
			await loadAndCacheSecrets();
			if (!secrets.JWT_SECRET) {
				logger.error('JWT_SECRET is not available.');
				throw new Error('JWT_SECRET is not available.');
			}
			return jwt.verify(token, secrets.JWT_SECRET);
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				logger.warn(`JWT verification error: ${error.message}`, {
					name: error.name,
					message: error.message,
					stack: error.stack
				});
				return null;
			} else {
				processError(error, logger);
				throw new Error('Failed to verify JWT token');
			}
		}
	};
	return {
		generateJwt,
		verifyJwt
	};
}
export default createJwtUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiand0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRoL2p3dFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDO0FBRS9CLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLElBQUksTUFBTSxlQUFlLENBQUM7QUFDakMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVd6QyxNQUFNLFVBQVUsYUFBYSxDQUFDLE1BQWM7SUFJM0MsSUFBSSxPQUFnQixDQUFDO0lBRXJCLE1BQU0sV0FBVyxHQUFHLEtBQUssSUFBc0IsRUFBRTtRQUNoRCxJQUFJLENBQUM7WUFDSixvQkFBb0IsQ0FDbkI7Z0JBQ0MsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7Z0JBQ3BDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO2FBQ3hDLEVBQ0QsTUFBTSxDQUNOLENBQUM7WUFFRixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ3JDLE1BQU07Z0JBQ04sUUFBUTtnQkFDUixnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO2FBQ3JDLENBQUMsQ0FBQztZQUVILG9CQUFvQixDQUNuQixDQUFDLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsRUFDOUQsTUFBTSxDQUNOLENBQUM7WUFFRixPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLElBQW1CLEVBQUU7UUFDckQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQztnQkFDSixPQUFPLEdBQUcsTUFBTSxXQUFXLEVBQUUsQ0FBQztZQUMvQixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1lBQ3JELENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLElBQVUsRUFBbUIsRUFBRTtRQUN6RCxJQUFJLENBQUM7WUFDSixvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVqRSxNQUFNLG1CQUFtQixFQUFFLENBQUM7WUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDakQsQ0FBQztZQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FDZCxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQ3hDLE9BQU8sQ0FBQyxVQUFVLEVBQ2xCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUNuQixDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNGLENBQUMsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFDdEIsS0FBYSxFQUNxQixFQUFFO1FBQ3BDLElBQUksQ0FBQztZQUNKLG9CQUFvQixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRW5FLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztZQUU1QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6QixNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBRUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxLQUFLLFlBQVksR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDdkQsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87b0JBQ3RCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztpQkFDbEIsQ0FBQyxDQUFDO2dCQUNILE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUMsQ0FBQztJQUVGLE9BQU87UUFDTixXQUFXO1FBQ1gsU0FBUztLQUNULENBQUM7QUFDSCxDQUFDO0FBRUQsZUFBZSxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IHZhbGlkYXRlRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi4vdXRpbHMvdmFsaWRhdGVEZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHsgcHJvY2Vzc0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvcHJvY2Vzc0Vycm9yJztcbmltcG9ydCBzb3BzIGZyb20gJy4uL3V0aWxzL3NvcHMnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuaW50ZXJmYWNlIFNlY3JldHMge1xuXHRKV1RfU0VDUkVUPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVXNlciB7XG5cdGlkOiBzdHJpbmc7XG5cdHVzZXJuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVKd3RVdGlsKGxvZ2dlcjogTG9nZ2VyKToge1xuXHRnZW5lcmF0ZUp3dDogKHVzZXI6IFVzZXIpID0+IFByb21pc2U8c3RyaW5nPjtcblx0dmVyaWZ5Snd0OiAodG9rZW46IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmcgfCBvYmplY3QgfCBudWxsPjtcbn0ge1xuXHRsZXQgc2VjcmV0czogU2VjcmV0cztcblxuXHRjb25zdCBsb2FkU2VjcmV0cyA9IGFzeW5jICgpOiBQcm9taXNlPFNlY3JldHM+ID0+IHtcblx0XHR0cnkge1xuXHRcdFx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0XHRcdFtcblx0XHRcdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAnZXhlY1N5bmMnLCBpbnN0YW5jZTogZXhlY1N5bmMgfVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRsb2dnZXJcblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IHNlY3JldHMgPSBhd2FpdCBzb3BzLmdldFNlY3JldHMoe1xuXHRcdFx0XHRsb2dnZXIsXG5cdFx0XHRcdGV4ZWNTeW5jLFxuXHRcdFx0XHRnZXREaXJlY3RvcnlQYXRoOiAoKSA9PiBwcm9jZXNzLmN3ZCgpXG5cdFx0XHR9KTtcblxuXHRcdFx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0XHRcdFt7IG5hbWU6ICdzZWNyZXRzLkpXVF9TRUNSRVQnLCBpbnN0YW5jZTogc2VjcmV0cy5KV1RfU0VDUkVUIH1dLFxuXHRcdFx0XHRsb2dnZXJcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiBzZWNyZXRzO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlcik7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNlY3JldHMnKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3QgbG9hZEFuZENhY2hlU2VjcmV0cyA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRpZiAoIXNlY3JldHMpIHtcblx0XHRcdGxvZ2dlci5pbmZvKCdTZWNyZXRzIG5vdCBmb3VuZC4gTG9hZGluZyBzZWNyZXRzLi4uJyk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRzZWNyZXRzID0gYXdhaXQgbG9hZFNlY3JldHMoKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHByb2Nlc3NFcnJvcihlcnJvciwgbG9nZ2VyKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCBhbmQgY2FjaGUgc2VjcmV0cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRjb25zdCBnZW5lcmF0ZUp3dCA9IGFzeW5jICh1c2VyOiBVc2VyKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcblx0XHR0cnkge1xuXHRcdFx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoW3sgbmFtZTogJ3VzZXInLCBpbnN0YW5jZTogdXNlciB9XSwgbG9nZ2VyKTtcblxuXHRcdFx0YXdhaXQgbG9hZEFuZENhY2hlU2VjcmV0cygpO1xuXG5cdFx0XHRpZiAoIXNlY3JldHMuSldUX1NFQ1JFVCkge1xuXHRcdFx0XHRsb2dnZXIuZXJyb3IoJ0pXVF9TRUNSRVQgaXMgbm90IGF2YWlsYWJsZS4nKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdKV1RfU0VDUkVUIGlzIG5vdCBhdmFpbGFibGUuJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBqd3Quc2lnbihcblx0XHRcdFx0eyBpZDogdXNlci5pZCwgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUgfSxcblx0XHRcdFx0c2VjcmV0cy5KV1RfU0VDUkVULFxuXHRcdFx0XHR7IGV4cGlyZXNJbjogJzFoJyB9XG5cdFx0XHQpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlcik7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBnZW5lcmF0ZSBKV1QgdG9rZW4nKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3QgdmVyaWZ5Snd0ID0gYXN5bmMgKFxuXHRcdHRva2VuOiBzdHJpbmdcblx0KTogUHJvbWlzZTxzdHJpbmcgfCBvYmplY3QgfCBudWxsPiA9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFt7IG5hbWU6ICd0b2tlbicsIGluc3RhbmNlOiB0b2tlbiB9XSwgbG9nZ2VyKTtcblxuXHRcdFx0YXdhaXQgbG9hZEFuZENhY2hlU2VjcmV0cygpO1xuXG5cdFx0XHRpZiAoIXNlY3JldHMuSldUX1NFQ1JFVCkge1xuXHRcdFx0XHRsb2dnZXIuZXJyb3IoJ0pXVF9TRUNSRVQgaXMgbm90IGF2YWlsYWJsZS4nKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdKV1RfU0VDUkVUIGlzIG5vdCBhdmFpbGFibGUuJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBqd3QudmVyaWZ5KHRva2VuLCBzZWNyZXRzLkpXVF9TRUNSRVQpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRpZiAoZXJyb3IgaW5zdGFuY2VvZiBqd3QuSnNvbldlYlRva2VuRXJyb3IpIHtcblx0XHRcdFx0bG9nZ2VyLndhcm4oYEpXVCB2ZXJpZmljYXRpb24gZXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gLCB7XG5cdFx0XHRcdFx0bmFtZTogZXJyb3IubmFtZSxcblx0XHRcdFx0XHRtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuXHRcdFx0XHRcdHN0YWNrOiBlcnJvci5zdGFja1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlcik7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHZlcmlmeSBKV1QgdG9rZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRnZW5lcmF0ZUp3dCxcblx0XHR2ZXJpZnlKd3Rcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlSnd0VXRpbDtcbiJdfQ==
