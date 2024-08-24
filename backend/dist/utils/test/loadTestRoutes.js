import testRoutes from '../../routes/testRoutes.js';
import setupLogger from '../../middleware/logger.js';
export function loadTestRoutes(app) {
	setupLogger()
		.then((logger) => {
			if (process.env.FEATURE_LOAD_TEST_ROUTES) {
				app.use('/test', testRoutes);
				logger.info('Test routes loaded');
			} else {
				logger.info(
					'Test routes not loaded; feature flag is set to FALSE'
				);
			}
		})
		.catch((err) => {
			console.error('Error setting up logger: ', err);
		});
}
export default loadTestRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZFRlc3RSb3V0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvdGVzdC9sb2FkVGVzdFJvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRCxPQUFPLFdBQVcsTUFBTSw0QkFBNEIsQ0FBQztBQUVyRCxNQUFNLFVBQVUsY0FBYyxDQUFDLEdBQXdCO0lBQ3RELFdBQVcsRUFBRTtTQUNYLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQ2hCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNuQyxDQUFDO2FBQU0sQ0FBQztZQUNQLE1BQU0sQ0FBQyxJQUFJLENBQ1Ysc0RBQXNELENBQ3RELENBQUM7UUFDSCxDQUFDO0lBQ0YsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELGVBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgdGVzdFJvdXRlcyBmcm9tICcuLi8uLi9yb3V0ZXMvdGVzdFJvdXRlcy5qcyc7XG5pbXBvcnQgc2V0dXBMb2dnZXIgZnJvbSAnLi4vLi4vbWlkZGxld2FyZS9sb2dnZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFRlc3RSb3V0ZXMoYXBwOiBleHByZXNzLkFwcGxpY2F0aW9uKTogdm9pZCB7XG5cdHNldHVwTG9nZ2VyKClcblx0XHQudGhlbigobG9nZ2VyKSA9PiB7XG5cdFx0XHRpZiAocHJvY2Vzcy5lbnYuRkVBVFVSRV9MT0FEX1RFU1RfUk9VVEVTKSB7XG5cdFx0XHRcdGFwcC51c2UoJy90ZXN0JywgdGVzdFJvdXRlcyk7XG5cdFx0XHRcdGxvZ2dlci5pbmZvKCdUZXN0IHJvdXRlcyBsb2FkZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxvZ2dlci5pbmZvKFxuXHRcdFx0XHRcdCdUZXN0IHJvdXRlcyBub3QgbG9hZGVkOyBmZWF0dXJlIGZsYWcgaXMgc2V0IHRvIEZBTFNFJ1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNldHRpbmcgdXAgbG9nZ2VyOiAnLCBlcnIpO1xuXHRcdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBsb2FkVGVzdFJvdXRlcztcbiJdfQ==
