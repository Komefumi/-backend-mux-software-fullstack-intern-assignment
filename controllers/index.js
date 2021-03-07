import { STORES } from '../constants';
import UserModel from '../models/User';

const MainController = {};

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
  } else {
    return res.json({ added: true });
  }
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
