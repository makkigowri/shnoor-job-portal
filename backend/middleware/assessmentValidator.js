const { body, param } = require("express-validator");
const validateCreateAssessment = [
  body("title").trim().notEmpty().withMessage("Assessment title is required"),
  body("durationMinutes").optional().isInt({ min: 1 }).withMessage("Duration must be a positive number of minutes"),
  body("passingMarks").optional().isInt({ min: 0 }).withMessage("Passing marks must be a non-negative number"),
  body("jobId").optional({ nullable: true }).isInt().withMessage("jobId must be a valid job id"),
  body("questions").optional().isArray().withMessage("Questions must be an array"),
  body("questions.*.questionText").if(body("questions").exists()).trim().notEmpty().withMessage("Each question requires question text"),
  body("questions.*.questionType")
    .if(body("questions").exists())
    .optional()
    .isIn(["mcq", "true_false", "short_answer"])
    .withMessage("questionType must be mcq, true_false or short_answer"),
  body("questions.*.marks").if(body("questions").exists()).optional().isInt({ min: 1 }).withMessage("Question marks must be a positive number")
];
const validateUpdateAssessment = [
  body("title").optional().trim().notEmpty().withMessage("Assessment title cannot be empty"),
  body("durationMinutes").optional().isInt({ min: 1 }).withMessage("Duration must be a positive number of minutes"),
  body("passingMarks").optional().isInt({ min: 0 }).withMessage("Passing marks must be a non-negative number"),
  body("questions").optional().isArray().withMessage("Questions must be an array")
];
const validateAssignAssessment = [
  body("candidateIds").isArray({ min: 1 }).withMessage("candidateIds must be a non-empty array"),
  body("candidateIds.*").isInt().withMessage("Each candidateId must be a valid user id"),
  body("scheduledStart").optional({ nullable: true }).isISO8601().withMessage("scheduledStart must be a valid date"),
  body("scheduledEnd").optional({ nullable: true }).isISO8601().withMessage("scheduledEnd must be a valid date")
];
const validateSaveAnswers = [
  body("answers").isArray({ min: 1 }).withMessage("answers must be a non-empty array"),
  body("answers.*.questionId").isInt().withMessage("Each answer requires a valid questionId")
];
const validateIdParam = [param("id").isInt().withMessage("Invalid id parameter")];
module.exports = {
  validateCreateAssessment,
  validateUpdateAssessment,
  validateAssignAssessment,
  validateSaveAnswers,
  validateIdParam
};
