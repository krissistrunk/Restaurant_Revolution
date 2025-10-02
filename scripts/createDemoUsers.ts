import { AuthService } from '../server/auth/authService';
import { log } from '../server/vite';

async function createDemoUsers() {
  console.log('Creating demo users with proper authentication...');

  try {
    // Create owner user
    const ownerResult = await AuthService.register({
      username: 'owner',
      email: 'owner@demo.com',
      password: 'owner123',
      name: 'Demo Owner',
      phone: '555-0001',
      role: 'owner',
      restaurantId: 1
    });

    if (ownerResult.success) {
      console.log('✅ Owner user created successfully');
      console.log('   Username: owner');
      console.log('   Password: owner123');
    } else {
      console.log(`⚠️  Owner creation: ${ownerResult.error}`);
    }

    // Create customer user
    const customerResult = await AuthService.register({
      username: 'customer',
      email: 'customer@demo.com',
      password: 'customer123',
      name: 'Demo Customer',
      phone: '555-0002',
      role: 'customer'
    });

    if (customerResult.success) {
      console.log('✅ Customer user created successfully');
      console.log('   Username: customer');
      console.log('   Password: customer123');
    } else {
      console.log(`⚠️  Customer creation: ${customerResult.error}`);
    }

    console.log('\n🎉 Demo users setup complete!');
    console.log('\nLogin credentials:');
    console.log('Owner: owner / owner123');
    console.log('Customer: customer / customer123');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createDemoUsers };
