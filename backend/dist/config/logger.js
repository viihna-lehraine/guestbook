import pkg from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { createLogger, format, transports } = pkg;
const { combine, timestamp, printf, colorize, errors, json } = format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
	return `${timestamp}, ${level}: ${stack || message}`;
});
function setupLogger() {
	const logger = createLogger({
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
				filename: 'server-%DATE%.log',
				dirname: './data/logs/server/main',
				datePattern: 'YYYY-MM-DD',
				zippedArchive: true,
				maxSize: '20m',
				maxFiles: '14d',
				format: combine(
					timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
					logFormat
				)
			})
		]
	});
	return logger;
}
export default setupLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sU0FBUyxDQUFDO0FBQzFCLE9BQU8sZUFBZSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNqRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFFdEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO0lBQ2pFLE9BQU8sR0FBRyxTQUFTLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQztBQUVILFNBQVMsV0FBVztJQUNuQixNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDM0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQy9ELE1BQU0sRUFBRSxPQUFPLENBQ2QsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLENBQUMsRUFDNUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQ3ZCLElBQUksRUFBRSxDQUNOO1FBQ0QsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFO1FBQzdDLFVBQVUsRUFBRTtZQUNYLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLENBQUM7YUFDdEMsQ0FBQztZQUNGLElBQUksZUFBZSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixPQUFPLEVBQUUseUJBQXlCO2dCQUNsQyxXQUFXLEVBQUUsWUFBWTtnQkFDekIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFFBQVEsRUFBRSxLQUFLO2dCQUNmLE1BQU0sRUFBRSxPQUFPLENBQ2QsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLENBQUMsRUFDNUMsU0FBUyxDQUNUO2FBQ0QsQ0FBQztTQUNGO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBRUQsZUFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGtnIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IERhaWx5Um90YXRlRmlsZSBmcm9tICd3aW5zdG9uLWRhaWx5LXJvdGF0ZS1maWxlJztcblxuY29uc3QgeyBjcmVhdGVMb2dnZXIsIGZvcm1hdCwgdHJhbnNwb3J0cyB9ID0gcGtnO1xuY29uc3QgeyBjb21iaW5lLCB0aW1lc3RhbXAsIHByaW50ZiwgY29sb3JpemUsIGVycm9ycywganNvbiB9ID0gZm9ybWF0O1xuXG5jb25zdCBsb2dGb3JtYXQgPSBwcmludGYoKHsgbGV2ZWwsIG1lc3NhZ2UsIHRpbWVzdGFtcCwgc3RhY2sgfSkgPT4ge1xuXHRyZXR1cm4gYCR7dGltZXN0YW1wfSwgJHtsZXZlbH06ICR7c3RhY2sgfHwgbWVzc2FnZX1gO1xufSk7XG5cbmZ1bmN0aW9uIHNldHVwTG9nZ2VyKCk6IHBrZy5Mb2dnZXIge1xuXHRjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoe1xuXHRcdGxldmVsOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gJ2luZm8nIDogJ2RlYnVnJyxcblx0XHRmb3JtYXQ6IGNvbWJpbmUoXG5cdFx0XHR0aW1lc3RhbXAoeyBmb3JtYXQ6ICdZWVlZLU1NLUREIEhIOm1tOnNzJyB9KSxcblx0XHRcdGVycm9ycyh7IHN0YWNrOiB0cnVlIH0pLFxuXHRcdFx0anNvbigpXG5cdFx0KSxcblx0XHRkZWZhdWx0TWV0YTogeyBzZXJ2aWNlOiAnZ3Vlc3Rib29rLXNlcnZpY2UnIH0sXG5cdFx0dHJhbnNwb3J0czogW1xuXHRcdFx0bmV3IHRyYW5zcG9ydHMuQ29uc29sZSh7XG5cdFx0XHRcdGZvcm1hdDogY29tYmluZShjb2xvcml6ZSgpLCBsb2dGb3JtYXQpXG5cdFx0XHR9KSxcblx0XHRcdG5ldyBEYWlseVJvdGF0ZUZpbGUoe1xuXHRcdFx0XHRmaWxlbmFtZTogJ3NlcnZlci0lREFURSUubG9nJyxcblx0XHRcdFx0ZGlybmFtZTogJy4vZGF0YS9sb2dzL3NlcnZlci9tYWluJyxcblx0XHRcdFx0ZGF0ZVBhdHRlcm46ICdZWVlZLU1NLUREJyxcblx0XHRcdFx0emlwcGVkQXJjaGl2ZTogdHJ1ZSxcblx0XHRcdFx0bWF4U2l6ZTogJzIwbScsXG5cdFx0XHRcdG1heEZpbGVzOiAnMTRkJyxcblx0XHRcdFx0Zm9ybWF0OiBjb21iaW5lKFxuXHRcdFx0XHRcdHRpbWVzdGFtcCh7IGZvcm1hdDogJ1lZWVktTU0tREQgSEg6bW06c3MnIH0pLFxuXHRcdFx0XHRcdGxvZ0Zvcm1hdFxuXHRcdFx0XHQpXG5cdFx0XHR9KVxuXHRcdF1cblx0fSk7XG5cblx0cmV0dXJuIGxvZ2dlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2V0dXBMb2dnZXI7XG4iXX0=
