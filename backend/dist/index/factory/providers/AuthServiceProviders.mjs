import { BackupCodeService } from '../../../auth/BackupCode.mjs';
import { EmailMFAService } from '../../../auth/EmailMFA.mjs';
import { FIDO2Service } from '../../../auth/FIDO2.mjs';
import { JWTService } from '../../../auth/JWT.mjs';
import { PasswordService } from '../../../auth/Password.mjs';
import { TOTPService } from '../../../auth/TOTP.mjs';
import { YubicoOTPService } from '../../../auth/YubicoOTP.mjs';
export class BackupCodeServiceProvider {
	static instance = null;
	static async getBackupCodeService() {
		if (!this.instance) {
			this.instance = await BackupCodeService.getInstance();
		}
		return this.instance;
	}
}
export class EmailMFAServiceProvider {
	static instance = null;
	static async getEmailMFAService() {
		if (!this.instance) {
			this.instance = await EmailMFAService.getInstance();
		}
		return this.instance;
	}
}
export class FIDO2ServiceProvider {
	static instance = null;
	static async getFIDO2Service() {
		if (!this.instance) {
			this.instance = await FIDO2Service.getInstance();
		}
		return this.instance;
	}
}
export class JWTServiceProvider {
	static instance = null;
	static async getJWTService() {
		if (!this.instance) {
			this.instance = await JWTService.getInstance();
		}
		return this.instance;
	}
}
export class PasswordServiceProvider {
	static instance = null;
	static async getPasswordService() {
		if (!this.instance) {
			this.instance = await PasswordService.getInstance();
		}
		return this.instance;
	}
}
export class TOTPServiceProvider {
	static instance = null;
	static async getTOTPService() {
		if (!this.instance) {
			this.instance = await TOTPService.getInstance();
		}
		return this.instance;
	}
}
export class YubicoOTPServiceProvider {
	static instance = null;
	static async getYubicoOTPService() {
		if (!this.instance) {
			this.instance = await YubicoOTPService.getInstance();
		}
		return this.instance;
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aFNlcnZpY2VQcm92aWRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvaW5kZXgvZmFjdG9yeS9wcm92aWRlcnMvQXV0aFNlcnZpY2VQcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQVczRCxNQUFNLE9BQU8seUJBQXlCO0lBQzdCLE1BQU0sQ0FBQyxRQUFRLEdBQXNDLElBQUksQ0FBQztJQUUzRCxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQjtRQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3RCLENBQUM7O0FBR0YsTUFBTSxPQUFPLHVCQUF1QjtJQUMzQixNQUFNLENBQUMsUUFBUSxHQUFvQyxJQUFJLENBQUM7SUFFekQsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0I7UUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQzs7QUFHRixNQUFNLE9BQU8sb0JBQW9CO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQWlDLElBQUksQ0FBQztJQUV0RCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWU7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQzs7QUFHRixNQUFNLE9BQU8sa0JBQWtCO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLEdBQStCLElBQUksQ0FBQztJQUVwRCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWE7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQzs7QUFHRixNQUFNLE9BQU8sdUJBQXVCO0lBQzNCLE1BQU0sQ0FBQyxRQUFRLEdBQW9DLElBQUksQ0FBQztJQUV6RCxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQjtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDOztBQUdGLE1BQU0sT0FBTyxtQkFBbUI7SUFDdkIsTUFBTSxDQUFDLFFBQVEsR0FBZ0MsSUFBSSxDQUFDO0lBRXJELE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDOztBQUdGLE1BQU0sT0FBTyx3QkFBd0I7SUFDNUIsTUFBTSxDQUFDLFFBQVEsR0FBcUMsSUFBSSxDQUFDO0lBRTFELE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CO1FBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhY2t1cENvZGVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYXV0aC9CYWNrdXBDb2RlJztcbmltcG9ydCB7IEVtYWlsTUZBU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL2F1dGgvRW1haWxNRkEnO1xuaW1wb3J0IHsgRklETzJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYXV0aC9GSURPMic7XG5pbXBvcnQgeyBKV1RTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYXV0aC9KV1QnO1xuaW1wb3J0IHsgUGFzc3dvcmRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYXV0aC9QYXNzd29yZCc7XG5pbXBvcnQgeyBUT1RQU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL2F1dGgvVE9UUCc7XG5pbXBvcnQgeyBZdWJpY29PVFBTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYXV0aC9ZdWJpY29PVFAnO1xuaW1wb3J0IHtcblx0QmFja3VwQ29kZVNlcnZpY2VJbnRlcmZhY2UsXG5cdEVtYWlsTUZBU2VydmljZUludGVyZmFjZSxcblx0RklETzJTZXJ2aWNlSW50ZXJmYWNlLFxuXHRKV1RTZXJ2aWNlSW50ZXJmYWNlLFxuXHRQYXNzd29yZFNlcnZpY2VJbnRlcmZhY2UsXG5cdFRPVFBTZXJ2aWNlSW50ZXJmYWNlLFxuXHRZdWJpY29PVFBTZXJ2aWNlSW50ZXJmYWNlXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvbWFpbic7XG5cbmV4cG9ydCBjbGFzcyBCYWNrdXBDb2RlU2VydmljZVByb3ZpZGVyIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEJhY2t1cENvZGVTZXJ2aWNlSW50ZXJmYWNlIHwgbnVsbCA9IG51bGw7XG5cblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRCYWNrdXBDb2RlU2VydmljZSgpOiBQcm9taXNlPEJhY2t1cENvZGVTZXJ2aWNlSW50ZXJmYWNlPiB7XG5cdFx0aWYgKCF0aGlzLmluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlID0gYXdhaXQgQmFja3VwQ29kZVNlcnZpY2UuZ2V0SW5zdGFuY2UoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtYWlsTUZBU2VydmljZVByb3ZpZGVyIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEVtYWlsTUZBU2VydmljZUludGVyZmFjZSB8IG51bGwgPSBudWxsO1xuXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0RW1haWxNRkFTZXJ2aWNlKCk6IFByb21pc2U8RW1haWxNRkFTZXJ2aWNlSW50ZXJmYWNlPiB7XG5cdFx0aWYgKCF0aGlzLmluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlID0gYXdhaXQgRW1haWxNRkFTZXJ2aWNlLmdldEluc3RhbmNlKCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmluc3RhbmNlO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBGSURPMlNlcnZpY2VQcm92aWRlciB7XG5cdHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBGSURPMlNlcnZpY2VJbnRlcmZhY2UgfCBudWxsID0gbnVsbDtcblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGdldEZJRE8yU2VydmljZSgpOiBQcm9taXNlPEZJRE8yU2VydmljZUludGVyZmFjZT4ge1xuXHRcdGlmICghdGhpcy5pbnN0YW5jZSkge1xuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IGF3YWl0IEZJRE8yU2VydmljZS5nZXRJbnN0YW5jZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgSldUU2VydmljZVByb3ZpZGVyIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEpXVFNlcnZpY2VJbnRlcmZhY2UgfCBudWxsID0gbnVsbDtcblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGdldEpXVFNlcnZpY2UoKTogUHJvbWlzZTxKV1RTZXJ2aWNlSW50ZXJmYWNlPiB7XG5cdFx0aWYgKCF0aGlzLmluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlID0gYXdhaXQgSldUU2VydmljZS5nZXRJbnN0YW5jZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgUGFzc3dvcmRTZXJ2aWNlUHJvdmlkZXIge1xuXHRwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogUGFzc3dvcmRTZXJ2aWNlSW50ZXJmYWNlIHwgbnVsbCA9IG51bGw7XG5cblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRQYXNzd29yZFNlcnZpY2UoKTogUHJvbWlzZTxQYXNzd29yZFNlcnZpY2VJbnRlcmZhY2U+IHtcblx0XHRpZiAoIXRoaXMuaW5zdGFuY2UpIHtcblx0XHRcdHRoaXMuaW5zdGFuY2UgPSBhd2FpdCBQYXNzd29yZFNlcnZpY2UuZ2V0SW5zdGFuY2UoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2U7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRPVFBTZXJ2aWNlUHJvdmlkZXIge1xuXHRwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogVE9UUFNlcnZpY2VJbnRlcmZhY2UgfCBudWxsID0gbnVsbDtcblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGdldFRPVFBTZXJ2aWNlKCk6IFByb21pc2U8VE9UUFNlcnZpY2VJbnRlcmZhY2U+IHtcblx0XHRpZiAoIXRoaXMuaW5zdGFuY2UpIHtcblx0XHRcdHRoaXMuaW5zdGFuY2UgPSBhd2FpdCBUT1RQU2VydmljZS5nZXRJbnN0YW5jZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgWXViaWNvT1RQU2VydmljZVByb3ZpZGVyIHtcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFl1Ymljb09UUFNlcnZpY2VJbnRlcmZhY2UgfCBudWxsID0gbnVsbDtcblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGdldFl1Ymljb09UUFNlcnZpY2UoKTogUHJvbWlzZTxZdWJpY29PVFBTZXJ2aWNlSW50ZXJmYWNlPiB7XG5cdFx0aWYgKCF0aGlzLmluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlID0gYXdhaXQgWXViaWNvT1RQU2VydmljZS5nZXRJbnN0YW5jZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZTtcblx0fVxufVxuIl19
