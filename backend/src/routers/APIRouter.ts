import { BaseRouter } from './BaseRouter';
import { NextFunction, Request, Response, Router } from 'express';
import { ServiceFactory } from '../index/factory';
import { check } from 'express-validator';
import { handleValidationErrors } from '../utils/validator';

export class APIRouter extends BaseRouter {
	private userController = ServiceFactory.getUserController();
	private authController = ServiceFactory.getAuthController();

	private constructor() {
		super();
		this.setUpAPIRoutes();
	}

	private setUpAPIRoutes(): void {
		this.router.post(
			'/register.html',
			[
				check('username')
					.isLength({ min: 3 })
					.withMessage('Username must be at least 3 characters long')
					.trim()
					.escape(),
				check('email')
					.isEmail()
					.withMessage('Please provide a valid email address')
					.normalizeEmail(),
				check('password')
					.isLength({ min: 8 })
					.withMessage('Password must be at least 8 characters long')
					.matches(/[A-Z]/)
					.withMessage(
						'Password must contain at least one uppercase letter'
					)
					.matches(/[a-z]/)
					.withMessage(
						'Password must contain at least one lowercase letter'
					)
					.matches(/\d/)
					.withMessage('Password must contain at least one digit')
					.matches(/[^\w\s]/)
					.withMessage(
						'Password must contain at least one special character'
					),
				check('confirmPassword')
					.custom((value, { req }) => value === req.body.password)
					.withMessage('Passwords do not match'),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					try {
						const result = await this.userController.createUser(
							req.body
						);
						return res.json(result);
					} catch (err) {
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/login',
			[
				check('email')
					.isEmail()
					.withMessage('Please provide a valid email address')
					.normalizeEmail(),
				check('password')
					.notEmpty()
					.withMessage('Password is required'),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					const cacheKey = `login:${req.body.email}`;
					const cachedResponse = await this.cacheService.get(
						cacheKey,
						'userLogin'
					);
					if (cachedResponse) {
						return res.json(cachedResponse);
					}

					try {
						const result = await this.authController.loginUser(
							req.body.email,
							req.body.password
						);
						await this.cacheService.set(
							cacheKey,
							result,
							'userLogin',
							3600
						);
						return res.json(result);
					} catch (err) {
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/recover-password',
			[
				check('email')
					.isEmail()
					.withMessage('Please provide a valid email address')
					.normalizeEmail(),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					const cacheKey = `recover-password:${req.body.email}`;
					const cachedResponse = await this.cacheService.get(
						cacheKey,
						'recoverPassword'
					);
					if (cachedResponse) {
						return res.json(cachedResponse);
					}

					try {
						await this.authController.recoverPassword(
							req.body.email
						);
						const response = {
							message: 'Password recovery email sent'
						};
						await this.cacheService.set(
							cacheKey,
							response,
							'recoverPassword',
							3600
						);
						return res.json(response);
					} catch (err) {
						this.errorLogger.logError('Password recovery failed');
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/generate-totp',
			[
				check('userId').notEmpty().withMessage('User ID is required'),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					const cacheKey = `generate-totp:${req.body.userId}`;
					const cachedResponse = await this.cacheService.get(
						cacheKey,
						'generateTOTP'
					);
					if (cachedResponse) {
						return res.json(cachedResponse);
					}

					try {
						const result = await this.authController.generateTOTP(
							req.body.userId
						);
						await this.cacheService.set(
							cacheKey,
							result,
							'generateTOTP',
							3600
						);
						return res.json(result);
					} catch (err) {
						this.errorLogger.logError('TOTP generation failed');
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/verify-totp',
			[
				check('userId').notEmpty().withMessage('User ID is required'),
				check('token').notEmpty().withMessage('Token is required'),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					try {
						const isValid = await this.authController.verifyTOTP(
							req.body.userId,
							req.body.token
						);
						return res.json({ isValid });
					} catch (err) {
						this.errorLogger.logError('TOTP verification failed');
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/generate-email-mfa',
			[
				check('email')
					.isEmail()
					.withMessage('Please provide a valid email address')
					.normalizeEmail(),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					const cacheKey = `generate-email-mfa:${req.body.email}`;
					const cachedResponse = await this.cacheService.get(
						cacheKey,
						'generateEmailMFA'
					);
					if (cachedResponse) {
						return res.json(cachedResponse);
					}

					try {
						await this.authController.generateEmailMFACode(
							req.body.email
						);
						const response = { message: 'MFA code sent' };
						await this.cacheService.set(
							cacheKey,
							response,
							'generateEmailMFA',
							3600
						);
						return res.json(response);
					} catch (err) {
						this.errorLogger.logError(
							'Email MFA generation failed'
						);
						next(err);
						return;
					}
				}
			)
		);

		this.router.post(
			'/verify-email-mfa',
			[
				check('email')
					.isEmail()
					.withMessage('Please provide a valid email address')
					.normalizeEmail(),
				check('emailMFACode')
					.notEmpty()
					.withMessage('MFA code is required'),
				handleValidationErrors
			],
			this.asyncHandler(
				async (req: Request, res: Response, next: NextFunction) => {
					try {
						const isValid =
							await this.authController.verifyEmailMFACode(
								req.body.email,
								req.body.email2FACode
							);
						return res.json({ isValid });
					} catch (err) {
						this.errorLogger.logError(
							'Email 2FA verification failed'
						);
						next(err);
						return;
					}
				}
			)
		);
	}

	public getAPIRouter(): Router {
		return this.router;
	}
}
