import jwt from 'jsonwebtoken';
import setupLogger from '../../config/logger.mjs';
import sops from '../sops.mjs';
import { execSync } from 'child_process';
const logger = setupLogger();
async function loadSecrets() {
	return sops.getSecrets({
		logger,
		execSync,
		getDirectoryPath: () => process.cwd()
	});
}
export function createJwtUtil() {
	let secrets;
	const loadAndCacheSecrets = async () => {
		if (!secrets) {
			secrets = await loadSecrets();
		}
	};
	const generateToken = async user => {
		await loadAndCacheSecrets();
		return jwt.sign(
			{ id: user.id, username: user.username },
			secrets.JWT_SECRET,
			{ expiresIn: '1h' }
		);
	};
	const verifyJwtToken = async token => {
		await loadAndCacheSecrets();
		try {
			return jwt.verify(token, secrets.JWT_SECRET);
		} catch (err) {
			logger.error(err);
			return null;
		}
	};
	return {
		generateToken,
		verifyJwtToken
	};
}
export default createJwtUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiand0VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hdXRoL2p3dFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDO0FBQy9CLE9BQU8sV0FBVyxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBV3pDLE1BQU0sTUFBTSxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBRTdCLEtBQUssVUFBVSxXQUFXO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN0QixNQUFNO1FBQ04sUUFBUTtRQUNSLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7S0FDckMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhO0lBSTVCLElBQUksT0FBZ0IsQ0FBQztJQUVyQixNQUFNLG1CQUFtQixHQUFHLEtBQUssSUFBbUIsRUFBRTtRQUNyRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxPQUFPLEdBQUcsTUFBTSxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLElBQVUsRUFBbUIsRUFBRTtRQUMzRCxNQUFNLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUNkLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFDeEMsT0FBTyxDQUFDLFVBQW9CLEVBQzVCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUNuQixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUMzQixLQUFhLEVBQ3FCLEVBQUU7UUFDcEMsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQztZQUNKLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQW9CLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNOLGFBQWE7UUFDYixjQUFjO0tBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCxlQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcbmltcG9ydCBzZXR1cExvZ2dlciBmcm9tICcuLi8uLi9jb25maWcvbG9nZ2VyJztcbmltcG9ydCBzb3BzIGZyb20gJy4uL3NvcHMnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuaW50ZXJmYWNlIFNlY3JldHMge1xuXHRKV1RfU0VDUkVUPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVXNlciB7XG5cdGlkOiBzdHJpbmc7XG5cdHVzZXJuYW1lOiBzdHJpbmc7XG59XG5cbmNvbnN0IGxvZ2dlciA9IHNldHVwTG9nZ2VyKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTZWNyZXRzKCk6IFByb21pc2U8U2VjcmV0cz4ge1xuXHRyZXR1cm4gc29wcy5nZXRTZWNyZXRzKHtcblx0XHRsb2dnZXIsXG5cdFx0ZXhlY1N5bmMsXG5cdFx0Z2V0RGlyZWN0b3J5UGF0aDogKCkgPT4gcHJvY2Vzcy5jd2QoKVxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUp3dFV0aWwoKToge1xuXHRnZW5lcmF0ZVRva2VuOiAodXNlcjogVXNlcikgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXHR2ZXJpZnlKd3RUb2tlbjogKHRva2VuOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nIHwgb2JqZWN0IHwgbnVsbD47XG59IHtcblx0bGV0IHNlY3JldHM6IFNlY3JldHM7XG5cblx0Y29uc3QgbG9hZEFuZENhY2hlU2VjcmV0cyA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRpZiAoIXNlY3JldHMpIHtcblx0XHRcdHNlY3JldHMgPSBhd2FpdCBsb2FkU2VjcmV0cygpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBnZW5lcmF0ZVRva2VuID0gYXN5bmMgKHVzZXI6IFVzZXIpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuXHRcdGF3YWl0IGxvYWRBbmRDYWNoZVNlY3JldHMoKTtcblx0XHRyZXR1cm4gand0LnNpZ24oXG5cdFx0XHR7IGlkOiB1c2VyLmlkLCB1c2VybmFtZTogdXNlci51c2VybmFtZSB9LFxuXHRcdFx0c2VjcmV0cy5KV1RfU0VDUkVUIGFzIHN0cmluZyxcblx0XHRcdHsgZXhwaXJlc0luOiAnMWgnIH1cblx0XHQpO1xuXHR9O1xuXG5cdGNvbnN0IHZlcmlmeUp3dFRva2VuID0gYXN5bmMgKFxuXHRcdHRva2VuOiBzdHJpbmdcblx0KTogUHJvbWlzZTxzdHJpbmcgfCBvYmplY3QgfCBudWxsPiA9PiB7XG5cdFx0YXdhaXQgbG9hZEFuZENhY2hlU2VjcmV0cygpO1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgc2VjcmV0cy5KV1RfU0VDUkVUIGFzIHN0cmluZyk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRsb2dnZXIuZXJyb3IoZXJyKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGdlbmVyYXRlVG9rZW4sXG5cdFx0dmVyaWZ5Snd0VG9rZW5cblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlSnd0VXRpbDtcbiJdfQ==
