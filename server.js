const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Create order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, customerEmail, customerPhone, customerName, plan } = req.body;
    const orderId = "order_" + Date.now();
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount || 99,
        order_currency: "INR",
        customer_details: {
          customer_id: "user_" + Date.now(),
          customer_email: customerEmail || "customer@email.com",
          customer_phone: customerPhone || "9999999999",
          customer_name: customerName || "Customer"
        },
        order_meta: {
          return_url: "https://hiremagnet.in?payment=success&order_id={order_id}",
          notify_url: "https://backend-dnej.onrender.com/payment-webhook",
          payment_methods: "cc,dc,upi,nb,app,paylater"
        }
      })
    });
    const data = await response.json();
    if (data.payment_session_id) {
      res.json({
        payment_session_id: data.payment_session_id,
        order_id: data.order_id
      });
    } else {
      console.error("Cashfree error:", data);
      res.status(500).json({ error: "Failed to create order", details: data });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Payment webhook from Cashfree
app.post("/payment-webhook", async (req, res) => {
  res.json({ status: "ok" });
});

// Validate payment by checking order status
app.post("/validate-token", async (req, res) => {
  try {
    const { order_id } = req.body;
    const response = await fetch(
      `https://api.cashfree.com/pg/orders/${order_id}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01"
        }
      }
    );
    const data = await response.json();
    if (data.order_status === "PAID") {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error("Validate error:", err);
    res.status(500).json({ valid: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
