import { __awaiter } from 'tslib';
import nodemailer from 'nodemailer';
import getSecrets from './secrets.js';
function createTransporter() {
	return __awaiter(this, void 0, void 0, function* () {
		let secrets = yield getSecrets();
		let transporter = nodemailer.createTransport({
			host: secrets.EMAIL_HOST,
			port: secrets.EMAIL_PORT,
			secure: secrets.EMAIL_SECURE,
			auth: {
				user: process.env.EMAIL_USER,
				pass: secrets.SMTP_TOKEN
			}
		});
		return transporter;
	});
}
let transporter = null;
function getTransporter() {
	return __awaiter(this, void 0, void 0, function* () {
		if (!transporter) {
			transporter = yield createTransporter();
		}
		return transporter;
	});
}
export { createTransporter, getTransporter };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvY29uZmlnL21haWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxVQUEyQixNQUFNLFlBQVksQ0FBQztBQUNyRCxPQUFPLFVBQVUsTUFBTSxXQUFXLENBQUM7QUFFbkMsU0FBZSxpQkFBaUI7O1FBQy9CLElBQUksT0FBTyxHQUFHLE1BQU0sVUFBVSxFQUFFLENBQUM7UUFFakMsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQztZQUM1QyxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDeEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVO1lBQ3hCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWTtZQUM1QixJQUFJLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBb0I7Z0JBQ3RDLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVTthQUN4QjtTQUNELENBQUMsQ0FBQztRQUVILE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7Q0FBQTtBQUVELElBQUksV0FBVyxHQUF1QixJQUFJLENBQUM7QUFFM0MsU0FBZSxjQUFjOztRQUM1QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEIsV0FBVyxHQUFHLE1BQU0saUJBQWlCLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztDQUFBO0FBRUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5vZGVtYWlsZXIsIHsgVHJhbnNwb3J0ZXIgfSBmcm9tICdub2RlbWFpbGVyJztcbmltcG9ydCBnZXRTZWNyZXRzIGZyb20gJy4vc2VjcmV0cyc7XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRyYW5zcG9ydGVyKCk6IFByb21pc2U8VHJhbnNwb3J0ZXI+IHtcblx0bGV0IHNlY3JldHMgPSBhd2FpdCBnZXRTZWNyZXRzKCk7XG5cblx0bGV0IHRyYW5zcG9ydGVyID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQoe1xuXHRcdGhvc3Q6IHNlY3JldHMuRU1BSUxfSE9TVCxcblx0XHRwb3J0OiBzZWNyZXRzLkVNQUlMX1BPUlQsXG5cdFx0c2VjdXJlOiBzZWNyZXRzLkVNQUlMX1NFQ1VSRSxcblx0XHRhdXRoOiB7XG5cdFx0XHR1c2VyOiBwcm9jZXNzLmVudi5FTUFJTF9VU0VSIGFzIHN0cmluZyxcblx0XHRcdHBhc3M6IHNlY3JldHMuU01UUF9UT0tFTlxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHRyYW5zcG9ydGVyO1xufVxuXG5sZXQgdHJhbnNwb3J0ZXI6IFRyYW5zcG9ydGVyIHwgbnVsbCA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFRyYW5zcG9ydGVyKCk6IFByb21pc2U8VHJhbnNwb3J0ZXI+IHtcblx0aWYgKCF0cmFuc3BvcnRlcikge1xuXHRcdHRyYW5zcG9ydGVyID0gYXdhaXQgY3JlYXRlVHJhbnNwb3J0ZXIoKTtcblx0fVxuXHRyZXR1cm4gdHJhbnNwb3J0ZXI7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVRyYW5zcG9ydGVyLCBnZXRUcmFuc3BvcnRlciB9O1xuIl19
