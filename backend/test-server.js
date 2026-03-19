// Test script para verificar que el backend funciona
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

console.log('Testing backend connection...');
console.log(`URL: http://localhost:3001/api/health`);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Backend is running!');
    } else {
      console.log('❌ Backend returned error');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Cannot connect to backend:');
  console.error(e.message);
  console.log('\nPossible solutions:');
  console.log('1. Make sure backend is running: npm run server');
  console.log('2. Check if port 3001 is available');
  console.log('3. Check for firewall/antivirus blocking the port');
});

req.end();
