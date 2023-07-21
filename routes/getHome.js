const express = require('express');

const request = require("request-promise-any");

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

router.post('/videos', (req, res, next) => {
  const email = req.body.email;
  let opt1 = selectFunction(
      "select session_id from users where email = '"
      .concat(`${email}`)
      .concat("'")
  );  
	let isExpired = false;
  let array = [];

  try{
    request(opt1, async (error, response) => {
      if (error) throw new Error(error);
      else {
        let z = JSON.parse(response.body);

        // console.log(z);

        if(z[0] !== undefined) {
          const session_id = z[0].session_id;
          const session = await stripe.checkout.sessions.retrieve(session_id);

          if(session.subscription !== null) {
            const sub_id = session.subscription;
            const subscription = await Stripe.retrieveSubscription(sub_id);

            // console.log(subscription.status, subscription.cancel_at_period_end);

            if(subscription.cancel_at_period_end !== true) {
              if(subscription.status === 'active' || subscription.status === 'trialing') {
                isExpired = false;

                let opt2 = selectFunction("select * from videos where category = 'slider'");

                request(opt2, function (error, response) {
                  if (error) throw new Error(error);
                  else {
                    let x = JSON.parse(response.body);
                    // console.log('hii', x);

                    if (x.length >= 1) {
                      // console.log('ALL', x);
                      array.push({ "category": "slider", "child": x });

                      let opt3 = selectFunction("select * from videos ORDER BY timestamp ASC limit 5");
                      request(opt3, function (error, response) {
                        if (error) throw new Error(error);
                        else {
                          let y = JSON.parse(response.body);
                          if (y.length >= 1) {
                            // console.log('ASC', y);
                            array.push({ "category": "asc", "child": y });

                            let opt4 = selectFunction("select * from videos ORDER BY timestamp DESC limit 5");

                            request(opt4, function (error, response) {
                              if (error) throw new Error(error);
                              else {
                                let z1 = JSON.parse(response.body);
                                if (z1.length >= 1) {
                                  // console.log('DESC', z1);
                                  isExpired = false;
                                  array.push({ "category": "desc", "child": z1 });
                                  // console.log(array);
                                  return res.json({ isExpired, data: array });
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                    else {
                      return res.json([]);
                    }
                  }
                });
              }
              else {
                isExpired = true;
                return res.json({ isExpired });
              }
            }
            else {
              isExpired = true;
              return res.json({ isExpired });
            }
          }
          else {
            isExpired = true;
            return res.json({ isExpired });
          }
        }
        else {
              isExpired = true;
              return res.json({ isExpired });
        }
      }
    });
  }
  catch(err) {
    console.log(err);
    isExpired = true;
    return res.json({ isExpired });
  }
})

module.exports = router;