import { inRange } from 'range_check';
import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
let blacklist = [];
export const loadBlacklist = async ({
	logger,
	fsModule,
	environmentVariables
}) => {
	validateDependencies(
		[
			{ name: 'logger', instance: logger },
			{ name: 'fsModule', instance: fsModule },
			{ name: 'environmentVariables', instance: environmentVariables }
		],
		logger || console
	);
	const filePath = environmentVariables.ipBlacklistPath;
	try {
		if (await fsModule.stat(filePath)) {
			const data = await fsModule.readFile(filePath, 'utf8');
			blacklist = JSON.parse(data);
			logger.info('Blacklist loaded successfully');
		}
	} catch (err) {
		processError(err, logger || console);
	}
};
const saveBlacklist = async ({
	logger,
	featureFlags,
	fsModule,
	environmentVariables
}) => {
	validateDependencies(
		[
			{ name: 'logger', instance: logger },
			{ name: 'featureFlags', instance: featureFlags },
			{ name: 'fsModule', instance: fsModule },
			{ name: 'environmentVariables', instance: environmentVariables }
		],
		logger || console
	);
	if (featureFlags.enableIpBlacklistFlag) {
		const filePath = environmentVariables.ipBlacklistPath;
		try {
			await fsModule.writeFile(filePath, JSON.stringify(blacklist));
			logger.info('Blacklist saved successfully');
		} catch (err) {
			processError(err, logger || console);
		}
	}
};
export const initializeBlacklist = async deps => {
	validateDependencies(
		[
			{ name: 'logger', instance: deps.logger },
			{ name: 'featureFlags', instance: deps.featureFlags }
		],
		deps.logger
	);
	const { logger, featureFlags } = deps;
	if (featureFlags.enableIpBlacklistFlag) {
		logger.info(
			'IP blacklist middleware is enabled. Initializing blacklist'
		);
		try {
			await loadBlacklist(deps);
			logger.info('Blacklist and range_check module loaded successfully');
		} catch (err) {
			processError(err, logger);
			throw err;
		}
	} else {
		logger.info('IP blacklist middleware is disabled');
	}
};
export const addToBlacklist = async (ip, deps) => {
	const { logger, featureFlags } = deps;
	validateDependencies(
		[
			{ name: 'ip', instance: ip },
			{ name: 'logger', instance: deps.logger },
			{ name: 'featureFlags', instance: deps.featureFlags }
		],
		logger || console
	);
	try {
		if (featureFlags.enableIpBlacklistFlag) {
			logger.info('IP Blacklist is enabled. Adding IP to blacklist');
			if (!blacklist.includes(ip)) {
				blacklist.push(ip);
				await saveBlacklist(deps);
				logger.info(`IP ${ip} added to blacklist`);
			} else {
				logger.info('IP already in blacklist');
			}
		} else {
			logger.info('IP Blacklist is disabled');
		}
	} catch (err) {
		processError(err, logger);
	}
};
export const removeFromBlacklist = async (ip, deps) => {
	const { logger, featureFlags } = deps;
	validateDependencies(
		[
			{ name: 'ip', instance: ip },
			{ name: 'logger', instance: deps.logger },
			{ name: 'featureFlags', instance: deps.featureFlags }
		],
		logger || console
	);
	try {
		if (featureFlags.enableIpBlacklistFlag) {
			blacklist = blacklist.filter(range => range !== ip);
			await saveBlacklist(deps);
			logger.info(`IP ${ip} removed from blacklist`);
		}
	} catch (err) {
		processError(err, logger);
	}
};
export const ipBlacklistMiddleware = deps => (req, res, next) => {
	const { logger, featureFlags } = deps;
	validateDependencies([
		{ name: 'logger', instance: logger },
		{ name: 'featureFlags', instance: featureFlags }
	]);
	try {
		if (featureFlags.enableIpBlacklistFlag) {
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
	} catch (err) {
		processError(err, logger);
		res.status(500).json({ error: 'Internal server error' });
		return;
	}
	next();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBCbGFja2xpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWlkZGxld2FyZS9pcEJsYWNrbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBTXRDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVNyRCxJQUFJLFNBQVMsR0FBYSxFQUFFLENBQUM7QUFFN0IsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxFQUNuQyxNQUFNLEVBQ04sUUFBUSxFQUNSLG9CQUFvQixFQUNLLEVBQWlCLEVBQUU7SUFDNUMsb0JBQW9CLENBQ25CO1FBQ0MsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7UUFDcEMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7UUFDeEMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFO0tBQ2hFLEVBQ0QsTUFBTSxJQUFJLE9BQU8sQ0FDakIsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFHLG9CQUFvQixDQUFDLGVBQWUsQ0FBQztJQUN0RCxJQUFJLENBQUM7UUFDSixJQUFJLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkQsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDRixDQUFDO0lBQUMsT0FBTyxHQUFH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QUFDO1lBRUQsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQ1Ysd0NBQXdDLFFBQVEsRUFBRSxDQUNsRCxDQUFDO2dCQUNGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELE9BQU87WUFDUixDQUFDO1FBQ0YsQ0FBQzthQUFNLENBQUM7WUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNGLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2QsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7UUFDekQsT0FBTztJQUNSLENBQUM7SUFFRCxJQUFJLEVBQUUsQ0FBQztBQUNSLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBpblJhbmdlIH0gZnJvbSAncmFuZ2VfY2hlY2snO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5pbXBvcnQge1xuXHRlbnZpcm9ubWVudFZhcmlhYmxlcyxcblx0RmVhdHVyZUZsYWdzXG59IGZyb20gJy4uL2NvbmZpZy9lbnZpcm9ubWVudENvbmZpZyc7XG5pbXBvcnQgeyB2YWxpZGF0ZURlcGVuZGVuY2llcyB9IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRlRGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IHByb2Nlc3NFcnJvciB9IGZyb20gJy4uL3V0aWxzL3Byb2Nlc3NFcnJvcic7XG5cbmludGVyZmFjZSBJcEJsYWNrbGlzdERlcGVuZGVuY2llcyB7XG5cdGxvZ2dlcjogTG9nZ2VyO1xuXHRmZWF0dXJlRmxhZ3M6IEZlYXR1cmVGbGFncztcblx0ZW52aXJvbm1lbnRWYXJpYWJsZXM6IHR5cGVvZiBlbnZpcm9ubWVudFZhcmlhYmxlcztcblx0ZnNNb2R1bGU6IHR5cGVvZiBmcy5wcm9taXNlcztcbn1cblxubGV0IGJsYWNrbGlzdDogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGNvbnN0IGxvYWRCbGFja2xpc3QgPSBhc3luYyAoe1xuXHRsb2dnZXIsXG5cdGZzTW9kdWxlLFxuXHRlbnZpcm9ubWVudFZhcmlhYmxlc1xufTogSXBCbGFja2xpc3REZXBlbmRlbmNpZXMpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0W1xuXHRcdFx0eyBuYW1lOiAnbG9nZ2VyJywgaW5zdGFuY2U6IGxvZ2dlciB9LFxuXHRcdFx0eyBuYW1lOiAnZnNNb2R1bGUnLCBpbnN0YW5jZTogZnNNb2R1bGUgfSxcblx0XHRcdHsgbmFtZTogJ2Vudmlyb25tZW50VmFyaWFibGVzJywgaW5zdGFuY2U6IGVudmlyb25tZW50VmFyaWFibGVzIH1cblx0XHRdLFxuXHRcdGxvZ2dlciB8fCBjb25zb2xlXG5cdCk7XG5cblx0Y29uc3QgZmlsZVBhdGggPSBlbnZpcm9ubWVudFZhcmlhYmxlcy5pcEJsYWNrbGlzdFBhdGg7XG5cdHRyeSB7XG5cdFx0aWYgKGF3YWl0IGZzTW9kdWxlLnN0YXQoZmlsZVBhdGgpKSB7XG5cdFx0XHRjb25zdCBkYXRhID0gYXdhaXQgZnNNb2R1bGUucmVhZEZpbGUoZmlsZVBhdGgsICd1dGY4Jyk7XG5cdFx0XHRibGFja2xpc3QgPSBKU09OLnBhcnNlKGRhdGEpO1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0JsYWNrbGlzdCBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fVxuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRwcm9jZXNzRXJyb3IoZXJyLCBsb2dnZXIgfHwgY29uc29sZSk7XG5cdH1cbn07XG5cbmNvbnN0IHNhdmVCbGFja2xpc3QgPSBhc3luYyAoe1xuXHRsb2dnZXIsXG5cdGZlYXR1cmVGbGFncyxcblx0ZnNNb2R1bGUsXG5cdGVudmlyb25tZW50VmFyaWFibGVzXG59OiBJcEJsYWNrbGlzdERlcGVuZGVuY2llcyk6IFByb21pc2U8dm9pZD4gPT4ge1xuXHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRbXG5cdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH0sXG5cdFx0XHR7IG5hbWU6ICdmZWF0dXJlRmxhZ3MnLCBpbnN0YW5jZTogZmVhdHVyZUZsYWdzIH0sXG5cdFx0XHR7IG5hbWU6ICdmc01vZHVsZScsIGluc3RhbmNlOiBmc01vZHVsZSB9LFxuXHRcdFx0eyBuYW1lOiAnZW52aXJvbm1lbnRWYXJpYWJsZXMnLCBpbnN0YW5jZTogZW52aXJvbm1lbnRWYXJpYWJsZXMgfVxuXHRcdF0sXG5cdFx0bG9nZ2VyIHx8IGNvbnNvbGVcblx0KTtcblxuXHRpZiAoZmVhdHVyZUZsYWdzLmVuYWJsZUlwQmxhY2tsaXN0RmxhZykge1xuXHRcdGNvbnN0IGZpbGVQYXRoID0gZW52aXJvbm1lbnRWYXJpYWJsZXMuaXBCbGFja2xpc3RQYXRoO1xuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCBmc01vZHVsZS53cml0ZUZpbGUoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGJsYWNrbGlzdCkpO1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0JsYWNrbGlzdCBzYXZlZCBzdWNjZXNzZnVsbHknKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHByb2Nlc3NFcnJvcihlcnIsIGxvZ2dlciB8fCBjb25zb2xlKTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplQmxhY2tsaXN0ID0gYXN5bmMgKFxuXHRkZXBzOiBJcEJsYWNrbGlzdERlcGVuZGVuY2llc1xuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFtcblx0XHRcdHsgbmFtZTogJ2xvZ2dlcicsIGluc3RhbmNlOiBkZXBzLmxvZ2dlciB9LFxuXHRcdFx0eyBuYW1lOiAnZmVhdHVyZUZsYWdzJywgaW5zdGFuY2U6IGRlcHMuZmVhdHVyZUZsYWdzIH1cblx0XHRdLFxuXHRcdGRlcHMubG9nZ2VyXG5cdCk7XG5cblx0Y29uc3QgeyBsb2dnZXIsIGZlYXR1cmVGbGFncyB9ID0gZGVwcztcblxuXHRpZiAoZmVhdHVyZUZsYWdzLmVuYWJsZUlwQmxhY2tsaXN0RmxhZykge1xuXHRcdGxvZ2dlci5pbmZvKFxuXHRcdFx0J0lQIGJsYWNrbGlzdCBtaWRkbGV3YXJlIGlzIGVuYWJsZWQuIEluaXRpYWxpemluZyBibGFja2xpc3QnXG5cdFx0KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgbG9hZEJsYWNrbGlzdChkZXBzKTtcblx0XHRcdGxvZ2dlci5pbmZvKCdCbGFja2xpc3QgYW5kIHJhbmdlX2NoZWNrIG1vZHVsZSBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRwcm9jZXNzRXJyb3IoZXJyLCBsb2dnZXIpO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRsb2dnZXIuaW5mbygnSVAgYmxhY2tsaXN0IG1pZGRsZXdhcmUgaXMgZGlzYWJsZWQnKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGFkZFRvQmxhY2tsaXN0ID0gYXN5bmMgKFxuXHRpcDogc3RyaW5nLFxuXHRkZXBzOiBJcEJsYWNrbGlzdERlcGVuZGVuY2llc1xuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdGNvbnN0IHsgbG9nZ2VyLCBmZWF0dXJlRmxhZ3MgfSA9IGRlcHM7XG5cblx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0W1xuXHRcdFx0eyBuYW1lOiAnaXAnLCBpbnN0YW5jZTogaXAgfSxcblx0XHRcdHsgbmFtZTogJ2xvZ2dlcicsIGluc3RhbmNlOiBkZXBzLmxvZ2dlciB9LFxuXHRcdFx0eyBuYW1lOiAnZmVhdHVyZUZsYWdzJywgaW5zdGFuY2U6IGRlcHMuZmVhdHVyZUZsYWdzIH1cblx0XHRdLFxuXHRcdGxvZ2dlciB8fCBjb25zb2xlXG5cdCk7XG5cblx0dHJ5IHtcblx0XHRpZiAoZmVhdHVyZUZsYWdzLmVuYWJsZUlwQmxhY2tsaXN0RmxhZykge1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0lQIEJsYWNrbGlzdCBpcyBlbmFibGVkLiBBZGRpbmcgSVAgdG8gYmxhY2tsaXN0Jyk7XG5cdFx0XHRpZiAoIWJsYWNrbGlzdC5pbmNsdWRlcyhpcCkpIHtcblx0XHRcdFx0YmxhY2tsaXN0LnB1c2goaXApO1xuXHRcdFx0XHRhd2FpdCBzYXZlQmxhY2tsaXN0KGRlcHMpO1xuXHRcdFx0XHRsb2dnZXIuaW5mbyhgSVAgJHtpcH0gYWRkZWQgdG8gYmxhY2tsaXN0YCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsb2dnZXIuaW5mbygnSVAgYWxyZWFkeSBpbiBibGFja2xpc3QnKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLmluZm8oJ0lQIEJsYWNrbGlzdCBpcyBkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0cHJvY2Vzc0Vycm9yKGVyciwgbG9nZ2VyKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZUZyb21CbGFja2xpc3QgPSBhc3luYyAoXG5cdGlwOiBzdHJpbmcsXG5cdGRlcHM6IElwQmxhY2tsaXN0RGVwZW5kZW5jaWVzXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0Y29uc3QgeyBsb2dnZXIsIGZlYXR1cmVGbGFncyB9ID0gZGVwcztcblxuXHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRbXG5cdFx0XHR7IG5hbWU6ICdpcCcsIGluc3RhbmNlOiBpcCB9LFxuXHRcdFx0eyBuYW1lOiAnbG9nZ2VyJywgaW5zdGFuY2U6IGRlcHMubG9nZ2VyIH0sXG5cdFx0XHR7IG5hbWU6ICdmZWF0dXJlRmxhZ3MnLCBpbnN0YW5jZTogZGVwcy5mZWF0dXJlRmxhZ3MgfVxuXHRcdF0sXG5cdFx0bG9nZ2VyIHx8IGNvbnNvbGVcblx0KTtcblxuXHR0cnkge1xuXHRcdGlmIChmZWF0dXJlRmxhZ3MuZW5hYmxlSXBCbGFja2xpc3RGbGFnKSB7XG5cdFx0XHRibGFja2xpc3QgPSBibGFja2xpc3QuZmlsdGVyKHJhbmdlID0+IHJhbmdlICE9PSBpcCk7XG5cdFx0XHRhd2FpdCBzYXZlQmxhY2tsaXN0KGRlcHMpO1xuXHRcdFx0bG9nZ2VyLmluZm8oYElQICR7aXB9IHJlbW92ZWQgZnJvbSBibGFja2xpc3RgKTtcblx0XHR9XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdHByb2Nlc3NFcnJvcihlcnIsIGxvZ2dlcik7XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBpcEJsYWNrbGlzdE1pZGRsZXdhcmUgPVxuXHQoZGVwczogSXBCbGFja2xpc3REZXBlbmRlbmNpZXMpID0+XG5cdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IHZvaWQgPT4ge1xuXHRcdGNvbnN0IHsgbG9nZ2VyLCBmZWF0dXJlRmxhZ3MgfSA9IGRlcHM7XG5cblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhbXG5cdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH0sXG5cdFx0XHR7IG5hbWU6ICdmZWF0dXJlRmxhZ3MnLCBpbnN0YW5jZTogZmVhdHVyZUZsYWdzIH1cblx0XHRdKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAoZmVhdHVyZUZsYWdzLmVuYWJsZUlwQmxhY2tsaXN0RmxhZykge1xuXHRcdFx0XHRsb2dnZXIuaW5mbygnSVAgQmxhY2tsaXN0IG1pZGRsZXdhcmUgZW5hYmxlZCcpO1xuXHRcdFx0XHRjb25zdCBjbGllbnRJcCA9IHJlcS5pcDtcblxuXHRcdFx0XHRpZiAoIWNsaWVudElwKSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmVycm9yKCdDbGllbnQgSVAgbm90IGZvdW5kJyk7XG5cdFx0XHRcdFx0cmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0JhZCByZXF1ZXN0JyB9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYmxhY2tsaXN0LnNvbWUocmFuZ2UgPT4gaW5SYW5nZShjbGllbnRJcCwgcmFuZ2UpKSkge1xuXHRcdFx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdFx0YEJsb2NrZWQgcmVxdWVzdCBmcm9tIGJsYWNrbGlzdGVkIElQOiAke2NsaWVudElwfWBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdBY2Nlc3MgZGVuaWVkJyB9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxvZ2dlci5pbmZvKCdJUCBCbGFja2xpc3QgbWlkZGxld2FyZSBkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVyciwgbG9nZ2VyKTtcblx0XHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG5leHQoKTtcblx0fTtcbiJdfQ==
