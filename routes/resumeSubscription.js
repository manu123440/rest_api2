const express = require('express');

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

router.post('/resumeSubscription', async (req, res, next) => {
	const email = req.body.email;

	// let opt1 = selectFunction(
	//     "select session_id from users where email = '"
	//     .concat(`${email}`)
	//     .concat("'")
	// );
	let isUpdated = false;

	try {
		const customer = await stripe.customers.list({
			email: email
		})

		if(customer.data.length < 0) {
			isUpdated = false;
			return res.json( { isUpdated });
		}
		else {
			// console.log(customer.data[0].id, customer);
			const customerID = customer.data[0].id;

			const sessionList = await Stripe.checkoutSession(customerID);
			console.log(sessionList);

			isUpdated = true;
			return res.json( { isUpdated });
		}
	}
	catch(err) {
		isUpdated = false;
		console.log(err);
		return res.json( { isUpdated });
	}

  // 	try {
  // 		request(opt1, async (error, response) => {
  //     		if (error) throw new Error(error);
  //     		else {
  //       		let z = JSON.parse(response.body);

  //       		if(z !== null && z[0] !== undefined) {
  //       			const session_id = z[0].session_id;
  //       			const session = await stripe.checkout.sessions.retrieve(session_id);

  //       			if(session.subscription !== null) {
  //       				const customer = await stripe.customers.list({
	// 						email: email
	// 					})
	// 					const customerId = customer.data[0].id;

	// 					let updateSub = '';

	// 					const subscriptions = await stripe.subscriptions.list({
	// 						customer: customerId,
	// 						status: 'active'
	// 					})

	// 					subscriptions.data.forEach(async (i) => {
	// 						// console.log(i.id);
	// 						let sub_id = i.id;
	// 						updateSub = await stripe.subscriptions.update(sub_id, {
	// 							cancel_at_period_end: false,
	// 							billing_cycle_anchor: 'now'
	// 						});
	// 					})

	// 					// console.log(subscriptions);
	// 					// console.log(updateSub);
	// 					// console.log(subscriptions.data);
  //       			}
  //       			else {
  //       				isUpdated = false
  //       				return res.json({
	// 						isUpdated
	// 					})
  //       			}
  //       		}
  //       		else {
  //       			isUpdated = false
  //       			return res.json({
	// 					isUpdated
	// 				})
  //       		}
  //       	}
  //       });
  // 	}
  // 	catch(err) {
	// 	console.log(err);
	// 	return res.json({ 'error': true });
	// }

})

module.exports = router;