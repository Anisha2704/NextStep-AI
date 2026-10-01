import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import seedAssessmentCatalog from './services/assessmentCatalogService.js';
import { startNotificationEmailWorker } from './services/notificationEmailWorker.js';
import bootstrapAdmin from './services/adminBootstrapService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

connectDB().then(async () => {
  await bootstrapAdmin();
  await seedAssessmentCatalog();
  startNotificationEmailWorker();
  app.listen(PORT, HOST, () => {
    console.log(`NextStep AI backend running on http://${HOST}:${PORT}`);
  });
}).catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exit(1);
});
