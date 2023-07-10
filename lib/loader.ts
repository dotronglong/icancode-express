import {Express} from 'express';
import * as fs from 'fs';
import Installer from './installer';

/**
 * ModuleLoader
 */
export default class ModuleLoader {
  private basePath: string;

  /**
   * Constructor
   * @param {string=} basePath
   */
  constructor(basePath: string = `${process.env.PWD}/dist`) {
    this.basePath = basePath;
  }

  /**
   * Detect modules
   * @return {Array<string>}
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
   * @param {string[]} depends Ensure these modules are loaded first
   * @return {string[]}
   */
  load(app: Express, depends: string[] = []): string[] {
    let loadedModules: string[] = [];

    loadedModules = loadedModules.concat(this.__load(app, depends));
    loadedModules = loadedModules.concat(this.__load(app, this.detect(), depends)); // eslint-disable-line max-len

    return loadedModules;
  }

  /**
   * Load specified modules with exclusions
   * @param {Express} app
   * @param {string[]} modules
   * @param {string[]} excludes
   * @return {string[]}
   */
  private __load(
      app: Express,
      modules: string[],
      excludes: string[] = [],
  ): string[] {
    const loadedModules: string[] = [];
    for (const module of modules) {
      if (excludes.indexOf(module) > -1) {
        // ignore this module
        continue;
      }

      try {
        const file = `${this.basePath}/module/${module}/module`;
        const installer: Installer = require(file).default;
        const result = installer.install(app);
        if (typeof result === 'function') {
          app.use(result);
        }
        loadedModules.push(module);
      } catch (e) {
        console.error(`Unable to install module ${module}`, e.message);
      }
    }

    return loadedModules;
  }
}
