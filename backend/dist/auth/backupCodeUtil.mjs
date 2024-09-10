import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
export default function createBackupCodeService({
	logger,
	UserMfa,
	bcrypt,
	crypto
}) {
	validateDependencies(
		[
			{ name: 'logger', instance: logger },
			{ name: 'UserMfa', instance: UserMfa },
			{ name: 'bcrypt', instance: bcrypt },
			{ name: 'crypto', instance: crypto }
		],
		logger
	);
	// generate backup codes for a given user ID
	async function generateBackupCodes(id) {
		try {
			validateDependencies([{ name: 'id', instance: id }], logger);
			const backupCodes = [];
			for (let i = 0; i < 16; i++) {
				const code = crypto.randomBytes(4).toString('hex'); // Generate 8-character hex code
				const hashedCode = await bcrypt.hash(code, 10); // Hashing the backup code
				backupCodes.push({ code: hashedCode, used: false });
			}
			await saveBackupCodesToDatabase(id, backupCodes);
			return backupCodes.map(backupCode => backupCode.code);
		} catch (err) {
			processError(err, logger);
			throw new Error(
				'Failed to generate backup codes. Please try again.'
			);
		}
	}
	// verify a backup code for a given user
	async function verifyBackupCode(id, inputCode) {
		try {
			validateDependencies(
				[
					{ name: 'id', instance: id },
					{ name: 'inputCode', instance: inputCode }
				],
				logger
			);
			const storedCodes = await getBackupCodesFromDatabase(id);
			if (!storedCodes) {
				logger.warn(`No backup codes found for user ${id}`);
				return false;
			}
			for (const storedCode of storedCodes) {
				const match = await bcrypt.compare(inputCode, storedCode.code); // Verify hashed code
				if (match && !storedCode.used) {
					storedCode.used = true; // Mark the code as used
					await updateBackupCodesInDatabase(id, storedCodes);
					return true;
				}
			}
			logger.warn(`Backup code verification failed for user ${id}`);
			return false;
		} catch (err) {
			processError(err, logger);
			throw new Error('Failed to verify backup code. Please try again.');
		}
	}
	// save generated backup codes to the database
	async function saveBackupCodesToDatabase(id, backupCodes) {
		try {
			validateDependencies(
				[
					{ name: 'id', instance: id },
					{ name: 'backupCodes', instance: backupCodes }
				],
				logger
			);
			const user = await UserMfa.findByPk(id);
			if (!user) {
				logger.error(`User with ID ${id} not found.`);
				throw new Error('User not found');
			}
			const backupCodesAsStrings = backupCodes.map(
				codeObj => codeObj.code
			);
			user.backupCodes = backupCodesAsStrings;
			await user.save();
		} catch (err) {
			processError(err, logger);
			throw new Error(
				'Failed to save backup codes. Please try again later.'
			);
		}
	}
	// retrieve backup codes from the database
	async function getBackupCodesFromDatabase(id) {
		try {
			validateDependencies([{ name: 'id', instance: id }], logger);
			const user = await UserMfa.findByPk(id);
			if (!user) {
				logger.error(`User with ID ${id} not found.`);
				return undefined;
			}
			const backupCodes = user.backupCodes;
			if (!backupCodes) {
				logger.warn(`No backup codes found for user ${id}`);
				return undefined;
			}
			// convert string array to BackupCode array
			return backupCodes.map(code => ({ code, used: false }));
		} catch (err) {
			processError(err, logger);
			throw new Error(
				'Failed to retrieve backup codes. Please try again later.'
			);
		}
	}
	async function updateBackupCodesInDatabase(id, backupCodes) {
		try {
			validateDependencies(
				[
					{ name: 'id', instance: id },
					{ name: 'backupCodes', instance: backupCodes }
				],
				logger
			);
			const user = await UserMfa.findByPk(id);
			if (!user) {
				logger.error(`User with ID ${id} not found.`);
				throw new Error('User not found');
			}
			const backupCodesAsStrings = backupCodes.map(
				codeObj => codeObj.code
			);
			user.backupCodes = backupCodesAsStrings;
			await user.save();
		} catch (err) {
			processError(err, logger);
			throw new Error(
				'Failed to update backup codes. Please try again later.'
			);
		}
	}
	return {
		generateBackupCodes,
		verifyBackupCode,
		saveBackupCodesToDatabase,
		getBackupCodesFromDatabase,
		updateBackupCodesInDatabase
	};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwQ29kZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0aC9iYWNrdXBDb2RlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFjckQsTUFBTSxDQUFDLE9BQU8sVUFBVSx1QkFBdUIsQ0FBQyxFQUMvQyxNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixNQUFNLEVBQ3lCO0lBZS9CLG9CQUFvQixDQUNuQjtRQUNDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO1FBQ3BDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO1FBQ3BDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO0tBQ3BDLEVBQ0QsTUFBTSxDQUNOLENBQUM7SUFFRiw0Q0FBNEM7SUFDNUMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEVBQVU7UUFDNUMsSUFBSSxDQUFDO1lBQ0osb0JBQW9CLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFN0QsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztZQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0NBQWdD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QUN6QiwwQkFBMEI7UUFDMUIsMkJBQTJCO0tBQzNCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHQnO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5pbXBvcnQgeyBVc2VyTWZhIH0gZnJvbSAnLi4vbW9kZWxzL1VzZXJNZmEnO1xuaW1wb3J0IHsgdmFsaWRhdGVEZXBlbmRlbmNpZXMgfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZURlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBwcm9jZXNzRXJyb3IgfSBmcm9tICcuLi91dGlscy9wcm9jZXNzRXJyb3InO1xuXG5pbnRlcmZhY2UgQmFja3VwQ29kZSB7XG5cdGNvZGU6IHN0cmluZztcblx0dXNlZDogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEJhY2t1cENvZGVTZXJ2aWNlRGVwZW5kZW5jaWVzIHtcblx0bG9nZ2VyOiBMb2dnZXI7XG5cdFVzZXJNZmE6IHR5cGVvZiBVc2VyTWZhO1xuXHRjcnlwdG86IHR5cGVvZiBjcnlwdG87XG5cdGJjcnlwdDogdHlwZW9mIGJjcnlwdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQmFja3VwQ29kZVNlcnZpY2Uoe1xuXHRsb2dnZXIsXG5cdFVzZXJNZmEsXG5cdGJjcnlwdCxcblx0Y3J5cHRvXG59OiBCYWNrdXBDb2RlU2VydmljZURlcGVuZGVuY2llcyk6IHtcblx0Z2VuZXJhdGVCYWNrdXBDb2RlczogKGlkOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nW10+O1xuXHR2ZXJpZnlCYWNrdXBDb2RlOiAoaWQ6IHN0cmluZywgaW5wdXRDb2RlOiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj47XG5cdHNhdmVCYWNrdXBDb2Rlc1RvRGF0YWJhc2U6IChcblx0XHRpZDogc3RyaW5nLFxuXHRcdGJhY2t1cENvZGVzOiBCYWNrdXBDb2RlW11cblx0KSA9PiBQcm9taXNlPHZvaWQ+O1xuXHRnZXRCYWNrdXBDb2Rlc0Zyb21EYXRhYmFzZTogKFxuXHRcdGlkOiBzdHJpbmdcblx0KSA9PiBQcm9taXNlPEJhY2t1cENvZGVbXSB8IHVuZGVmaW5lZD47XG5cdHVwZGF0ZUJhY2t1cENvZGVzSW5EYXRhYmFzZTogKFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0YmFja3VwQ29kZXM6IEJhY2t1cENvZGVbXVxuXHQpID0+IFByb21pc2U8dm9pZD47XG59IHtcblx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoXG5cdFx0W1xuXHRcdFx0eyBuYW1lOiAnbG9nZ2VyJywgaW5zdGFuY2U6IGxvZ2dlciB9LFxuXHRcdFx0eyBuYW1lOiAnVXNlck1mYScsIGluc3RhbmNlOiBVc2VyTWZhIH0sXG5cdFx0XHR7IG5hbWU6ICdiY3J5cHQnLCBpbnN0YW5jZTogYmNyeXB0IH0sXG5cdFx0XHR7IG5hbWU6ICdjcnlwdG8nLCBpbnN0YW5jZTogY3J5cHRvIH1cblx0XHRdLFxuXHRcdGxvZ2dlclxuXHQpO1xuXG5cdC8vIGdlbmVyYXRlIGJhY2t1cCBjb2RlcyBmb3IgYSBnaXZlbiB1c2VyIElEXG5cdGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQmFja3VwQ29kZXMoaWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcblx0XHR0cnkge1xuXHRcdFx0dmFsaWRhdGVEZXBlbmRlbmNpZXMoW3sgbmFtZTogJ2lkJywgaW5zdGFuY2U6IGlkIH1dLCBsb2dnZXIpO1xuXG5cdFx0XHRjb25zdCBiYWNrdXBDb2RlczogQmFja3VwQ29kZVtdID0gW107XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcblx0XHRcdFx0Y29uc3QgY29kZSA9IGNyeXB0by5yYW5kb21CeXRlcyg0KS50b1N0cmluZygnaGV4Jyk7IC8vIEdlbmVyYXRlIDgtY2hhcmFjdGVyIGhleCBjb2RlXG5cdFx0XHRcdGNvbnN0IGhhc2hlZENvZGUgPSBhd2FpdCBiY3J5cHQuaGFzaChjb2RlLCAxMCk7IC8vIEhhc2hpbmcgdGhlIGJhY2t1cCBjb2RlXG5cdFx0XHRcdGJhY2t1cENvZGVzLnB1c2goeyBjb2RlOiBoYXNoZWRDb2RlLCB1c2VkOiBmYWxzZSB9KTtcblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgc2F2ZUJhY2t1cENvZGVzVG9EYXRhYmFzZShpZCwgYmFja3VwQ29kZXMpO1xuXG5cdFx0XHRyZXR1cm4gYmFja3VwQ29kZXMubWFwKGJhY2t1cENvZGUgPT4gYmFja3VwQ29kZS5jb2RlKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHByb2Nlc3NFcnJvcihlcnIsIGxvZ2dlcik7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdGYWlsZWQgdG8gZ2VuZXJhdGUgYmFja3VwIGNvZGVzLiBQbGVhc2UgdHJ5IGFnYWluLidcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gdmVyaWZ5IGEgYmFja3VwIGNvZGUgZm9yIGEgZ2l2ZW4gdXNlclxuXHRhc3luYyBmdW5jdGlvbiB2ZXJpZnlCYWNrdXBDb2RlKFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0aW5wdXRDb2RlOiBzdHJpbmdcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAnaWQnLCBpbnN0YW5jZTogaWQgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdpbnB1dENvZGUnLCBpbnN0YW5jZTogaW5wdXRDb2RlIH1cblx0XHRcdFx0XSxcblx0XHRcdFx0bG9nZ2VyXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBzdG9yZWRDb2RlcyA9IGF3YWl0IGdldEJhY2t1cENvZGVzRnJvbURhdGFiYXNlKGlkKTtcblxuXHRcdFx0aWYgKCFzdG9yZWRDb2Rlcykge1xuXHRcdFx0XHRsb2dnZXIud2FybihgTm8gYmFja3VwIGNvZGVzIGZvdW5kIGZvciB1c2VyICR7aWR9YCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yIChjb25zdCBzdG9yZWRDb2RlIG9mIHN0b3JlZENvZGVzKSB7XG5cdFx0XHRcdGNvbnN0IG1hdGNoID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoaW5wdXRDb2RlLCBzdG9yZWRDb2RlLmNvZGUpOyAvLyBWZXJpZnkgaGFzaGVkIGNvZGVcblx0XHRcdFx0aWYgKG1hdGNoICYmICFzdG9yZWRDb2RlLnVzZWQpIHtcblx0XHRcdFx0XHRzdG9yZWRDb2RlLnVzZWQgPSB0cnVlOyAvLyBNYXJrIHRoZSBjb2RlIGFzIHVzZWRcblx0XHRcdFx0XHRhd2FpdCB1cGRhdGVCYWNrdXBDb2Rlc0luRGF0YWJhc2UoaWQsIHN0b3JlZENvZGVzKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsb2dnZXIud2FybihgQmFja3VwIGNvZGUgdmVyaWZpY2F0aW9uIGZhaWxlZCBmb3IgdXNlciAke2lkfWApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVyciwgbG9nZ2VyKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHZlcmlmeSBiYWNrdXAgY29kZS4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHR9XG5cdH1cblxuXHQvLyBzYXZlIGdlbmVyYXRlZCBiYWNrdXAgY29kZXMgdG8gdGhlIGRhdGFiYXNlXG5cdGFzeW5jIGZ1bmN0aW9uIHNhdmVCYWNrdXBDb2Rlc1RvRGF0YWJhc2UoXG5cdFx0aWQ6IHN0cmluZyxcblx0XHRiYWNrdXBDb2RlczogQmFja3VwQ29kZVtdXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHsgbmFtZTogJ2lkJywgaW5zdGFuY2U6IGlkIH0sXG5cdFx0XHRcdFx0eyBuYW1lOiAnYmFja3VwQ29kZXMnLCBpbnN0YW5jZTogYmFja3VwQ29kZXMgfVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRsb2dnZXJcblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyTWZhLmZpbmRCeVBrKGlkKTtcblxuXHRcdFx0aWYgKCF1c2VyKSB7XG5cdFx0XHRcdGxvZ2dlci5lcnJvcihgVXNlciB3aXRoIElEICR7aWR9IG5vdCBmb3VuZC5gKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBmb3VuZCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBiYWNrdXBDb2Rlc0FzU3RyaW5ncyA9IGJhY2t1cENvZGVzLm1hcChcblx0XHRcdFx0Y29kZU9iaiA9PiBjb2RlT2JqLmNvZGVcblx0XHRcdCk7XG5cdFx0XHR1c2VyLmJhY2t1cENvZGVzID0gYmFja3VwQ29kZXNBc1N0cmluZ3M7XG5cdFx0XHRhd2FpdCB1c2VyLnNhdmUoKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHByb2Nlc3NFcnJvcihlcnIsIGxvZ2dlcik7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdGYWlsZWQgdG8gc2F2ZSBiYWNrdXAgY29kZXMuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvLyByZXRyaWV2ZSBiYWNrdXAgY29kZXMgZnJvbSB0aGUgZGF0YWJhc2Vcblx0YXN5bmMgZnVuY3Rpb24gZ2V0QmFja3VwQ29kZXNGcm9tRGF0YWJhc2UoXG5cdFx0aWQ6IHN0cmluZ1xuXHQpOiBQcm9taXNlPEJhY2t1cENvZGVbXSB8IHVuZGVmaW5lZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhbeyBuYW1lOiAnaWQnLCBpbnN0YW5jZTogaWQgfV0sIGxvZ2dlcik7XG5cblx0XHRcdGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyTWZhLmZpbmRCeVBrKGlkKTtcblxuXHRcdFx0aWYgKCF1c2VyKSB7XG5cdFx0XHRcdGxvZ2dlci5lcnJvcihgVXNlciB3aXRoIElEICR7aWR9IG5vdCBmb3VuZC5gKTtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgYmFja3VwQ29kZXMgPSB1c2VyLmJhY2t1cENvZGVzO1xuXHRcdFx0aWYgKCFiYWNrdXBDb2Rlcykge1xuXHRcdFx0XHRsb2dnZXIud2FybihgTm8gYmFja3VwIGNvZGVzIGZvdW5kIGZvciB1c2VyICR7aWR9YCk7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbnZlcnQgc3RyaW5nIGFycmF5IHRvIEJhY2t1cENvZGUgYXJyYXlcblx0XHRcdHJldHVybiBiYWNrdXBDb2Rlcy5tYXAoXG5cdFx0XHRcdChjb2RlOiBzdHJpbmcpID0+ICh7IGNvZGUsIHVzZWQ6IGZhbHNlIH0pIGFzIEJhY2t1cENvZGVcblx0XHRcdCk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRwcm9jZXNzRXJyb3IoZXJyLCBsb2dnZXIpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHQnRmFpbGVkIHRvIHJldHJpZXZlIGJhY2t1cCBjb2Rlcy4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUJhY2t1cENvZGVzSW5EYXRhYmFzZShcblx0XHRpZDogc3RyaW5nLFxuXHRcdGJhY2t1cENvZGVzOiBCYWNrdXBDb2RlW11cblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhbGlkYXRlRGVwZW5kZW5jaWVzKFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0eyBuYW1lOiAnaWQnLCBpbnN0YW5jZTogaWQgfSxcblx0XHRcdFx0XHR7IG5hbWU6ICdiYWNrdXBDb2RlcycsIGluc3RhbmNlOiBiYWNrdXBDb2RlcyB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdGxvZ2dlclxuXHRcdFx0KTtcblxuXHRcdFx0Y29uc3QgdXNlciA9IGF3YWl0IFVzZXJNZmEuZmluZEJ5UGsoaWQpO1xuXG5cdFx0XHRpZiAoIXVzZXIpIHtcblx0XHRcdFx0bG9nZ2VyLmVycm9yKGBVc2VyIHdpdGggSUQgJHtpZH0gbm90IGZvdW5kLmApO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGZvdW5kJyk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGJhY2t1cENvZGVzQXNTdHJpbmdzID0gYmFja3VwQ29kZXMubWFwKFxuXHRcdFx0XHRjb2RlT2JqID0+IGNvZGVPYmouY29kZVxuXHRcdFx0KTtcblx0XHRcdHVzZXIuYmFja3VwQ29kZXMgPSBiYWNrdXBDb2Rlc0FzU3RyaW5ncztcblx0XHRcdGF3YWl0IHVzZXIuc2F2ZSgpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0cHJvY2Vzc0Vycm9yKGVyciwgbG9nZ2VyKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0J0ZhaWxlZCB0byB1cGRhdGUgYmFja3VwIGNvZGVzLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLidcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRnZW5lcmF0ZUJhY2t1cENvZGVzLFxuXHRcdHZlcmlmeUJhY2t1cENvZGUsXG5cdFx0c2F2ZUJhY2t1cENvZGVzVG9EYXRhYmFzZSxcblx0XHRnZXRCYWNrdXBDb2Rlc0Zyb21EYXRhYmFzZSxcblx0XHR1cGRhdGVCYWNrdXBDb2Rlc0luRGF0YWJhc2Vcblx0fTtcbn1cbiJdfQ==
