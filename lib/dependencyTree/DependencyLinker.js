'use strict';

class DependencyLinker {
    constructor(moduleMap) {
        this.moduleMap = moduleMap;
    }

    linkComponentDependencies() {
        let components = this.moduleMap.components;
        for(let component of components.values()) {
            if(component.dependencies) {
                component.dependencies.forEach((dependency, index) => {
                    if (components.has(dependency)) {
                        let linked = components.get(dependency);
                        component.dependencies[index] = linked;
                        this.linkModuleDependency(component.parentModule, linked.parentModule);
                    }
                });
            }
        }
    }

    linkModuleDependency(module, moduleDependencyToLink) {
        let existingDefinition;
        let moduleHasDependency = module.moduleDependencies.has(moduleDependencyToLink.name);

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