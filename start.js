import { handler } from './build/handler.js';
import compression from 'compression';
import express from 'express';

const app = express();

app.use(compression());
app.use(handler);

app.listen(3000, () => {
	console.log('Listening on port 3000');
});