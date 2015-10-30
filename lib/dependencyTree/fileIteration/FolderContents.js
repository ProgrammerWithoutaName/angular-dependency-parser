'use strict';
const ModuleMap = require('../ModuleMap');
const path = require('path');
const fsp = require('fs-promise');
const FileInformation = require('./FileInformation');
const PromiseTracker = require('multi-promise');

class FolderContents {
    constructor(options) {
        this.path = options.folderPath;
        this.tags = options.tags;
        this.promiseTracker = new PromiseTracker();
        this.promise = this.promiseTracker.promise;

        if(this.tags.singleFile) {
            let file = path.basename(this.path);
            this.contents = [];
            this.contents.push(file);
            this.path = this.path.replace(file, '');
            this.promiseTracker.allPromisesGiven = true;
        }
    }

    initialize() {
        if(!this.tags.singleFile) {
            this.loadFolder();
        } else {
            this.loadDirectoryItems();
        }
        return this.promise;
    }

    loadFolder() {
        fsp.readdir(this.path).then((list, error) => {
            if(error) {
                throw error;
            } else {
                this.contents = list;
                this.loadDirectoryItems();
            }
        }, error => { throw error; }).catch(error => { throw error; });
    }

    loadDirectoryItems() {
        this.promiseTracker.expectedPromiseCount = this.contents.length;
        this.directoryItems = [];

        this.contents.forEach(folderItem => {
            let fileInfo = new FileInformation({
                fileName: folderItem,
                parentFolder: this.path,
                tags: this.tags
            });
            this.directoryItems.push(fileInfo);

            this.promiseTracker.generatePromiseAttachment(fileInfo.initialize());
        });
    }
}

module.exports = FolderContents;