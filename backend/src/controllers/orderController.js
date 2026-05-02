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
      `SELECT ci.*, p.title, p.price, p.stock_quantity, p.status, p.seller_id
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
      if (item.status !== 'active') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Product "${item.title}" is not active` });
      }
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${item.title}"` });
      }
    }

    const lockedProducts = await client.query(
      `SELECT p.id, p.stock_quantity FROM products p
       JOIN cart_items ci ON ci.product_id = p.id
       WHERE ci.cart_id = $1 FOR UPDATE`,
      [cart.id]
    );
    for (const locked of lockedProducts.rows) {
      const cartItem = itemsResult.rows.find(i => i.product_id === locked.id);
      if (cartItem && locked.stock_quantity < cartItem.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${cartItem.title}"` });
      }
    }

    const totalAmount = itemsResult.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { shipping_address_id } = req.body;

    let addressId = shipping_address_id;
    let addressText = null;
    
    if (!addressId) {
      const defaultAddress = await client.query(
        'SELECT id, street, city, state, zip FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [req.user.id]
      );
      if (defaultAddress.rows.length > 0) {
        const addr = defaultAddress.rows[0];
        addressId = addr.id;
        addressText = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
      } else {
        const anyAddress = await client.query(
          'SELECT id, street, city, state, zip FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
          [req.user.id]
        );
        if (anyAddress.rows.length > 0) {
          const addr = anyAddress.rows[0];
          addressId = addr.id;
          addressText = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
        }
      }
    } else {
      const addrResult = await client.query(
        'SELECT street, city, state, zip FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, req.user.id]
      );
      if (addrResult.rows.length > 0) {
        const addr = addrResult.rows[0];
        addressText = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
      }
    }

    if (!addressText) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No shipping address found. Please add a shipping address in your profile.' });
    }

    const orderNumber = `ZY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, status, payment_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, orderNumber, totalAmount, 'pending', 'pending', addressText]
    );
    const order = orderResult.rows[0];

    for (const item of itemsResult.rows) {
      const subtotal = item.price * item.quantity;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, title, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.product_id, item.seller_id, item.title, item.quantity, item.price, subtotal]
      );
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
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
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Fetch items for all orders
    const orders = [];
    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      // Derive effective status from items
      const items = itemsResult.rows;
      let effectiveStatus = order.status;
      if (items.length > 0) {
        const statuses = items.map(i => i.status);
        if (statuses.every(s => s === 'delivered')) effectiveStatus = 'delivered';
        else if (statuses.every(s => s === 'cancelled')) effectiveStatus = 'cancelled';
        else if (statuses.some(s => s === 'shipped')) effectiveStatus = 'shipped';
        else if (statuses.some(s => s === 'processing')) effectiveStatus = 'processing';
      }
      orders.push({ ...order, status: effectiveStatus, items });
    }

    res.json({ orders });
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    res.json({ order: orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error('GetOrder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status, o.shipping_address, o.created_at,
              oi.id as item_id, oi.product_id, oi.title, oi.quantity, oi.price, oi.subtotal, oi.status as item_status,
              u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN users u ON u.id = o.user_id
       WHERE oi.seller_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('GetSellerOrders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSellerOrderItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    if (!status || !['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: processing, shipped, delivered, or cancelled' });
    }

    const result = await pool.query(
      `UPDATE order_items 
       SET status = $1, updated_at = now()
       WHERE id = $2 AND seller_id = $3
       RETURNING *`,
      [status, itemId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order item not found or already updated' });
    }
    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('UpdateSellerOrderItem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, getOrder, getSellerOrders, updateSellerOrderItem };