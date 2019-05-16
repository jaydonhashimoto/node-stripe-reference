const express = require('express');
const keys = require('./config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const exphbs = require('express-handlebars');

const app = express();

//bodyParser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//handlebars middelware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//set static folder
app.use(express.static(`${__dirname}/public`));

//index route
app.get('/', (req, res) => {
    //render index page with pk value
    res.render('index', {
        stripePublishableKey: keys.stripePublishableKey
    });
});

//charge route
app.post('/charge', (req, res) => {
    //define amount
    const amount = 2500;
    //create customer
    stripe.customers.create({
        email: req.body.stripeEmail,
        name: req.body.stripeBillingName,
        address: {
            line1: req.body.stripeBillingAddressLine1,
            city: req.body.stripeBillingAddressCity,
            country: req.body.stripeBillingAddressCountry,
            postal_code: req.body.stripeBillingAddressZip
        },
        source: req.body.stripeToken
    })
        //charge customer
        .then(customer => stripe.charges.create({
            amount: amount,
            description: 'Web Development Ebook',
            currency: 'usd',
            customer: customer.id
        }))
        //render success page
        .then(charge => res.render('success'));
});

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port: ${PORT}`));