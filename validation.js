import { validate as validateEmail } from 'email-validator';
import validatePhoneNumber from 'phone';
import { isNumeric } from 'validator';

import Store from './models/Store';

import { createObjectFromFields, apiResponseHelper } from './utils';

import { STORES, STRING_T, EMAIL_T, NUMBER_T, DATE_T } from './constants';

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
  console.log({ store });
  const chosenStore = checkIfValidStore(store);
  if (!chosenStore) {
    apiResponseHelper(res, 'Invalid store selection', {}, 400, false);
    return false;
  }
  return chosenStore;
};

const stringExists = (input) => typeof input === 'string' && input.length > 0;
const userFieldValidators = {
  firstName: stringExists,
  lastName: stringExists,
  email: validateEmail,
  birthday: (input) => Date.parse(input),
  phone: (input) => validatePhoneNumber(input).length > 0,
  store: checkIfValidStore,
};

const validatorsForAdditionals = {
  [STRING_T]: stringExists,
  [EMAIL_T]: validateEmail,
  [NUMBER_T]: (input) => isNumeric(input + ''),
  [DATE_T]: Date.parse,
};

const userFields = Object.keys(userFieldValidators);

const newUserDataValidation = async (newUserData) => {
  const dataForFields = createObjectFromFields(newUserData, userFields);
  const atleastOneIsInvalid = userFields.some((currentKey) => {
    const result = userFieldValidators[currentKey](dataForFields[currentKey]);
    console.log(`validation for field ${currentKey} : ${result}`);
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
      const validatorForField = validatorsForAdditionals[field];
      if (newUserData[field] && validatorForField(newUserData[field])) {
        dataForFields.additionalFields[field] = newUserData[field];
      }
    });
  }

  return dataForFields;
};

export { getSkipAndLimit, storeCheck, userFields, newUserDataValidation };
