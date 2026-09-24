import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true, minlength: 8, maxlength: 600 },
  options: {
    type: [{ type: String, trim: true, minlength: 1, maxlength: 240 }],
    required: true,
    validate: [(items) => items.length >= 2 && items.length <= 6, 'Each question must have 2 to 6 options'],
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    validate: {
      validator(value) {
        return Number.isInteger(value) && value < this.options.length;
      },
      message: 'The correct answer must point to an available option',
    },
  },
  explanation: { type: String, required: true, trim: true, maxlength: 600 },
  skill: { type: String, required: true, trim: true, maxlength: 100 },
});

const assessmentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
    version: { type: Number, required: true, min: 1, default: 1 },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    subjectSlug: { type: String, required: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    topicSlug: { type: String, required: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
    skill: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    durationMinutes: { type: Number, required: true, min: 1, max: 180 },
    passingScore: { type: Number, required: true, min: 1, max: 100, default: 70 },
    active: { type: Boolean, default: true, index: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [(items) => items.length >= 3 && items.length <= 50, 'An assessment must have 3 to 50 questions'],
    },
  },
  { timestamps: true }
);

assessmentSchema.index(
  { slug: 1, version: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: 'string' }, version: { $type: 'number' } } }
);
assessmentSchema.index({ active: 1, category: 1, title: 1 });
assessmentSchema.index({ active: 1, subjectSlug: 1, topicSlug: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
