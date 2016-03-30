'use strict';
let Module = require('./AngularModule');
let ComponentMap = require('./ComponentMap');
let path = require('path');

let definitionTypes = {
    functionDefinition: 'function',
    valueDefinition: 'value',
    configDefinition: 'config'
};

class ModuleMap {
    constructor(preferredAngularVersion) {
        this.currentFile = '';
        this.modules = new Map();
        this.componentMap = new ComponentMap();
        this.entryPoints = new Map();
        this.nonScriptFiles = {};
        this.buildAngularBase();

        // these exist to mock out angular as needed. this isn't a complete list at the moment
        this.$$minErr = () => {};
        this.extend = () => {};

        //Allow this to be defined in preferences somewhere.
        this.version = preferredAngularVersion || {
            major: 1,
            minor: 5
        };
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
        moduleToDefine.folderLocation = path.dirname(options.file);
        moduleToDefine.defined = true;
        options.moduleDependencies.forEach(dependency => {
            moduleToDefine.moduleDependencies.set(dependency, undefined);
        });
    }

    module(moduleName, moduleDependencies) {
        if(!this.modules.has(moduleName)) {
            this.addModule(moduleName);
        }

        if(moduleDependencies) {
            this.defineModule({
                moduleName,
                moduleDependencies,
                file: this.currentFile
            });
        }

        return this.modules.get(moduleName);
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
        // components return an object, so it's defined as a value effectively.
        // In order to correctly process this, we will need to start using the AST to break it down and pull
        // the individual code pieces. This is also needed for maintaining references to globals, as well as
        // pulling in code written outside of the angular factory/constructor functions.
        this.addEntryPoint('component', definitionTypes.valueDefinition);
    }

    get components() { return this.componentMap.components; }
    get dependencyKeys() { return this.componentMap.dependencyKeys; }
}

module.exports = ModuleMap;