const { pool } = require('../config/db');

const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      'SELECT * FROM carts WHERE user_id = $1',
      [req.user.id]
    );
    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart not found' });
    }
    const cart = cartResult.rows[0];

    const itemsResult = await client.query(
      `SELECT ci.*, p.title, p.price, p.stock, p.active, p.seller_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );
    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of itemsResult.rows) {
      if (!item.active) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Product "${item.title}" is not active` });
      }
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${item.title}"` });
      }
    }

    const lockedProducts = await client.query(
      `SELECT p.id, p.stock FROM products p
       JOIN cart_items ci ON ci.product_id = p.id
       WHERE ci.cart_id = $1 FOR UPDATE`,
      [cart.id]
    );
    for (const locked of lockedProducts.rows) {
      const cartItem = itemsResult.rows.find(i => i.product_id === locked.id);
      if (cartItem && locked.stock < cartItem.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${cartItem.title}"` });
      }
    }

    const totalAmount = itemsResult.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { shipping_address_id } = req.body;

    let addressId = shipping_address_id;
    if (!addressId) {
      const defaultAddress = await client.query(
        'SELECT id FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [req.user.id]
      );
      if (defaultAddress.rows.length > 0) {
        addressId = defaultAddress.rows[0].id;
      }
    }

    const orderNumber = `ZY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, orderNumber, totalAmount, 'pending', addressId || null]
    );
    const order = orderResult.rows[0];

    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CreateOrder error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, a.label as address_label, a.street, a.city, a.state, a.zip, a.country
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.*, a.label as address_label, a.street, a.city, a.state, a.zip, a.country
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.user.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.title, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ order: orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error('GetOrder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, getOrder };