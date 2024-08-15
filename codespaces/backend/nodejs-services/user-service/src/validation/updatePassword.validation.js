// src/validation/userValidation.js
import Joi from 'joi';

// Define the schema for changing password
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required()
    .messages({
      'string.empty': 'Old password is required',
      'string.min': 'Old password must be at least 6 characters long',
    }),
  newPassword: Joi.string().min(6).required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
    }),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Confirm password does not match new password',
      'string.empty': 'Confirm new password is required',
    }),
});

// Middleware function to validate and sanitize input


export { changePasswordSchema };
