const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Create order
app.post("/create-order", async (req, res) => {
  try {
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id: "order_" + Date.now(),
        order_amount: 49,
        order_currency: "INR",
        customer_details: {
          customer_id: "user_" + Date.now(),
          customer_email: "test@test.com",
          customer_phone: "9999999999"
        }
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send("Error creating order");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
