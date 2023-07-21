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

router.post('/searchVideo', (req, res, next) => {
	const { title } = req.query;
	let isFound = false;

	try {
		let opt1 = selectFunction(
			"select * from videos where title LIKE '%"
			.concat(`${title}`)
			.concat("%'")
		);

		// console.log(opt1);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let z = JSON.parse(response.body);

				// console.log(z, z[0] !== undefined);

				if(z.length >= 1) {
					// console.log(z);
					// fetch video data
					isFound = true;
					return res.json({ isFound, data: z });
				}
				else {
					isFound = false;
					return res.json({ isFound });
				}
			}
		})
	}
	catch(err) {
		console.log(err);
		return res.json({ 'error': true });
	}
})

module.exports = router;