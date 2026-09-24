import mongoose from 'mongoose';

const answeredQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionIndex: { type: Number, required: true, min: 0, max: 49 },
  question: { type: String, required: true, maxlength: 600 },
  options: { type: [{ type: String, maxlength: 240 }], required: true },
  selectedAnswer: { type: Number, required: true, min: 0, max: 5 },
  correctAnswer: { type: Number, required: true, min: 0, max: 5 },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String, required: true, maxlength: 600 },
  skill: { type: String, required: true, maxlength: 100 },
});

const assessmentResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    assessmentSlug: { type: String, required: true, maxlength: 100 },
    assessmentTitle: { type: String, required: true, maxlength: 120 },
    subject: { type: String, required: true, maxlength: 100 },
    subjectSlug: { type: String, required: true, maxlength: 100 },
    topic: { type: String, required: true, maxlength: 120 },
    topicSlug: { type: String, required: true, maxlength: 100 },
    assessmentSkill: { type: String, required: true, maxlength: 100 },
    assessmentVersion: { type: Number, required: true, min: 1 },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1, max: 50 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    passingScore: { type: Number, required: true, min: 1, max: 100 },
    passed: { type: Boolean, required: true },
    skillBreakdown: {
      type: [{
        skill: { type: String, required: true, maxlength: 100 },
        correct: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 1 },
        percentage: { type: Number, required: true, min: 0, max: 100 },
      }],
      required: true,
      validate: [(items) => items.length >= 1 && items.length <= 50, 'A result must include a skill breakdown'],
    },
    answers: {
      type: [answeredQuestionSchema],
      required: true,
      validate: [(items) => items.length >= 1 && items.length <= 50, 'An assessment result must include 1 to 50 answers'],
    },
    submittedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

assessmentResultSchema.index({ user: 1, submittedAt: -1 });
assessmentResultSchema.index({ user: 1, assessment: 1, submittedAt: -1 });

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

export default AssessmentResult;
