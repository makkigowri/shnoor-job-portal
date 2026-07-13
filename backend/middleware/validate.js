const { body, validationResult } = require("express-validator");
const validateRegister = [
  body("fullname").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").trim().isLength({ min: 10, max: 15 }).withMessage("Valid phone number is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  body("role").isIn(["jobseeker", "recruiter"]).withMessage("Role must be jobseeker or recruiter"),
  body("acceptPrivacyPolicy").equals("true").withMessage("You must accept the Privacy Policy"),
  body("acceptTerms").equals("true").withMessage("You must accept the Terms & Conditions")
];
const validateLogin = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("acceptTerms").equals("true").withMessage("You must accept the Terms & Conditions")
];
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};
module.exports = { validateRegister, validateLogin, handleValidation };
