'use strict';
const path = require('path');
const FolderLoader = require('./lib/dependencyTree/fileIteration/FolderLoader');
const deindent = require('./lib/deindent');
const ModuleMap = require('./lib/dependencyTree/ModuleMap');
let DependencyLinker = require('./lib/dependencyTree/DependencyLinker');
let LoadTracker = require('./lib/dependencyTree/fileIteration/LoadTracker');

function convertProjects(directories) {
    let moduleMap = new ModuleMap();
    let loadTracker = new LoadTracker();

    return new Promise( (resolve, reject) => {
        loadTracker.promise.then(() => resolve(moduleMap), reject);
        directories.forEach(directory => {
            if(directory.individualScripts) {
                loadIndividualScripts(directory, loadTracker, moduleMap);
            } else {
                loadProject(directory, loadTracker, moduleMap);
            }
        });
        loadTracker.loadingAll = false;
    });
}

function loadProject(directory, loadTracker, moduleMap) {
    directory.moduleMap = moduleMap;
    let folderLoader = new FolderLoader(directory);
    let loadComplete = loadTracker.generateLoadResults(folderLoader);

    folderLoader.loadAll().then(loadComplete, (error) => {
        throw new Error(`Error for ${directory.folderPath}, error: ${error}`);
    }).catch(error => {
        throw new Error(`Error for ${directory.folderPath}, error: ${error}`);
    });
}

function loadIndividualScripts(directory, loadTracker, moduleMap) {
    directory.filePaths.forEach(path => loadSingleScript(path, directory.tags, loadTracker, moduleMap));
}

function loadSingleScript(script, tags, loadTracker, moduleMap) {
    let folderLoader = new FolderLoader({
        folderPath: script,
        moduleMap,
        tags
    });

    let loadComplete = loadTracker.generateLoadResults(folderLoader);

    folderLoader.loadAll().then(loadComplete, (error) => {
        throw new Error(`Error for ${script}, error: ${error}`);
    }).catch(error => {
        throw new Error(`Error for ${script}, error: ${error}`);
    });
}

module.exports = { convertProjects }