import { pick as createObjectFromFields } from 'lodash';
import { userFields } from './validation';

const apiResponseHelper = (
  res,
  message,
  data,
  status = 200,
  success = true,
) => {
  return res.status(status).json({ message, data, success });
};

const getUserData = (userObject) => {
  const cleaned = createObjectFromFields(userObject, [
    ...userFields,
    'additionalFields',
  ]);
  return cleaned;
};

export { createObjectFromFields, apiResponseHelper, getUserData };
