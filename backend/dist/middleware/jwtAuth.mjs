import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
export function initializeJwtAuthMiddleware({ logger, verifyJwt }) {
	validateDependencies(
		[
			{ name: 'logger', instance: logger },
			{ name: 'verifyJwt', instance: verifyJwt }
		],
		logger || console
	);
	return async (req, res, next) => {
		try {
			logger.info('JWT Auth is enabled');
			const authHeader = req.headers.authorization;
			const token = authHeader?.split(' ')[1];
			if (!token) {
				logger.warn('No JWT token found in the authorization header');
				res.sendStatus(403);
				return;
			}
			const user = await verifyJwt(token);
			if (!user) {
				logger.warn('Invalid JWT token');
				res.sendStatus(403);
				return;
			}
			req.user = user;
			next();
		} catch (error) {
			processError(error, logger || console, req);
			res.sendStatus(500);
		}
	};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiand0QXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL2p3dEF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBT3JELE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxFQUMzQyxNQUFNLEVBQ04sU0FBUyxFQUNzQjtJQUMvQixvQkFBb0IsQ0FDbkI7UUFDQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtRQUNwQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtLQUMxQyxFQUNELE1BQU0sSUFBSSxPQUFPLENBQ2pCLENBQUM7SUFFRixPQUFPLEtBQUssRUFDWCxHQUFZLEVBQ1osR0FBYSxFQUNiLElBQWtCLEVBQ0YsRUFBRTtRQUNsQixJQUFJLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbkMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDN0MsTUFBTSxLQUFLLEdBQUcsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO2dCQUM5RCxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2pDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLE9BQU87WUFDUixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBSSxFQUFFLENBQUM7UUFDUixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDNUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4uL2NvbmZpZy9sb2dnZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZURlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBwcm9jZXNzRXJyb3IgfSBmcm9tICcuLi91dGlscy9wcm9jZXNzRXJyb3InO1xuXG5pbnRlcmZhY2UgSnd0QXV0aE1pZGRsZXdhcmVEZXBlbmRlbmNpZXMge1xuXHRsb2dnZXI6IExvZ2dlcjtcblx0dmVyaWZ5Snd0OiAodG9rZW46IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmcgfCBvYmplY3QgfCBudWxsPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVKd3RBdXRoTWlkZGxld2FyZSh7XG5cdGxvZ2dlcixcblx0dmVyaWZ5Snd0XG59OiBKd3RBdXRoTWlkZGxld2FyZURlcGVuZGVuY2llcykge1xuXHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRbXG5cdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH0sXG5cdFx0XHR7IG5hbWU6ICd2ZXJpZnlKd3QnLCBpbnN0YW5jZTogdmVyaWZ5Snd0IH1cblx0XHRdLFxuXHRcdGxvZ2dlciB8fCBjb25zb2xlXG5cdCk7XG5cblx0cmV0dXJuIGFzeW5jIChcblx0XHRyZXE6IFJlcXVlc3QsXG5cdFx0cmVzOiBSZXNwb25zZSxcblx0XHRuZXh0OiBOZXh0RnVuY3Rpb25cblx0KTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdGxvZ2dlci5pbmZvKCdKV1QgQXV0aCBpcyBlbmFibGVkJyk7XG5cdFx0XHRjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcblx0XHRcdGNvbnN0IHRva2VuID0gYXV0aEhlYWRlcj8uc3BsaXQoJyAnKVsxXTtcblxuXHRcdFx0aWYgKCF0b2tlbikge1xuXHRcdFx0XHRsb2dnZXIud2FybignTm8gSldUIHRva2VuIGZvdW5kIGluIHRoZSBhdXRob3JpemF0aW9uIGhlYWRlcicpO1xuXHRcdFx0XHRyZXMuc2VuZFN0YXR1cyg0MDMpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHVzZXIgPSBhd2FpdCB2ZXJpZnlKd3QodG9rZW4pO1xuXHRcdFx0aWYgKCF1c2VyKSB7XG5cdFx0XHRcdGxvZ2dlci53YXJuKCdJbnZhbGlkIEpXVCB0b2tlbicpO1xuXHRcdFx0XHRyZXMuc2VuZFN0YXR1cyg0MDMpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJlcS51c2VyID0gdXNlcjtcblx0XHRcdG5leHQoKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIgfHwgY29uc29sZSwgcmVxKTtcblx0XHRcdHJlcy5zZW5kU3RhdHVzKDUwMCk7XG5cdFx0fVxuXHR9O1xufVxuIl19
