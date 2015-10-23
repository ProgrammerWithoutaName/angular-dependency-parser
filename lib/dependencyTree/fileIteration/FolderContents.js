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
        if(this.tags.singleFile) {
            return this.loadFile();
        }
        return this.loadFolder();
    }

    loadFolder() {
        return new Promise( (resolve, reject) => {
            fsp.readdir(this.path).then((list, error) => {
                if(error) {
                    reject();
                } else {
                    this.contents = list;
                    resolve();
                }
            }, reject).catch(reject);
        });
    }

    loadFile() {
        return new Promise( (resolve) => resolve());
    }

    *directoryItems() {
        for(let folderItem of this.contents) {
            yield new Promise((resolve, reject) => {
                let fileInfo = new FileInformation({
                    fileName: folderItem,
                    parentFolder: this.path,
                    tags: this.tags
                });

                fileInfo.initialize().then(resolve, reject).catch(reject);
            });
        }
    }
}

module.exports = FolderContents;