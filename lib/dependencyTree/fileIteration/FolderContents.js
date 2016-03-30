'use strict';
const ModuleMap = require('../ModuleMap');
const path = require('path');
const fsp = require('fs-promise');
const FileInformation = require('./FileInformation');

class FolderContents {
    constructor(options) {
        this.path = options.folderPath;
        this.tags = options.tags;
        
        if(this.tags.singleFile) {
            let file = path.basename(this.path);
            this.contents = [];
            this.contents.push(file);
            this.path = this.path.replace(file, '');
        }
    }

    initialize() {
        if(!this.tags.singleFile) {
            return this.loadFolder();
        } else {
            return this.loadDirectoryItems();
        }
    }

    loadFolder() {
        return fsp.readdir(this.path).then((list, error) => {
            if(error) {
                throw error;
            } else {
                this.contents = list;
                return this.loadDirectoryItems();
            }
        }, error => { throw error; });
    }

    loadDirectoryItems() {
        this.directoryItems = [];

        let fileInfoInitPromises = this.contents.map(folderItem => {
            let fileInfo = new FileInformation({
                fileName: folderItem,
                parentFolder: this.path,
                tags: JSON.parse(JSON.stringify(this.tags)) // Object clone
            });
            this.directoryItems.push(fileInfo);

            return fileInfo.initialize();
        });
        return Promise.all(fileInfoInitPromises);
    }
}

module.exports = FolderContents;