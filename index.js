'use strict';
const path = require('path');
const FolderLoader = require('./lib/dependencyTree/fileIteration/FolderLoader');
const deindent = require('./lib/deindent');
const ModuleMap = require('./lib/dependencyTree/ModuleMap');
let DependencyLinker = require('./lib/dependencyTree/DependencyLinker');
let LoadTracker = require('./lib/dependencyTree/fileIteration/LoadTracker');


let importedScripts = [
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/angularuiselect2/select2.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/angular-animate.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/angular-file-upload.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/angular-ui-router/release/angular-ui-router.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/angular-google-analytics/dist/angular-google-analytics.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/angular-scroll/angular-scroll.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/breeze.angular.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/ui-bootstrap-tpls-0.10.0.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/angular-idle.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/angular-local-storage.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/Scripts/globalize.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/ng-busy/build/angular-busy.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/ngQuickDate/dist/ng-quick-date.js",
    "C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/bower_components/angular-bootstrap-show-errors/src/showErrors.js"
];


let directories = [
    {
        folderPath: 'C:/development/olie2/smg.c3.olie2/Smg.C3.OLIE2.Web/app',
        tags: {
            web: true,
            convert: true,
            baseFolder: 'webApp'
        }
    },{
        folderPath: 'C:/development/olie2/smg.c3.olie2/Sgm.C3.OLIE2.Common/app',
        tags: {
            common: true,
            convert: true,
            baseFolder: 'commonApp'
        }
    }, {
        individualScripts: true,
        filePaths: importedScripts,
        tags: {
            convert: false,
            singleFile: true
        }
    }
];

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