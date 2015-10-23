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
                        if (!component.parentModule.moduleDependencies.has(linked.parentModule.name)) {
                            component.parentModule.moduleDependencies.set(linked.parentModule.name, linked.parentModule);
                        }
                    }
                });
            }
        }
    }
}

module.exports = DependencyLinker;