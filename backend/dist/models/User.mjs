import { execSync } from 'child_process';
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../config/hashConfig.mjs';
import { PasswordValidationError } from '../config/errorClasses.mjs';
import { initializeRateLimitMiddleware } from '../middleware/rateLimit.mjs';
import sops from '../utils/sops.mjs';
import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
class User extends Model {
	id;
	userId;
	username;
	password;
	email;
	isAccountVerified;
	resetPasswordToken;
	resetPasswordExpires;
	isMfaEnabled;
	creationDate;
	async comparePassword(password, argon2, secrets, logger) {
		try {
			validateDependencies(
				[
					{ name: 'password', instance: password },
					{ name: 'argon2', instance: argon2 },
					{ name: 'secrets', instance: secrets },
					{ name: 'logger', instance: logger }
				],
				logger
			);
			return await argon2.verify(
				this.password,
				password + secrets.PEPPER
			);
		} catch (error) {
			processError(error, logger);
			throw new PasswordValidationError('Passwords do not match');
		}
	}
	static validatePassword(password, logger) {
		try {
			validateDependencies(
				[
					{ name: 'password', instance: password },
					{ name: 'logger', instance: logger }
				],
				logger
			);
			const isValidLength =
				password.length >= 8 && password.length <= 128;
			const hasUpperCase = /[A-Z]/.test(password);
			const hasLowerCase = /[a-z]/.test(password);
			const hasNumber = /\d/.test(password);
			const hasSpecial = /[^\dA-Za-z]/.test(password);
			return (
				isValidLength &&
				hasUpperCase &&
				hasLowerCase &&
				hasNumber &&
				hasSpecial
			);
		} catch (error) {
			processError(error, logger);
			return false;
		}
	}
	static async createUser(
		{ uuidv4, getSecrets },
		userId,
		username,
		password,
		email,
		rateLimitDependencies,
		logger
	) {
		try {
			validateDependencies(
				[
					{ name: 'uuidv4', instance: uuidv4 },
					{ name: 'getSecrets', instance: getSecrets },
					{
						name: 'rateLimitDependencies',
						instance: rateLimitDependencies
					},
					{ name: 'logger', instance: logger }
				],
				logger
			);
			const rateLimiter = initializeRateLimitMiddleware(
				rateLimitDependencies
			);
			const req = { ip: email };
			const res = {};
			await new Promise((resolve, reject) => {
				rateLimiter(req, res, err => (err ? reject(err) : resolve()));
			});
			const isValidPassword = User.validatePassword(password, logger);
			if (!isValidPassword) {
				logger.warn(
					'Password does not meet the security requirements.'
				);
				throw new PasswordValidationError(
					'Password does not meet security requirements. Please make sure your password is between 8 and 128 characters long, contains at least one uppercase letter, one lowercase letter, one number, and one special character.'
				);
			}
			const secrets = await getSecrets();
			const hashedPassword = await hashPassword({
				password,
				secrets,
				logger
			});
			const newUser = await User.create({
				id: uuidv4(),
				userId,
				username,
				password: hashedPassword,
				email,
				isAccountVerified: false,
				resetPasswordToken: null,
				resetPasswordExpires: null,
				isMfaEnabled: false,
				creationDate: new Date()
			});
			return newUser;
		} catch (error) {
			processError(error, logger);
			if (error instanceof PasswordValidationError) {
				throw error;
			}
			throw new PasswordValidationError(
				'There was an error creating your account. Please try again. If the issue persists, please contact support.'
			);
		}
	}
	static async comparePasswords(
		hashedPassword,
		password,
		argon2,
		secrets,
		logger
	) {
		try {
			validateDependencies(
				[
					{ name: 'argon2', instance: argon2 },
					{ name: 'secrets', instance: secrets },
					{ name: 'logger', instance: logger }
				],
				logger
			);
			const isValid = await argon2.verify(
				hashedPassword,
				password + secrets.PEPPER
			);
			logger.debug('Password verified successfully');
			return isValid;
		} catch (error) {
			processError(error, logger);
			throw new PasswordValidationError('Error verifying password');
		}
	}
}
export default function createUserModel(sequelize, logger) {
	try {
		validateDependencies(
			[
				{ name: 'sequelize', instance: sequelize },
				{ name: 'logger', instance: logger }
			],
			logger
		);
		User.init(
			{
				id: {
					type: DataTypes.STRING,
					defaultValue: () => uuidv4(),
					allowNull: false,
					primaryKey: true,
					unique: true
				},
				userId: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					allowNull: false,
					unique: true
				},
				username: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true
				},
				password: {
					type: DataTypes.STRING,
					allowNull: false
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true
				},
				isAccountVerified: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false
				},
				resetPasswordToken: {
					type: DataTypes.STRING,
					allowNull: true
				},
				resetPasswordExpires: {
					type: DataTypes.DATE,
					allowNull: true
				},
				isMfaEnabled: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false
				},
				creationDate: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW
				}
			},
			{
				sequelize,
				tableName: 'Users',
				timestamps: true
			}
		);
		User.addHook('beforeCreate', async user => {
			try {
				const secrets = await sops.getSecrets({
					logger,
					execSync,
					getDirectoryPath: () => process.cwd()
				});
				user.password = await hashPassword({
					password: user.password,
					secrets,
					logger
				});
			} catch (error) {
				processError(error, logger);
				throw new PasswordValidationError('Error hashing password.');
			}
		});
		User.addHook('afterUpdate', async user => {
			try {
				if (user.changed('isMfaEnabled')) {
					const UserMfa = await (
						await import('./UserMfa')
					).default(sequelize, logger);
					await UserMfa.update(
						{ isMfaEnabled: user.isMfaEnabled },
						{ where: { id: user.id } }
					);
					logger.debug('MFA status updated successfully');
				}
			} catch (error) {
				processError(error, logger);
				throw new PasswordValidationError(
					'Error updating multi-factor authentication status.'
				);
			}
		});
		return User;
	} catch (error) {
		processError(error, logger);
		throw error;
	}
}
export { User };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFFTixTQUFTLEVBR1QsS0FBSyxFQUVMLE1BQU0sV0FBVyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxFQUFFLElBQUksTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVwRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRSxPQUFPLEVBQ04sNkJBQTZCLEVBRTdCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxJQUFvQixNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUF1QnJELE1BQU0sSUFDTCxTQUFRLEtBQTJEO0lBRzVELEVBQUUsQ0FBVTtJQUNaLE1BQU0sQ0FBVTtJQUNoQixRQUFRLENBQVU7SUFDbEIsUUFBUSxDQUFVO0lBQ2xCLEtBQUssQ0FBVTtJQUNmLGlCQUFpQixDQUFXO0lBQzVCLGtCQUFrQixDQUFpQjtJQUNuQyxvQkFBb0IsQ0FBZTtJQUNuQyxZQUFZLENBQVc7SUFDdkIsWUFBWSxDQUEwQjtJQUU3QyxLQUFLLENBQUMsZUFBZSxDQUNwQixRQUFnQixFQUNoQixNQUErQixFQUMvQixPQUFvQixFQUNwQixNQUFjO1FBRWQsSUFBSSxDQUFDO1lBQ0osb0JBQW9CLENBQ25CO2dCQUNDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO2dCQUN4QyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFB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QUFFLEVBQUUsQ0FDMUIsQ0FBQztvQkFFRixNQUFNLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7WUFDRixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLHVCQUF1QixDQUNoQyxvREFBb0QsQ0FDcEQsQ0FBQztZQUNILENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QixNQUFNLEtBQUssQ0FBQztJQUNiLENBQUM7QUFDRixDQUFDO0FBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQge1xuXHRDcmVhdGlvbk9wdGlvbmFsLFxuXHREYXRhVHlwZXMsXG5cdEluZmVyQXR0cmlidXRlcyxcblx0SW5mZXJDcmVhdGlvbkF0dHJpYnV0ZXMsXG5cdE1vZGVsLFxuXHRTZXF1ZWxpemVcbn0gZnJvbSAnc2VxdWVsaXplJztcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgaGFzaFBhc3N3b3JkIH0gZnJvbSAnLi4vY29uZmlnL2hhc2hDb25maWcnO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5pbXBvcnQgeyBQYXNzd29yZFZhbGlkYXRpb25FcnJvciB9IGZyb20gJy4uL2NvbmZpZy9lcnJvckNsYXNzZXMnO1xuaW1wb3J0IHtcblx0aW5pdGlhbGl6ZVJhdGVMaW1pdE1pZGRsZXdhcmUsXG5cdFJhdGVMaW1pdE1pZGRsZXdhcmVEZXBlbmRlbmNpZXNcbn0gZnJvbSAnLi4vbWlkZGxld2FyZS9yYXRlTGltaXQnO1xuaW1wb3J0IHNvcHMsIHsgU2VjcmV0c01hcCB9IGZyb20gJy4uL3V0aWxzL3NvcHMnO1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZURlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBwcm9jZXNzRXJyb3IgfSBmcm9tICcuLi91dGlscy9wcm9jZXNzRXJyb3InO1xuXG5pbnRlcmZhY2UgVXNlckF0dHJpYnV0ZXMge1xuXHRpZDogc3RyaW5nO1xuXHR1c2VySWQ6IG51bWJlcjtcblx0dXNlcm5hbWU6IHN0cmluZztcblx0cGFzc3dvcmQ6IHN0cmluZztcblx0ZW1haWw6IHN0cmluZztcblx0aXNBY2NvdW50VmVyaWZpZWQ6IGJvb2xlYW47XG5cdHJlc2V0UGFzc3dvcmRUb2tlbj86IHN0cmluZyB8IG51bGw7XG5cdHJlc2V0UGFzc3dvcmRFeHBpcmVzPzogRGF0ZSB8IG51bGw7XG5cdGlzTWZhRW5hYmxlZDogYm9vbGVhbjtcblx0Y3JlYXRpb25EYXRlOiBEYXRlO1xufVxuXG50eXBlIFVzZXJTZWNyZXRzID0gUGljazxTZWNyZXRzTWFwLCAnUEVQUEVSJz47XG5cbmludGVyZmFjZSBVc2VyTW9kZWxEZXBlbmRlbmNpZXMge1xuXHRhcmdvbjI6IHR5cGVvZiBpbXBvcnQoJ2FyZ29uMicpO1xuXHR1dWlkdjQ6IHR5cGVvZiB1dWlkdjQ7XG5cdGdldFNlY3JldHM6ICgpID0+IFByb21pc2U8VXNlclNlY3JldHM+O1xufVxuXG5jbGFzcyBVc2VyXG5cdGV4dGVuZHMgTW9kZWw8SW5mZXJBdHRyaWJ1dGVzPFVzZXI+LCBJbmZlckNyZWF0aW9uQXR0cmlidXRlczxVc2VyPj5cblx0aW1wbGVtZW50cyBVc2VyQXR0cmlidXRlc1xue1xuXHRwdWJsaWMgaWQhOiBzdHJpbmc7XG5cdHB1YmxpYyB1c2VySWQhOiBudW1iZXI7XG5cdHB1YmxpYyB1c2VybmFtZSE6IHN0cmluZztcblx0cHVibGljIHBhc3N3b3JkITogc3RyaW5nO1xuXHRwdWJsaWMgZW1haWwhOiBzdHJpbmc7XG5cdHB1YmxpYyBpc0FjY291bnRWZXJpZmllZCE6IGJvb2xlYW47XG5cdHB1YmxpYyByZXNldFBhc3N3b3JkVG9rZW4hOiBzdHJpbmcgfCBudWxsO1xuXHRwdWJsaWMgcmVzZXRQYXNzd29yZEV4cGlyZXMhOiBEYXRlIHwgbnVsbDtcblx0cHVibGljIGlzTWZhRW5hYmxlZCE6IGJvb2xlYW47XG5cdHB1YmxpYyBjcmVhdGlvbkRhdGUhOiBDcmVhdGlvbk9wdGlvbmFsPERhdGU+O1xuXG5cdGFzeW5jIGNvbXBhcmVQYXNzd29yZChcblx0XHRwYXNzd29yZDogc3RyaW5nLFxuXHRcdGFyZ29uMjogdHlwZW9mIGltcG9ydCgnYXJnb24yJyksXG5cdFx0c2VjcmV0czogVXNlclNlY3JldHMsXG5cdFx0bG9nZ2VyOiBMb2dnZXJcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAncGFzc3dvcmQnLCBpbnN0YW5jZTogcGFzc3dvcmQgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdhcmdvbjInLCBpbnN0YW5jZTogYXJnb24yIH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAnc2VjcmV0cycsIGluc3RhbmNlOiBzZWNyZXRzIH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAnbG9nZ2VyJywgaW5zdGFuY2U6IGxvZ2dlciB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdGxvZ2dlclxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIGF3YWl0IGFyZ29uMi52ZXJpZnkoXG5cdFx0XHRcdHRoaXMucGFzc3dvcmQsXG5cdFx0XHRcdHBhc3N3b3JkICsgc2VjcmV0cy5QRVBQRVJcblx0XHRcdCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHByb2Nlc3NFcnJvcihlcnJvciwgbG9nZ2VyKTtcblx0XHRcdHRocm93IG5ldyBQYXNzd29yZFZhbGlkYXRpb25FcnJvcignUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyB2YWxpZGF0ZVBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcsIGxvZ2dlcjogTG9nZ2VyKTogYm9vbGVhbiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAncGFzc3dvcmQnLCBpbnN0YW5jZTogcGFzc3dvcmQgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH1cblx0XHRcdFx0XSxcblx0XHRcdFx0bG9nZ2VyXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBpc1ZhbGlkTGVuZ3RoID1cblx0XHRcdFx0cGFzc3dvcmQubGVuZ3RoID49IDggJiYgcGFzc3dvcmQubGVuZ3RoIDw9IDEyODtcblx0XHRcdGNvbnN0IGhhc1VwcGVyQ2FzZSA9IC9bQS1aXS8udGVzdChwYXNzd29yZCk7XG5cdFx0XHRjb25zdCBoYXNMb3dlckNhc2UgPSAvW2Etel0vLnRlc3QocGFzc3dvcmQpO1xuXHRcdFx0Y29uc3QgaGFzTnVtYmVyID0gL1xcZC8udGVzdChwYXNzd29yZCk7XG5cdFx0XHRjb25zdCBoYXNTcGVjaWFsID0gL1teXFxkQS1aYS16XS8udGVzdChwYXNzd29yZCk7XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGlzVmFsaWRMZW5ndGggJiZcblx0XHRcdFx0aGFzVXBwZXJDYXNlICYmXG5cdFx0XHRcdGhhc0xvd2VyQ2FzZSAmJlxuXHRcdFx0XHRoYXNOdW1iZXIgJiZcblx0XHRcdFx0aGFzU3BlY2lhbFxuXHRcdFx0KTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBhc3luYyBjcmVhdGVVc2VyKFxuXHRcdHsgdXVpZHY0LCBnZXRTZWNyZXRzIH06IFVzZXJNb2RlbERlcGVuZGVuY2llcyxcblx0XHR1c2VySWQ6IG51bWJlcixcblx0XHR1c2VybmFtZTogc3RyaW5nLFxuXHRcdHBhc3N3b3JkOiBzdHJpbmcsXG5cdFx0ZW1haWw6IHN0cmluZyxcblx0XHRyYXRlTGltaXREZXBlbmRlbmNpZXM6IFJhdGVMaW1pdE1pZGRsZXdhcmVEZXBlbmRlbmNpZXMsXG5cdFx0bG9nZ2VyOiBMb2dnZXJcblx0KTogUHJvbWlzZTxVc2VyPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAndXVpZHY0JywgaW5zdGFuY2U6IHV1aWR2NCB9LFxuXHRcdFx0XHRcdHsgbmFtZTogJ2dldFNlY3JldHMnLCBpbnN0YW5jZTogZ2V0U2VjcmV0cyB9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5hbWU6ICdyYXRlTGltaXREZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHRcdFx0aW5zdGFuY2U6IHJhdGVMaW1pdERlcGVuZGVuY2llc1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAnbG9nZ2VyJywgaW5zdGFuY2U6IGxvZ2dlciB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdGxvZ2dlclxuXHRcdFx0KTtcblxuXHRcdFx0Y29uc3QgcmF0ZUxpbWl0ZXIgPSBpbml0aWFsaXplUmF0ZUxpbWl0TWlkZGxld2FyZShcblx0XHRcdFx0cmF0ZUxpbWl0RGVwZW5kZW5jaWVzXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgcmVxID0geyBpcDogZW1haWwgfSBhcyB1bmtub3duIGFzIFJlcXVlc3Q7XG5cdFx0XHRjb25zdCByZXMgPSB7fSBhcyB1bmtub3duIGFzIFJlc3BvbnNlO1xuXG5cdFx0XHRhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdHJhdGVMaW1pdGVyKHJlcSwgcmVzLCBlcnIgPT4gKGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSgpKSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc3QgaXNWYWxpZFBhc3N3b3JkID0gVXNlci52YWxpZGF0ZVBhc3N3b3JkKHBhc3N3b3JkLCBsb2dnZXIpO1xuXHRcdFx0aWYgKCFpc1ZhbGlkUGFzc3dvcmQpIHtcblx0XHRcdFx0bG9nZ2VyLndhcm4oXG5cdFx0XHRcdFx0J1Bhc3N3b3JkIGRvZXMgbm90IG1lZXQgdGhlIHNlY3VyaXR5IHJlcXVpcmVtZW50cy4nXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRocm93IG5ldyBQYXNzd29yZFZhbGlkYXRpb25FcnJvcihcblx0XHRcdFx0XHQnUGFzc3dvcmQgZG9lcyBub3QgbWVldCBzZWN1cml0eSByZXF1aXJlbWVudHMuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBwYXNzd29yZCBpcyBiZXR3ZWVuIDggYW5kIDEyOCBjaGFyYWN0ZXJzIGxvbmcsIGNvbnRhaW5zIGF0IGxlYXN0IG9uZSB1cHBlcmNhc2UgbGV0dGVyLCBvbmUgbG93ZXJjYXNlIGxldHRlciwgb25lIG51bWJlciwgYW5kIG9uZSBzcGVjaWFsIGNoYXJhY3Rlci4nXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHNlY3JldHMgPSBhd2FpdCBnZXRTZWNyZXRzKCk7XG5cdFx0XHRjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGhhc2hQYXNzd29yZCh7XG5cdFx0XHRcdHBhc3N3b3JkLFxuXHRcdFx0XHRzZWNyZXRzLFxuXHRcdFx0XHRsb2dnZXJcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zdCBuZXdVc2VyID0gYXdhaXQgVXNlci5jcmVhdGUoe1xuXHRcdFx0XHRpZDogdXVpZHY0KCksXG5cdFx0XHRcdHVzZXJJZCxcblx0XHRcdFx0dXNlcm5hbWUsXG5cdFx0XHRcdHBhc3N3b3JkOiBoYXNoZWRQYXNzd29yZCxcblx0XHRcdFx0ZW1haWwsXG5cdFx0XHRcdGlzQWNjb3VudFZlcmlmaWVkOiBmYWxzZSxcblx0XHRcdFx0cmVzZXRQYXNzd29yZFRva2VuOiBudWxsLFxuXHRcdFx0XHRyZXNldFBhc3N3b3JkRXhwaXJlczogbnVsbCxcblx0XHRcdFx0aXNNZmFFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0Y3JlYXRpb25EYXRlOiBuZXcgRGF0ZSgpXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIG5ld1VzZXI7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHByb2Nlc3NFcnJvcihlcnJvciwgbG9nZ2VyKTtcblxuXHRcdFx0aWYgKGVycm9yIGluc3RhbmNlb2YgUGFzc3dvcmRWYWxpZGF0aW9uRXJyb3IpIHtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cblx0XHRcdHRocm93IG5ldyBQYXNzd29yZFZhbGlkYXRpb25FcnJvcihcblx0XHRcdFx0J1RoZXJlIHdhcyBhbiBlcnJvciBjcmVhdGluZyB5b3VyIGFjY291bnQuIFBsZWFzZSB0cnkgYWdhaW4uIElmIHRoZSBpc3N1ZSBwZXJzaXN0cywgcGxlYXNlIGNvbnRhY3Qgc3VwcG9ydC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBhc3luYyBjb21wYXJlUGFzc3dvcmRzKFxuXHRcdGhhc2hlZFBhc3N3b3JkOiBzdHJpbmcsXG5cdFx0cGFzc3dvcmQ6IHN0cmluZyxcblx0XHRhcmdvbjI6IHR5cGVvZiBpbXBvcnQoJ2FyZ29uMicpLFxuXHRcdHNlY3JldHM6IFVzZXJTZWNyZXRzLFxuXHRcdGxvZ2dlcjogTG9nZ2VyXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHRyeSB7XG5cdFx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHsgbmFtZTogJ2FyZ29uMicsIGluc3RhbmNlOiBhcmdvbjIgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdzZWNyZXRzJywgaW5zdGFuY2U6IHNlY3JldHMgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH1cblx0XHRcdFx0XSxcblx0XHRcdFx0bG9nZ2VyXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBpc1ZhbGlkID0gYXdhaXQgYXJnb24yLnZlcmlmeShcblx0XHRcdFx0aGFzaGVkUGFzc3dvcmQsXG5cdFx0XHRcdHBhc3N3b3JkICsgc2VjcmV0cy5QRVBQRVJcblx0XHRcdCk7XG5cblx0XHRcdGxvZ2dlci5kZWJ1ZygnUGFzc3dvcmQgdmVyaWZpZWQgc3VjY2Vzc2Z1bGx5Jyk7XG5cdFx0XHRyZXR1cm4gaXNWYWxpZDtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIpO1xuXHRcdFx0dGhyb3cgbmV3IFBhc3N3b3JkVmFsaWRhdGlvbkVycm9yKCdFcnJvciB2ZXJpZnlpbmcgcGFzc3dvcmQnKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVXNlck1vZGVsKFxuXHRzZXF1ZWxpemU6IFNlcXVlbGl6ZSxcblx0bG9nZ2VyOiBMb2dnZXJcbik6IHR5cGVvZiBVc2VyIHtcblx0dHJ5IHtcblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFtcblx0XHRcdFx0eyBuYW1lOiAnc2VxdWVsaXplJywgaW5zdGFuY2U6IHNlcXVlbGl6ZSB9LFxuXHRcdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH1cblx0XHRcdF0sXG5cdFx0XHRsb2dnZXJcblx0XHQpO1xuXG5cdFx0VXNlci5pbml0KFxuXHRcdFx0e1xuXHRcdFx0XHRpZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5TVFJJTkcsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiAoKSA9PiB1dWlkdjQoKSxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHByaW1hcnlLZXk6IHRydWUsXG5cdFx0XHRcdFx0dW5pcXVlOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHVzZXJJZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5JTlRFR0VSLFxuXHRcdFx0XHRcdGF1dG9JbmNyZW1lbnQ6IHRydWUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZSxcblx0XHRcdFx0XHR1bmlxdWU6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0dXNlcm5hbWU6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdFx0dW5pcXVlOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhc3N3b3JkOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLlNUUklORyxcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdHVuaXF1ZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc0FjY291bnRWZXJpZmllZDoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5CT09MRUFOLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogZmFsc2UsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZXNldFBhc3N3b3JkVG9rZW46IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuU1RSSU5HLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZXNldFBhc3N3b3JkRXhwaXJlczoge1xuXHRcdFx0XHRcdHR5cGU6IERhdGFUeXBlcy5EQVRFLFxuXHRcdFx0XHRcdGFsbG93TnVsbDogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc01mYUVuYWJsZWQ6IHtcblx0XHRcdFx0XHR0eXBlOiBEYXRhVHlwZXMuQk9PTEVBTixcblx0XHRcdFx0XHRhbGxvd051bGw6IGZhbHNlLFxuXHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0Y3JlYXRpb25EYXRlOiB7XG5cdFx0XHRcdFx0dHlwZTogRGF0YVR5cGVzLkRBVEUsXG5cdFx0XHRcdFx0YWxsb3dOdWxsOiBmYWxzZSxcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IERhdGFUeXBlcy5OT1dcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2VxdWVsaXplLFxuXHRcdFx0XHR0YWJsZU5hbWU6ICdVc2VycycsXG5cdFx0XHRcdHRpbWVzdGFtcHM6IHRydWVcblx0XHRcdH1cblx0XHQpO1xuXG5cdFx0VXNlci5hZGRIb29rKCdiZWZvcmVDcmVhdGUnLCBhc3luYyAodXNlcjogVXNlcikgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgc2VjcmV0cyA9IGF3YWl0IHNvcHMuZ2V0U2VjcmV0cyh7XG5cdFx0XHRcdFx0bG9nZ2VyLFxuXHRcdFx0XHRcdGV4ZWNTeW5jLFxuXHRcdFx0XHRcdGdldERpcmVjdG9yeVBhdGg6ICgpID0+IHByb2Nlc3MuY3dkKClcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHVzZXIucGFzc3dvcmQgPSBhd2FpdCBoYXNoUGFzc3dvcmQoe1xuXHRcdFx0XHRcdHBhc3N3b3JkOiB1c2VyLnBhc3N3b3JkLFxuXHRcdFx0XHRcdHNlY3JldHMsXG5cdFx0XHRcdFx0bG9nZ2VyXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIpO1xuXHRcdFx0XHR0aHJvdyBuZXcgUGFzc3dvcmRWYWxpZGF0aW9uRXJyb3IoJ0Vycm9yIGhhc2hpbmcgcGFzc3dvcmQuJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRVc2VyLmFkZEhvb2soJ2FmdGVyVXBkYXRlJywgYXN5bmMgKHVzZXI6IFVzZXIpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmICh1c2VyLmNoYW5nZWQoJ2lzTWZhRW5hYmxlZCcpKSB7XG5cdFx0XHRcdFx0Y29uc3QgVXNlck1mYSA9IGF3YWl0IChcblx0XHRcdFx0XHRcdGF3YWl0IGltcG9ydCgnLi9Vc2VyTWZhJylcblx0XHRcdFx0XHQpLmRlZmF1bHQoc2VxdWVsaXplLCBsb2dnZXIpO1xuXG5cdFx0XHRcdFx0YXdhaXQgVXNlck1mYS51cGRhdGUoXG5cdFx0XHRcdFx0XHR7IGlzTWZhRW5hYmxlZDogdXNlci5pc01mYUVuYWJsZWQgfSxcblx0XHRcdFx0XHRcdHsgd2hlcmU6IHsgaWQ6IHVzZXIuaWQgfSB9XG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZygnTUZBIHN0YXR1cyB1cGRhdGVkIHN1Y2Nlc3NmdWxseScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlcik7XG5cdFx0XHRcdHRocm93IG5ldyBQYXNzd29yZFZhbGlkYXRpb25FcnJvcihcblx0XHRcdFx0XHQnRXJyb3IgdXBkYXRpbmcgbXVsdGktZmFjdG9yIGF1dGhlbnRpY2F0aW9uIHN0YXR1cy4nXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gVXNlcjtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRwcm9jZXNzRXJyb3IoZXJyb3IsIGxvZ2dlcik7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cbn1cblxuZXhwb3J0IHsgVXNlciB9O1xuIl19
