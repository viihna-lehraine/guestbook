import pkg from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import loadEnv from '../config/loadEnv';

const { createLogger, format, transports } = pkg;
const { combine, timestamp, printf, colorize, errors, json } = format;

let logFormat = printf(({ level, message, timestamp, stack }) => {
	return `${timestamp}, ${level}: ${stack || message}`;
});

async function setupLogger() {
	loadEnv();

	let logger = createLogger({
		level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
		format: combine(
			timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			errors({ stack: true }),
			json()
		),
		defaultMeta: { service: 'guestbook-service' },
		transports: [
			new transports.Console({
				format: combine(colorize(), logFormat)
			}),
			new DailyRotateFile({
				filename: './logs/server/error-%DATE%.log',
				dirname: './logs/server',
				datePattern: 'YYYY-MM-DD',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: '14d',
				format: logFormat
			})
		]
	});

	return logger;
}

export default setupLogger;
