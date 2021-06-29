import app from './app';
import Logger from './src/logger/logger';
require('dotenv').config();

const PORT = process.env.PORT || 8055;
app.listen(PORT, () => {
  Logger.info(`server running on port ${PORT}`);
});
