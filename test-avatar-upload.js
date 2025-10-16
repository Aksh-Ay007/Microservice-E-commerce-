// Simple test script to verify avatar and banner upload functionality
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Adjust based on your setup
const TEST_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Test functions
async function testUserAvatarUpload() {
  console.log('🧪 Testing User Avatar Upload...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/update-avatar`, {
      fileName: TEST_IMAGE_BASE64
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': 'Bearer your-token-here'
      }
    });
    
    console.log('✅ User Avatar Upload Success:', response.data);
    return true;
  } catch (error) {
    console.error('❌ User Avatar Upload Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSellerAvatarUpload() {
  console.log('🧪 Testing Seller Avatar Upload...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/seller/update-avatar`, {
      fileName: TEST_IMAGE_BASE64
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add seller authentication headers if needed
        // 'Authorization': 'Bearer your-seller-token-here'
      }
    });
    
    console.log('✅ Seller Avatar Upload Success:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Seller Avatar Upload Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSellerBannerUpload() {
  console.log('🧪 Testing Seller Banner Upload...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/seller/update-banner`, {
      fileName: TEST_IMAGE_BASE64
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Add seller authentication headers if needed
        // 'Authorization': 'Bearer your-seller-token-here'
      }
    });
    
    console.log('✅ Seller Banner Upload Success:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Seller Banner Upload Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Avatar and Banner Upload Tests...\n');
  
  const results = {
    userAvatar: await testUserAvatarUpload(),
    sellerAvatar: await testSellerAvatarUpload(),
    sellerBanner: await testSellerBannerUpload()
  };
  
  console.log('\n📊 Test Results:');
  console.log('User Avatar Upload:', results.userAvatar ? '✅ PASS' : '❌ FAIL');
  console.log('Seller Avatar Upload:', results.sellerAvatar ? '✅ PASS' : '❌ FAIL');
  console.log('Seller Banner Upload:', results.sellerBanner ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}

// Export for use in other files
module.exports = {
  testUserAvatarUpload,
  testSellerAvatarUpload,
  testSellerBannerUpload,
  runTests
};

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}