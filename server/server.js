const express = require('express');
const path = require('path');
const { createOrder, capturePayment } = require('./paypalService');

const app = express();

app.use(express.json());  // Add this to parse JSON request bodies
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/checkout.html'));
});

app.post('/api/orders', async (req, res) => {
    try {
        const { amount, email } = req.body;  // Get amount and email from request body
        const order = await createOrder(amount);
        // Optionally, store email or other info in your database
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).send('Error creating order');
    }
});

app.post('/api/orders/:orderID/capture', async (req, res) => {
    try {
        const capture = await capturePayment(req.params.orderID);
        res.json(capture);
    } catch (error) {
        console.error('Error capturing payment:', error.message);
        res.status(500).send('Error capturing payment');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
