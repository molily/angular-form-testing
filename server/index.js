const express = require('express');
const rateLimit = require('express-rate-limit');
const zxcvbn = require('zxcvbn');

/**
 * Fake service for the form example. This service does nothing useful
 * and just simulates input validation and signup. Do not use it in production.
 */

const PORT = process.env.PORT || 3000;

/**
 * Regular expression for validating an email address.
 * Taken from Angular:
 * https://github.com/angular/angular/blob/43b4940c9d595c542a00795976bc3168dd0ca5af/packages/forms/src/validators.ts#L68-L99
 * Copyright Google LLC All Rights Reserved.
 * MIT-style license: https://angular.io/license
 */
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const USERNAME_REGEXP = /^[a-zA-Z0-9.]+$/;

/**
 * Holds the users in memory.
 */
const users = [];

const isUsernameSyntaxValid = (username) =>
  typeof username === 'string' &&
  username !== '' &&
  username.length <= 50 &&
  USERNAME_REGEXP.test(username);

const isEmailSyntaxValid = (email) =>
  typeof email === 'string' &&
  email !== '' &&
  email.length <= 100 &&
  EMAIL_REGEXP.test(email);

const isPasswordSyntaxValid = (password) =>
  typeof password === 'string' && password !== '' && password.length <= 200;

const isUsernameTaken = (username) => users.some((user) => user.username == username);

const isEmailTaken = (email) => users.some((user) => user.email == email);

const app = express();
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(apiLimiter);

app.post('/password-strength', (req, res) => {
  const { password } = req.body;
  if (!isPasswordSyntaxValid(password)) {
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

app.post('/username-taken', (req, res) => {
  const { username } = req.body;
  if (!isUsernameSyntaxValid(username)) {
    res.sendStatus(400);
    return;
  }
  res.send({ usernameTaken: isUsernameTaken(username) });
});

app.post('/email-taken', (req, res) => {
  const { email } = req.body;
  if (!isEmailSyntaxValid(email)) {
    res.sendStatus(400);
    return;
  }
  const emailTaken = isEmailTaken(email);
  res.send({ emailTaken: isEmailTaken(email) });
});

const validateSignup = (body) => {
  const errors = [];
  if (!body) {
    errors.push('Bad request');
    return errors;
  }
  const { username, email, password } = body;
  if (!(isUsernameSyntaxValid(username) && !isUsernameTaken(username))) {
    errors.push('Username invalid');
  }
  if (!(isEmailSyntaxValid(email) && !isEmailTaken(email))) {
    errors.push('Email invalid');
  }
  if (!(isPasswordSyntaxValid(password) && zxcvbn(password).score >= 3)) {
    errors.push('Password invalid');
  }
  return errors;
};

app.post('/signup', (req, res) => {
  const errors = validateSignup(req.body);
  if (errors.length > 0) {
    res.status(400).send({ errors });
    return;
  }
  const { username, email, password } = req.body;
  users.push({
    username,
    email,
    password,
  });
  console.log(`Successful signup: ${username}`);
  res.send({ success: true });
});

app.listen(PORT);
console.log('Server running.');
