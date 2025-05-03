import express from 'express';
import { serverConfig } from '@config/serverConfig';
import { corsMiddleware } from '@middleware/corsMiddleware';
import { errorHandler } from '@middleware/errorHandler';
import { chatRoutes } from '@routes/chatRoutes';

const app = express();
const PORT = serverConfig.port;

app.use(corsMiddleware);

app.use(express.json());

app.use('/api', chatRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Backend server is running.');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
