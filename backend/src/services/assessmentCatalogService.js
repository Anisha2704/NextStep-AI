import Assessment from '../models/Assessment.js';
import assessmentCatalog from '../data/assessmentCatalog.js';

const seedAssessmentCatalog = async () => {
  if (!assessmentCatalog.length) return;

  await Promise.all(assessmentCatalog.map((assessment) => new Assessment(assessment).validate()));

  await Promise.all(assessmentCatalog.map((assessment) => Assessment.updateMany(
    { slug: assessment.slug, version: { $lt: assessment.version }, active: true },
    { $set: { active: false } }
  )));

  await Assessment.bulkWrite(
    assessmentCatalog.map((assessment) => ({
      updateOne: {
        filter: { slug: assessment.slug, version: assessment.version },
        update: { $setOnInsert: assessment },
        upsert: true,
      },
    })),
    { ordered: false }
  );
};

export default seedAssessmentCatalog;
