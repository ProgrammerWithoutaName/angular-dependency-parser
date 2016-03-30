'use strict';
const path = require('path');
const FolderContents = require('./FolderContents');
const ModuleMap = require('../ModuleMap');
const MockBrowser = require('mock-browser').mocks.MockBrowser;

let totalFileCount = 0;

class FolderLoader {
    constructor(options) {
        this.path = options.folderPath;
        this.tags = options.tags;
        this.moduleMap = options.moduleMap || new ModuleMap();
        this.definedGlobals = options.definedGlobals;
        this.onNonScriptFile = options.onNonScriptFile || (() => {});
        this.fileCount = 0;
        this.folderCount = 0;
        this.folderContents = new FolderContents({
            folderPath: options.folderPath,
            tags: options.tags
        });
    }

    loadAll() {
        
        let folderContentsPromise = this.folderContents.initialize();

        return folderContentsPromise.then(() => {
            let loadPromises = [];
            
            loadPromises = this.folderContents.directoryItems.map( directoryItem => this.load(directoryItem));
            
            if(!this.tags.vendor) {
                totalFileCount += this.fileCount;
            }
            
            return Promise.all(loadPromises);
        });
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
            let mockBrowser = new MockBrowser();
            this.moduleMap.currentFile = folderItem.path;
            this.moduleMap.currentTags = JSON.parse(JSON.stringify(this.tags));
            global.angular = this.moduleMap;
            global.window = global; // we are mocking out the browser environment.
            global.document = mockBrowser.getDocument();
            
            // mocking these out for now. Ultimately, we will need to parse the entire project in Esprima and read it the correct way.
            if(this.definedGlobals) {
                this.definedGlobals.forEach(item => global[item] = {});
            }

            folderItem.requireFile();
            resolve();
        });
    }
}

module.exports = FolderLoader;