'use strict';
const path = require('path');
const FolderContents = require('./FolderContents');
const ModuleMap = require('../ModuleMap');
const LoadTracker = require('./LoadTracker');

class FolderLoader {
    constructor(options) {
        this.path = options.folderPath;
        this.tags = options.tags;
        this.moduleMap = options.moduleMap || new ModuleMap();
        this.contents = new FolderContents({
            folderPath: options.folderPath,
            tags: options.tags
        });
    }

    loadAll() {
        let loadTracker = new LoadTracker();
        return new Promise((resolve, reject) => {
            this.contents.initialize().then(() => {
                for(let folderItem of this.contents.directoryItems()) {
                    let itemResolved = loadTracker.generateLoadResults(folderItem);
                    folderItem.then(results =>
                            this.loadItem(results).then(itemResolved, reject), reject)
                        .catch(reject);
                }
                loadTracker.loadingAll = false;
            }, reject);
            loadTracker.promise.then(resolve);
        });
    }

    loadItem(folderItem) {
        if(folderItem.isDirectory) {
            return this.loadDirectory(folderItem);
        } else if(folderItem.isJavascript && !folderItem.isSpec) {
            return this.loadFile(folderItem);
        }
        return new Promise(resolve => resolve());
    }

    loadDirectory(folderItem) {
        let folderLoader = new FolderLoader({
            folderPath: folderItem.path,
            tags: this.tags,
            moduleMap: this.moduleMap
        });
        return folderLoader.loadAll();
    }

    loadFile(folderItem) {
        return new Promise(resolve => {
            this.moduleMap.currentFile = folderItem.path;
            this.moduleMap.currentTags = this.tags;
            global.angular = this.moduleMap;
            global.window = global; // we are mocking out the browser environment.
            folderItem.requireFile();
            resolve();
        });
    }

    loadFolder(folderItem) {

    }
}

module.exports = FolderLoader;