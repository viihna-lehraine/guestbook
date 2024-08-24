import { generateToken } from '../utils/auth/jwtUtil.js';
import UserModelPromise from '../models/User.js';
export let login = async (req, res) => {
	try {
		let User = await UserModelPromise;
		let { username, password } = req.body;
		// Correctly type `user` and ensure the correct model is used
		let user = await User.findOne({ where: { username } });
		if (!user) {
			return res
				.status(401)
				.json({ message: 'Login failed - invalid credentials' });
		}
		// Use the comparePassword method from the User model
		let isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		// Generate JWT token
		let token = await generateToken(user);
		// Respond with the token
		res.json({ token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
	return; // unreachable code, but it satisfies TypeScript *shrug*
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlcnMvYXV0aENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sZ0JBQWdCLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsTUFBTSxDQUFDLElBQUksS0FBSyxHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLEVBQUU7SUFDeEQsSUFBSSxDQUFDO1FBQ0osSUFBSSxJQUFJLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQztRQUVsQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFdEMsNkRBQTZEO1FBQzdELElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWCxPQUFPLEdBQUc7aUJBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQztpQkFDWCxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxxREFBcUQ7UUFDckQsSUFBSSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN0QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksS0FBSyxHQUFHLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLHlCQUF5QjtRQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsT0FBTyxDQUFDLHdEQUF3RDtBQUNqRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgZ2VuZXJhdGVUb2tlbiB9IGZyb20gJy4uL3V0aWxzL2F1dGgvand0VXRpbCc7XG5pbXBvcnQgVXNlck1vZGVsUHJvbWlzZSBmcm9tICcuLi9tb2RlbHMvVXNlcic7XG5cbmV4cG9ydCBsZXQgbG9naW4gPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG5cdHRyeSB7XG5cdFx0bGV0IFVzZXIgPSBhd2FpdCBVc2VyTW9kZWxQcm9taXNlO1xuXG5cdFx0bGV0IHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcblxuXHRcdC8vIENvcnJlY3RseSB0eXBlIGB1c2VyYCBhbmQgZW5zdXJlIHRoZSBjb3JyZWN0IG1vZGVsIGlzIHVzZWRcblx0XHRsZXQgdXNlciA9IGF3YWl0IFVzZXIuZmluZE9uZSh7IHdoZXJlOiB7IHVzZXJuYW1lIH0gfSk7XG5cblx0XHRpZiAoIXVzZXIpIHtcblx0XHRcdHJldHVybiByZXNcblx0XHRcdFx0LnN0YXR1cyg0MDEpXG5cdFx0XHRcdC5qc29uKHsgbWVzc2FnZTogJ0xvZ2luIGZhaWxlZCAtIGludmFsaWQgY3JlZGVudGlhbHMnIH0pO1xuXHRcdH1cblxuXHRcdC8vIFVzZSB0aGUgY29tcGFyZVBhc3N3b3JkIG1ldGhvZCBmcm9tIHRoZSBVc2VyIG1vZGVsXG5cdFx0bGV0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IHVzZXIuY29tcGFyZVBhc3N3b3JkKHBhc3N3b3JkKTtcblxuXHRcdGlmICghaXNQYXNzd29yZFZhbGlkKSB7XG5cdFx0XHRyZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBtZXNzYWdlOiAnSW52YWxpZCBjcmVkZW50aWFscycgfSk7XG5cdFx0fVxuXG5cdFx0Ly8gR2VuZXJhdGUgSldUIHRva2VuXG5cdFx0bGV0IHRva2VuID0gYXdhaXQgZ2VuZXJhdGVUb2tlbih1c2VyKTtcblxuXHRcdC8vIFJlc3BvbmQgd2l0aCB0aGUgdG9rZW5cblx0XHRyZXMuanNvbih7IHRva2VuIH0pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0cmVzLnN0YXR1cyg1MDApLmpzb24oeyBtZXNzYWdlOiAnU2VydmVyIGVycm9yJyB9KTtcblx0fVxuXG5cdHJldHVybjsgLy8gdW5yZWFjaGFibGUgY29kZSwgYnV0IGl0IHNhdGlzZmllcyBUeXBlU2NyaXB0ICpzaHJ1Zypcbn07XG4iXX0=
