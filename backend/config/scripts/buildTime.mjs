const { execSync } = await import('child_process');

const start = Date.now();

try {
	execSync('npm run build:original', { stdio: 'inherit' });
} catch (error) {
	console.error('Build process failed:', error);
}

const end = Date.now();
const time = (end - start) / 1000;

console.log(`\nBuild completed in ${time.toFixed(2)} seconds.`);
