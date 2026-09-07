import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    skill: { type: String, default: '' },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
      },
    ],
    difficulty: { type: String, default: 'Intermediate' },
  },
  { timestamps: true }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
