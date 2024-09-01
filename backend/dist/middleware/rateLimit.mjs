import { RateLimiterMemory } from 'rate-limiter-flexible';
const rateLimiter = new RateLimiterMemory({
	points: 10, // 10 requests
	duration: 1 // per 1 second by IP
});
export const rateLimitMiddleware = (req, res, next) => {
	const ip = req.ip || 'unknown'; // provides fallback if req.ip is undefined
	rateLimiter
		.consume(ip)
		.then(() => {
			next();
		})
		.catch(() => {
			res.status(429).send('Too Many Requests');
		});
};
export default rateLimitMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0ZUxpbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvcmF0ZUxpbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTFELE1BQU0sV0FBVyxHQUFHLElBQUksaUJBQWlCLENBQUM7SUFDekMsTUFBTSxFQUFFLEVBQUUsRUFBRSxjQUFjO0lBQzFCLFFBQVEsRUFBRSxDQUFDLENBQUMscUJBQXFCO0NBQ2pDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLENBQ2xDLEdBQVksRUFDWixHQUFhLEVBQ2IsSUFBa0IsRUFDWCxFQUFFO0lBQ1QsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQywyQ0FBMkM7SUFFM0UsV0FBVztTQUNULE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDWCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1YsSUFBSSxFQUFFLENBQUM7SUFDUixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLGVBQWUsbUJBQW1CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBSYXRlTGltaXRlck1lbW9yeSB9IGZyb20gJ3JhdGUtbGltaXRlci1mbGV4aWJsZSc7XG5cbmNvbnN0IHJhdGVMaW1pdGVyID0gbmV3IFJhdGVMaW1pdGVyTWVtb3J5KHtcblx0cG9pbnRzOiAxMCwgLy8gMTAgcmVxdWVzdHNcblx0ZHVyYXRpb246IDEgLy8gcGVyIDEgc2Vjb25kIGJ5IElQXG59KTtcblxuZXhwb3J0IGNvbnN0IHJhdGVMaW1pdE1pZGRsZXdhcmUgPSAoXG5cdHJlcTogUmVxdWVzdCxcblx0cmVzOiBSZXNwb25zZSxcblx0bmV4dDogTmV4dEZ1bmN0aW9uXG4pOiB2b2lkID0+IHtcblx0Y29uc3QgaXAgPSByZXEuaXAgfHwgJ3Vua25vd24nOyAvLyBwcm92aWRlcyBmYWxsYmFjayBpZiByZXEuaXAgaXMgdW5kZWZpbmVkXG5cblx0cmF0ZUxpbWl0ZXJcblx0XHQuY29uc3VtZShpcClcblx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRuZXh0KCk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0cmVzLnN0YXR1cyg0MjkpLnNlbmQoJ1RvbyBNYW55IFJlcXVlc3RzJyk7XG5cdFx0fSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCByYXRlTGltaXRNaWRkbGV3YXJlO1xuIl19
