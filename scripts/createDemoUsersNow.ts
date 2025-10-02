import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUsers() {
  console.log('Creating demo users with hashed passwords...');

  try {
    // Hash passwords
    const ownerPassword = await bcrypt.hash('owner123', 12);
    const customerPassword = await bcrypt.hash('customer123', 12);

    console.log('Passwords hashed successfully');

    // Create owner user
    const { data: ownerData, error: ownerError } = await supabase
      .from('users')
      .insert({
        username: 'owner',
        email: 'owner@demo.com',
        password: ownerPassword,
        name: 'Demo Owner',
        phone: '555-0001',
        role: 'owner',
        restaurant_id: 1,
        email_verified: true,
        loyalty_points: 0
      })
      .select();

    if (ownerError) {
      console.error('Error creating owner:', ownerError);
    } else {
      console.log('✅ Owner user created: username=owner, password=owner123');
    }

    // Create customer user
    const { data: customerData, error: customerError } = await supabase
      .from('users')
      .insert({
        username: 'customer',
        email: 'customer@demo.com',
        password: customerPassword,
        name: 'Demo Customer',
        phone: '555-0002',
        role: 'customer',
        email_verified: true,
        loyalty_points: 0
      })
      .select();

    if (customerError) {
      console.error('Error creating customer:', customerError);
    } else {
      console.log('✅ Customer user created: username=customer, password=customer123');
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Owner: owner / owner123');
    console.log('Customer: customer / customer123');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
