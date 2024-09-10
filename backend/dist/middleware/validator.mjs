import { validateDependencies } from '../utils/validateDependencies.mjs';
import { processError } from '../utils/processError.mjs';
export function initializeValidatorMiddleware({ validator, logger }) {
	try {
		validateDependencies(
			[
				{ name: 'validator', instance: validator },
				{ name: 'logger', instance: logger }
			],
			logger || console
		);
		const validateEntry = (req, res, next) => {
			const errors = [];
			if (validator.isEmpty(req.body.name || '')) {
				errors.push({ msg: 'Name is required', param: 'name' });
			}
			if (validator.isEmpty(req.body.message || '')) {
				errors.push({ msg: 'Message is required', param: 'message' });
			}
			if (errors.length) {
				logger.warn(
					`Validation failed for entry creation: ${JSON.stringify(errors)}`
				);
				res.status(400).json({ errors });
				return;
			}
			logger.info('Validation passed for entry creation');
			next();
		};
		const registrationValidationRules = (req, res, next) => {
			const errors = [];
			try {
				if (!validator.isLength(req.body.username || '', { min: 3 })) {
					errors.push({
						msg: 'Username must be at least 3 characters long',
						param: 'username'
					});
				}
				if (!validator.matches(req.body.username || '', /^[\w-]+$/)) {
					errors.push({
						msg: 'Username can only contain letters, numbers, underscores, and hyphens',
						param: 'username'
					});
				}
				if (!validator.isEmail(req.body.email || '')) {
					errors.push({
						msg: 'Please provide a valid email address',
						param: 'email'
					});
				}
				if (!validator.isLength(req.body.password || '', { min: 8 })) {
					errors.push({
						msg: 'Password must be at least 8 characters long',
						param: 'password'
					});
				}
				if (!validator.matches(req.body.password || '', /[A-Z]/)) {
					errors.push({
						msg: 'Password must contain at least one uppercase letter',
						param: 'password'
					});
				}
				if (!validator.matches(req.body.password || '', /[a-z]/)) {
					errors.push({
						msg: 'Password must contain at least one lowercase letter',
						param: 'password'
					});
				}
				if (!validator.matches(req.body.password || '', /\d/)) {
					errors.push({
						msg: 'Password must contain at least one digit',
						param: 'password'
					});
				}
				if (
					!validator.matches(req.body.password || '', /[^\dA-Za-z]/)
				) {
					errors.push({
						msg: 'Password must contain at least one special character',
						param: 'password'
					});
				}
				if (req.body.password !== req.body.confirmPassword) {
					errors.push({
						msg: 'Passwords do not match',
						param: 'confirmPassword'
					});
				}
				if (errors.length) {
					logger.warn(
						`Validation failed for registration: ${JSON.stringify(errors)}`
					);
					res.status(400).json({ errors });
					return;
				}
				logger.info('Validation passed for registration');
				next();
			} catch (err) {
				processError(err, logger || console, req);
				res.status(500).json({ error: 'Internal Server Error' });
			}
		};
		return {
			validateEntry,
			registrationValidationRules
		};
	} catch (error) {
		processError(error, logger || console);
		throw error;
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvdmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQU9yRCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsRUFDN0MsU0FBUyxFQUNULE1BQU0sRUFDaUI7SUFRdkIsSUFBSSxDQUFDO1FBQ0osb0JBQW9CLENBQ25CO1lBQ0MsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7WUFDMUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7U0FDcEMsRUFDRCxNQUFNLElBQUksT0FBTyxDQUNqQixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FDckIsR0FBWSxFQUNaLEdBQWEsRUFDYixJQUFrQixFQUNYLEVBQUU7WUFDVCxNQUFNLE1BQU0sR0FBMEMsRUFBRSxDQUFDO1lBRXpELElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMs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O0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUN2QyxNQUFNLEtBQUssQ0FBQztJQUNiLENBQUM7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi4vY29uZmlnL2xvZ2dlcic7XG5pbXBvcnQgeyB2YWxpZGF0ZURlcGVuZGVuY2llcyB9IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRlRGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IHByb2Nlc3NFcnJvciB9IGZyb20gJy4uL3V0aWxzL3Byb2Nlc3NFcnJvcic7XG5cbmludGVyZmFjZSBWYWxpZGF0b3JEZXBlbmRlbmNpZXMge1xuXHR2YWxpZGF0b3I6IHR5cGVvZiB2YWxpZGF0b3I7XG5cdGxvZ2dlcjogTG9nZ2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZVZhbGlkYXRvck1pZGRsZXdhcmUoe1xuXHR2YWxpZGF0b3IsXG5cdGxvZ2dlclxufTogVmFsaWRhdG9yRGVwZW5kZW5jaWVzKToge1xuXHR2YWxpZGF0ZUVudHJ5OiAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHZvaWQ7XG5cdHJlZ2lzdHJhdGlvblZhbGlkYXRpb25SdWxlczogKFxuXHRcdHJlcTogUmVxdWVzdCxcblx0XHRyZXM6IFJlc3BvbnNlLFxuXHRcdG5leHQ6IE5leHRGdW5jdGlvblxuXHQpID0+IHZvaWQ7XG59IHtcblx0dHJ5IHtcblx0XHR2YWxpZGF0ZURlcGVuZGVuY2llcyhcblx0XHRcdFtcblx0XHRcdFx0eyBuYW1lOiAndmFsaWRhdG9yJywgaW5zdGFuY2U6IHZhbGlkYXRvciB9LFxuXHRcdFx0XHR7IG5hbWU6ICdsb2dnZXInLCBpbnN0YW5jZTogbG9nZ2VyIH1cblx0XHRcdF0sXG5cdFx0XHRsb2dnZXIgfHwgY29uc29sZVxuXHRcdCk7XG5cblx0XHRjb25zdCB2YWxpZGF0ZUVudHJ5ID0gKFxuXHRcdFx0cmVxOiBSZXF1ZXN0LFxuXHRcdFx0cmVzOiBSZXNwb25zZSxcblx0XHRcdG5leHQ6IE5leHRGdW5jdGlvblxuXHRcdCk6IHZvaWQgPT4ge1xuXHRcdFx0Y29uc3QgZXJyb3JzOiBBcnJheTx7IG1zZzogc3RyaW5nOyBwYXJhbTogc3RyaW5nIH0+ID0gW107XG5cblx0XHRcdGlmICh2YWxpZGF0b3IuaXNFbXB0eShyZXEuYm9keS5uYW1lIHx8ICcnKSkge1xuXHRcdFx0XHRlcnJvcnMucHVzaCh7IG1zZzogJ05hbWUgaXMgcmVxdWlyZWQnLCBwYXJhbTogJ25hbWUnIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodmFsaWRhdG9yLmlzRW1wdHkocmVxLmJvZHkubWVzc2FnZSB8fCAnJykpIHtcblx0XHRcdFx0ZXJyb3JzLnB1c2goeyBtc2c6ICdNZXNzYWdlIGlzIHJlcXVpcmVkJywgcGFyYW06ICdtZXNzYWdlJyB9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGVycm9ycy5sZW5ndGgpIHtcblx0XHRcdFx0bG9nZ2VyLndhcm4oXG5cdFx0XHRcdFx0YFZhbGlkYXRpb24gZmFpbGVkIGZvciBlbnRyeSBjcmVhdGlvbjogJHtKU09OLnN0cmluZ2lmeShlcnJvcnMpfWBcblx0XHRcdFx0KTtcblx0XHRcdFx0cmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcnMgfSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bG9nZ2VyLmluZm8oJ1ZhbGlkYXRpb24gcGFzc2VkIGZvciBlbnRyeSBjcmVhdGlvbicpO1xuXHRcdFx0bmV4dCgpO1xuXHRcdH07XG5cblx0XHRjb25zdCByZWdpc3RyYXRpb25WYWxpZGF0aW9uUnVsZXMgPSAoXG5cdFx0XHRyZXE6IFJlcXVlc3QsXG5cdFx0XHRyZXM6IFJlc3BvbnNlLFxuXHRcdFx0bmV4dDogTmV4dEZ1bmN0aW9uXG5cdFx0KTogdm9pZCA9PiB7XG5cdFx0XHRjb25zdCBlcnJvcnM6IEFycmF5PHsgbXNnOiBzdHJpbmc7IHBhcmFtOiBzdHJpbmcgfT4gPSBbXTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCF2YWxpZGF0b3IuaXNMZW5ndGgocmVxLmJvZHkudXNlcm5hbWUgfHwgJycsIHsgbWluOiAzIH0pKSB7XG5cdFx0XHRcdFx0ZXJyb3JzLnB1c2goe1xuXHRcdFx0XHRcdFx0bXNnOiAnVXNlcm5hbWUgbXVzdCBiZSBhdCBsZWFzdCAzIGNoYXJhY3RlcnMgbG9uZycsXG5cdFx0XHRcdFx0XHRwYXJhbTogJ3VzZXJuYW1lJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCF2YWxpZGF0b3IubWF0Y2hlcyhyZXEuYm9keS51c2VybmFtZSB8fCAnJywgL15bXFx3LV0rJC8pKSB7XG5cdFx0XHRcdFx0ZXJyb3JzLnB1c2goe1xuXHRcdFx0XHRcdFx0bXNnOiAnVXNlcm5hbWUgY2FuIG9ubHkgY29udGFpbiBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIGh5cGhlbnMnLFxuXHRcdFx0XHRcdFx0cGFyYW06ICd1c2VybmFtZSdcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghdmFsaWRhdG9yLmlzRW1haWwocmVxLmJvZHkuZW1haWwgfHwgJycpKSB7XG5cdFx0XHRcdFx0ZXJyb3JzLnB1c2goe1xuXHRcdFx0XHRcdFx0bXNnOiAnUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJyxcblx0XHRcdFx0XHRcdHBhcmFtOiAnZW1haWwnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIXZhbGlkYXRvci5pc0xlbmd0aChyZXEuYm9keS5wYXNzd29yZCB8fCAnJywgeyBtaW46IDggfSkpIHtcblx0XHRcdFx0XHRlcnJvcnMucHVzaCh7XG5cdFx0XHRcdFx0XHRtc2c6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nJyxcblx0XHRcdFx0XHRcdHBhcmFtOiAncGFzc3dvcmQnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCF2YWxpZGF0b3IubWF0Y2hlcyhyZXEuYm9keS5wYXNzd29yZCB8fCAnJywgL1tBLVpdLykpIHtcblx0XHRcdFx0XHRlcnJvcnMucHVzaCh7XG5cdFx0XHRcdFx0XHRtc2c6ICdQYXNzd29yZCBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHVwcGVyY2FzZSBsZXR0ZXInLFxuXHRcdFx0XHRcdFx0cGFyYW06ICdwYXNzd29yZCdcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIXZhbGlkYXRvci5tYXRjaGVzKHJlcS5ib2R5LnBhc3N3b3JkIHx8ICcnLCAvW2Etel0vKSkge1xuXHRcdFx0XHRcdGVycm9ycy5wdXNoKHtcblx0XHRcdFx0XHRcdG1zZzogJ1Bhc3N3b3JkIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgbG93ZXJjYXNlIGxldHRlcicsXG5cdFx0XHRcdFx0XHRwYXJhbTogJ3Bhc3N3b3JkJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghdmFsaWRhdG9yLm1hdGNoZXMocmVxLmJvZHkucGFzc3dvcmQgfHwgJycsIC9cXGQvKSkge1xuXHRcdFx0XHRcdGVycm9ycy5wdXNoKHtcblx0XHRcdFx0XHRcdG1zZzogJ1Bhc3N3b3JkIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgZGlnaXQnLFxuXHRcdFx0XHRcdFx0cGFyYW06ICdwYXNzd29yZCdcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQhdmFsaWRhdG9yLm1hdGNoZXMocmVxLmJvZHkucGFzc3dvcmQgfHwgJycsIC9bXlxcZEEtWmEtel0vKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRlcnJvcnMucHVzaCh7XG5cdFx0XHRcdFx0XHRtc2c6ICdQYXNzd29yZCBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNwZWNpYWwgY2hhcmFjdGVyJyxcblx0XHRcdFx0XHRcdHBhcmFtOiAncGFzc3dvcmQnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAocmVxLmJvZHkucGFzc3dvcmQgIT09IHJlcS5ib2R5LmNvbmZpcm1QYXNzd29yZCkge1xuXHRcdFx0XHRcdGVycm9ycy5wdXNoKHtcblx0XHRcdFx0XHRcdG1zZzogJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2gnLFxuXHRcdFx0XHRcdFx0cGFyYW06ICdjb25maXJtUGFzc3dvcmQnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdFx0YFZhbGlkYXRpb24gZmFpbGVkIGZvciByZWdpc3RyYXRpb246ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JzKX1gXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9ycyB9KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsb2dnZXIuaW5mbygnVmFsaWRhdGlvbiBwYXNzZWQgZm9yIHJlZ2lzdHJhdGlvbicpO1xuXHRcdFx0XHRuZXh0KCk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0cHJvY2Vzc0Vycm9yKGVyciwgbG9nZ2VyIHx8IGNvbnNvbGUsIHJlcSk7XG5cdFx0XHRcdHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InIH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsaWRhdGVFbnRyeSxcblx0XHRcdHJlZ2lzdHJhdGlvblZhbGlkYXRpb25SdWxlc1xuXHRcdH07XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cHJvY2Vzc0Vycm9yKGVycm9yLCBsb2dnZXIgfHwgY29uc29sZSk7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cbn1cbiJdfQ==
