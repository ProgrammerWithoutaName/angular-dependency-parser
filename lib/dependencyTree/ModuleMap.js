'use strict';
let Module = require('./Module');
let ComponentMap = require('./ComponentMap');

let definitionTypes = {
    functionDefinition: 'function',
    valueDefinition: 'value',
    configDefinition: 'config'
};

class ModuleMap {
    constructor() {
        this.currentFile = '';
        this.modules = new Map();
        this.componentMap = new ComponentMap();
        this.entryPoints = new Map();
        this.buildAngularBase();
    }

    addEntryPoint(type, definitionType) {
        switch(definitionType) {
            case definitionTypes.functionDefinition: {
                this.entryPoints.set(type, this.componentMap.createFunctionDefinitionEntryPoint(type));
                break;
            }
            case definitionTypes.valueDefinition: {
                this.entryPoints.set(type, this.componentMap.createValueDefinitionEntryPoint(type));
                break;
            }
            case definitionTypes.configDefinition: {
                this.entryPoints.set(type, this.componentMap.createConfigDefinitionEntryPoint(type));
            }
        }
    }

    addModule(moduleName) {
        this.modules.set(moduleName, new Module({
            moduleName: moduleName,
            moduleMap: this,
            tags: this.currentTags
        }));
    }

    defineModule(options) {
        let moduleToDefine = this.modules.get(options.moduleName);
        moduleToDefine.file = options.file;
        options.moduleDependencies.forEach(dependency => {
            moduleToDefine.moduleDependencies.set(dependency, undefined);
        });
    }

    module(moduleName, moduleDependencies) {
        if(!this.modules.has(moduleName)) {
            this.addModule(moduleName);
        }

        if(moduleDependencies) {
            this.defineModule({moduleName, moduleDependencies, file: this.currentFile});
        }
        let foundModule = this.modules.get(moduleName);

        return foundModule;
    }

    buildAngularBase() {
        this.addEntryPoint('config', definitionTypes.configDefinition);
        this.addEntryPoint('run', definitionTypes.configDefinition);
        this.addEntryPoint('controller', definitionTypes.functionDefinition);
        this.addEntryPoint('directive', definitionTypes.functionDefinition);
        this.addEntryPoint('filter', definitionTypes.functionDefinition);
        this.addEntryPoint('factory', definitionTypes.functionDefinition);
        this.addEntryPoint('service', definitionTypes.functionDefinition);
        this.addEntryPoint('provider', definitionTypes.functionDefinition);
        this.addEntryPoint('constant', definitionTypes.valueDefinition);
        this.addEntryPoint('value', definitionTypes.valueDefinition);
    }

    get components() { return this.componentMap.components; }
}

module.exports = ModuleMap;