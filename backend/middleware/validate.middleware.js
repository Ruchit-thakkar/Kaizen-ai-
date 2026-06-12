/**
 * Validation Middleware: Executes schema-specific validations against request body.
 * @param {Function} validateFn - A function that returns a string (error message) if invalid, or null if valid.
 */
export const validate = (validateFn) => {
  return (req, res, next) => {
    if (typeof validateFn === 'function') {
      const errorMsg = validateFn(req.body);
      if (errorMsg) {
        return res.status(400).json({ 
          success: false, 
          message: errorMsg 
        });
      }
    }
    next();
  };
};
