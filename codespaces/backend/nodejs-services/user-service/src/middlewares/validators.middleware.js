import { userRegistrationSchema } from "../validation/registration.validation.js";
import { changePasswordSchema } from "../validation/updatePassword.validation.js";
const validateRegistration = (req, res, next) => {
  const { error, value } = userRegistrationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ errors: error.details.map((detail) => detail.message) });
  }
  req.body = value; // Optionally replace req.body with sanitized values
  next();
};

const validateChangePassword = (req, res, next) => {
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(detail => detail.message) });
    }
    next();
  };
export { validateRegistration, validateChangePassword };
