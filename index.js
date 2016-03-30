'use strict';
const path = require('path');
const FolderLoader = require('./lib/dependencyTree/fileIteration/FolderLoader');
const ModuleMap = require('./lib/dependencyTree/ModuleMap');
const DependencyLinker = require('./lib/dependencyTree/DependencyLinker');
const moduleCollapse = require('./lib/moduleCollapse/moduleCollapse');

function convertProjects(directories, definedGlobals) {
    let moduleMap = new ModuleMap();
    let readPromises = [];
    console.log('starting project');

    return new Promise( (resolve, reject) => {

        readPromises = loadDirectories(directories, moduleMap, definedGlobals);

        Promise.all(readPromises).then(() => {
            linkDependencies(moduleMap);
            collapseFlaggedModules(directories, moduleMap);
            resolve(moduleMap);
        }, reject).catch(reject);

        console.log('done setting folder loaders.');
    });
}

function collapseFlaggedModules(directories, moduleMap) {
    moduleMap.collapsedModules = new Map();
    directories.filter(directory => directory.tags.collapse).forEach( directory => {
        directory.tags.collapse.forEach(dependencyKey =>
            moduleMap.collapsedModules.set(dependencyKey, moduleCollapse.collapse(dependencyKey, moduleMap)));
    });
}

function loadDirectories(directories, moduleMap, definedGlobals) {
    return directories.map(directory => {
        if(directory.individualScripts) {
            return Promise.all(loadIndividualScripts(directory, moduleMap, definedGlobals));
        } else {
            return loadProject(directory, moduleMap, definedGlobals);
        }
    });
}

function linkDependencies(moduleMap) {
    console.log('starting link');
    let dependencyLinker = new DependencyLinker(moduleMap);

    dependencyLinker.linkComponentDependencies();
    dependencyLinker.linkModuleDependencies();

    console.log('linking complete');
}

function loadProject(directory, moduleMap, definedGlobals) {
    directory.moduleMap = moduleMap;
    directory.definedGlobals = definedGlobals;
    console.log(`parsing Folder: ${directory.folderPath}`);
    if(directory.tags.trackNonScriptFiles) {
        moduleMap.nonScriptFiles[directory.tags.baseFolder] = {
            tags: directory.tags,
            folderItems: []
        };
        directory.onNonScriptFile = folderItem => moduleMap.nonScriptFiles[directory.tags.baseFolder].folderItems.push(folderItem);
    }

    let folderLoader = new FolderLoader(directory);
    let loadComplete = folderLoader.loadAll();
    let loadError =(error) => {
        throw new Error(`Error for ${directory.folderPath}, error: ${error}`);
    };

    loadComplete.then(() => {}, loadError).catch(loadError);

    return loadComplete;
}

function loadIndividualScripts(directory, moduleMap, definedGlobals) {
    return directory.filePaths.map(path => loadSingleScript(path, directory.tags, moduleMap, definedGlobals));
}

function loadSingleScript(script, tags, moduleMap, definedGlobals) {
    console.log(`parsing Script: ${script}`);

    let folderLoader = new FolderLoader({
        folderPath: script,
        moduleMap,
        tags,
        definedGlobals
    });

    let loadComplete = folderLoader.loadAll();

    let loadError = (error) => {
        throw new Error(`Error for ${script}, error: ${error}`);
    };
    loadComplete.then(()=>{}, loadError).catch(loadError);

    return loadComplete;
}

module.exports = { 
    convertProjects 
};