import { __awaiter } from 'tslib';
import { execSync } from 'child_process';
import path from 'path';
let __dirname = process.cwd();
function getDirectoryPath() {
	// Return the absolute path to the directory containing secrets.js
	return path.resolve(__dirname);
}
function getSecrets() {
	return __awaiter(this, void 0, void 0, function* () {
		try {
			let secretsPath = path.join(
				getDirectoryPath(),
				'../backend/config/secrets.json.gpg'
			);
			console.log('Resolved secrets path:', secretsPath); // debugging line to verify the correct path
			let decryptedSecrets = execSync(
				`sops -d --output-type json ${secretsPath}`
			).toString();
			return JSON.parse(decryptedSecrets);
		} catch (err) {
			console.error('Error retrieving secrets from SOPS: ', err);
			throw err;
		}
	});
}
export default getSecrets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL2NvbmZpZy9zZWNyZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUV4QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFOUIsU0FBUyxnQkFBZ0I7SUFDeEIsa0VBQWtFO0lBQ2xFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsU0FBZSxVQUFVOztRQUN4QixJQUFJLENBQUM7WUFDSixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUMxQixnQkFBZ0IsRUFBRSxFQUNsQixvQ0FBb0MsQ0FDcEMsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyw0Q0FBNEM7WUFDaEcsSUFBSSxnQkFBZ0IsR0FBRyxRQUFRLENBQzlCLDhCQUE4QixXQUFXLEVBQUUsQ0FDM0MsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzRCxNQUFNLEdBQUcsQ0FBQztRQUNYLENBQUM7SUFDRixDQUFDO0NBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxubGV0IF9fZGlybmFtZSA9IHByb2Nlc3MuY3dkKCk7XG5cbmZ1bmN0aW9uIGdldERpcmVjdG9yeVBhdGgoKSB7XG5cdC8vIFJldHVybiB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgc2VjcmV0cy5qc1xuXHRyZXR1cm4gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNlY3JldHMoKSB7XG5cdHRyeSB7XG5cdFx0bGV0IHNlY3JldHNQYXRoID0gcGF0aC5qb2luKFxuXHRcdFx0Z2V0RGlyZWN0b3J5UGF0aCgpLFxuXHRcdFx0Jy4uL2JhY2tlbmQvY29uZmlnL3NlY3JldHMuanNvbi5ncGcnXG5cdFx0KTtcblx0XHRjb25zb2xlLmxvZygnUmVzb2x2ZWQgc2VjcmV0cyBwYXRoOicsIHNlY3JldHNQYXRoKTsgLy8gZGVidWdnaW5nIGxpbmUgdG8gdmVyaWZ5IHRoZSBjb3JyZWN0IHBhdGhcblx0XHRsZXQgZGVjcnlwdGVkU2VjcmV0cyA9IGV4ZWNTeW5jKFxuXHRcdFx0YHNvcHMgLWQgLS1vdXRwdXQtdHlwZSBqc29uICR7c2VjcmV0c1BhdGh9YFxuXHRcdCkudG9TdHJpbmcoKTtcblx0XHRyZXR1cm4gSlNPTi5wYXJzZShkZWNyeXB0ZWRTZWNyZXRzKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Y29uc29sZS5lcnJvcignRXJyb3IgcmV0cmlldmluZyBzZWNyZXRzIGZyb20gU09QUzogJywgZXJyKTtcblx0XHR0aHJvdyBlcnI7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0U2VjcmV0cztcbiJdfQ==
