const express= require('express');
const mongoose= require('mongoose');
const paypal = require('paypal-rest-sdk');


const dotenv= require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Connected"))
.catch(err=>console.log(err))

const app= express();
app.use(express.json());
app.use(require('cors')());
app.use("/uploads",express.static("./uploads"))
paypal.configure({
    'mode': 'sandbox', 
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });


  app.get('/api/payment', (req, res) => {
    const { amount } = req.query;

    // Validate if amount is provided
    if (!amount) {
        return res.status(400).json({ success: false, message: 'Amount is required.' });
    }

    // Create a PayPal payment
    paypal.payment.create({
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            return_url: 'http://example.com/return',
            cancel_url: 'http://example.com/cancel'
        },
        transactions: [{
            amount: {
                total: amount,
                currency: 'USD'
            },
            description: 'This is the payment description.'
        }]
    }, function (error, payment) {
        if (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ success: false, error: error.message });
        } else {
            console.log('Payment created:', payment);
            res.status(200).json({ success: true, data: payment });
        }
    });
});



app.use("/api/product",require("./routes/product.route"))
app.use("/api/customer", require("./routes/customer.route"));
app.use("/api/order", require("./routes/order.route"));
app.listen(process.env.PORT,()=>{
    console.log("Server Started");
})