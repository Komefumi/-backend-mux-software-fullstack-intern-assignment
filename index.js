import express from 'express';
import bodyParser from 'body-parser';
import runONDEATH from 'death';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { addAsync } from '@awaitjs/express';

import MainController from './controllers/index';

const runONDEATHFull = runONDEATH({ uncaughtException: true });
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI);
const app = addAsync(express());
const server = createServer(app);

app.use(bodyParser.json());
app.getAsync('/customers', MainController.listCustomers);
app.postAsync('/customers', MainController.addCustomer);
app.getAsync('/fields', MainController.listCustomers);
app.postAsync('/fields', MainController.addCustomer);

app.use((error, req, res, next) => {
  res.status(400).json({ Errormessage: error.message });
});

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  // some other closing procedures go here
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});

runONDEATHFull(() => {
  // db.close();
  mongoose.disconnect();
});
