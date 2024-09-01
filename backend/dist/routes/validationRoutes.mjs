import express from 'express';
import { validationResult } from 'express-validator';
import { createValidatorMiddleware } from '../middleware/validator.mjs';
const { registrationValidationRules } = createValidatorMiddleware({
	validator: (await import('validator')).default
});
export default function createValidationRoutes() {
	const router = express.Router();
	router.post(
		'/register',
		registrationValidationRules,
		async (req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			return next();
		}
	);
	return router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvblJvdXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvdmFsaWRhdGlvblJvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQW9ELE1BQU0sU0FBUyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3JELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXBFLE1BQU0sRUFBRSwyQkFBMkIsRUFBRSxHQUFHLHlCQUF5QixDQUFDO0lBQ2pFLFNBQVMsRUFBRSxDQUFDLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTztDQUM5QyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxVQUFVLHNCQUFzQjtJQUM3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFaEMsTUFBTSxDQUFDLElBQUksQ0FDVixXQUFXLEVBQ1gsMkJBQTJCLEVBQzNCLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCLEVBQUUsRUFBRTtRQUN6RCxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDdkIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxPQUFPLElBQUksRUFBRSxDQUFDO0lBQ2YsQ0FBQyxDQUNELENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcywgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uLCBSb3V0ZXIgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgeyBjcmVhdGVWYWxpZGF0b3JNaWRkbGV3YXJlIH0gZnJvbSAnLi4vbWlkZGxld2FyZS92YWxpZGF0b3InO1xuXG5jb25zdCB7IHJlZ2lzdHJhdGlvblZhbGlkYXRpb25SdWxlcyB9ID0gY3JlYXRlVmFsaWRhdG9yTWlkZGxld2FyZSh7XG5cdHZhbGlkYXRvcjogKGF3YWl0IGltcG9ydCgndmFsaWRhdG9yJykpLmRlZmF1bHRcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVWYWxpZGF0aW9uUm91dGVzKCk6IFJvdXRlciB7XG5cdGNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cblx0cm91dGVyLnBvc3QoXG5cdFx0Jy9yZWdpc3RlcicsXG5cdFx0cmVnaXN0cmF0aW9uVmFsaWRhdGlvblJ1bGVzLFxuXHRcdGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuXHRcdFx0aWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yczogZXJyb3JzLmFycmF5KCkgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0fVxuXHQpO1xuXG5cdHJldHVybiByb3V0ZXI7XG59XG4iXX0=
