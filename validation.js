import { validate as validateEmail } from 'email-validator';
import { isDate as returnTrueIfDate } from 'validator';

import User from './models/User';
import Store from './models/Store';

import { createObjectFromFields } from './utils';

import { STORES } from './constants';

const checkIfValidStore = (store) => {
  const chosenStore = String(store).toLowerCase();
  if (STORES.indexOf(chosenStore) === -1) return false;
  else return chosenStore;
};

const getStore = ({ query: { store } }) => store;

// const stdErr = (res) => res.status(400).json({ error: true });
const getSkipAndLimit = (req) => ({
  limit: req.query.limit || 10,
  skip: req.query.skip || 0,
});

const storeCheck = (req, res) => {
  const store = getStore(req);
  const chosenStore = checkIfValidStore(store);
  if (!chosenStore) {
    res.status(400).json({ message: 'Invalid store selection' });
    return false;
  }
  return chosenStore;
};

const stringExists = (input) => typeof input === 'string' && input.length > 0;
const userFieldValidators = (validators = {
  firstName: stringExists,
  lastName: stringExists,
  email: validateEmail,
  birthday: (input) => returnTrueIfDate(input),
  store: checkIfValidStore,
});

const userFields = Object.keys(validators);

const newUserDataValidation = async (newUserData) => {
  const dataForFields = createObjectFromFields(newUserData, userFields);
  const atleastOneIsInvalid = userFields.some((currentKey) => {
    const result = userFieldValidators[currentKey](dataForFields[currentKey]);
    return !result;
  });

  if (atleastOneIsInvalid) return false;

  if (newUserData.additionalFields) {
    const additionalFields = await Store.findOne({
      storeName: dataForFields.store,
    });
    const fieldNames = Object.keys(additionalFields);
    dataForFields.additionalFields = {};
    fieldNames.forEach((field) => {
      if (
        newUserData[field] &&
        typeof newUserData[field] === additionalFields[field]
      ) {
        dataForFields.additionalFields[field] = newUserData[field];
      }
    });
  }

  const newUserInstance = new User(dataForFields);
  return newUserInstance;
};

export { getSkipAndLimit, storeCheck, userFields, newUserDataValidation };
