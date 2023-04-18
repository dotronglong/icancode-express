import {Express} from 'express';
import * as fs from 'fs';
import Installer from './installer';

export default class ModuleLoader {
  private basePath: string;

  constructor(basePath: string = '.') {
    this.basePath = basePath;
  }

  /**
   * Detect modules
   * @returns {Array<string>}
   */
  detect(): Array<string> {
    let modules: Array<string> = [];
    if (process.env.MODULES !== undefined) {
      modules = process.env.MODULES.split(',');
    } else {
      try {
        const files = fs.readdirSync(`${this.basePath}/module`);
        for (const file of files) {
          if (fs.lstatSync(`${this.basePath}/module/${file}`).isDirectory()) {
            modules.push(file);
          }
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    return modules;
  }

  /**
   * Load modules
   * @param {Express} app 
   * @returns {Array<string>}
   */
  load(app: Express): Array<string> {
    const modules = this.detect();
    const loadedModules: Array<string> = [];
    for (const module of modules) {
      try {
        const file = `${this.basePath}/module/${module}/module`;
        const installer: Installer = require(file).default;
        installer.install(app);
        loadedModules.push(module);
      } catch (e) {
        console.error(`Unable to install module ${module}`, e.message);
      }
    }

    return loadedModules;
  }
}