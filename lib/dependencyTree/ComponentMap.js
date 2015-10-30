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
        let dependencies, functionImplementation;
        if (Array.isArray(options.componentDefinition)) {
            functionImplementation = options.componentDefinition.splice(options.componentDefinition.length - 1, 1)[0];
            dependencies = options.componentDefinition || [];
        } else if(typeof options.componentDefinition === 'function') {
            functionImplementation = options.componentDefinition;
            dependencies = options.componentDefinition.$inject || [];
        } else {
            throw `component ${options.name} of type ${options.type} in ${options.file} is not an array of function when calling functionImplementation,
            componentType found is ${typeof options.componentDefinition}`
        }
        return {
            name: options.name,
            type: options.type,
            parentModule: options.parentModule,
            file: options.file,
            functionImplementation,
            dependencies
        };
    }
}

module.exports = ComponentMap;