// src/validation/userValidation.js
import Joi from 'joi';

// Define the schema for user registration with validation and sanitization
const userRegistrationSchema = Joi.object({
  fullName: Joi.string()
    .min(3)
    .max(50)
    .trim() // Sanitizes by trimming whitespace
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 3 characters long',
      'string.max': 'Full name must be less than 50 characters long'
    }),
  email: Joi.string()
    .email()
    .lowercase() // Sanitizes by converting to lowercase
    .trim() // Sanitizes by trimming whitespace
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim() // Sanitizes by trimming whitespace
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be less than 30 characters long'
    }),
  password: Joi.string()
    .min(6)
    .trim() // Sanitizes by trimming whitespace
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
  // Optional fields for file uploads
  avatar: Joi.array().items(Joi.object({
    path: Joi.string().allow(''),
  })),
  coverImage: Joi.array().items(Joi.object({
    path: Joi.string().allow(''),
  })),
});



export { userRegistrationSchema };
