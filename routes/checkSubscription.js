const express = require('express');

const request = require('request-promise-any');

const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Stripe = require("./stripe");

const baseUrl = "http://bhaveshnetflix.live/";

let selectFunction = (item) => {
  let options = {
    method: "POST",
    url: baseUrl + "select.php",
    formData: {
      select_query: item,
    },
  };
  return options;
};

router.post('/checkSubscription',async (req, res, next) => {
	const email = req.body.email;

	let opt1 = selectFunction(
	    "select session_id from users where email = '"
	    .concat(`${email}`)
	    .concat("'")
	);
	
	let isActive = false;

	try {
		request(opt1, async (error, response) => {
      if (error) throw new Error(error);
      else {
       	let z = JSON.parse(response.body);

       	if (z[0].session_id === 'null') {
       		isActive = false;
					return res.json({
					  isActive
					})
       	}
       	else {
       		const session_id = z[0].session_id;

	       	const session = await stripe.checkout.sessions.retrieve(session_id);
	       	// console.log(session, session.subscription);
	       	const sub_id = session.subscription;
	       	// console.log(sub_id);

	       	if (sub_id !== null) {
		        const subscription = await Stripe.retrieveSubscription(sub_id);
		        // console.log(subscription.status);
						// console.log(subscription.current_period_start, subscription.current_period_end);
						// const start = subscription.current_period_start * 1000;
						const end = subscription.current_period_end * 1000;
						const nowDate = new Date().getTime();
						// const startDate = new Date(start).getTime();
						const endDate = new Date(end).getTime();
						const diffTime = endDate - nowDate;
						const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
						// console.log(new Date(end).getDate(), new Date(start).getDate(), daysLeft);

						if(subscription.status === 'active' || subscription.status === 'trialing') {
						 	isActive = true;
						 	return res.json({
						 		isActive,
						 		daysLeft
							})
						}	
						else {
							isActive = false;
							return res.json({
								isActive
							})
						}						
					}
					else {
						isActive = false;
						return res.json({
							isActive
						})
					}					
		    }
      }
    })
	}
	catch(err) {
		isActive = false;
	  return res.json({
	  	isActive
		})
	}
})

module.exports = router;