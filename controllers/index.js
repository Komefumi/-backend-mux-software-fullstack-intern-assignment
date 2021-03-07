import UserModel from '../models/User';
import {
  getSkipAndLimit,
  storeCheck,
  newUserDataValidation,
  userFields,
} from '../validation';

import { createObjectFromFields } from '../utils';

const MainController = {};

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
    return res.json({ chosenStore, results });
  }
};

MainController.addCustomer = (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  }
  const payloadData = { ...req.body, store: chosenStore };
  const newUserInstance = newUserDataValidation(payloadData);
  const savedInstance = newUserInstance.save();
  return res.json({
    user: createObjectFromFields(savedInstance, [
      ...userFields,
      'additionalFields',
    ]),
  });
};

MainController.listFields = (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    return res.json({ result: true });
  }
};

MainController.addField = (req, res) => {
  const chosenStore = storeCheck(req, res);
  if (!chosenStore) {
    return;
  } else {
    return res.json({ added: true });
  }
};

export default MainController;
