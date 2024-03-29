const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");

// Begins a transaction to insert customer and order details, then each item in the order
// Commits the transaction if successful or rolls back in case of error
router.post("/", async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, phone, onlinePayment, total, time, items } =
    req.body;

  try {
    await pool.query("BEGIN");
    const customerInsertQuery = `
      INSERT INTO customer (first_name, last_name, phone, online_payment)
      VALUES ($1, $2, $3, $4) RETURNING customer_id;
    `;

    const customerResult = await pool.query(customerInsertQuery, [
      firstName,
      lastName,
      phone,
      onlinePayment,
    ]);
    const customerId = customerResult.rows[0].customer_id;
    const orderInsertQuery = `
      INSERT INTO orders (user_id, customer_id, total, time, order_status)
      VALUES ($1, $2, $3, $4, $5) RETURNING order_id;
    `;

    const orderResult = await pool.query(orderInsertQuery, [
      userId,
      customerId,
      total,
      time,
      false,
    ]);
    const orderId = orderResult.rows[0].order_id;

    for (const item of items) {
      const lineItemInsertQuery = `
        INSERT INTO line_item (order_id, menu_item_id, quantity, notes)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(lineItemInsertQuery, [
        orderId,
        item.menuItemId,
        item.quantity,
        item.notes,
      ]);
    }

    await pool.query("COMMIT");
    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error processing order:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// Executes a JOIN query to combine 'orders' and 'customer' data
// retrieving order details and customer contact information
router.get("/", (req, res) => {
  if (req.isAuthenticated() && req.user.access_level === true) {
    pool
      .query(
        `SELECT o.user_id, o.order_id, o.time, o.order_status, c.first_name, c.last_name, c.phone
       FROM orders o
       JOIN customer c ON o.customer_id = c.customer_id
       ORDER by o.time desc;`
      )
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        console.log("Error GET /api/orders", error);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

router.delete("/:id", (req, res) => {
  if (req.isAuthenticated() && req.user.access_level === true)
    pool
      .query('DELETE FROM "orders" WHERE order_id=$1', [req.params.id])
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log("Error DELETE /api/orders", error);
        res.sendStatus(500);
      });
});

router.put("/:id", (req, res) => {
  if (req.isAuthenticated() && req.user.access_level === true)
    pool
      .query(
        `UPDATE orders
  SET order_status = 'true'
  WHERE order_id = $1;
  `,
        [req.params.id]
      )
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log("Error DELETE /api/orders", error);
        res.sendStatus(500);
      });
});

module.exports = router;
