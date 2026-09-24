import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import seedAssessmentCatalog from './services/assessmentCatalogService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAssessmentCatalog();
  app.listen(PORT, () => {
    console.log(`NextStep AI backend running on port ${PORT}`);
  });
}).catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exit(1);
});
