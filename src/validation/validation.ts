import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().required().messages({
    "string.alphanum": "Username must contain only letters and numbers",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain both letters and numbers",
      "any.required": "Password is required",
    }),
  fullName: Joi.string()
    .pattern(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Full name must contain only letters and may have space to separate first name and last name",
      "any.required": "Full name is required",
    }),
});

export const passwordValidation = Joi.object({
  newPassword: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "New Password must be at least 8 characters long and contain both letters and numbers",
      "any.required": "New Password is required",
    }),
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
});

export const ValidateUserDetail = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  fullName: Joi.string()
    .pattern(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Full name must contain only letters and may have space to separate first name and last name",
      "any.required": "Full name is required",
    }),
});
