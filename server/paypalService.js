const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.paypal.com'; // Live PayPal API

const generateAccessToken = async () => {
    try {
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to generate access token:', error);
        throw error;
    }
};


const createOrder = async (amount) => {
    try {
        const accessToken = await generateAccessToken();
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount,
                },
                description: 'Course Payment'
            }],
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

const capturePayment = async (orderId) => {
    try {
        const accessToken = await generateAccessToken();
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to capture payment:', error);
        throw error;
    }
};

module.exports = { createOrder, capturePayment };
