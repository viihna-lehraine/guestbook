import { RateLimiterMemory } from 'rate-limiter-flexible';
const rateLimiter = new RateLimiterMemory({
	points: 100, // 100 requests
	duration: 60, // per 60 seconds, by IP
	keyPrefix: 'rateLimiter' // useful for distinguishing rate limiters in logs or in distributed setups
});
export const rateLimitMiddleware = (req, res, next) => {
	let ip = req.ip || 'unknown'; // provides fallback if req.ip is undefined
	rateLimiter
		.consume(ip)
		.then(() => {
			next();
		})
		.catch(() => {
			res.status(429).send('Too many requests');
		});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0ZUxpbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvbWlkZGxld2FyZS9yYXRlTGltaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQztJQUN6QyxNQUFNLEVBQUUsR0FBRyxFQUFFLGVBQWU7SUFDNUIsUUFBUSxFQUFFLEVBQUUsRUFBRSx3QkFBd0I7SUFDdEMsU0FBUyxFQUFFLGFBQWEsQ0FBQywyRUFBMkU7Q0FDcEcsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsQ0FDbEMsR0FBWSxFQUNaLEdBQWEsRUFDYixJQUFrQixFQUNqQixFQUFFO0lBQ0gsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQywyQ0FBMkM7SUFFekUsV0FBVztTQUNULE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDWCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1YsSUFBSSxFQUFFLENBQUM7SUFDUixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IFJhdGVMaW1pdGVyTWVtb3J5IH0gZnJvbSAncmF0ZS1saW1pdGVyLWZsZXhpYmxlJztcblxuY29uc3QgcmF0ZUxpbWl0ZXIgPSBuZXcgUmF0ZUxpbWl0ZXJNZW1vcnkoe1xuXHRwb2ludHM6IDEwMCwgLy8gMTAwIHJlcXVlc3RzXG5cdGR1cmF0aW9uOiA2MCwgLy8gcGVyIDYwIHNlY29uZHMsIGJ5IElQXG5cdGtleVByZWZpeDogJ3JhdGVMaW1pdGVyJyAvLyB1c2VmdWwgZm9yIGRpc3Rpbmd1aXNoaW5nIHJhdGUgbGltaXRlcnMgaW4gbG9ncyBvciBpbiBkaXN0cmlidXRlZCBzZXR1cHNcbn0pO1xuXG5leHBvcnQgY29uc3QgcmF0ZUxpbWl0TWlkZGxld2FyZSA9IChcblx0cmVxOiBSZXF1ZXN0LFxuXHRyZXM6IFJlc3BvbnNlLFxuXHRuZXh0OiBOZXh0RnVuY3Rpb25cbikgPT4ge1xuXHRsZXQgaXAgPSByZXEuaXAgfHwgJ3Vua25vd24nOyAvLyBwcm92aWRlcyBmYWxsYmFjayBpZiByZXEuaXAgaXMgdW5kZWZpbmVkXG5cblx0cmF0ZUxpbWl0ZXJcblx0XHQuY29uc3VtZShpcClcblx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRuZXh0KCk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0cmVzLnN0YXR1cyg0MjkpLnNlbmQoJ1RvbyBtYW55IHJlcXVlc3RzJyk7XG5cdFx0fSk7XG59O1xuIl19
