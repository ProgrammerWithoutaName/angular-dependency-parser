'use strict';
const path = require('path');
const dependencyKeyFormatter = require('../dependencyKeyFormatter');
const angularComponentDefinitionBuilder = require('./angularComponentDefinitionBuilder');

class ComponentMap {
    constructor() {
        this.components = new Map();
        this.dependencyKeys = new Map();
    }

    createFunctionDefinitionEntryPoint(type) {
        return (options) => {
            let component = ComponentMap.getComponentFunctionDefinition({
                name: options.componentName,
                dependencyKey: dependencyKeyFormatter.format({ name: options.componentName, type }),
                type,
                parentModule: options.parentModule,
                file: options.file,
                componentDefinition: options.componentDefinition
            });

            this.components.set(component.name, component);
            this.dependencyKeys.set(component.dependencyKey, component);
            return component;
        }
    }

    createValueDefinitionEntryPoint(type) {
        // should have no dependencies:
        return (options) => {
            let component = {
                name: options.componentName,
                dependencyKey: dependencyKeyFormatter.format({ name: options.componentName, type }),
                file: options.file,
                type,
                parentModule: options.parentModule,
                valueDefinition: options.componentDefinition
            };

            this.components.set(component.name, component);
            this.dependencyKeys.set(component.dependencyKey, component);
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

            if(this.components.has(component.name)) {
                component = this.correctConfigComponentsName(component);
            }

            this.components.set(component.name, component);
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
            totalOverlaps: 0,
            componentDefinition: options.componentDefinition
        });

        return baseComponent;
    }

    correctConfigComponentsName(component) {
        let existing = this.components.get(component.name);
        if(!existing.totalOverlaps) {
            existing.totalOverlaps = 0;
        }
        existing.totalOverlaps += 1;
        component.name = `${component.name}${existing.totalOverlaps}`;

        return component;
    }

    static addDependencyIfUnique(existingDependencies, dependenciesToAdd) {
        dependenciesToAdd.forEach(dependency => {
            if(existingDependencies.indexOf(dependency) >= 0) {
                existingDependencies.push(dependency);
            }
        });
    }

    static getComponentFunctionDefinition(options) {
        console.log(`processing angular ${options.type} ${options.name}`);
        try {
            let componentDefinition = angularComponentDefinitionBuilder.buildComponentDefinition(options.componentDefinition);
            let component;
            if (!componentDefinition) {
                throw `component ${options.name} of type ${options.type} in ${options.file} is not an array of function when calling functionImplementation,
            componentType found is ${typeof options.componentDefinition}`
            }

            component = {
                name: options.name,
                dependencyKey: options.dependencyKey || options.name,
                type: options.type,
                baseParentModule: options.parentModule,
                file: options.file,
                functionImplementation: componentDefinition.functionImplementation,
                dependencies: componentDefinition.dependencies,
                get parentModule() { 
                    return component.collapseParentDefinition ? 
                        component.collapseParentDefinition.baseModule :  
                        options.parentModule;
                }
            };
            return component;
        } catch(error) {
            console.log(options.componentDefinition.toString());
            console.log(error.stack);
        }

    }
}

module.exports = ComponentMap;