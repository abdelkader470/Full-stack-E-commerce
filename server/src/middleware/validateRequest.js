import { validationResult } from "express-validator";

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.errors = result.array().map((item) => ({
      field: item.path,
      message: item.msg
    }));
    return next(error);
  }

  return next();
};
