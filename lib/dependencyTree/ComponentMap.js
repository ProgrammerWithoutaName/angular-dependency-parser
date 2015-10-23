'use strict';
const path = require('path');

class ComponentMap {
    constructor() {
        this.components = new Map();
    }

    createFunctionDefinitionEntryPoint(type) {
        return (options) => {
            let component = ComponentMap.getComponentFunctionDefinition({
                name: options.componentName,
                type,
                parentModule: options.parentModule,
                file: options.file,
                componentDefinition: options.componentDefinition
            });

            this.components.set(component.name, component);
            return component;
        }
    }

    createValueDefinitionEntryPoint(type) {
        // should have no dependencies:
        return (options) => {
            let component = {
                name: options.componentName,
                file: options.file,
                type,
                parentModule: options.parentModule,
                valueDefinition: options.componentDefinition
            };

            this.components.set(component.name, component);
            return component;
        }
    }

    createConfigDefinitionEntryPoint(type) {
        // should have no dependencies:
        return (options) => {
            // don't remove the ., keeps things nice and separate

            let component = ComponentMap.buildNewConfigComponent({
                type,
                file: options.file,
                parentModule: options.parentModule,
                componentDefinition: options.componentDefinition
            });

            // left off here:
            // need to: get the fileName from match
            // add to array of stuff in the same file.
            // fix the Code Generation to take these config files into account, they aren't part of exports, but they
            // do need to be loaded.
            if(this.components.has(component.name)) {
                this.addConfigToComponent(component);
            } else {
                this.components.set(component.name, component);
            }

            return component;
        }
    }

    static buildNewConfigComponent(options) {

        let baseName = path.basename(options.file);
        baseName = baseName.replace(/(\..*$)/gi, '');

        let baseComponent = ComponentMap.getComponentFunctionDefinition({
            name: `${baseName}.${options.type}`,
            type: options.type,
            file: options.file,
            parentModule: options.parentModule,
            componentDefinition: options.componentDefinition
        });
        baseComponent.functionDefinitions = [];
        baseComponent.functionDefinitions.push(baseComponent.functionDefinition);
        baseComponent.functionDefinition = undefined;
        return baseComponent;
    }

    addConfigToComponent(component) {
        let existing = this.components.get(component.name);
        existing.functionDefinitions.push(component.functionDefinition);
        ComponentMap.addDependencyIfUnique(existing.dependencies, component.dependencies);
    }

    static addDependencyIfUnique(existingDependencies, dependenciesToAdd) {
        dependenciesToAdd.forEach(dependency => {
            if(existingDependencies.indexOf(dependency) >= 0) {
                existingDependencies.push(dependency);
            }
        });
    }

    static getComponentFunctionDefinition(options) {
        let dependencies, functionDefinition;
        if (Array.isArray(options.componentDefinition)) {
            functionDefinition = options.componentDefinition.splice(options.componentDefinition.length - 1, 1);
            dependencies = options.componentDefinition || [];
        } else if(typeof options.componentDefinition === 'function') {
            functionDefinition = options.componentDefinition;
            dependencies = options.componentDefinition.$inject || [];
        } else {
            throw `component ${options.name} of type ${options.type} in ${options.file} is not an array of function when calling functionDefinition,
            componentType found is ${typeof options.componentDefinition}`
        }
        return {
            name: options.name,
            type: options.type,
            parentModule: options.parentModule,
            file: options.file,
            functionDefinition,
            dependencies
        };
    }
}

module.exports = ComponentMap;