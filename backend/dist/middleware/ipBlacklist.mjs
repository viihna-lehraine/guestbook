import { inRange } from 'range_check';
import path from 'path';
let blacklist = [];
export function createIpBlacklist({
	logger,
	featureFlags,
	__dirname,
	fsModule
}) {
	const IP_BLACKLIST_ENABLED = featureFlags.enableIpBlacklistFlag;
	const loadBlacklist = async () => {
		const filePath = path.join(__dirname, '../../data/blacklist.json');
		try {
			if (fsModule.existsSync(filePath)) {
				const data = fsModule.readFileSync(filePath, 'utf8');
				blacklist = JSON.parse(data);
			}
		} catch (err) {
			logger.error(`Error loading blacklist: ${err}`);
		}
	};
	const saveBlacklist = async () => {
		if (IP_BLACKLIST_ENABLED) {
			const filePath = path.join(__dirname, '../../data/blacklist.json');
			try {
				fsModule.writeFileSync(filePath, JSON.stringify(blacklist));
			} catch (err) {
				logger.error(`Error saving blacklist: ${err}`);
			}
		}
	};
	const initializeBlacklist = async () => {
		if (IP_BLACKLIST_ENABLED) {
			logger.info(
				'IP blacklist middleware is enabled. Initializing blacklist'
			);
			try {
				await loadBlacklist();
				logger.info(
					'Blacklist and range_check module loaded successfully'
				);
			} catch (err) {
				logger.error(`Error during blacklist initialization: ${err}`);
				throw err;
			}
		} else {
			logger.info('IP blacklist middleware is disabled');
		}
	};
	const addToBlacklist = async ip => {
		if (IP_BLACKLIST_ENABLED) {
			logger.info('IP Blacklist is enabled. Adding IP to blacklist');
			if (!blacklist.includes(ip)) {
				blacklist.push(ip);
				await saveBlacklist();
			} else {
				logger.info('IP already in blacklist');
			}
		} else {
			logger.info('IP Blacklist is disabled');
		}
	};
	const ipBlacklistMiddleware = (req, res, next) => {
		if (IP_BLACKLIST_ENABLED) {
			logger.info('IP Blacklist middleware enabled');
			const clientIp = req.ip;
			if (!clientIp) {
				logger.error('Client IP not found');
				res.status(500).json({ error: 'Bad request' });
				return;
			}
			if (blacklist.some(range => inRange(clientIp, range))) {
				logger.warn(`Blocked request from blacklisted IP: ${clientIp}`);
				res.status(403).json({ error: 'Access denied' });
				return;
			}
		} else {
			logger.info('IP Blacklist middleware disabled');
		}
		next();
	};
	const removeFromBlacklist = ip => {
		if (IP_BLACKLIST_ENABLED) {
			blacklist = blacklist.filter(range => range !== ip);
			saveBlacklist();
		}
	};
	return {
		initializeBlacklist,
		loadBlacklist,
		addToBlacklist,
		ipBlacklistMiddleware,
		removeFromBlacklist
	};
}
export const initializeIpBlacklist = createIpBlacklist;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBCbGFja2xpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWlkZGxld2FyZS9pcEJsYWNrbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR3RDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQXVCeEIsSUFBSSxTQUFTLEdBQWEsRUFBRSxDQUFDO0FBRTdCLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUNqQyxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxRQUFRLEVBQ2lCO0lBQ3pCLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLHFCQUFxQixDQUFDO0lBRWhFLE1BQU0sYUFBYSxHQUFHLEtBQUssSUFBbUIsRUFBRTtRQUMvQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQztZQUNKLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDckQsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsQ0FBQztRQUNGLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsTUFBTSxhQUFhLEdBQUcsS0FBSyxJQUFtQixFQUFFO1FBQy9DLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ25F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QkFBb0IsRUFBRSxDQUFDO1lBQzFCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELGFBQWEsRUFBRSxDQUFDO1FBQ2pCLENBQUM7SUFDRixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ04sbUJBQW1CO1FBQ25CLGFBQWE7UUFDYixjQUFjO1FBQ2QscUJBQXFCO1FBQ3JCLG1CQUFtQjtLQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5SYW5nZSB9IGZyb20gJ3JhbmdlX2NoZWNrJztcbmltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW50ZXJmYWNlIElwQmxhY2tsaXN0RGVwZW5kZW5jaWVzIHtcblx0bG9nZ2VyOiBSZXR1cm5UeXBlPHR5cGVvZiBpbXBvcnQoJy4uL2NvbmZpZy9sb2dnZXInKS5kZWZhdWx0Pjtcblx0ZmVhdHVyZUZsYWdzOiBSZXR1cm5UeXBlPFxuXHRcdHR5cGVvZiBpbXBvcnQoJy4uL3V0aWxzL2ZlYXR1cmVGbGFncycpLmdldEZlYXR1cmVGbGFnc1xuXHQ+O1xuXHRfX2Rpcm5hbWU6IHN0cmluZztcblx0ZnNNb2R1bGU6IHR5cGVvZiBmcztcbn1cblxuaW50ZXJmYWNlIElwQmxhY2tsaXN0IHtcblx0aW5pdGlhbGl6ZUJsYWNrbGlzdDogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblx0bG9hZEJsYWNrbGlzdDogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblx0YWRkVG9CbGFja2xpc3Q6IChpcDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuXHRpcEJsYWNrbGlzdE1pZGRsZXdhcmU6IChcblx0XHRyZXE6IFJlcXVlc3QsXG5cdFx0cmVzOiBSZXNwb25zZSxcblx0XHRuZXh0OiBOZXh0RnVuY3Rpb25cblx0KSA9PiB2b2lkO1xuXHRyZW1vdmVGcm9tQmxhY2tsaXN0OiAoaXA6IHN0cmluZykgPT4gdm9pZDtcbn1cblxubGV0IGJsYWNrbGlzdDogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlwQmxhY2tsaXN0KHtcblx0bG9nZ2VyLFxuXHRmZWF0dXJlRmxhZ3MsXG5cdF9fZGlybmFtZSxcblx0ZnNNb2R1bGVcbn06IElwQmxhY2tsaXN0RGVwZW5kZW5jaWVzKTogSXBCbGFja2xpc3Qge1xuXHRjb25zdCBJUF9CTEFDS0xJU1RfRU5BQkxFRCA9IGZlYXR1cmVGbGFncy5lbmFibGVJcEJsYWNrbGlzdEZsYWc7XG5cblx0Y29uc3QgbG9hZEJsYWNrbGlzdCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9kYXRhL2JsYWNrbGlzdC5qc29uJyk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChmc01vZHVsZS5leGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuXHRcdFx0XHRjb25zdCBkYXRhID0gZnNNb2R1bGUucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpO1xuXHRcdFx0XHRibGFja2xpc3QgPSBKU09OLnBhcnNlKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0bG9nZ2VyLmVycm9yKGBFcnJvciBsb2FkaW5nIGJsYWNrbGlzdDogJHtlcnJ9YCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IHNhdmVCbGFja2xpc3QgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdFx0aWYgKElQX0JMQUNLTElTVF9FTkFCTEVEKSB7XG5cdFx0XHRjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9kYXRhL2JsYWNrbGlzdC5qc29uJyk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRmc01vZHVsZS53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShibGFja2xpc3QpKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRsb2dnZXIuZXJyb3IoYEVycm9yIHNhdmluZyBibGFja2xpc3Q6ICR7ZXJyfWApO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRjb25zdCBpbml0aWFsaXplQmxhY2tsaXN0ID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuXHRcdGlmIChJUF9CTEFDS0xJU1RfRU5BQkxFRCkge1xuXHRcdFx0bG9nZ2VyLmluZm8oXG5cdFx0XHRcdCdJUCBibGFja2xpc3QgbWlkZGxld2FyZSBpcyBlbmFibGVkLiBJbml0aWFsaXppbmcgYmxhY2tsaXN0J1xuXHRcdFx0KTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IGxvYWRCbGFja2xpc3QoKTtcblx0XHRcdFx0bG9nZ2VyLmluZm8oXG5cdFx0XHRcdFx0J0JsYWNrbGlzdCBhbmQgcmFuZ2VfY2hlY2sgbW9kdWxlIGxvYWRlZCBzdWNjZXNzZnVsbHknXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0bG9nZ2VyLmVycm9yKGBFcnJvciBkdXJpbmcgYmxhY2tsaXN0IGluaXRpYWxpemF0aW9uOiAke2Vycn1gKTtcblx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIuaW5mbygnSVAgYmxhY2tsaXN0IG1pZGRsZXdhcmUgaXMgZGlzYWJsZWQnKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3QgYWRkVG9CbGFja2xpc3QgPSBhc3luYyAoaXA6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuXHRcdGlmIChJUF9CTEFDS0xJU1RfRU5BQkxFRCkge1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0lQIEJsYWNrbGlzdCBpcyBlbmFibGVkLiBBZGRpbmcgSVAgdG8gYmxhY2tsaXN0Jyk7XG5cdFx0XHRpZiAoIWJsYWNrbGlzdC5pbmNsdWRlcyhpcCkpIHtcblx0XHRcdFx0YmxhY2tsaXN0LnB1c2goaXApO1xuXHRcdFx0XHRhd2FpdCBzYXZlQmxhY2tsaXN0KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsb2dnZXIuaW5mbygnSVAgYWxyZWFkeSBpbiBibGFja2xpc3QnKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0lQIEJsYWNrbGlzdCBpcyBkaXNhYmxlZCcpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBpcEJsYWNrbGlzdE1pZGRsZXdhcmUgPSAoXG5cdFx0cmVxOiBSZXF1ZXN0LFxuXHRcdHJlczogUmVzcG9uc2UsXG5cdFx0bmV4dDogTmV4dEZ1bmN0aW9uXG5cdCk6IHZvaWQgPT4ge1xuXHRcdGlmIChJUF9CTEFDS0xJU1RfRU5BQkxFRCkge1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0lQIEJsYWNrbGlzdCBtaWRkbGV3YXJlIGVuYWJsZWQnKTtcblx0XHRcdGNvbnN0IGNsaWVudElwID0gcmVxLmlwO1xuXG5cdFx0XHRpZiAoIWNsaWVudElwKSB7XG5cdFx0XHRcdGxvZ2dlci5lcnJvcignQ2xpZW50IElQIG5vdCBmb3VuZCcpO1xuXHRcdFx0XHRyZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnQmFkIHJlcXVlc3QnIH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmIChibGFja2xpc3Quc29tZShyYW5nZSA9PiBpblJhbmdlKGNsaWVudElwLCByYW5nZSkpKSB7XG5cdFx0XHRcdGxvZ2dlci53YXJuKGBCbG9ja2VkIHJlcXVlc3QgZnJvbSBibGFja2xpc3RlZCBJUDogJHtjbGllbnRJcH1gKTtcblx0XHRcdFx0cmVzLnN0YXR1cyg0MDMpLmpzb24oeyBlcnJvcjogJ0FjY2VzcyBkZW5pZWQnIH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlci5pbmZvKCdJUCBCbGFja2xpc3QgbWlkZGxld2FyZSBkaXNhYmxlZCcpO1xuXHRcdH1cblxuXHRcdG5leHQoKTtcblx0fTtcblxuXHRjb25zdCByZW1vdmVGcm9tQmxhY2tsaXN0ID0gKGlwOiBzdHJpbmcpOiB2b2lkID0+IHtcblx0XHRpZiAoSVBfQkxBQ0tMSVNUX0VOQUJMRUQpIHtcblx0XHRcdGJsYWNrbGlzdCA9IGJsYWNrbGlzdC5maWx0ZXIocmFuZ2UgPT4gcmFuZ2UgIT09IGlwKTtcblx0XHRcdHNhdmVCbGFja2xpc3QoKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRpbml0aWFsaXplQmxhY2tsaXN0LFxuXHRcdGxvYWRCbGFja2xpc3QsXG5cdFx0YWRkVG9CbGFja2xpc3QsXG5cdFx0aXBCbGFja2xpc3RNaWRkbGV3YXJlLFxuXHRcdHJlbW92ZUZyb21CbGFja2xpc3Rcblx0fTtcbn1cblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVJcEJsYWNrbGlzdCA9IGNyZWF0ZUlwQmxhY2tsaXN0O1xuIl19
