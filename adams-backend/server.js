require('dotenv').config();
require('./src/jobs/dailyComplianceCheck');
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 4000;

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`ADAMS API running on port ${PORT}`));
}).catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
