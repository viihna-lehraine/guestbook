import express from 'express';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import zxcvbn from 'zxcvbn';
import { v4 as uuidv4 } from 'uuid';
import xss from 'xss';
import {
	generateConfirmationEmailTemplate,
	generateEmail2FACode,
	generateQRCode,
	generateTOTPSecret,
	getTransporter,
	verifyEmail2FACode,
	verifyTOTPToken
} from '../index.js';
import setupLogger from '../config/logger.js';
import getSecrets from '../config/sops.js';
import User from '../models/User.js';
const router = express.Router();
const logger = setupLogger();
const secrets = await getSecrets.getSecrets();
// Password strength checker
const checkPasswordStrength = password => {
	const { score } = zxcvbn(password);
	return score >= 3;
};
// Register
router.post('/register', async (req, res) => {
	const { username, email, password, confirmPassword } = req.body;
	// Sanitize inputs
	const sanitizedUsername = xss(username);
	const sanitizedEmail = xss(email);
	const sanitizedPassword = xss(password);
	if (sanitizedPassword !== confirmPassword) {
		logger.info('Registration failure: passwords do not match');
		return res
			.status(400)
			.json({ password: 'Registration failure: passwords do not match' });
	}
	if (!User.validatePassword(sanitizedPassword)) {
		logger.info(
			'Registration failure: passwords do not meet complexity requirements'
		);
		return res.status(400).json({
			password:
				'Registration failure: password does not meet complexity requirements'
		});
	}
	if (!checkPasswordStrength(sanitizedPassword)) {
		logger.info('Registration failure: password is too weak');
		return res
			.status(400)
			.json({ password: 'Registration failure: password is too weak' });
	}
	try {
		const pwnedResponse = await axios.get(
			`https://api.pwnedpasswords.com/range/${sanitizedPassword.substring(0, 5)}`
		);
		const pwnedList = pwnedResponse.data
			.split('\n')
			.map(p => p.split(':')[0]);
		if (pwnedList.includes(sanitizedPassword.substring(5).toUpperCase())) {
			logger.warn(
				'Registration warning: password has been exposed in a data breach'
			);
			return res.status(400).json({
				password:
					'Registration warning: password has been exposed in a data breach'
			});
		}
	} catch (error) {
		logger.error(error);
		logger.error('Registration error: HIBP API check failed');
	}
	try {
		const user = await User.findOne({ where: { email: sanitizedEmail } });
		if (user) {
			logger.info('Registration failure: email already exists');
			return res
				.status(400)
				.json({ email: 'Registration failure: email already exists' });
		} else {
			const hashedPassword = await argon2.hash(
				sanitizedPassword + secrets.PEPPER,
				{
					type: argon2.argon2id
				}
			);
			const newUser = await User.create({
				id: uuidv4(),
				username: sanitizedUsername,
				password: hashedPassword,
				email: sanitizedEmail,
				isAccountVerified: false,
				resetPasswordToken: null,
				resetPasswordExpires: null,
				isMfaEnabled: false,
				creationDate: new Date()
			});
			// Generate a confirmation token
			const confirmationToken = jwt.sign(
				{ id: newUser.id },
				secrets.JWT_SECRET,
				{ expiresIn: '1d' }
			);
			const confirmationUrl = `http://localhost:${process.env.SERVER_PORT}/api/users/confirm/${confirmationToken}`;
			// Send confirmation email
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: newUser.email,
				subject: 'Guestbook - Account Confirmation',
				html: generateConfirmationEmailTemplate(
					newUser.username,
					confirmationUrl
				)
			};
			await (await getTransporter()).sendMail(mailOptions);
			logger.info('User registration complete');
			res.json({
				message:
					'Registration successful. Please check your email to confirm your account.'
			});
		}
	} catch (err) {
		logger.error('User Registration: server error: ', err);
		res.status(500).json({ error: 'User registration: server error' });
	}
	return;
});
// Login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	// sanitize inputs
	const sanitizedEmail = xss(email);
	const sanitizedPassword = xss(password);
	try {
		const user = await User.findOne({ where: { email: sanitizedEmail } });
		if (!user) {
			logger.info('400 - User not found');
			return res.status(400).json({ email: 'User not found' });
		}
		const isMatch = await argon2.verify(
			user.password,
			sanitizedPassword + secrets.PEPPER
		);
		if (isMatch) {
			const payload = { id: user.userid, username: user.username };
			const token = jwt.sign(payload, secrets.JWT_SECRET, {
				expiresIn: '1h'
			});
			res.json({ success: true, token: `Bearer ${token}` });
		} else {
			return res.status(400).json({ password: 'Incorrect password' });
		}
	} catch (err) {
		console.error(err);
		logger.error('Login - server error');
		res.status(500).json({ error: 'Login - Server error' });
	}
	return;
});
// Password Recovery (simplified)
router.post('/recover-password', async (req, res) => {
	const { email } = req.body;
	// sanitize inputs
	const sanitizedEmail = xss(email);
	try {
		const user = await User.findOne({ where: { email: sanitizedEmail } });
		if (!user) {
			return res.status(404).json({ email: 'User not found' });
		}
		// Generate a token (customize this later)
		const token = await bcrypt.genSalt(25);
		// let passwordResetUrl = `https://localhost:${process.env.SERVER_PORT}/password-reset${token}`;
		// Store the token in the database (simplified for now)
		user.resetPasswordToken = token;
		user.resetPasswordExpires = new Date(Date.now() + 1800000); // 30 min
		await user.save();
		// Send password reset email
		logger.info('Password reset link sent to user ', user.email);
		res.json({ message: `Password reset link sent to ${user.email}` });
	} catch (err) {
		logger.error('Password Recovery - Server error: ', err);
		res.status(500).json({ error: 'Password Recovery - Server error' });
	}
	return;
});
// Route for TOTP secret generation
router.post('/generate-totp', async (req, res) => {
	// let { username } = req.body; // *DEV-NOTE* does this even need to be here?
	// sanitize username input
	// let sanitizedUsername = xss(username); // *DEV-NOTE* or this?
	// *DEV-NOTE* here, we could store the secret in the session or send it to the client
	// depending on the use case; food for thought
	try {
		const { base32, otpauth_url } = generateTOTPSecret();
		const qrCodeUrl = await generateQRCode(otpauth_url);
		res.json({ secret: base32, qrCodeUrl });
	} catch (err) {
		logger.error('Error generating TOTP secret: ', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});
// Route to verify TOTP tokens
router.post('/verify-totp', async (req, res) => {
	const { token, secret } = req.body;
	try {
		// verify TOTP token using the secret
		const isTOTPTokenValid = verifyTOTPToken(secret, token);
		res.json({ isTOTPTokenValid });
	} catch (err) {
		logger.error('Error verifying TOTP token: ', err);
		res.status(500).json({ error: 'Internal server error' });
	}
	return;
});
// Route to generate and send 2FA codes by email
router.post('/generate-2fa', async (req, res) => {
	const { email } = req.body;
	// sanitize email input
	const sanitizedEmail = xss(email);
	try {
		const user = await User.findOne({ where: { email: sanitizedEmail } });
		if (!user) {
			return res
				.status(404)
				.json({ error: 'Generate 2FA: user not found' });
		}
		const { email2FAToken } = await generateEmail2FACode();
		// save 2FA token and expiration in user's record
		user.resetPasswordToken = email2FAToken;
		user.resetPasswordExpires = new Date(Date.now() + 30 * 60000); // 30 min
		await user.save(); // save user data with the new 2FA token and expiration
		// send the 2FA code to user's email
		await (
			await getTransporter()
		).sendMail({
			to: sanitizedEmail,
			subject: 'Guestbook - Your Login Code',
			text: `Your 2FA code is ${email2FAToken}`
		});
		res.json({ message: '2FA code sent to email' });
	} catch (err) {
		logger.error('Error generating 2FA code: ', err);
		res.status(500).json({ error: 'Generate 2FA: internal server error' });
	}
	return;
});
// Route to verify email 2FA code
router.post('/verify-2fa', async (req, res) => {
	const { email, email2FACode } = req.body;
	// sanitize inputs
	const sanitizedEmail = xss(email);
	try {
		const user = await User.findOne({ where: { email: sanitizedEmail } });
		if (!user) {
			logger.error('Verify 2FA: user not found');
			return res
				.status(404)
				.json({ error: 'Verify 2FA: User not found' });
		}
		const resetPasswordToken = user.resetPasswordToken || '';
		const isEmail2FACodeValid = verifyEmail2FACode(
			resetPasswordToken,
			email2FACode
		);
		if (!isEmail2FACodeValid) {
			logger.error('Invalid or expired 2FA code');
			return res
				.status(400)
				.json({ error: 'Invalid or expired 2FA code' });
		}
		res.json({ message: '2FA code verified successfully' });
	} catch (err) {
		logger.error('Error verifying 2FA code:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
	return;
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlclJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvdXNlclJvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQThCLE1BQU0sU0FBUyxDQUFDO0FBQ3JELE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDO0FBQy9CLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFFLEVBQUUsSUFBSSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sRUFDTixpQ0FBaUMsRUFDakMsb0JBQW9CLEVBQ3BCLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixlQUFlLEVBQ2YsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxXQUFXLE1BQU0scUJBQXFCLENBQUM7QUFDOUMsT0FBTyxVQUFVLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEMsT0FBTyxJQUFJLE1BQU0sZ0JBQWdCLENBQUM7QUFPbEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLE1BQU0sTUFBTSxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBQzdCLE1BQU0sT0FBTyxHQUFnQixNQUFNLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUUzRCw0QkFBNEI7QUFDNUIsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFFBQWdCLEVBQVcsRUFBRTtJQUMzRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNuQixDQUFDLENBQUM7QUFFRixX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O2lCQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUM7aUJBQ1gsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLElBQUksRUFBRSxDQUFDO1FBRXpELE1BQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQzdDLGtCQUFrQixFQUNsQixZQUFZLENBQ1osQ0FBQztRQUNGLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUM1QyxPQUFPLEdBQUc7aUJBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQztpQkFDWCxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxPQUFPO0FBQ1IsQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgYXJnb24yIGZyb20gJ2FyZ29uMic7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdCc7XG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHp4Y3ZibiBmcm9tICd6eGN2Ym4nO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeHNzIGZyb20gJ3hzcyc7XG5pbXBvcnQge1xuXHRnZW5lcmF0ZUNvbmZpcm1hdGlvbkVtYWlsVGVtcGxhdGUsXG5cdGdlbmVyYXRlRW1haWwyRkFDb2RlLFxuXHRnZW5lcmF0ZVFSQ29kZSxcblx0Z2VuZXJhdGVUT1RQU2VjcmV0LFxuXHRnZXRUcmFuc3BvcnRlcixcblx0dmVyaWZ5RW1haWwyRkFDb2RlLFxuXHR2ZXJpZnlUT1RQVG9rZW5cbn0gZnJvbSAnLi4vaW5kZXguanMnO1xuaW1wb3J0IHNldHVwTG9nZ2VyIGZyb20gJy4uL2NvbmZpZy9sb2dnZXIuanMnO1xuaW1wb3J0IGdldFNlY3JldHMgZnJvbSAnLi4vY29uZmlnL3NvcHMnO1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vbW9kZWxzL1VzZXInO1xuXG5pbnRlcmZhY2UgVXNlclNlY3JldHMge1xuXHRKV1RfU0VDUkVUOiBzdHJpbmc7XG5cdFBFUFBFUjogc3RyaW5nO1xufVxuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuY29uc3QgbG9nZ2VyID0gc2V0dXBMb2dnZXIoKTtcbmNvbnN0IHNlY3JldHM6IFVzZXJTZWNyZXRzID0gYXdhaXQgZ2V0U2VjcmV0cy5nZXRTZWNyZXRzKCk7XG5cbi8vIFBhc3N3b3JkIHN0cmVuZ3RoIGNoZWNrZXJcbmNvbnN0IGNoZWNrUGFzc3dvcmRTdHJlbmd0aCA9IChwYXNzd29yZDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG5cdGNvbnN0IHsgc2NvcmUgfSA9IHp4Y3ZibihwYXNzd29yZCk7XG5cdHJldHVybiBzY29yZSA+PSAzO1xufTtcblxuLy8gUmVnaXN0ZXJcbnJvdXRlci5wb3N0KCcvcmVnaXN0ZXInLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG5cdGNvbnN0IHsgdXNlcm5hbWUsIGVtYWlsLCBwYXNzd29yZCwgY29uZmlybVBhc3N3b3JkIH0gPSByZXEuYm9keTtcblxuXHQvLyBTYW5pdGl6ZSBpbnB1dHNcblx0Y29uc3Qgc2FuaXRpemVkVXNlcm5hbWUgPSB4c3ModXNlcm5hbWUpO1xuXHRjb25zdCBzYW5pdGl6ZWRFbWFpbCA9IHhzcyhlbWFpbCk7XG5cdGNvbnN0IHNhbml0aXplZFBhc3N3b3JkID0geHNzKHBhc3N3b3JkKTtcblxuXHRpZiAoc2FuaXRpemVkUGFzc3dvcmQgIT09IGNvbmZpcm1QYXNzd29yZCkge1xuXHRcdGxvZ2dlci5pbmZvKCdSZWdpc3RyYXRpb24gZmFpbHVyZTogcGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuXHRcdHJldHVybiByZXNcblx0XHRcdC5zdGF0dXMoNDAwKVxuXHRcdFx0Lmpzb24oeyBwYXNzd29yZDogJ1JlZ2lzdHJhdGlvbiBmYWlsdXJlOiBwYXNzd29yZHMgZG8gbm90IG1hdGNoJyB9KTtcblx0fVxuXG5cdGlmICghVXNlci52YWxpZGF0ZVBhc3N3b3JkKHNhbml0aXplZFBhc3N3b3JkKSkge1xuXHRcdGxvZ2dlci5pbmZvKFxuXHRcdFx0J1JlZ2lzdHJhdGlvbiBmYWlsdXJlOiBwYXNzd29yZHMgZG8gbm90IG1lZXQgY29tcGxleGl0eSByZXF1aXJlbWVudHMnXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oe1xuXHRcdFx0cGFzc3dvcmQ6XG5cdFx0XHRcdCdSZWdpc3RyYXRpb24gZmFpbHVyZTogcGFzc3dvcmQgZG9lcyBub3QgbWVldCBjb21wbGV4aXR5IHJlcXVpcmVtZW50cydcblx0XHR9KTtcblx0fVxuXG5cdGlmICghY2hlY2tQYXNzd29yZFN0cmVuZ3RoKHNhbml0aXplZFBhc3N3b3JkKSkge1xuXHRcdGxvZ2dlci5pbmZvKCdSZWdpc3RyYXRpb24gZmFpbHVyZTogcGFzc3dvcmQgaXMgdG9vIHdlYWsnKTtcblx0XHRyZXR1cm4gcmVzXG5cdFx0XHQuc3RhdHVzKDQwMClcblx0XHRcdC5qc29uKHsgcGFzc3dvcmQ6ICdSZWdpc3RyYXRpb24gZmFpbHVyZTogcGFzc3dvcmQgaXMgdG9vIHdlYWsnIH0pO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRjb25zdCBwd25lZFJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KFxuXHRcdFx0YGh0dHBzOi8vYXBpLnB3bmVkcGFzc3dvcmRzLmNvbS9yYW5nZS8ke3Nhbml0aXplZFBhc3N3b3JkLnN1YnN0cmluZygwLCA1KX1gXG5cdFx0KTtcblx0XHRjb25zdCBwd25lZExpc3QgPSBwd25lZFJlc3BvbnNlLmRhdGFcblx0XHRcdC5zcGxpdCgnXFxuJylcblx0XHRcdC5tYXAoKHA6IHN0cmluZykgPT4gcC5zcGxpdCgnOicpWzBdKTtcblx0XHRpZiAocHduZWRMaXN0LmluY2x1ZGVzKHNhbml0aXplZFBhc3N3b3JkLnN1YnN0cmluZyg1KS50b1VwcGVyQ2FzZSgpKSkge1xuXHRcdFx0bG9nZ2VyLndhcm4oXG5cdFx0XHRcdCdSZWdpc3RyYXRpb24gd2FybmluZzogcGFzc3dvcmQgaGFzIGJlZW4gZXhwb3NlZCBpbiBhIGRhdGEgYnJlYWNoJ1xuXHRcdFx0KTtcblx0XHRcdHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7XG5cdFx0XHRcdHBhc3N3b3JkOlxuXHRcdFx0XHRcdCdSZWdpc3RyYXRpb24gd2FybmluZzogcGFzc3dvcmQgaGFzIGJlZW4gZXhwb3NlZCBpbiBhIGRhdGEgYnJlYWNoJ1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGxvZ2dlci5lcnJvcihlcnJvcik7XG5cdFx0bG9nZ2VyLmVycm9yKCdSZWdpc3RyYXRpb24gZXJyb3I6IEhJQlAgQVBJIGNoZWNrIGZhaWxlZCcpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgVXNlci5maW5kT25lKHsgd2hlcmU6IHsgZW1haWw6IHNhbml0aXplZEVtYWlsIH0gfSk7XG5cdFx0aWYgKHVzZXIpIHtcblx0XHRcdGxvZ2dlci5pbmZvKCdSZWdpc3RyYXRpb24gZmFpbHVyZTogZW1haWwgYWxyZWFkeSBleGlzdHMnKTtcblx0XHRcdHJldHVybiByZXNcblx0XHRcdFx0LnN0YXR1cyg0MDApXG5cdFx0XHRcdC5qc29uKHsgZW1haWw6ICdSZWdpc3RyYXRpb24gZmFpbHVyZTogZW1haWwgYWxyZWFkeSBleGlzdHMnIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGFyZ29uMi5oYXNoKFxuXHRcdFx0XHRzYW5pdGl6ZWRQYXNzd29yZCArIHNlY3JldHMuUEVQUEVSLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogYXJnb24yLmFyZ29uMmlkXG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0XHRjb25zdCBuZXdVc2VyID0gYXdhaXQgVXNlci5jcmVhdGUoe1xuXHRcdFx0XHRpZDogdXVpZHY0KCksXG5cdFx0XHRcdHVzZXJuYW1lOiBzYW5pdGl6ZWRVc2VybmFtZSxcblx0XHRcdFx0cGFzc3dvcmQ6IGhhc2hlZFBhc3N3b3JkLFxuXHRcdFx0XHRlbWFpbDogc2FuaXRpemVkRW1haWwsXG5cdFx0XHRcdGlzQWNjb3VudFZlcmlmaWVkOiBmYWxzZSxcblx0XHRcdFx0cmVzZXRQYXNzd29yZFRva2VuOiBudWxsLFxuXHRcdFx0XHRyZXNldFBhc3N3b3JkRXhwaXJlczogbnVsbCxcblx0XHRcdFx0aXNNZmFFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0Y3JlYXRpb25EYXRlOiBuZXcgRGF0ZSgpXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gR2VuZXJhdGUgYSBjb25maXJtYXRpb24gdG9rZW5cblx0XHRcdGNvbnN0IGNvbmZpcm1hdGlvblRva2VuID0gand0LnNpZ24oXG5cdFx0XHRcdHsgaWQ6IG5ld1VzZXIuaWQgfSxcblx0XHRcdFx0c2VjcmV0cy5KV1RfU0VDUkVULFxuXHRcdFx0XHR7IGV4cGlyZXNJbjogJzFkJyB9XG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgY29uZmlybWF0aW9uVXJsID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwcm9jZXNzLmVudi5TRVJWRVJfUE9SVH0vYXBpL3VzZXJzL2NvbmZpcm0vJHtjb25maXJtYXRpb25Ub2tlbn1gO1xuXG5cdFx0XHQvLyBTZW5kIGNvbmZpcm1hdGlvbiBlbWFpbFxuXHRcdFx0Y29uc3QgbWFpbE9wdGlvbnMgPSB7XG5cdFx0XHRcdGZyb206IHByb2Nlc3MuZW52LkVNQUlMX1VTRVIsXG5cdFx0XHRcdHRvOiBuZXdVc2VyLmVtYWlsLFxuXHRcdFx0XHRzdWJqZWN0OiAnR3Vlc3Rib29rIC0gQWNjb3VudCBDb25maXJtYXRpb24nLFxuXHRcdFx0XHRodG1sOiBnZW5lcmF0ZUNvbmZpcm1hdGlvbkVtYWlsVGVtcGxhdGUoXG5cdFx0XHRcdFx0bmV3VXNlci51c2VybmFtZSxcblx0XHRcdFx0XHRjb25maXJtYXRpb25Vcmxcblx0XHRcdFx0KVxuXHRcdFx0fTtcblxuXHRcdFx0YXdhaXQgKGF3YWl0IGdldFRyYW5zcG9ydGVyKCkpLnNlbmRNYWlsKG1haWxPcHRpb25zKTtcblxuXHRcdFx0bG9nZ2VyLmluZm8oJ1VzZXIgcmVnaXN0cmF0aW9uIGNvbXBsZXRlJyk7XG5cdFx0XHRyZXMuanNvbih7XG5cdFx0XHRcdG1lc3NhZ2U6XG5cdFx0XHRcdFx0J1JlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCB0byBjb25maXJtIHlvdXIgYWNjb3VudC4nXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGxvZ2dlci5lcnJvcignVXNlciBSZWdpc3RyYXRpb246IHNlcnZlciBlcnJvcjogJywgZXJyKTtcblx0XHRyZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnVXNlciByZWdpc3RyYXRpb246IHNlcnZlciBlcnJvcicgfSk7XG5cdH1cblxuXHRyZXR1cm47XG59KTtcblxuLy8gTG9naW5cbnJvdXRlci5wb3N0KCcvbG9naW4nLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG5cdGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcblxuXHQvLyBzYW5pdGl6ZSBpbnB1dHNcblx0Y29uc3Qgc2FuaXRpemVkRW1haWwgPSB4c3MoZW1haWwpO1xuXHRjb25zdCBzYW5pdGl6ZWRQYXNzd29yZCA9IHhzcyhwYXNzd29yZCk7XG5cblx0dHJ5IHtcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgVXNlci5maW5kT25lKHsgd2hlcmU6IHsgZW1haWw6IHNhbml0aXplZEVtYWlsIH0gfSk7XG5cdFx0aWYgKCF1c2VyKSB7XG5cdFx0XHRsb2dnZXIuaW5mbygnNDAwIC0gVXNlciBub3QgZm91bmQnKTtcblx0XHRcdHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVtYWlsOiAnVXNlciBub3QgZm91bmQnIH0pO1xuXHRcdH1cblx0XHRjb25zdCBpc01hdGNoID0gYXdhaXQgYXJnb24yLnZlcmlmeShcblx0XHRcdHVzZXIucGFzc3dvcmQsXG5cdFx0XHRzYW5pdGl6ZWRQYXNzd29yZCArIHNlY3JldHMuUEVQUEVSXG5cdFx0KTtcblx0XHRpZiAoaXNNYXRjaCkge1xuXHRcdFx0Y29uc3QgcGF5bG9hZCA9IHsgaWQ6IHVzZXIudXNlcmlkLCB1c2VybmFtZTogdXNlci51c2VybmFtZSB9O1xuXHRcdFx0Y29uc3QgdG9rZW4gPSBqd3Quc2lnbihwYXlsb2FkLCBzZWNyZXRzLkpXVF9TRUNSRVQsIHtcblx0XHRcdFx0ZXhwaXJlc0luOiAnMWgnXG5cdFx0XHR9KTtcblx0XHRcdHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdG9rZW46IGBCZWFyZXIgJHt0b2tlbn1gIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBwYXNzd29yZDogJ0luY29ycmVjdCBwYXNzd29yZCcgfSk7XG5cdFx0fVxuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0bG9nZ2VyLmVycm9yKCdMb2dpbiAtIHNlcnZlciBlcnJvcicpO1xuXHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdMb2dpbiAtIFNlcnZlciBlcnJvcicgfSk7XG5cdH1cblxuXHRyZXR1cm47XG59KTtcblxuLy8gUGFzc3dvcmQgUmVjb3ZlcnkgKHNpbXBsaWZpZWQpXG5yb3V0ZXIucG9zdCgnL3JlY292ZXItcGFzc3dvcmQnLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG5cdGNvbnN0IHsgZW1haWwgfSA9IHJlcS5ib2R5O1xuXG5cdC8vIHNhbml0aXplIGlucHV0c1xuXHRjb25zdCBzYW5pdGl6ZWRFbWFpbCA9IHhzcyhlbWFpbCk7XG5cblx0dHJ5IHtcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgVXNlci5maW5kT25lKHsgd2hlcmU6IHsgZW1haWw6IHNhbml0aXplZEVtYWlsIH0gfSk7XG5cdFx0aWYgKCF1c2VyKSB7XG5cdFx0XHRyZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlbWFpbDogJ1VzZXIgbm90IGZvdW5kJyB9KTtcblx0XHR9XG5cdFx0Ly8gR2VuZXJhdGUgYSB0b2tlbiAoY3VzdG9taXplIHRoaXMgbGF0ZXIpXG5cdFx0Y29uc3QgdG9rZW4gPSBhd2FpdCBiY3J5cHQuZ2VuU2FsdCgyNSk7XG5cdFx0Ly8gbGV0IHBhc3N3b3JkUmVzZXRVcmwgPSBgaHR0cHM6Ly9sb2NhbGhvc3Q6JHtwcm9jZXNzLmVudi5TRVJWRVJfUE9SVH0vcGFzc3dvcmQtcmVzZXQke3Rva2VufWA7XG5cblx0XHQvLyBTdG9yZSB0aGUgdG9rZW4gaW4gdGhlIGRhdGFiYXNlIChzaW1wbGlmaWVkIGZvciBub3cpXG5cdFx0dXNlci5yZXNldFBhc3N3b3JkVG9rZW4gPSB0b2tlbjtcblx0XHR1c2VyLnJlc2V0UGFzc3dvcmRFeHBpcmVzID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIDE4MDAwMDApOyAvLyAzMCBtaW5cblx0XHRhd2FpdCB1c2VyLnNhdmUoKTtcblxuXHRcdC8vIFNlbmQgcGFzc3dvcmQgcmVzZXQgZW1haWxcblx0XHRsb2dnZXIuaW5mbygnUGFzc3dvcmQgcmVzZXQgbGluayBzZW50IHRvIHVzZXIgJywgdXNlci5lbWFpbCk7XG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBgUGFzc3dvcmQgcmVzZXQgbGluayBzZW50IHRvICR7dXNlci5lbWFpbH1gIH0pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRsb2dnZXIuZXJyb3IoJ1Bhc3N3b3JkIFJlY292ZXJ5IC0gU2VydmVyIGVycm9yOiAnLCBlcnIpO1xuXHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdQYXNzd29yZCBSZWNvdmVyeSAtIFNlcnZlciBlcnJvcicgfSk7XG5cdH1cblxuXHRyZXR1cm47XG59KTtcblxuLy8gUm91dGUgZm9yIFRPVFAgc2VjcmV0IGdlbmVyYXRpb25cbnJvdXRlci5wb3N0KCcvZ2VuZXJhdGUtdG90cCcsIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcblx0Ly8gbGV0IHsgdXNlcm5hbWUgfSA9IHJlcS5ib2R5OyAvLyAqREVWLU5PVEUqIGRvZXMgdGhpcyBldmVuIG5lZWQgdG8gYmUgaGVyZT9cblxuXHQvLyBzYW5pdGl6ZSB1c2VybmFtZSBpbnB1dFxuXHQvLyBsZXQgc2FuaXRpemVkVXNlcm5hbWUgPSB4c3ModXNlcm5hbWUpOyAvLyAqREVWLU5PVEUqIG9yIHRoaXM/XG5cblx0Ly8gKkRFVi1OT1RFKiBoZXJlLCB3ZSBjb3VsZCBzdG9yZSB0aGUgc2VjcmV0IGluIHRoZSBzZXNzaW9uIG9yIHNlbmQgaXQgdG8gdGhlIGNsaWVudFxuXHQvLyBkZXBlbmRpbmcgb24gdGhlIHVzZSBjYXNlOyBmb29kIGZvciB0aG91Z2h0XG5cblx0dHJ5IHtcblx0XHRjb25zdCB7IGJhc2UzMiwgb3RwYXV0aF91cmwgfSA9IGdlbmVyYXRlVE9UUFNlY3JldCgpO1xuXHRcdGNvbnN0IHFyQ29kZVVybCA9IGF3YWl0IGdlbmVyYXRlUVJDb2RlKG90cGF1dGhfdXJsKTtcblx0XHRyZXMuanNvbih7IHNlY3JldDogYmFzZTMyLCBxckNvZGVVcmwgfSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGxvZ2dlci5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBUT1RQIHNlY3JldDogJywgZXJyKTtcblx0XHRyZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcblx0fVxufSk7XG5cbi8vIFJvdXRlIHRvIHZlcmlmeSBUT1RQIHRva2Vuc1xucm91dGVyLnBvc3QoJy92ZXJpZnktdG90cCcsIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcblx0Y29uc3QgeyB0b2tlbiwgc2VjcmV0IH0gPSByZXEuYm9keTtcblxuXHR0cnkge1xuXHRcdC8vIHZlcmlmeSBUT1RQIHRva2VuIHVzaW5nIHRoZSBzZWNyZXRcblx0XHRjb25zdCBpc1RPVFBUb2tlblZhbGlkID0gdmVyaWZ5VE9UUFRva2VuKHNlY3JldCwgdG9rZW4pO1xuXHRcdHJlcy5qc29uKHsgaXNUT1RQVG9rZW5WYWxpZCB9KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0bG9nZ2VyLmVycm9yKCdFcnJvciB2ZXJpZnlpbmcgVE9UUCB0b2tlbjogJywgZXJyKTtcblx0XHRyZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9KTtcblx0fVxuXG5cdHJldHVybjtcbn0pO1xuXG4vLyBSb3V0ZSB0byBnZW5lcmF0ZSBhbmQgc2VuZCAyRkEgY29kZXMgYnkgZW1haWxcbnJvdXRlci5wb3N0KCcvZ2VuZXJhdGUtMmZhJywgYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuXHRjb25zdCB7IGVtYWlsIH0gPSByZXEuYm9keTtcblxuXHQvLyBzYW5pdGl6ZSBlbWFpbCBpbnB1dFxuXHRjb25zdCBzYW5pdGl6ZWRFbWFpbCA9IHhzcyhlbWFpbCk7XG5cblx0dHJ5IHtcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgVXNlci5maW5kT25lKHsgd2hlcmU6IHsgZW1haWw6IHNhbml0aXplZEVtYWlsIH0gfSk7XG5cblx0XHRpZiAoIXVzZXIpIHtcblx0XHRcdHJldHVybiByZXNcblx0XHRcdFx0LnN0YXR1cyg0MDQpXG5cdFx0XHRcdC5qc29uKHsgZXJyb3I6ICdHZW5lcmF0ZSAyRkE6IHVzZXIgbm90IGZvdW5kJyB9KTtcblx0XHR9XG5cblx0XHRjb25zdCB7IGVtYWlsMkZBVG9rZW4gfSA9IGF3YWl0IGdlbmVyYXRlRW1haWwyRkFDb2RlKCk7XG5cblx0XHQvLyBzYXZlIDJGQSB0b2tlbiBhbmQgZXhwaXJhdGlvbiBpbiB1c2VyJ3MgcmVjb3JkXG5cdFx0dXNlci5yZXNldFBhc3N3b3JkVG9rZW4gPSBlbWFpbDJGQVRva2VuO1xuXHRcdHVzZXIucmVzZXRQYXNzd29yZEV4cGlyZXMgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgMzAgKiA2MDAwMCk7IC8vIDMwIG1pblxuXHRcdGF3YWl0IHVzZXIuc2F2ZSgpOyAvLyBzYXZlIHVzZXIgZGF0YSB3aXRoIHRoZSBuZXcgMkZBIHRva2VuIGFuZCBleHBpcmF0aW9uXG5cblx0XHQvLyBzZW5kIHRoZSAyRkEgY29kZSB0byB1c2VyJ3MgZW1haWxcblx0XHRhd2FpdCAoXG5cdFx0XHRhd2FpdCBnZXRUcmFuc3BvcnRlcigpXG5cdFx0KS5zZW5kTWFpbCh7XG5cdFx0XHR0bzogc2FuaXRpemVkRW1haWwsXG5cdFx0XHRzdWJqZWN0OiAnR3Vlc3Rib29rIC0gWW91ciBMb2dpbiBDb2RlJyxcblx0XHRcdHRleHQ6IGBZb3VyIDJGQSBjb2RlIGlzICR7ZW1haWwyRkFUb2tlbn1gXG5cdFx0fSk7XG5cblx0XHRyZXMuanNvbih7IG1lc3NhZ2U6ICcyRkEgY29kZSBzZW50IHRvIGVtYWlsJyB9KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0bG9nZ2VyLmVycm9yKCdFcnJvciBnZW5lcmF0aW5nIDJGQSBjb2RlOiAnLCBlcnIpO1xuXHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdHZW5lcmF0ZSAyRkE6IGludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XG5cdH1cblxuXHRyZXR1cm47XG59KTtcblxuLy8gUm91dGUgdG8gdmVyaWZ5IGVtYWlsIDJGQSBjb2RlXG5yb3V0ZXIucG9zdCgnL3ZlcmlmeS0yZmEnLCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG5cdGNvbnN0IHsgZW1haWwsIGVtYWlsMkZBQ29kZSB9ID0gcmVxLmJvZHk7XG5cblx0Ly8gc2FuaXRpemUgaW5wdXRzXG5cdGNvbnN0IHNhbml0aXplZEVtYWlsID0geHNzKGVtYWlsKTtcblxuXHR0cnkge1xuXHRcdGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyB3aGVyZTogeyBlbWFpbDogc2FuaXRpemVkRW1haWwgfSB9KTtcblx0XHRpZiAoIXVzZXIpIHtcblx0XHRcdGxvZ2dlci5lcnJvcignVmVyaWZ5IDJGQTogdXNlciBub3QgZm91bmQnKTtcblx0XHRcdHJldHVybiByZXNcblx0XHRcdFx0LnN0YXR1cyg0MDQpXG5cdFx0XHRcdC5qc29uKHsgZXJyb3I6ICdWZXJpZnkgMkZBOiBVc2VyIG5vdCBmb3VuZCcgfSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzZXRQYXNzd29yZFRva2VuID0gdXNlci5yZXNldFBhc3N3b3JkVG9rZW4gfHwgJyc7XG5cblx0XHRjb25zdCBpc0VtYWlsMkZBQ29kZVZhbGlkID0gdmVyaWZ5RW1haWwyRkFDb2RlKFxuXHRcdFx0cmVzZXRQYXNzd29yZFRva2VuLFxuXHRcdFx0ZW1haWwyRkFDb2RlXG5cdFx0KTtcblx0XHRpZiAoIWlzRW1haWwyRkFDb2RlVmFsaWQpIHtcblx0XHRcdGxvZ2dlci5lcnJvcignSW52YWxpZCBvciBleHBpcmVkIDJGQSBjb2RlJyk7XG5cdFx0XHRyZXR1cm4gcmVzXG5cdFx0XHRcdC5zdGF0dXMoNDAwKVxuXHRcdFx0XHQuanNvbih7IGVycm9yOiAnSW52YWxpZCBvciBleHBpcmVkIDJGQSBjb2RlJyB9KTtcblx0XHR9XG5cblx0XHRyZXMuanNvbih7IG1lc3NhZ2U6ICcyRkEgY29kZSB2ZXJpZmllZCBzdWNjZXNzZnVsbHknIH0pO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRsb2dnZXIuZXJyb3IoJ0Vycm9yIHZlcmlmeWluZyAyRkEgY29kZTonLCBlcnIpO1xuXHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xuXHR9XG5cblx0cmV0dXJuO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcbiJdfQ==
