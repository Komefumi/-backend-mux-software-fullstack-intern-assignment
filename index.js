import express from 'express';
import bodyParser from 'body-parser';
import runONDEATH from 'death';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { addAsync } from '@awaitjs/express';

import MainController from './controllers/index';

import Store from './models/Store';

import { ELECTRONICS, TOYS } from './constants';

const runONDEATHFull = runONDEATH({ uncaughtException: true });
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI);
const app = addAsync(express());
const server = createServer(app);

app.use(bodyParser.json());
app.getAsync('/customers', MainController.listCustomers);
app.postAsync('/customers', MainController.addCustomer);
app.deleteAsync('/customers', MainController.deleteCustomer);
app.getAsync('/fields', MainController.listFields);
app.postAsync('/fields', MainController.addField);
app.deleteAsync('/fields', MainController.deleteField);

app.use((error, req, res, next) => {
  res.status(400).json({ Errormessage: error.message });
});

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  // some other closing procedures go here
  process.exit(1);
});

Promise.all([
  Store.findOneAndUpdate(
    { storeName: TOYS },
    { $setOnInsert: { storeName: TOYS, additionalFields: {} } },
    { upsert: true },
  ),
  Store.findOneAndUpdate(
    { storeName: ELECTRONICS },
    { $setOnInsert: { storeName: ELECTRONICS, additionalFields: {} } },
    { upsert: true },
  ),
])
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error({ err });
    mongoose.disconnect();
    process.exit(1);
  });

runONDEATHFull(() => {
  // db.close();
  mongoose.disconnect();
});
