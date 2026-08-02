require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model.js');
const Product = require('./src/models/product.model.js');

const TINY_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NiIvPjwvc3ZnPg==';

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({ name: /^Step13 Test/ });
  await User.deleteOne({ email: 'step13admin@example.com' });

  const admin = await User.create({ name: 'Step13 Admin', email: 'step13admin@example.com', password: 'password123', role: 'admin' });

  const products = [
    { name: 'Step13 Test Premium Widget', description: 'A high-end widget with a big price to test Indian currency grouping', price: 123456, category: 'electronics', stock: 20, images: [TINY_IMAGE], createdBy: admin._id },
    { name: 'Step13 Test Low Stock Item', description: 'This item is running low on stock', price: 499, category: 'home', stock: 3, createdBy: admin._id },
    { name: 'Step13 Test Sold Out Item', description: 'This item is completely out of stock', price: 999, category: 'clothing', stock: 0, createdBy: admin._id },
    { name: 'Step13 Test No Image Item', description: 'This item has no images uploaded yet', price: 250, category: 'books', stock: 15, createdBy: admin._id },
  ];

  // Pad to 13 total so pagination (limit=12) has a real 2nd page to test
  for (let i = 1; i <= 9; i += 1) {
    products.push({
      name: `Step13 Test Filler ${i}`,
      description: 'Filler product to trigger pagination onto a second page',
      price: 100 + i,
      category: 'other',
      stock: 10,
      createdBy: admin._id,
    });
  }

  const created = await Product.insertMany(products);
  console.log('Seeded', created.length, 'products');
  console.log('Premium Widget ID:', created[0]._id.toString());
  console.log('Low Stock ID:', created[1]._id.toString());
  console.log('Sold Out ID:', created[2]._id.toString());
  console.log('No Image ID:', created[3]._id.toString());

  await mongoose.disconnect();
  process.exit(0);
})();
