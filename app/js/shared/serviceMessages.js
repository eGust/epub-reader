import {
  zipObject,
} from 'lodash';

const keys = 'queryDocRoot queryDocPath openFiles openBook getDbValue setDbValue'
  .trim().split(/\s+/);
const serviceMessages = zipObject(keys, keys);
export default serviceMessages;
