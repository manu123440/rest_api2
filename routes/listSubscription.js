const express = require('express');

const request = require('request-promise-any');

const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Stripe = require("./stripe");

router.post('/listSubscription',async (req, res, next) => {
	let isSuccess = false;
	try {
		const subscription = await stripe.subscriptions.list({});
		// let array = subscription.data.map(i => {
		// 	return i.plan;
		// })
		// console.log(array);
		// console.log(subscription.data);
		if(subscription.data.length === 0) {
			isSuccess = false;
			return res.json({
				isSuccess
			})
		}
		else {
			isSuccess = true;
		 	return res.json({
		 		isSuccess,
		 		data: subscription.data
			})
		}
	}
	catch(err) {
		isSuccess = false;
	  	return res.json({
		  	isSuccess
		})
	}
})

module.exports = router;