import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import siniflarRouter from './routes/siniflar.js';
import ogretmenlerRouter from './routes/ogretmenler.js';
import derslerRouter from './routes/dersler.js';
import atamalarRouter from './routes/atamalar.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/siniflar', siniflarRouter);
app.use('/api/ogretmenler', ogretmenlerRouter);
app.use('/api/dersler', derslerRouter);
app.use('/api/atamalar', atamalarRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
