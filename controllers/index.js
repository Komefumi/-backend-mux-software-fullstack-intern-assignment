import UserModel from '../models/User';
import StoreModel from '../models/Store';
import {
  getSkipAndLimit,
  storeCheck,
  newUserDataValidation,
  userFields,
} from '../validation';

import { createObjectFromFields } from '../utils';
import { TYPES } from '../constants';

const MainController = {};

const getAdditionalFieldsOfStore = async (storeName) => {
  const { additionalFields } = await StoreModel.findOne({ storeName });
  return additionalFields;
};

MainController.listCustomers = async (req, res) => {
  const { limit, skip } = getSkipAndLimit(req);
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const results = await UserModel.find(
      { store: chosenStore },
      {},
      { skip, limit },
    );
    return res.json({ chosenStore, customers: results });
  }
};

MainController.addCustomer = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  }
  const payloadData = { ...req.body, store: chosenStore };
  console.log({ payloadData });
  const newUserData = await newUserDataValidation(payloadData);
  if (!newUserData) {
    return res.status(400).json({ error: true });
  }
  const { email } = newUserData;
  const existingRecord = await UserModel.findOne({ email });
  let savedInstance = null;
  if (existingRecord) {
    savedInstance = await UserModel.findOneAndUpdate({ email }, newUserData);
  }
  savedInstance = await new UserModel(newUserData).save();
  return res.json({
    user: createObjectFromFields(savedInstance, [
      ...userFields,
      'additionalFields',
    ]),
  });
};

MainController.deleteCustomer = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  }
  const deletedUser = await UserModel.findOneAndRemove({
    email: req.body.email,
  });
  if (!deletedUser) {
    return res.json({ userExisted: false });
  }
  return res.json({
    userExisted: true,
    user: createObjectFromFields(savedInstance, [
      ...userFields,
      'additionalFields',
    ]),
  });
};

MainController.listFields = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const additionalFields = await getAdditionalFieldsOfStore(chosenStore);
    const fieldDataArray = Object.keys(additionalFields).map((currentField) => [
      { fieldName: currentField, fieldType: additionalFields[currentField] },
    ]);
    return res.json({ fields: fieldDataArray });
  }
};

MainController.addField = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const fieldName =
      req.body.fieldName && String(req.body.fieldName).toLowerCase();
    const fieldType =
      req.body.fieldType && String(req.body.fieldType).toLowerCase();
    const additionalFields = await getAdditionalFieldsOfStore(chosenStore);
    if (
      !fieldName ||
      !fieldName.length ||
      !fieldType ||
      TYPES.indexOf(fieldType) === -1
    ) {
      res.json({ error: true });
    }
    additionalFields[fieldName] = fieldType;
    await StoreModel.findOneAndUpdate(
      { storeName: store },
      { additionalFields },
    );
    return res.json({ added: true });
  }
};

MainController.deleteField = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const fieldName =
      req.body.fieldName && String(req.body.fieldName).toLowerCase();
    const additionalFields = await getAdditionalFieldsOfStore(chosenStore);
    if (!fieldName || !fieldName.length) {
      res.json({ error: true });
    }
    const fieldType = additionalFields[fieldName];
    await StoreModel.findOneAndUpdate(
      { storeName: store },
      { additionalFields },
    );
    return res.json({
      fieldExisted: fieldType ? true : false,
      fieldName,
      fieldType,
    });
  }
};

export default MainController;
