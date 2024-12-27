import {Express} from 'express';
import {createDebug} from '@icancode/base';

const debug = createDebug('icancode:express:module');
export type ModuleInstaller = (app: Express) => Promise<void>;

/**
 * Module
 */
export interface Module {
  name(): string;
  install: ModuleInstaller;
}

/**
 * ModuleLoader
 */
export class ModuleLoader {
  private app: Express;
  private registeredModules: Record<string, Module>;

  /**
   * Constructor
   * @param {Express} app
   * @param {...Module[]} modules
   */
  constructor(app: Express, ...modules: Module[]) {
    this.app = app;
    this.registeredModules = {};
    this.register(...modules);
  }

  /**
   * Register module
   * @param {...Module[]} modules
   * @return {ModuleLoader}
   */
  register(...modules: Module[]): ModuleLoader {
    modules.forEach((m) => (this.registeredModules[m.name()] = m));

    return this;
  }

  /**
   * Load modules by names
   * @param {string[]} names Specify the name of modules to be loaded
   * @return {Promise<void>}
   */
  async load(...names: string[]): Promise<void> {
    // Get the module names to load
    const moduleNames = this.detectLoadingModuleNames(names);

    debug('load modules', moduleNames);

    // Gather installation tasks for the modules
    const tasks = moduleNames
        .map((name) => this.registeredModules[name]?.install(this.app))
        .filter((task): task is Promise<void> => task !== undefined);

    // Wait for all tasks to complete
    await Promise.all(tasks);
  }

  /**
   * Detect module names
   * @param {string[]} names The modules to be loaded
   * @return {string[]} List of module names
   */
  private detectLoadingModuleNames(names: string[]): string[] {
    let moduleNames: string[];
    if (names.length > 0) {
      moduleNames = names;
    } else {
      // Load all registered modules when none of modules is specified
      moduleNames = Object.keys(this.registeredModules);
    }

    const moduleNamesFromEnv = process.env.MODULES ?
      process.env.MODULES.split(',').filter(Boolean) :
      [];

    return moduleNames.concat(moduleNamesFromEnv);
  }
}

/**
 * ModuleBuilder
 */
export class ModuleBuilder {
  private name: string;
  private installer: ModuleInstaller;

  /**
   * Constructor
   * @param {string} name
   */
  constructor(name: string) {
    this.name = name;
    this.installer = () => Promise.resolve();
  }

  /**
   * Return new builder
   * @param {string} name
   * @return {ModuleBuilder}
   */
  static builder(name: string): ModuleBuilder {
    return new ModuleBuilder(name);
  }

  /**
   * Return an instance of Module
   * @return {Module}
   */
  build(): Module {
    return {
      name: () => this.name,
      install: this.installer,
    };
  }

  /**
   * Set name
   *
   * @param {string} name
   * @return {this}
   */
  withName(name: string): this {
    this.name = name;

    return this;
  }

  /**
   * Set installer
   * @param {ModuleInstaller} installer
   * @return {this}
   */
  withInstaller(installer: ModuleInstaller): this {
    this.installer = installer;

    return this;
  }
}
