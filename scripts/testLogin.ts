import { AuthService } from '../server/auth/authService';
import { storage } from '../server/storage';

async function testLogin() {
  console.log('Testing login functionality...\n');

  try {
    // Test 1: Check if users exist
    console.log('1. Checking if users exist in database:');
    const ownerUser = await storage.getUserByUsername('owner');
    const customerUser = await storage.getUserByUsername('customer');

    console.log('Owner user:', ownerUser ? `✅ Found (id: ${ownerUser.id})` : '❌ Not found');
    console.log('Customer user:', customerUser ? `✅ Found (id: ${customerUser.id})` : '❌ Not found');

    if (!ownerUser || !customerUser) {
      console.error('\n❌ Users not found in database!');
      return;
    }

    // Test 2: Try to login as owner
    console.log('\n2. Testing login as owner (username: owner, password: owner123):');
    const ownerLogin = await AuthService.login({
      username: 'owner',
      password: 'owner123'
    });

    if (ownerLogin.success) {
      console.log('✅ Owner login successful!');
      console.log('   User:', ownerLogin.user?.name);
      console.log('   Role:', ownerLogin.user?.role);
      console.log('   Token generated:', ownerLogin.token?.substring(0, 20) + '...');
    } else {
      console.log('❌ Owner login failed:', ownerLogin.error);
    }

    // Test 3: Try to login as customer
    console.log('\n3. Testing login as customer (username: customer, password: customer123):');
    const customerLogin = await AuthService.login({
      username: 'customer',
      password: 'customer123'
    });

    if (customerLogin.success) {
      console.log('✅ Customer login successful!');
      console.log('   User:', customerLogin.user?.name);
      console.log('   Role:', customerLogin.user?.role);
      console.log('   Token generated:', customerLogin.token?.substring(0, 20) + '...');
    } else {
      console.log('❌ Customer login failed:', customerLogin.error);
    }

    // Test 4: Try with wrong password
    console.log('\n4. Testing with wrong password:');
    const wrongPassword = await AuthService.login({
      username: 'owner',
      password: 'wrongpassword'
    });

    if (!wrongPassword.success) {
      console.log('✅ Correctly rejected wrong password:', wrongPassword.error);
    } else {
      console.log('❌ Should have rejected wrong password!');
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    throw error;
  }
}

testLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
