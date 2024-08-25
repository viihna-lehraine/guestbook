import yub from 'yub';
import getSecrets from '../../config/sops.js';
const secrets = await getSecrets.getSecrets();
let yubClient;
async function initializeYubicoOtpUtil() {
	yubClient = yub.init(
		secrets.YUBICO_CLIENT_ID.toString(),
		secrets.YUBICO_SECRET_KEY
	);
}
// for validating a Yubico OTP
async function validateYubicoOTP(otp) {
	if (!yubClient) {
		await initializeYubicoOtpUtil();
	}
	return new Promise((resolve, reject) => {
		yubClient.verify(otp, (err, data) => {
			if (err) {
				return reject(err);
			}
			if (data && data.status === 'OK') {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
}
// generated OTP configruation options
function generateYubicoOtpOptions() {
	if (!secrets) {
		throw new Error('Secrets have not been initialized');
	}
	return {
		clientId: secrets.YUBICO_CLIENT_ID,
		apiKey: secrets.YUBICO_SECRET_KEY,
		apiUrl: secrets.YUBICO_API_URL
	};
}
export { generateYubicoOtpOptions, validateYubicoOTP };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieXViaWNvT3RwVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hdXRoL3l1Ymljb090cFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sZ0NBQWdDLENBQUM7QUEwQnhDLE1BQU0sT0FBTyxHQUFZLE1BQU0sVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3ZELElBQUksU0FBZ0MsQ0FBQztBQUVyQyxLQUFLLFVBQVUsdUJBQXVCO0lBQ3JDLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUNuQixPQUFRLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEVBQ3BDLE9BQVEsQ0FBQyxpQkFBaUIsQ0FDYixDQUFDO0FBQ2hCLENBQUM7QUFFRCw4QkFBOEI7QUFDOUIsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEdBQVc7SUFDM0MsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sdUJBQXVCLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0QyxTQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQWlCLEVBQUUsSUFBaUIsRUFBRSxFQUFFO1lBQy9ELElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1QsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUVELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsc0NBQXNDO0FBQ3RDLFNBQVMsd0JBQXdCO0lBQ2hDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsT0FBTztRQUNOLFFBQVEsRUFBRSxPQUFPLENBQUMsZ0JBQWdCO1FBQ2xDLE1BQU0sRUFBRSxPQUFPLENBQUMsaUJBQWlCO1FBQ2pDLE1BQU0sRUFBRSxPQUFPLENBQUMsY0FBYztLQUM5QixDQUFDO0FBQ0gsQ0FBQztBQUVELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHl1YiBmcm9tICd5dWInO1xuaW1wb3J0IGdldFNlY3JldHMgZnJvbSAnLi4vLi4vY29uZmlnL3NvcHMnO1xuaW1wb3J0ICcuLi8uLi8uLi90eXBlcy9jdXN0b20veXViLmQudHMnO1xuXG5pbnRlcmZhY2UgU2VjcmV0cyB7XG5cdFlVQklDT19DTElFTlRfSUQ6IG51bWJlcjtcblx0WVVCSUNPX1NFQ1JFVF9LRVk6IHN0cmluZztcblx0WVVCSUNPX0FQSV9VUkw6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFl1YkNsaWVudCB7XG5cdHZlcmlmeShcblx0XHRvdHA6IHN0cmluZyxcblx0XHRjYWxsYmFjazogKGVycjogRXJyb3IgfCBudWxsLCBkYXRhOiBZdWJSZXNwb25zZSkgPT4gdm9pZFxuXHQpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgWXViUmVzcG9uc2Uge1xuXHRzdGF0dXM6IHN0cmluZztcblx0W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG9iamVjdCB8IG51bGwgfCB1bmRlZmluZWQ7IC8vICpERVYtTk9URSogSSBoYXZlIGFic29sdXRlbHkgbm8gaWRlYSB3aGF0IHR5cGUgc2hvdWxkIGJlXG59XG5cbmludGVyZmFjZSBZdWJpY29PdHBPcHRpb25zIHtcblx0Y2xpZW50SWQ6IG51bWJlcjtcblx0YXBpS2V5OiBzdHJpbmc7XG5cdGFwaVVybDogc3RyaW5nO1xufVxuXG5jb25zdCBzZWNyZXRzOiBTZWNyZXRzID0gYXdhaXQgZ2V0U2VjcmV0cy5nZXRTZWNyZXRzKCk7XG5sZXQgeXViQ2xpZW50OiBZdWJDbGllbnQgfCB1bmRlZmluZWQ7XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVZdWJpY29PdHBVdGlsKCk6IFByb21pc2U8dm9pZD4ge1xuXHR5dWJDbGllbnQgPSB5dWIuaW5pdChcblx0XHRzZWNyZXRzIS5ZVUJJQ09fQ0xJRU5UX0lELnRvU3RyaW5nKCksXG5cdFx0c2VjcmV0cyEuWVVCSUNPX1NFQ1JFVF9LRVlcblx0KSBhcyBZdWJDbGllbnQ7XG59XG5cbi8vIGZvciB2YWxpZGF0aW5nIGEgWXViaWNvIE9UUFxuYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVZdWJpY29PVFAob3RwOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0aWYgKCF5dWJDbGllbnQpIHtcblx0XHRhd2FpdCBpbml0aWFsaXplWXViaWNvT3RwVXRpbCgpO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR5dWJDbGllbnQhLnZlcmlmeShvdHAsIChlcnI6IEVycm9yIHwgbnVsbCwgZGF0YTogWXViUmVzcG9uc2UpID0+IHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIHJlamVjdChlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGF0YSAmJiBkYXRhLnN0YXR1cyA9PT0gJ09LJykge1xuXHRcdFx0XHRyZXNvbHZlKHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG4vLyBnZW5lcmF0ZWQgT1RQIGNvbmZpZ3J1YXRpb24gb3B0aW9uc1xuZnVuY3Rpb24gZ2VuZXJhdGVZdWJpY29PdHBPcHRpb25zKCk6IFl1Ymljb090cE9wdGlvbnMge1xuXHRpZiAoIXNlY3JldHMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1NlY3JldHMgaGF2ZSBub3QgYmVlbiBpbml0aWFsaXplZCcpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjbGllbnRJZDogc2VjcmV0cy5ZVUJJQ09fQ0xJRU5UX0lELFxuXHRcdGFwaUtleTogc2VjcmV0cy5ZVUJJQ09fU0VDUkVUX0tFWSxcblx0XHRhcGlVcmw6IHNlY3JldHMuWVVCSUNPX0FQSV9VUkxcblx0fTtcbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVZdWJpY29PdHBPcHRpb25zLCB2YWxpZGF0ZVl1Ymljb09UUCB9O1xuIl19
