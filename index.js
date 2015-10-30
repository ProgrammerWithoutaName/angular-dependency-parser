'use strict';
const path = require('path');
const FolderLoader = require('./lib/dependencyTree/fileIteration/FolderLoader');
const ModuleMap = require('./lib/dependencyTree/ModuleMap');
const DependencyLinker = require('./lib/dependencyTree/DependencyLinker');
const PromiseTracker = require('multi-promise');

function convertProjects(directories) {
    let moduleMap = new ModuleMap();
    let promiseTracker = new PromiseTracker();
    console.log('starting project');

    return new Promise( (resolve, reject) => {
        promiseTracker.promise.then(() => {
            console.log('starting link');
            let dependencyLinker = new DependencyLinker(moduleMap);

            dependencyLinker.linkComponentDependencies();
            dependencyLinker.linkModuleDependencies();

            console.log('linking complete');
            resolve(moduleMap);
        }, reject).catch(reject);

        directories.forEach(directory => {

            if(directory.individualScripts) {
                loadIndividualScripts(directory, promiseTracker, moduleMap);
            } else {
                loadProject(directory, promiseTracker, moduleMap);
            }
        });

        console.log('done setting folder loaders.');
        promiseTracker.allPromisesGiven = true;
    });
}

function loadProject(directory, promiseTracker, moduleMap) {
    directory.moduleMap = moduleMap;
    console.log(`parsing Folder: ${directory.folderPath}`);
    if(directory.tags.trackNonScriptFiles) {
        moduleMap.nonScriptFiles[directory.tags.baseFolder] = {
            tags: directory.tags,
            folderItems: []
        };
        directory.onNonScriptFile = folderItem => moduleMap.nonScriptFiles[directory.tags.baseFolder].folderItems.push(folderItem);
    }

    let folderLoader = new FolderLoader(directory);
    let loadComplete = promiseTracker.generatePromiseAttachment(folderLoader.loadAll(), true);
    let loadError =(error) => {
        throw new Error(`Error for ${directory.folderPath}, error: ${error}`);
    };

    loadComplete.then(() => {}, loadError).catch(loadError);
}

function loadIndividualScripts(directory, promiseTracker, moduleMap) {
    directory.filePaths.forEach(path => loadSingleScript(path, directory.tags, promiseTracker, moduleMap));
}

function loadSingleScript(script, tags, promiseTracker, moduleMap) {
    console.log(`parsing Script: ${script}`);
    let folderLoader = new FolderLoader({
        folderPath: script,
        moduleMap,
        tags
    });

    let loadComplete = promiseTracker.generatePromiseAttachment(folderLoader.loadAll(), true);
    let loadError = (error) => {
        throw new Error(`Error for ${script}, error: ${error}`);
    };
    loadComplete.then(()=>{}, loadError).catch(loadError);
}

module.exports = { convertProjects };