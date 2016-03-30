'use strict';
const Module = require('../dependencyTree/AngularModule');

// purpose is to take a module and collapse it. Useful when creating a module export definition of outside code where they
// define multiple modules and have them as a dependency in the top level. Example: ui.router

function collapse(dependencyKey, moduleMap) {
    // we should crawl the tree to create a single module.
    let moduleToCollapse = moduleMap.modules.get(dependencyKey);
    let file = moduleToCollapse.file;

    let collapseDefinition = {
        baseModule: moduleToCollapse,
        baseFile: file,
        collapseDependencyKey: dependencyKey,
        includedModuleKeys: new Set(),
        moduleMap
    };

    try {
        let baseComponents = crawlTree(collapseDefinition, moduleToCollapse);
        collapseDefinition.components = baseComponents.filter(component => component.type !== 'run' && component.type !== 'config');
    }
    catch(error) {
        console.log(error.message);
        console.log(error.stack);
    }
    return collapseDefinition;
}

function crawlTree(collapseDefinition, angularModule) {
    let components = [];
    collapseDefinition.includedModuleKeys.add(angularModule.name);
    angularModule.collapseParentDefinition = collapseDefinition;
    for( let component of angularModule.components.values()) {
        components.push(component);
        component.collapseParentDefinition = collapseDefinition;
    }

    angularModule.tags.collapseDependencyKey = collapseDefinition.collapseDependencyKey;

    console.log('collapsing ' + angularModule.name);

    for(let dependency of angularModule.moduleDependencies.values()) {
        if(dependency && dependency.file === collapseDefinition.baseFile && !collapseDefinition.includedModuleKeys.has(dependency.name)) {
            components = components.concat(crawlTree(collapseDefinition, dependency));
        }
    }

    return components;
}

module.exports = { collapse, crawlTree };