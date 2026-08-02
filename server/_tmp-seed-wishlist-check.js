require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model.js');
const Product = require('./src/models/product.model.js');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({ name: /^WishlistCheck/ });
  await User.deleteOne({ email: 'wishlistcheck@example.com' });
  const admin = await User.create({ name: 'Check', email: 'wishlistcheck@example.com', password: 'password123', role: 'admin' });
  const p = await Product.create({
    name: 'WishlistCheck Product',
    description: 'temporary product to check the wishlist button fix',
    price: 100,
    category: 'other',
    stock: 10,
    createdBy: admin._id,
  });
  console.log('ID:', p._id.toString());
  await mongoose.disconnect();
  process.exit(0);
})();
