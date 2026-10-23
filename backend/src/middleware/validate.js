
import ApiError from "../utils/ApiError.js";

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(
        new ApiError(
          400,
          result.error.issues
            .map(
              (issue) =>
                `${issue.path.join(".")}: ${issue.message}`
            )
            .join("; ")
        )
      );
    }

    req.validated = result.data;
    next();
  };
}
