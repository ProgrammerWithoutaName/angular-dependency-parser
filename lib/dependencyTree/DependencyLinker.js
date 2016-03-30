'use strict';

class DependencyLinker {
    constructor(moduleMap) {
        this.moduleMap = moduleMap;
    }

    linkComponentDependencies() {
        let components = this.moduleMap.components;
        let dependencyKeys = this.moduleMap.dependencyKeys;

        for(let component of components.values()) {
            if(component.dependencies) {
                component.dependencies.forEach((dependency, index) => {
                    if (dependencyKeys.has(dependency)) {
                        let linked = dependencyKeys.get(dependency);
                        component.dependencies[index] = linked;
                        this.linkModuleDependency(component.parentModule, linked.parentModule);
                    }
                });
            }
        }
    }

    linkModuleDependency(module, moduleDependencyToLink) {
        let existingDefinition;
        let moduleHasDependency = module.moduleDependencies.has(moduleDependencyToLink.name); // this could be incorrect, most likely a bug.

        if(moduleHasDependency) {
            existingDefinition = module.moduleDependencies.get(moduleDependencyToLink.name);
        }

        if(!moduleHasDependency || (moduleHasDependency && existingDefinition === undefined)) {
            module.moduleDependencies.set(moduleDependencyToLink.name, moduleDependencyToLink);
        }
    }

    linkModuleDependencies() {
        for(let module of this.moduleMap.modules.values()) {
            for(let moduleDependencyKey of module.moduleDependencies.keys()) {
                if(this.moduleMap.modules.has(moduleDependencyKey)) {
                    let moduleDependency = this.moduleMap.modules.get(moduleDependencyKey);
                    this.linkModuleDependency(module, moduleDependency);
                }
            }
        }
    }
}

module.exports = DependencyLinker;