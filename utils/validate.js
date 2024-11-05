const { NextFunction, Request, Response } = require("express");
const { AnyZodObject, ZodIssue, ZodType, z } = require("zod");

const paginationSchema = z.object({
  page: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(1).optional()
  ),
  pageSize: z.preprocess(
    (val) => (val ? +val : undefined),
    z.number().min(1).optional()
  ),
});

const paramsById = z
  .object({
    id: z.string().transform((arg) => +arg),
  })
  .superRefine(({ id }, ctx) => {
    if (isNaN(+id)) {
      ctx.addIssue({ code: "custom", path: ["id"] });
    }
  });

const ValidatedRequest = Request;
ValidatedRequest.prototype.validatedData = undefined;

const InferBody = (T) => ValidatedRequest.extend({
  validatedData: {
    body: z.infer(T).body,
  },
});

const InferParams = (T) => ValidatedRequest.extend({
  validatedData: {
    params: z.infer(T).params,
  },
});

const InferQuery = (T) => ValidatedRequest.extend({
  validatedData: {
    query: z.infer(T).query,
  },
});

const InferBodyParams = (T, U) => ValidatedRequest.extend({
  validatedData: {
    body: z.infer(T).body,
    params: z.infer(U).params,
  },
});

const validate =
  (schema) =>
  async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (validatedData) {
        req.validatedData = validatedData;
      }
      return next();
    } catch (error) {
      const issues = error.issues;
      const formattedError = {
        message: "Validation failed",
        issues: mapValidationIssues(issues),
      };
      return res.status(400).json(formattedError);
    }
  };

const mapValidationIssues = (issues) => {
  return issues.map((issue) => ({
    ...issue,
    path: issue.path.join("."),
  }));
};

const thaiNationalIDSchema = z.string().refine(
  (value) => {
    if (value == null || value.length !== 13 || !/^[0-9]\d+$/.test(value)) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(value.charAt(i)) * (13 - i);
    }
    const check = (11 - (sum % 11)) % 10;
    return check === parseInt(value.charAt(12));
  },
  { message: "เลขบัตรประชาชนไม่ถูกต้อง" }
);

module.exports = validate;

