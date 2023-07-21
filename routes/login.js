const express = require('express');

const request = require("request-promise-any");

const router = express.Router();

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

router.post('/login', (req, res, next) => {
	const { email, password } = req.body;
  // return res.json({ email: email, password: password });

  let options = selectFunction(
      "select * from users where email = '"
        .concat(`${email}`)
        .concat("'")
    );
  let isRegistered = false;

    try {
      request(options, function (error, response) {
        if (error) throw new Error(error);
        else {
          let x = JSON.parse(response.body);
          // console.log(x);
          
          if (x.length === 0) {
            isRegistered = false;
            // invalid email
            // return res.redirect('/register');
            return res.json({ isRegistered, 'message': 'Invalid Email' });
          }
          else {
            if (x[0].password === password) {
              isRegistered = true;
              return res.json({ isRegistered, 'message': 'Successfully LoggedIn' });
              // req.session.isLoggedIn = true;
              // req.session.user = x[1];
              // req.session.save(err => {
              //   // successfully logged in
              //   // return res.redirect('/');
              //   if (!err) return res.json({ isRegistered });
              // })
            }
            else {
              isRegistered = true;
              // invalid password
              // return res.redirect('/login');
              return res.json({ isRegistered, 'message': 'Invalid Password' });
            }
          }
        }
      });
    }
    catch(error) {
      isRegistered = false;
      return res.json({ isRegistered, 'message': 'Error' });
    }
})

module.exports = router;