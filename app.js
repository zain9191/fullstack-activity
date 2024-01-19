const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://zain:zain315216@firstcluster.bn3sbzb.mongodb.net/yourDatabaseName?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(error => {
    console.error('Connexion à MongoDB échouée!', error);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Import the Product model
const Product = require('./models/product');

// Routes
app.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  next();
});

app.get('/api/products/:id', async (req, res, next) => {
  const productId = req.params.id;

  try {
    // Find the product by ID in the database
    const product = await Product.findById(productId);

    if (!product) {
      // If the product is not found, return a 404 status
      return res.status(404).json({ message: 'Product not found' });
    }

    // If the product is found, return it in the response
    res.json({ product });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  next();
});

app.post('/api/products', async (req, res, next) => {
  const { name, description, price, inStock } = req.body;

  try {
    // Create a new product instance based on the request body
    const newProduct = new Product({
      name,
      description,
      price,
      inStock
    });

    // Save the new product to the database
    const savedProduct = await newProduct.save();

    // Return the saved product in the response
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    // Handle any errors that occur during the database save
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  next();
});

// Express route for updating a product by ID
app.put('/api/products/:id', async (req, res, next) => {
  const productId = req.params.id;
  const { name, description, price, inStock } = req.body;

  try {
    // Find the product by ID in the database
    const product = await Product.findById(productId);

    if (!product) {
      // If the product is not found, return a 404 status
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product fields with the new values
    product.name = name;
    product.description = description;
    product.price = price;
    product.inStock = inStock;

    // Save the updated product to the database
    const updatedProduct = await product.save();

    // Return a success message in the response
    res.json({ message: 'Modified!', product: updatedProduct });
  } catch (error) {
    // Handle any errors that occur during the database update
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  next();
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
  
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json({ message: 'Deleted!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});