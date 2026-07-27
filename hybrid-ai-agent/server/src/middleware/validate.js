export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const { required, types } = schema;

    if (required) {
      for (const field of required) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          errors.push(`${field} is required`);
        }
      }
    }

    if (types) {
      for (const [field, expectedType] of Object.entries(types)) {
        const value = req.body[field];
        if (value !== undefined && value !== null && typeof value !== expectedType) {
          errors.push(`${field} must be of type ${expectedType}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    next();
  };
};
