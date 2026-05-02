import { ZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Validates `body`, `query`, `params` against a Zod schema.
 * Missing parts are coerced to `{}` so schemas can be lenient about which sections they declare.
 */
const validateRequest =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body ?? {},
        query: req.query ?? {},
        params: req.params ?? {},
      });
      next();
    } catch (error: unknown) {
      const issues =
        error instanceof ZodError
          ? error.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
            }))
          : [];
      return res.status(400).json({
        status: 400,
        message: issues[0]?.message ?? 'Validation Error',
        data: null,
        errors: issues,
      });
    }
  };

export default validateRequest;
