'use strict';
const path = require('path');
const dependencyKeyFormatter = require('../dependencyKeyFormatter');
const configTypes = new Set();
configTypes.add('config');
configTypes.add('run');
class AngularModule {
    constructor(options) {
        this.components = new Map();
        this.name = options.moduleName;
        this.moduleMap = options.moduleMap;
        this.moduleDependencies = new Map();
        this.tags = options.tags;

        let types = this.moduleMap.entryPoints.keys();
        for(let type of types) {
            this.createEntryPoint(type);
        }
    }

    get currentFile() { return this.moduleMap.currentFile; }
    get entryPoints() { return this.moduleMap.entryPoints; }

    createEntryPoint(type) {
        this[type] = (componentName, componentDefinition) => {
            if(configTypes.has(type)) {
                componentDefinition = componentName;
                componentName = undefined;
            }

            let component = this.entryPoints.get(type)({
                componentName,
                dependencyKey: dependencyKeyFormatter.format({name: componentName, type: type}),
                componentDefinition,
                file: this.currentFile,
                parentModule: this
            });

            this.addComponent(component);

            return this;
        };
    }

    addComponent(component) {
        this.components.set(component.name, component);
    }
}

module.exports = AngularModule;