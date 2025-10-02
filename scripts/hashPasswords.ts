import bcrypt from 'bcryptjs';

async function hashPasswords() {
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const customerPassword = await bcrypt.hash('customer123', 12);

  console.log('Owner password hash:');
  console.log(ownerPassword);
  console.log('\nCustomer password hash:');
  console.log(customerPassword);
}

hashPasswords();
