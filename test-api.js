// Quick API test to bypass potential middleware issues
const fetch = require('node-fetch');

async function testAPIs() {
  console.log('🧪 Testing Restaurant Revolution v3 APIs...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test basic endpoints
  const tests = [
    { name: 'Main Page', url: '/' },
    { name: 'Restaurant Info', url: '/api/restaurant' },
    { name: 'Categories', url: '/api/categories?restaurantId=1' },
    { name: 'Menu Items', url: '/api/menu-items?restaurantId=1' },
    { name: 'Featured Items', url: '/api/menu-items/featured?restaurantId=1' },
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(`${baseUrl}${test.url}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ ${test.name}: OK (${data.length} chars)`);
      } else {
        console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

testAPIs();