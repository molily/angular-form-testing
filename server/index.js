const express = require('express');
const rateLimit = require('express-rate-limit');
const zxcvbn = require('zxcvbn');

/**
 * Regular expression for validating an email address.
 * Taken from Angular:
 * https://github.com/angular/angular/blob/43b4940c9d595c542a00795976bc3168dd0ca5af/packages/forms/src/validators.ts#L68-L99
 * Copyright Google LLC All Rights Reserved. MIT-style license: https://angular.io/license
 */
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const USERNAME_REGEXP = /^[a-zA-Z0-9_]+$/;

/**
 * Holds the users in memory.
 */
const users = new Map();

const app = express();
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(apiLimiter);

app.post('/password-strength', function (req, res) {
  const { password } = req.body;
  if (!(typeof password === 'string' && password !== '' && password.length < 100)) {
    res.sendStatus(400);
    return;
  }
  const result = zxcvbn(password);
  res.send({
    score: result.score,
    warning: result.feedback.warning,
    suggestions: result.feedback.suggestions,
  });
});

app.post('/username-taken', function (req, res) {
  const { username } = req.body;
  if (!(typeof username === 'string' && username !== '' && username.length < 100)) {
    res.sendStatus(400);
    return;
  }
  res.send({ usernameTaken: users.has(username) });
});

const validateSignup = (body) => {
  const errors = [];
  if (!body) {
    errors.push('Bad request');
    return errors;
  }
  const { username, email, password } = body;
  if (
    !(
      typeof username === 'string' &&
      USERNAME_REGEXP.test(username) &&
      !users.has(username)
    )
  ) {
    errors.push('Username invalid');
  }
  if (!(typeof email === 'string' && EMAIL_REGEXP.test(email))) {
    errors.push('Email invalid');
  }
  if (!(typeof password === 'string' && zxcvbn(password).score >= 3)) {
    errors.push('Password invalid');
  }
  return errors;
};

app.post('/signup', function (req, res) {
  const errors = validateSignup(req.body);
  if (errors.length > 0) {
    res.status(400).send({ errors });
    return;
  }
  const { username, email, password } = req.body;
  users.set(username, {
    username,
    email,
    password,
  });
  console.log(`Successful signup: ${username}`);
  res.send({ success: true });
});

app.listen(3000);
console.log('Server running.');
