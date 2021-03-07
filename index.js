import express from 'express';
import bodyParser from 'body-parser';
import runONDEATH from 'death';
import mongoose from 'mongoose';

const runONDEATHFull = runONDEATH({ uncaughtException: true });
const PORT = process.env.PORT || 5000;
const db = mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
const app = express();

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

runONDEATHFull(() => {
  db.close();
});
