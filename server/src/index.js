require('dotenv').config();

const { createApp } = require('./app');
const { connectDb } = require('./db');
const { seedIfEmpty } = require('./seed');

async function main() {
  await connectDb();
  await seedIfEmpty();

  const app = createApp();
  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] escuchando en http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] error fatal:', err);
  process.exit(1);
});

