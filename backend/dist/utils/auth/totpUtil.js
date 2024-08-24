import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
function generateTOTPSecret() {
	let totpSecret = speakeasy.generateSecret({ length: 20 });
	return {
		ascii: totpSecret.ascii || '',
		hex: totpSecret.hex || '',
		base32: totpSecret.base32 || '',
		otpauth_url: totpSecret.otpauth_url || ''
	};
}
function generateTOTPToken(secret) {
	let totpToken = speakeasy.totp({
		secret: secret,
		encoding: 'base32'
	});
	return totpToken;
}
function verifyTOTPToken(secret, token) {
	let isTOTPTokenValid = speakeasy.totp.verify({
		secret: secret,
		encoding: 'base32',
		token: token,
		window: 1 // gives leeway for clock drift
	});
	return isTOTPTokenValid;
}
async function generateQRCode(otpauth_url) {
	return await QRCode.toDataURL(otpauth_url);
}
export {
	generateTOTPSecret,
	generateTOTPToken,
	verifyTOTPToken,
	generateQRCode
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90cFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvYXV0aC90b3RwVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBUzVCLFNBQVMsa0JBQWtCO0lBQzFCLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxRCxPQUFPO1FBQ04sS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUM3QixHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxFQUFFO1FBQ3pCLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTSxJQUFJLEVBQUU7UUFDL0IsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLElBQUksRUFBRTtLQUN6QyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsTUFBYztJQUN4QyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQzlCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsUUFBUSxFQUFFLFFBQVE7S0FDbEIsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxTQUFTLENBQUM7QUFDbEIsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLE1BQWMsRUFBRSxLQUFhO0lBQ3JELElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDNUMsTUFBTSxFQUFFLE1BQU07UUFDZCxRQUFRLEVBQUUsUUFBUTtRQUNsQixLQUFLLEVBQUUsS0FBSztRQUNaLE1BQU0sRUFBRSxDQUFDLENBQUMsK0JBQStCO0tBQ3pDLENBQUMsQ0FBQztJQUNILE9BQU8sZ0JBQWdCLENBQUM7QUFDekIsQ0FBQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsV0FBbUI7SUFDaEQsT0FBTyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELE9BQU8sRUFDTixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixjQUFjLEVBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzcGVha2Vhc3kgZnJvbSAnc3BlYWtlYXN5JztcbmltcG9ydCBRUkNvZGUgZnJvbSAncXJjb2RlJztcblxuaW50ZXJmYWNlIFRPVFBTZWNyZXQge1xuXHRhc2NpaTogc3RyaW5nO1xuXHRoZXg6IHN0cmluZztcblx0YmFzZTMyOiBzdHJpbmc7XG5cdG90cGF1dGhfdXJsOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlVE9UUFNlY3JldCgpOiBUT1RQU2VjcmV0IHtcblx0bGV0IHRvdHBTZWNyZXQgPSBzcGVha2Vhc3kuZ2VuZXJhdGVTZWNyZXQoeyBsZW5ndGg6IDIwIH0pO1xuXHRyZXR1cm4ge1xuXHRcdGFzY2lpOiB0b3RwU2VjcmV0LmFzY2lpIHx8ICcnLFxuXHRcdGhleDogdG90cFNlY3JldC5oZXggfHwgJycsXG5cdFx0YmFzZTMyOiB0b3RwU2VjcmV0LmJhc2UzMiB8fCAnJyxcblx0XHRvdHBhdXRoX3VybDogdG90cFNlY3JldC5vdHBhdXRoX3VybCB8fCAnJ1xuXHR9O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVRPVFBUb2tlbihzZWNyZXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCB0b3RwVG9rZW4gPSBzcGVha2Vhc3kudG90cCh7XG5cdFx0c2VjcmV0OiBzZWNyZXQsXG5cdFx0ZW5jb2Rpbmc6ICdiYXNlMzInXG5cdH0pO1xuXHRyZXR1cm4gdG90cFRva2VuO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlUT1RQVG9rZW4oc2VjcmV0OiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpOiBib29sZWFuIHtcblx0bGV0IGlzVE9UUFRva2VuVmFsaWQgPSBzcGVha2Vhc3kudG90cC52ZXJpZnkoe1xuXHRcdHNlY3JldDogc2VjcmV0LFxuXHRcdGVuY29kaW5nOiAnYmFzZTMyJyxcblx0XHR0b2tlbjogdG9rZW4sXG5cdFx0d2luZG93OiAxIC8vIGdpdmVzIGxlZXdheSBmb3IgY2xvY2sgZHJpZnRcblx0fSk7XG5cdHJldHVybiBpc1RPVFBUb2tlblZhbGlkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVFSQ29kZShvdHBhdXRoX3VybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0cmV0dXJuIGF3YWl0IFFSQ29kZS50b0RhdGFVUkwob3RwYXV0aF91cmwpO1xufVxuXG5leHBvcnQge1xuXHRnZW5lcmF0ZVRPVFBTZWNyZXQsXG5cdGdlbmVyYXRlVE9UUFRva2VuLFxuXHR2ZXJpZnlUT1RQVG9rZW4sXG5cdGdlbmVyYXRlUVJDb2RlXG59O1xuIl19
