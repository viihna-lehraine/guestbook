import argon2 from 'argon2';
import { processError } from '../utils/processError.mjs';
import { validateDependencies } from '../utils/validateDependencies.mjs';
export const hashConfig = {
	type: argon2.argon2id,
	memoryCost: 48640, // 47.5 MiB memory
	timeCost: 4, // 4 iterations
	parallelism: 1
};
export async function hashPassword({ password, secrets, logger }) {
	try {
		validateDependencies(
			[
				{ name: 'password', instance: password },
				{ name: 'secrets', instance: secrets }
			],
			logger || console
		);
		return await argon2.hash(password + secrets.PEPPER, hashConfig);
	} catch (error) {
		processError(error, logger || console);
		return '';
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaENvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWcvaGFzaENvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFNUIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQ3BELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBV3JFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN6QixJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVE7SUFDckIsVUFBVSxFQUFFLEtBQUssRUFBRSxrQkFBa0I7SUFDckMsUUFBUSxFQUFFLENBQUMsRUFBRSxlQUFlO0lBQzVCLFdBQVcsRUFBRSxDQUFDO0NBQ2QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxLQUFLLFVBQVUsWUFBWSxDQUFDLEVBQ2xDLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxFQUNvQjtJQUMxQixJQUFJLENBQUM7UUFDSixvQkFBb0IsQ0FDbkI7WUFDQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtZQUN4QyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtTQUN0QyxFQUNELE1BQU0sSUFBSSxPQUFPLENBQ2pCLENBQUM7UUFDRixPQUFPLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUN2QyxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFyZ29uMiBmcm9tICdhcmdvbjInO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgcHJvY2Vzc0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvcHJvY2Vzc0Vycm9yJ1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZURlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBTZWNyZXRzTWFwIH0gZnJvbSAnLi4vdXRpbHMvc29wcyc7XG5cbnR5cGUgVXNlclNlY3JldHMgPSBQaWNrPFNlY3JldHNNYXAsICdQRVBQRVInPjtcblxuaW50ZXJmYWNlIEhhc2hQYXNzd29yZERlcGVuZGVuY2llcyB7XG5cdHBhc3N3b3JkOiBzdHJpbmc7XG5cdHNlY3JldHM6IFVzZXJTZWNyZXRzO1xuXHRsb2dnZXI6IExvZ2dlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGhhc2hDb25maWcgPSB7XG5cdHR5cGU6IGFyZ29uMi5hcmdvbjJpZCxcblx0bWVtb3J5Q29zdDogNDg2NDAsIC8vIDQ3LjUgTWlCIG1lbW9yeVxuXHR0aW1lQ29zdDogNCwgLy8gNCBpdGVyYXRpb25zXG5cdHBhcmFsbGVsaXNtOiAxXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHtcblx0cGFzc3dvcmQsXG5cdHNlY3JldHMsXG5cdGxvZ2dlclxufTogSGFzaFBhc3N3b3JkRGVwZW5kZW5jaWVzKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0dHJ5IHtcblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFtcblx0XHRcdFx0eyBuYW1lOiAncGFzc3dvcmQnLCBpbnN0YW5jZTogcGFzc3dvcmQgfSxcblx0XHRcdFx0eyBuYW1lOiAnc2VjcmV0cycsIGluc3RhbmNlOiBzZWNyZXRzIH1cblx0XHRcdF0sXG5cdFx0XHRsb2dnZXIgfHwgY29uc29sZVxuXHRcdCk7XG5cdFx0cmV0dXJuIGF3YWl0IGFyZ29uMi5oYXNoKHBhc3N3b3JkICsgc2VjcmV0cy5QRVBQRVIsIGhhc2hDb25maWcpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHByb2Nlc3NFcnJvcihlcnJvciwgbG9nZ2VyIHx8IGNvbnNvbGUpO1xuXHRcdHJldHVybiAnJztcblx0fVxufVxuIl19
