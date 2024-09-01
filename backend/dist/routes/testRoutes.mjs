import express from 'express';
export default function createTestRouter(deps) {
	const router = express.Router();
	const { logger } = deps;
	router.get('/test', (req, res) => {
		logger.info('Test route was accessed.');
		res.send('Test route is working!');
	});
	return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvdGVzdFJvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQXNDLE1BQU0sU0FBUyxDQUFDO0FBUTdELE1BQU0sQ0FBQyxPQUFPLFVBQVUsZ0JBQWdCLENBQUMsSUFBMkI7SUFDbkUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFFeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7UUFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBSb3V0ZXIgfSBmcm9tICdleHByZXNzJztcblxuaW50ZXJmYWNlIFRlc3RSb3V0ZURlcGVuZGVuY2llcyB7XG5cdGxvZ2dlcjoge1xuXHRcdGluZm86IChtc2c6IHN0cmluZykgPT4gdm9pZDtcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVGVzdFJvdXRlcihkZXBzOiBUZXN0Um91dGVEZXBlbmRlbmNpZXMpOiBSb3V0ZXIge1xuXHRjb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuXHRjb25zdCB7IGxvZ2dlciB9ID0gZGVwcztcblxuXHRyb3V0ZXIuZ2V0KCcvdGVzdCcsIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcblx0XHRsb2dnZXIuaW5mbygnVGVzdCByb3V0ZSB3YXMgYWNjZXNzZWQuJyk7XG5cdFx0cmVzLnNlbmQoJ1Rlc3Qgcm91dGUgaXMgd29ya2luZyEnKTtcblx0fSk7XG5cblx0cmV0dXJuIHJvdXRlcjtcbn1cbiJdfQ==
