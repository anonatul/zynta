const { pool } = require('../config/db');

const getCart = async (req, res) => {
  try {
    const cartResult = await pool.query(
      'SELECT * FROM carts WHERE user_id = $1',
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ cart: null, items: [] });
    }

    const cart = cartResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT ci.*, p.title, p.price, p.image_url, p.stock_quantity, p.status, p.seller_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    res.json({ cart, items: itemsResult.rows });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = productResult.rows[0];
    if (product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not active' });
    }
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cartResult = await pool.query(
      'SELECT * FROM carts WHERE user_id = $1',
      [req.user.id]
    );

    let cart;
    if (cartResult.rows.length === 0) {
      cartResult = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
      cart = cartResult.rows[0];
    } else {
      cart = cartResult.rows[0];
    }

    const existingItem = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, product_id]
    );

    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      const updateResult = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      );
      return res.json({ cartItem: updateResult.rows[0] });
    }

    const itemResult = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cart.id, product_id, quantity]
    );
    res.status(201).json({ cartItem: itemResult.rows[0] });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const itemResult = await pool.query(
      `SELECT ci.*, p.stock_quantity, p.status FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, req.user.id]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    const item = itemResult.rows[0];
    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Product is not active' });
    }
    if (item.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, itemId]
    );
    res.json({ cartItem: result.rows[0] });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await pool.query(
      `DELETE FROM cart_items ci USING carts c
       WHERE ci.cart_id = c.id AND ci.id = $1 AND c.user_id = $2 RETURNING ci.id`,
      [itemId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('RemoveCartItem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cart_items ci USING carts c
       WHERE ci.cart_id = c.id AND c.user_id = $1 RETURNING ci.id`,
      [req.user.id]
    );
    res.json({ message: 'Cart cleared', removed: result.rows.length });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };