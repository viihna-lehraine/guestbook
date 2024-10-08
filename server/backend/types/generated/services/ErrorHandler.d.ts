import { AppError, ClientError, ErrorSeverityType } from './ErrorClasses';
import { NextFunction, Request, Response } from 'express';
import { AppLoggerServiceInterface, ErrorHandlerServiceInterface, ErrorLoggerServiceInterface } from '../index/interfaces/main';
import { Sequelize } from 'sequelize';
export declare class ErrorHandlerService implements ErrorHandlerServiceInterface {
    private static instance;
    ErrorClasses: {
        AppAuthenticationError: typeof import("./ErrorClasses").AppAuthenticationError;
        AuthControllerError: typeof import("./ErrorClasses").AuthControllerError;
        AutoCorrectedInputWarning: typeof import("./ErrorClasses").AutoCorrectedInputWarning;
        CacheServiceError: typeof import("./ErrorClasses").CacheServiceError;
        ClientAuthenticationError: typeof import("./ErrorClasses").ClientAuthenticationError;
        ConcurrencyError: typeof import("./ErrorClasses").ConcurrencyError;
        ConfigurationError: typeof import("./ErrorClasses").ConfigurationError;
        ConfigurationErrorFatal: typeof import("./ErrorClasses").ConfigurationErrorFatal;
        ConflictError: typeof import("./ErrorClasses").ConflictError;
        DatabaseErrorFatal: typeof import("./ErrorClasses").DatabaseErrorFatal;
        DatabaseErrorRecoverable: typeof import("./ErrorClasses").DatabaseErrorRecoverable;
        DataIntegrityError: typeof import("./ErrorClasses").DataIntegrityError;
        DependencyErrorFatal: typeof import("./ErrorClasses").DependencyErrorFatal;
        DependencyErrorRecoverable: typeof import("./ErrorClasses").DependencyErrorRecoverable;
        DeprecatedApiWarning: typeof import("./ErrorClasses").DeprecatedApiWarning;
        ExpressError: typeof import("./ErrorClasses").ExpressError;
        ExpressRouteError: typeof import("./ErrorClasses").ExpressRouteError;
        ExternalServiceError: typeof import("./ErrorClasses").ExternalServiceError;
        ExternalServiceErrorFatal: typeof import("./ErrorClasses").ExternalServiceErrorFatal;
        FallbackSuccessInfo: typeof import("./ErrorClasses").FallbackSuccessInfo;
        FileProcessingError: typeof import("./ErrorClasses").FileProcessingError;
        ForbiddenError: typeof import("./ErrorClasses").ForbiddenError;
        HealthCheckError: typeof import("./ErrorClasses").HealthCheckError;
        HTTPSClientErrorFatal: typeof import("./ErrorClasses").HTTPSClientErrorFatal;
        HTTPSServerErrorRecoverable: typeof import("./ErrorClasses").HTTPSServerErrorRecoverable;
        InsufficientStorageError: typeof import("./ErrorClasses").InsufficientStorageError;
        InvalidCredentialsError: typeof import("./ErrorClasses").InvalidCredentialsError;
        InvalidInputError: typeof import("./ErrorClasses").InvalidInputError;
        InvalidTokenError: typeof import("./ErrorClasses").InvalidTokenError;
        MiddlewareServiceError: typeof import("./ErrorClasses").MiddlewareServiceError;
        MissingResourceError: typeof import("./ErrorClasses").MissingResourceError;
        PassportAuthServiceError: typeof import("./ErrorClasses").PassportAuthServiceError;
        PartialServiceFailureWarning: typeof import("./ErrorClasses").PartialServiceFailureWarning;
        PasswordValidationError: typeof import("./ErrorClasses").PasswordValidationError;
        PermissionDeniedError: typeof import("./ErrorClasses").PermissionDeniedError;
        QuotaExceededErrorFatal: typeof import("./ErrorClasses").QuotaExceededErrorFatal;
        QuotaExceededErrorRecoverable: typeof import("./ErrorClasses").QuotaExceededErrorRecoverable;
        QuotaExceededErrorWarning: typeof import("./ErrorClasses").QuotaExceededErrorWarning;
        RateLimitErrorFatal: typeof import("./ErrorClasses").RateLimitErrorFatal;
        RateLimitErrorRecoverable: typeof import("./ErrorClasses").RateLimitErrorRecoverable;
        RateLimitErrorWarning: typeof import("./ErrorClasses").RateLimitErrorWarning;
        RedisServiceError: typeof import("./ErrorClasses").RedisServiceError;
        ResourceManagerError: typeof import("./ErrorClasses").ResourceManagerError;
        RootMiddlewareError: typeof import("./ErrorClasses").RootMiddlewareError;
        ServerNotInitializedError: typeof import("./ErrorClasses").ServerNotInitializedError;
        ServiceDegradedError: typeof import("./ErrorClasses").ServiceDegradedError;
        ServiceDegradedErrorMinor: typeof import("./ErrorClasses").ServiceDegradedErrorMinor;
        ServiceUnavailableError: typeof import("./ErrorClasses").ServiceUnavailableError;
        ServiceUnavailableErrorFatal: typeof import("./ErrorClasses").ServiceUnavailableErrorFatal;
        SessionExpiredError: typeof import("./ErrorClasses").SessionExpiredError;
        SlowApiWarning: typeof import("./ErrorClasses").SlowApiWarning;
        TimeoutError: typeof import("./ErrorClasses").TimeoutError;
        UserActionInfo: typeof import("./ErrorClasses").UserActionInfo;
        UserRegistrationError: typeof import("./ErrorClasses").UserRegistrationError;
        UtilityErrorFatal: typeof import("./ErrorClasses").UtilityErrorFatal;
        UtilityErrorRecoverable: typeof import("./ErrorClasses").UtilityErrorRecoverable;
        ValidationError: typeof import("./ErrorClasses").ValidationError;
    };
    ErrorSeverity: {
        readonly FATAL: "fatal";
        readonly RECOVERABLE: "recoverable";
        readonly WARNING: "warning";
        readonly INFO: "info";
    };
    private logger;
    private errorLogger;
    private shutdownFunction;
    private constructor();
    static getInstance(logger: AppLoggerServiceInterface, errorLogger: ErrorLoggerServiceInterface): Promise<ErrorHandlerService>;
    handleError(params: {
        error: unknown;
        req?: Request;
        details?: Record<string, unknown>;
        severity?: ErrorSeverityType;
        action?: string;
        userId?: string;
        sequelize?: Sequelize;
    }): void;
    expressErrorHandler(): (err: AppError | ClientError | Error | Record<string, unknown>, req: Request, res: Response, next: NextFunction) => void;
    handleCriticalError(params: {
        error: unknown;
        req?: Request;
        details?: Record<string, unknown>;
    }): void;
    sendClientErrorResponse({ message, res, responseId, statusCode }: {
        message: string;
        statusCode?: number;
        res: Response;
        responseId?: string;
    }): Promise<void>;
    initializeGlobalErrorHandlers(): void;
    setShutdownHandler(shutdownFn: () => Promise<void>): void;
    private performGracefulShutdown;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=ErrorHandler.d.ts.map
