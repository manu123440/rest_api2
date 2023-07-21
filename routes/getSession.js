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

router.post('/listSession', async (req, res, next) => {
	const email = req.body.email;
	let isActive = false;

	let opt1 = selectFunction(
	  "select session_id from users where email = '"
	    .concat(`${email}`)
	    .concat("'")
	);

	try {
		request(opt1, async (error, response) => {
	    if (error) throw new Error(error);
	    else {
	      let z = JSON.parse(response.body);
	      // console.log(z, z.length === 0);
	      if (z.length === 0) {
	      	isActive = false;
					return res.json({
					 	isActive,
					 	session_id: 'null'
					})
	      }
	      else {
	      	const session = await stripe.checkout.sessions.retrieve(z[0].session_id);
		     	// console.log(session, session.subscription);
		     	isActive = true;
					return res.json({
						isActive,
					 	sessionId: z[0].session_id
					})
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