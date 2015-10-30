'use strict';
const path = require('path');
const FolderContents = require('./FolderContents');
const ModuleMap = require('../ModuleMap');
const PromiseTracker = require('multi-promise');

let totalFileCount = 0;

class FolderLoader {
    constructor(options) {
        this.path = options.folderPath;
        this.tags = options.tags;
        this.moduleMap = options.moduleMap || new ModuleMap();
        this.onNonScriptFile = options.onNonScriptFile || (() => {});
        this.fileCount = 0;
        this.folderCount = 0;
        this.folderContents = new FolderContents({
            folderPath: options.folderPath,
            tags: options.tags
        });
    }

    loadAll() {
        let promiseTracker = new PromiseTracker();
        let folderContentsPromise = this.folderContents.initialize();

        promiseTracker.generatePromiseAttachment(folderContentsPromise).then(() => {
            this.folderContents.directoryItems.forEach( directoryItem => {
                promiseTracker.generatePromiseAttachment(this.load(directoryItem));
            });

            promiseTracker.expectedPromiseCount = 1 + this.folderContents.directoryItems.length;
            if(!this.tags.vendor) {
                totalFileCount += this.fileCount;
            }
        });

        return promiseTracker.promise;
    }

    load(folderItem) {
        if(folderItem.isDirectory) {
            return this.loadDirectory(folderItem);
        } else if(folderItem.isJavascript && !folderItem.isSpec) {
            return this.loadFile(folderItem);
        }

        this.onNonScriptFile(folderItem);
        return new Promise(resolve => resolve());
    }

    loadDirectory(folderItem) {
        this.folderCount += 1;
        let folderLoader = new FolderLoader({
            folderPath: folderItem.path,
            tags: this.tags,
            moduleMap: this.moduleMap,
            onNonScriptFile: this.onNonScriptFile
        });
        return folderLoader.loadAll();
    }

    loadFile(folderItem) {
        this.fileCount += 1;
        return new Promise(resolve => {
            this.moduleMap.currentFile = folderItem.path;
            this.moduleMap.currentTags = this.tags;
            global.angular = this.moduleMap;
            global.window = global; // we are mocking out the browser environment.
            folderItem.requireFile();
            resolve();
        });
    }
}

module.exports = FolderLoader;