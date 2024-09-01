async function createTransporter({ nodemailer, getSecrets, emailUser }) {
	const secrets = await getSecrets();
	const transporter = nodemailer.createTransport({
		host: secrets.EMAIL_HOST,
		port: secrets.EMAIL_PORT,
		secure: secrets.EMAIL_SECURE,
		auth: {
			user: emailUser,
			pass: secrets.SMTP_TOKEN
		}
	});
	return transporter;
}
let transporter = null;
export async function getTransporter(deps) {
	if (!transporter) {
		transporter = await createTransporter(deps);
	}
	return transporter;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9tYWlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZUEsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ2hDLFVBQVUsRUFDVixVQUFVLEVBQ1YsU0FBUyxFQUNXO0lBQ3BCLE1BQU0sT0FBTyxHQUFrQixNQUFNLFVBQVUsRUFBRSxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUM7UUFDOUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVTtRQUN4QixNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVk7UUFDNUIsSUFBSSxFQUFFO1lBQ0wsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVU7U0FDeEI7S0FDRCxDQUFDLENBQUM7SUFFSCxPQUFPLFdBQVcsQ0FBQztBQUNwQixDQUFDO0FBRUQsSUFBSSxXQUFXLEdBQXVCLElBQUksQ0FBQztBQUUzQyxNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUF3QjtJQUM1RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEIsV0FBVyxHQUFHLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbm9kZW1haWxlciwgeyBUcmFuc3BvcnRlciB9IGZyb20gJ25vZGVtYWlsZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1haWxlclNlY3JldHMge1xuXHRFTUFJTF9IT1NUOiBzdHJpbmc7XG5cdEVNQUlMX1BPUlQ6IG51bWJlcjtcblx0RU1BSUxfU0VDVVJFOiBib29sZWFuO1xuXHRTTVRQX1RPS0VOOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFpbGVyRGVwZW5kZW5jaWVzIHtcblx0bm9kZW1haWxlcjogdHlwZW9mIG5vZGVtYWlsZXI7XG5cdGdldFNlY3JldHM6ICgpID0+IFByb21pc2U8TWFpbGVyU2VjcmV0cz47XG5cdGVtYWlsVXNlcjogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVUcmFuc3BvcnRlcih7XG5cdG5vZGVtYWlsZXIsXG5cdGdldFNlY3JldHMsXG5cdGVtYWlsVXNlclxufTogTWFpbGVyRGVwZW5kZW5jaWVzKTogUHJvbWlzZTxUcmFuc3BvcnRlcj4ge1xuXHRjb25zdCBzZWNyZXRzOiBNYWlsZXJTZWNyZXRzID0gYXdhaXQgZ2V0U2VjcmV0cygpO1xuXG5cdGNvbnN0IHRyYW5zcG9ydGVyID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQoe1xuXHRcdGhvc3Q6IHNlY3JldHMuRU1BSUxfSE9TVCxcblx0XHRwb3J0OiBzZWNyZXRzLkVNQUlMX1BPUlQsXG5cdFx0c2VjdXJlOiBzZWNyZXRzLkVNQUlMX1NFQ1VSRSxcblx0XHRhdXRoOiB7XG5cdFx0XHR1c2VyOiBlbWFpbFVzZXIsXG5cdFx0XHRwYXNzOiBzZWNyZXRzLlNNVFBfVE9LRU5cblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiB0cmFuc3BvcnRlcjtcbn1cblxubGV0IHRyYW5zcG9ydGVyOiBUcmFuc3BvcnRlciB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHJhbnNwb3J0ZXIoZGVwczogTWFpbGVyRGVwZW5kZW5jaWVzKTogUHJvbWlzZTxUcmFuc3BvcnRlcj4ge1xuXHRpZiAoIXRyYW5zcG9ydGVyKSB7XG5cdFx0dHJhbnNwb3J0ZXIgPSBhd2FpdCBjcmVhdGVUcmFuc3BvcnRlcihkZXBzKTtcblx0fVxuXHRyZXR1cm4gdHJhbnNwb3J0ZXI7XG59XG5cbiJdfQ==
