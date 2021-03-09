import UserModel from '../models/User';
import StoreModel from '../models/Store';
import {
  getSkipAndLimit,
  storeCheck,
  newUserDataValidation,
} from '../validation';

import { apiResponseHelper, getUserData } from '../utils';
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
    return apiResponseHelper(res, 'Customers for store retrieved', {
      store: chosenStore,
      customers: results.map((user) => getUserData(user)),
    });
  }
};

MainController.addCustomer = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  }
  const payloadData = { ...req.body, store: chosenStore };
  const newUserData = await newUserDataValidation(payloadData);
  if (!newUserData) {
    return apiResponseHelper(
      res,
      'There was an error in the provided data',
      {},
      400,
      false,
    );
  }
  const { email } = newUserData;
  const existingRecord = await UserModel.findOne({ email });
  let savedInstance = null;
  if (existingRecord) {
    savedInstance = await UserModel.findOneAndUpdate({ email }, newUserData);
  }
  savedInstance = await new UserModel(newUserData).save();
  return apiResponseHelper(res, 'Customer saved', {
    user: getUserData(savedInstance),
  });
};

MainController.deleteCustomer = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  }
  const deletedUser = await UserModel.findOneAndRemove({
    email: req.body.email,
    store: chosenStore,
  });
  if (!deletedUser) {
    return apiResponseHelper(
      res,
      'User not found',
      { userExisted: false },
      200,
      false,
    );
  }
  return apiResponseHelper(res, 'User Successfully Deleted', {
    userExisted: true,
    user: getUserData(deletedUser),
  });
};

MainController.customerCount = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const customerCountForStore = await UserModel.countDocuments({
      store: chosenStore,
    });
    return apiResponseHelper(
      res,
      `Returning number of customers for ${chosenStore}`,
      { chosenStore, customerCount: customerCountForStore },
    );
  }
};

MainController.listFields = async (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    const additionalFields = await getAdditionalFieldsOfStore(chosenStore);
    // const fieldDataArray = Object.keys(additionalFields).map(
    //   (currentField) => ({
    //     fieldName: currentField,
    //     fieldType: additionalFields[currentField],
    //   }),
    // );
    const fieldDataMapping = Object.keys(additionalFields).reduce(
      (accum, fieldName) => {
        return { ...accum, [fieldName]: additionalFields[fieldName] };
      },
      {},
    );

    return apiResponseHelper(
      res,
      `Additional fields for ${chosenStore} successfully retrieved`,
      { fields: fieldDataMapping },
    );
    // return res.json({ fields: fieldDataArray });
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
    const updatedStore = await StoreModel.findOneAndUpdate(
      { storeName: chosenStore },
      { additionalFields },
      { new: true },
    );
    return apiResponseHelper(res, `Ran add field operation`, {
      fieldName,
      fieldType,
      updatedStore,
    });
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
    const updatedStore = await StoreModel.findOneAndUpdate(
      { storeName: chosenStore },
      { additionalFields },
      { new: true },
    );
    return apiResponseHelper(res, `Ran delete field operation`, {
      fieldExisted: fieldType ? true : false,
      fieldName,
      fieldType,
      updatedStore,
    });
  }
};

export default MainController;
