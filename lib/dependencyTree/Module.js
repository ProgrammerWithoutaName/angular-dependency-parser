'use strict';
const path = require('path');
const configTypes = new Set();
configTypes.add('config');
configTypes.add('run');
class Module {
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
                componentDefinition,
                file: this.currentFile,
                parentModule: this
            });

            this.components.set(component.name, component);
            return this;
        };
    }
}

module.exports = Module;