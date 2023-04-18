import {Express} from 'express';

export default interface Installer {
  install(app: Express);
}
