import { createClient } from 'redis';
async function connectRedis() {
	let client = createClient({
		url: 'redis://localhost:6379'
	});
	client.on('error', (err) => {
		console.error('Redis client error:', err);
	});
	await client.connect();
	console.log('Connected to Redis');
	await client.set('key', 'value');
	let value = await client.get('key');
	console.log('Key value:', value);
	return client;
}
let redisClient = connectRedis();
export default redisClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL3JlZGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFckMsS0FBSyxVQUFVLFlBQVk7SUFDMUIsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQ3pCLEdBQUcsRUFBRSx3QkFBd0I7S0FDN0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBRWxDLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWpDLE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQUVELElBQUksV0FBVyxHQUFHLFlBQVksRUFBRSxDQUFDO0FBRWpDLGVBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAncmVkaXMnO1xuXG5hc3luYyBmdW5jdGlvbiBjb25uZWN0UmVkaXMoKSB7XG5cdGxldCBjbGllbnQgPSBjcmVhdGVDbGllbnQoe1xuXHRcdHVybDogJ3JlZGlzOi8vbG9jYWxob3N0OjYzNzknXG5cdH0pO1xuXG5cdGNsaWVudC5vbignZXJyb3InLCAoZXJyKSA9PiB7XG5cdFx0Y29uc29sZS5lcnJvcignUmVkaXMgY2xpZW50IGVycm9yOicsIGVycik7XG5cdH0pO1xuXG5cdGF3YWl0IGNsaWVudC5jb25uZWN0KCk7XG5cdGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gUmVkaXMnKTtcblxuXHRhd2FpdCBjbGllbnQuc2V0KCdrZXknLCAndmFsdWUnKTtcblx0bGV0IHZhbHVlID0gYXdhaXQgY2xpZW50LmdldCgna2V5Jyk7XG5cdGNvbnNvbGUubG9nKCdLZXkgdmFsdWU6JywgdmFsdWUpO1xuXG5cdHJldHVybiBjbGllbnQ7XG59XG5cbmxldCByZWRpc0NsaWVudCA9IGNvbm5lY3RSZWRpcygpO1xuXG5leHBvcnQgZGVmYXVsdCByZWRpc0NsaWVudDtcbiJdfQ==
