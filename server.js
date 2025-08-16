// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crud_demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Schema & Model
const ItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number
});
const Item = mongoose.model('Item', ItemSchema);

/* -----------------------
   V1: Basic Create
----------------------- */
app.post('/v1/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item); // 201 Created
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/* -----------------------
   V2: Validation
----------------------- */
app.post('/v2/items', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    const item = new Item({ name, quantity });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/* -----------------------
   V3: Consistent Response Format
----------------------- */
app.post('/v3/items', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
      return res.status(400).json({ success: false, data: null, error: 'Name and quantity are required' });
    }
    const item = new Item({ name, quantity });
    await item.save();
    res.status(201).json({ success: true, data: item, error: null });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Failed to create item' });
  }
});

/* -----------------------
   V4: Prevent Duplicates
----------------------- */
app.post('/v4/items', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }
    const exists = await Item.findOne({ name });
    if (exists) {
      return res.status(409).json({ error: 'Item already exists' });
    }
    const item = new Item({ name, quantity });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/* -----------------------
   V5: Default Values & Name Formatting
----------------------- */
app.post('/v5/items', async (req, res) => {
  try {
    let { name, quantity } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    quantity = quantity ?? 1; // Default to 1 if not provided
    name = name.trim().replace(/\b\w/g, c => c.toUpperCase()); // Title Case
    const item = new Item({ name, quantity });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/* -----------------------
   V6: Logging & Delay
----------------------- */
app.post('/v6/items', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /v6/items - Body:`, req.body);
  setTimeout(async () => {
    try {
      const item = new Item(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create item' });
    }
  }, 2000); // 2-second delay
});

// Start server
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
