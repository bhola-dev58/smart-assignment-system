import bcrypt from 'bcrypt';
const password = '123456'; // Change to your desired password

const hash = await bcrypt.hash(password, 10);
console.log('Hashed password:', hash);