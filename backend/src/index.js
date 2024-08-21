import initializeDatabase from './config/db.js';
import featureFlags from './config/featureFlags.js';
import loadEnv, { __dirname } from './config/loadEnv.js';
import { setupHttp } from './middleware/http.js';
import { createTransporter, getTransporter } from './config/mailer.js';
import multerConfiguredUpload from './config/multer.js';
import configurePassport from './config/passport.js';
// import redisClient from './config/redis.js';
import setupSecurityHeaders from './middleware/securityHeaders.js';
import slowdownMiddleware from './middleware/slowdown.js';
import { csrfMiddleware } from './middleware/csrf.js';
import sops from './config/sops.js';
import {
	addToBlacklist,
	initializeIpBlacklist,
	ipBlacklistMiddleware,
	loadBlacklist,
	removeFromBlacklist
} from './middleware/ipBlacklist.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import {
	registrationValidationRules,
	validateEntry
} from './middleware/validator.js';
import {
	generateBackupCodes,
	getBackupCodesFromDatabase,
	saveBackupCodesToDatabase,
	verifyBackupCode
} from './utils/auth/backupCodeUtil.js';
import {
	generateEmail2FACode,
	verifyEmail2FACode
} from './utils/auth/email2FAUtil.js';
import {
	generateU2fAuthenticationOptions,
	generateU2fRegistrationOptions,
	verifyU2fAuthentication,
	verifyU2fRegistration
} from './utils/auth/fido2Util.js';
import { verifyJwToken } from './utils/auth/jwtUtil.js';
import {
	generatePasskeyAuthenticationOptions,
	generatePasskeyRegistrationOptions,
	verifyPasskeyAuthentication,
	verifyPasskeyRegistration
} from './utils/auth/passkeyUtil.js';
import {
	generateYubicoOtpOptions,
	validateYubicoOTP
} from './utils/auth/yubicoOtpUtil.js';
import {
	generateTOTPSecret,
	generateTOTPToken,
	verifyTOTPToken,
	generateQRCode
} from './utils/auth/totpUtil.js';
import generate2FactorEmailTemplate from './utils/emailTemplates/2FactorEmailTemplate.js';
import generate2FAEnabledEmailTemplate from './utils/emailTemplates/2FAEnabledEmailTemplate.js';
import generateAccountDeletedConfirmationEmailTemplate from './utils/emailTemplates/accountDeletedConfirmationEmailTemplate.js';
import generateAccountDeletionStartedEmailTemplate from './utils/emailTemplates/accountDeletionStartedEmailTemplate.js';
import generateConfirmationEmailTemplate from './utils/emailTemplates/confirmationEmailTemplate.js';
import loadTestRoutes from './utils/test/loadTestRoutes.js';
import { parseBoolean } from './utils/parseBoolean.js';
export {
	addToBlacklist,
	configurePassport,
	createTransporter,
	csrfMiddleware,
	decryptDataFiles,
	featureFlags,
	generate2FactorEmailTemplate,
	generate2FAEnabledEmailTemplate,
	generateAccountDeletedConfirmationEmailTemplate,
	generateAccountDeletionStartedEmailTemplate,
	generateBackupCodes,
	generateConfirmationEmailTemplate,
	generateEmail2FACode,
	generatePasskeyAuthenticationOptions,
	generatePasskeyRegistrationOptions,
	generateQRCode,
	generateU2fAuthenticationOptions,
	generateU2fRegistrationOptions,
	generateTOTPSecret,
	generateTOTPToken,
	generateYubicoOtpOptions,
	getBackupCodesFromDatabase,
	getSSLKeys,
	getTransporter,
	ipBlacklistMiddleware,
	initializeDatabase,
	initializeIpBlacklist,
	loadBlacklist,
	loadEnv,
	loadTestRoutes,
	multerConfiguredUpload,
	parseBoolean,
	rateLimitMiddleware,
	//	redisClient,
	registrationValidationRules,
	removeFromBlacklist,
	saveBackupCodesToDatabase,
	setupHttp,
	setupSecurityHeaders,
	slowdownMiddleware,
	validateEntry,
	validateYubicoOTP,
	verifyBackupCode,
	verifyEmail2FACode,
	verifyJwToken,
	verifyPasskeyAuthentication,
	verifyPasskeyRegistration,
	verifyTOTPToken,
	verifyU2fAuthentication,
	verifyU2fRegistration,
	__dirname
};
let { decryptDataFiles, getSSLKeys } = sops;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixNQUFNLGFBQWEsQ0FBQztBQUM3QyxPQUFPLFlBQVksTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDcEUsT0FBTyxzQkFBc0IsTUFBTSxpQkFBaUIsQ0FBQztBQUNyRCxPQUFPLGlCQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQ2xELDRDQUE0QztBQUM1QyxPQUFPLG9CQUFvQixNQUFNLDhCQUE4QixDQUFDO0FBQ2hFLE9BQU8sa0JBQWtCLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sSUFBSSxNQUFNLGVBQWUsQ0FBQztBQUNqQyxPQUFPLEVBQ04sY0FBYyxFQUNkLHFCQUFxQixFQUNyQixxQkFBcUIsRUFDckIsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixNQUFNLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFDTiwyQkFBMkIsRUFDM0IsYUFBYSxFQUNiLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUNOLG1CQUFtQixFQUNuQiwwQkFBMEIsRUFDMUIseUJBQXlCLEVBQ3pCLGdCQUFnQixFQUNoQixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFDTixvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLE1BQU0sMkJBQTJCLENBQUM7QUFDbkMsT0FBTyxFQUNOLGdDQUFnQyxFQUNoQyw4QkFBOEIsRUFDOUIsdUJBQXVCLEVBQ3ZCLHFCQUFxQixFQUNyQixNQUFNLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQ04sb0NBQW9DLEVBQ3BDLGtDQUFrQyxFQUNsQywyQkFBMkIsRUFDM0IseUJBQXlCLEVBQ3pCLE1BQU0sMEJBQTBCLENBQUM7QUFDbEMsT0FBTyxFQUNOLHdCQUF3QixFQUN4QixpQkFBaUIsRUFDakIsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQ04sa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsY0FBYyxFQUNkLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyw0QkFBNEIsTUFBTSw2Q0FBNkMsQ0FBQztBQUN2RixPQUFPLCtCQUErQixNQUFNLGdEQUFnRCxDQUFDO0FBQzdGLE9BQU8sK0NBQStDLE1BQU0sZ0VBQWdFLENBQUM7QUFDN0gsT0FBTywyQ0FBMkMsTUFBTSw0REFBNEQsQ0FBQztBQUNySCxPQUFPLGlDQUFpQyxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pHLE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVwRCxPQUFPLEVBQ04sY0FBYyxFQUNkLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsY0FBYyxFQUNkLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osNEJBQTRCLEVBQzVCLCtCQUErQixFQUMvQiwrQ0FBK0MsRUFDL0MsMkNBQTJDLEVBQzNDLG1CQUFtQixFQUNuQixpQ0FBaUMsRUFDakMsb0JBQW9CLEVBQ3BCLG9DQUFvQyxFQUNwQyxrQ0FBa0MsRUFDbEMsY0FBYyxFQUNkLGdDQUFnQyxFQUNoQyw4QkFBOEIsRUFDOUIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQix3QkFBd0IsRUFDeEIsMEJBQTBCLEVBQzFCLFVBQVUsRUFDVixjQUFjLEVBQ2QscUJBQXFCLEVBQ3JCLGtCQUFrQixFQUNsQixxQkFBcUIsRUFDckIsYUFBYSxFQUNiLE9BQU8sRUFDUCxjQUFjLEVBQ2Qsc0JBQXNCLEVBQ3RCLFlBQVksRUFDWixtQkFBbUI7QUFDbkIsZUFBZTtBQUNmLDJCQUEyQixFQUMzQixtQkFBbUIsRUFDbkIseUJBQXlCLEVBQ3pCLFNBQVMsRUFDVCxvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QixlQUFlLEVBQ2YsdUJBQXVCLEVBQ3ZCLHFCQUFxQixFQUNyQixTQUFTLEVBQ1QsQ0FBQztBQUVGLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5pdGlhbGl6ZURhdGFiYXNlIGZyb20gJy4vY29uZmlnL2RiJztcbmltcG9ydCBmZWF0dXJlRmxhZ3MgZnJvbSAnLi9jb25maWcvZmVhdHVyZUZsYWdzJztcbmltcG9ydCBsb2FkRW52LCB7IF9fZGlybmFtZSB9IGZyb20gJy4vY29uZmlnL2xvYWRFbnYnO1xuaW1wb3J0IHsgc2V0dXBIdHRwIH0gZnJvbSAnLi9taWRkbGV3YXJlL2h0dHAnO1xuaW1wb3J0IHsgY3JlYXRlVHJhbnNwb3J0ZXIsIGdldFRyYW5zcG9ydGVyIH0gZnJvbSAnLi9jb25maWcvbWFpbGVyJztcbmltcG9ydCBtdWx0ZXJDb25maWd1cmVkVXBsb2FkIGZyb20gJy4vY29uZmlnL211bHRlcic7XG5pbXBvcnQgY29uZmlndXJlUGFzc3BvcnQgZnJvbSAnLi9jb25maWcvcGFzc3BvcnQnO1xuLy8gaW1wb3J0IHJlZGlzQ2xpZW50IGZyb20gJy4vY29uZmlnL3JlZGlzJztcbmltcG9ydCBzZXR1cFNlY3VyaXR5SGVhZGVycyBmcm9tICcuL21pZGRsZXdhcmUvc2VjdXJpdHlIZWFkZXJzJztcbmltcG9ydCBzbG93ZG93bk1pZGRsZXdhcmUgZnJvbSAnLi9taWRkbGV3YXJlL3Nsb3dkb3duJztcbmltcG9ydCB7IGNzcmZNaWRkbGV3YXJlIH0gZnJvbSAnLi9taWRkbGV3YXJlL2NzcmYnO1xuaW1wb3J0IHNvcHMgZnJvbSAnLi9jb25maWcvc29wcyc7XG5pbXBvcnQge1xuXHRhZGRUb0JsYWNrbGlzdCxcblx0aW5pdGlhbGl6ZUlwQmxhY2tsaXN0LFxuXHRpcEJsYWNrbGlzdE1pZGRsZXdhcmUsXG5cdGxvYWRCbGFja2xpc3QsXG5cdHJlbW92ZUZyb21CbGFja2xpc3Rcbn0gZnJvbSAnLi9taWRkbGV3YXJlL2lwQmxhY2tsaXN0JztcbmltcG9ydCB7IHJhdGVMaW1pdE1pZGRsZXdhcmUgfSBmcm9tICcuL21pZGRsZXdhcmUvcmF0ZUxpbWl0JztcbmltcG9ydCB7XG5cdHJlZ2lzdHJhdGlvblZhbGlkYXRpb25SdWxlcyxcblx0dmFsaWRhdGVFbnRyeVxufSBmcm9tICcuL21pZGRsZXdhcmUvdmFsaWRhdG9yJztcbmltcG9ydCB7XG5cdGdlbmVyYXRlQmFja3VwQ29kZXMsXG5cdGdldEJhY2t1cENvZGVzRnJvbURhdGFiYXNlLFxuXHRzYXZlQmFja3VwQ29kZXNUb0RhdGFiYXNlLFxuXHR2ZXJpZnlCYWNrdXBDb2RlXG59IGZyb20gJy4vdXRpbHMvYXV0aC9iYWNrdXBDb2RlVXRpbCc7XG5pbXBvcnQge1xuXHRnZW5lcmF0ZUVtYWlsMkZBQ29kZSxcblx0dmVyaWZ5RW1haWwyRkFDb2RlXG59IGZyb20gJy4vdXRpbHMvYXV0aC9lbWFpbDJGQVV0aWwnO1xuaW1wb3J0IHtcblx0Z2VuZXJhdGVVMmZBdXRoZW50aWNhdGlvbk9wdGlvbnMsXG5cdGdlbmVyYXRlVTJmUmVnaXN0cmF0aW9uT3B0aW9ucyxcblx0dmVyaWZ5VTJmQXV0aGVudGljYXRpb24sXG5cdHZlcmlmeVUyZlJlZ2lzdHJhdGlvblxufSBmcm9tICcuL3V0aWxzL2F1dGgvZmlkbzJVdGlsJztcbmltcG9ydCB7IHZlcmlmeUp3VG9rZW4gfSBmcm9tICcuL3V0aWxzL2F1dGgvand0VXRpbCc7XG5pbXBvcnQge1xuXHRnZW5lcmF0ZVBhc3NrZXlBdXRoZW50aWNhdGlvbk9wdGlvbnMsXG5cdGdlbmVyYXRlUGFzc2tleVJlZ2lzdHJhdGlvbk9wdGlvbnMsXG5cdHZlcmlmeVBhc3NrZXlBdXRoZW50aWNhdGlvbixcblx0dmVyaWZ5UGFzc2tleVJlZ2lzdHJhdGlvblxufSBmcm9tICcuL3V0aWxzL2F1dGgvcGFzc2tleVV0aWwnO1xuaW1wb3J0IHtcblx0Z2VuZXJhdGVZdWJpY29PdHBPcHRpb25zLFxuXHR2YWxpZGF0ZVl1Ymljb09UUFxufSBmcm9tICcuL3V0aWxzL2F1dGgveXViaWNvT3RwVXRpbCc7XG5pbXBvcnQge1xuXHRnZW5lcmF0ZVRPVFBTZWNyZXQsXG5cdGdlbmVyYXRlVE9UUFRva2VuLFxuXHR2ZXJpZnlUT1RQVG9rZW4sXG5cdGdlbmVyYXRlUVJDb2RlXG59IGZyb20gJy4vdXRpbHMvYXV0aC90b3RwVXRpbCc7XG5pbXBvcnQgZ2VuZXJhdGUyRmFjdG9yRW1haWxUZW1wbGF0ZSBmcm9tICcuL3V0aWxzL2VtYWlsVGVtcGxhdGVzLzJGYWN0b3JFbWFpbFRlbXBsYXRlJztcbmltcG9ydCBnZW5lcmF0ZTJGQUVuYWJsZWRFbWFpbFRlbXBsYXRlIGZyb20gJy4vdXRpbHMvZW1haWxUZW1wbGF0ZXMvMkZBRW5hYmxlZEVtYWlsVGVtcGxhdGUnO1xuaW1wb3J0IGdlbmVyYXRlQWNjb3VudERlbGV0ZWRDb25maXJtYXRpb25FbWFpbFRlbXBsYXRlIGZyb20gJy4vdXRpbHMvZW1haWxUZW1wbGF0ZXMvYWNjb3VudERlbGV0ZWRDb25maXJtYXRpb25FbWFpbFRlbXBsYXRlJztcbmltcG9ydCBnZW5lcmF0ZUFjY291bnREZWxldGlvblN0YXJ0ZWRFbWFpbFRlbXBsYXRlIGZyb20gJy4vdXRpbHMvZW1haWxUZW1wbGF0ZXMvYWNjb3VudERlbGV0aW9uU3RhcnRlZEVtYWlsVGVtcGxhdGUnO1xuaW1wb3J0IGdlbmVyYXRlQ29uZmlybWF0aW9uRW1haWxUZW1wbGF0ZSBmcm9tICcuL3V0aWxzL2VtYWlsVGVtcGxhdGVzL2NvbmZpcm1hdGlvbkVtYWlsVGVtcGxhdGUnO1xuaW1wb3J0IGxvYWRUZXN0Um91dGVzIGZyb20gJy4vdXRpbHMvdGVzdC9sb2FkVGVzdFJvdXRlcyc7XG5pbXBvcnQgeyBwYXJzZUJvb2xlYW4gfSBmcm9tICcuL3V0aWxzL3BhcnNlQm9vbGVhbic7XG5cbmV4cG9ydCB7XG5cdGFkZFRvQmxhY2tsaXN0LFxuXHRjb25maWd1cmVQYXNzcG9ydCxcblx0Y3JlYXRlVHJhbnNwb3J0ZXIsXG5cdGNzcmZNaWRkbGV3YXJlLFxuXHRkZWNyeXB0RGF0YUZpbGVzLFxuXHRmZWF0dXJlRmxhZ3MsXG5cdGdlbmVyYXRlMkZhY3RvckVtYWlsVGVtcGxhdGUsXG5cdGdlbmVyYXRlMkZBRW5hYmxlZEVtYWlsVGVtcGxhdGUsXG5cdGdlbmVyYXRlQWNjb3VudERlbGV0ZWRDb25maXJtYXRpb25FbWFpbFRlbXBsYXRlLFxuXHRnZW5lcmF0ZUFjY291bnREZWxldGlvblN0YXJ0ZWRFbWFpbFRlbXBsYXRlLFxuXHRnZW5lcmF0ZUJhY2t1cENvZGVzLFxuXHRnZW5lcmF0ZUNvbmZpcm1hdGlvbkVtYWlsVGVtcGxhdGUsXG5cdGdlbmVyYXRlRW1haWwyRkFDb2RlLFxuXHRnZW5lcmF0ZVBhc3NrZXlBdXRoZW50aWNhdGlvbk9wdGlvbnMsXG5cdGdlbmVyYXRlUGFzc2tleVJlZ2lzdHJhdGlvbk9wdGlvbnMsXG5cdGdlbmVyYXRlUVJDb2RlLFxuXHRnZW5lcmF0ZVUyZkF1dGhlbnRpY2F0aW9uT3B0aW9ucyxcblx0Z2VuZXJhdGVVMmZSZWdpc3RyYXRpb25PcHRpb25zLFxuXHRnZW5lcmF0ZVRPVFBTZWNyZXQsXG5cdGdlbmVyYXRlVE9UUFRva2VuLFxuXHRnZW5lcmF0ZVl1Ymljb090cE9wdGlvbnMsXG5cdGdldEJhY2t1cENvZGVzRnJvbURhdGFiYXNlLFxuXHRnZXRTU0xLZXlzLFxuXHRnZXRUcmFuc3BvcnRlcixcblx0aXBCbGFja2xpc3RNaWRkbGV3YXJlLFxuXHRpbml0aWFsaXplRGF0YWJhc2UsXG5cdGluaXRpYWxpemVJcEJsYWNrbGlzdCxcblx0bG9hZEJsYWNrbGlzdCxcblx0bG9hZEVudixcblx0bG9hZFRlc3RSb3V0ZXMsXG5cdG11bHRlckNvbmZpZ3VyZWRVcGxvYWQsXG5cdHBhcnNlQm9vbGVhbixcblx0cmF0ZUxpbWl0TWlkZGxld2FyZSxcblx0Ly9cdHJlZGlzQ2xpZW50LFxuXHRyZWdpc3RyYXRpb25WYWxpZGF0aW9uUnVsZXMsXG5cdHJlbW92ZUZyb21CbGFja2xpc3QsXG5cdHNhdmVCYWNrdXBDb2Rlc1RvRGF0YWJhc2UsXG5cdHNldHVwSHR0cCxcblx0c2V0dXBTZWN1cml0eUhlYWRlcnMsXG5cdHNsb3dkb3duTWlkZGxld2FyZSxcblx0dmFsaWRhdGVFbnRyeSxcblx0dmFsaWRhdGVZdWJpY29PVFAsXG5cdHZlcmlmeUJhY2t1cENvZGUsXG5cdHZlcmlmeUVtYWlsMkZBQ29kZSxcblx0dmVyaWZ5SndUb2tlbixcblx0dmVyaWZ5UGFzc2tleUF1dGhlbnRpY2F0aW9uLFxuXHR2ZXJpZnlQYXNza2V5UmVnaXN0cmF0aW9uLFxuXHR2ZXJpZnlUT1RQVG9rZW4sXG5cdHZlcmlmeVUyZkF1dGhlbnRpY2F0aW9uLFxuXHR2ZXJpZnlVMmZSZWdpc3RyYXRpb24sXG5cdF9fZGlybmFtZVxufTtcblxubGV0IHsgZGVjcnlwdERhdGFGaWxlcywgZ2V0U1NMS2V5cyB9ID0gc29wcztcbiJdfQ==
