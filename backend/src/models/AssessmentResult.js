import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    answers: [{ questionIndex: Number, selectedAnswer: Number }],
  },
  { timestamps: true }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

export default AssessmentResult;
