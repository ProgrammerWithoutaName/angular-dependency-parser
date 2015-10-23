'use strict';
const path = require('path');
const fsp = require('fs-promise');

class FileInformation {
    constructor(options) {
        this.parentFolder = options.parentFolder;
        this.fileName = options.fileName;
        this.path = path.join(options.parentFolder, options.fileName);
        this.tags = options.tags;
        this.extension = path.extname(this.fileName);
        this.isJavascript = this.extension === '.js';
        this.isSpec = this.fileName.match(/.[sS]pec.js$/gi);
        this.stat = {};
    }

    getFileWithoutExtension() {
        let extension = new RegExp(`${this.extension}$`, 'gi');
        return this.fileName.replace(extension, '');
    }

    relativeLocation(currentPath) { return path.relative(currentPath, this.path); }
    relativeFolderLocation(currentPath) { return path.relative(currentPath, this.parentFolder); }

    requireFile() {
        let script = path.join(this.relativeFolderLocation(__dirname), this.getFileWithoutExtension());
        require(script);
    }

    initialize() {
        return new Promise((resolve, reject) => {
            fsp.stat(this.path).then((stat, error) => {
                if(error) {
                    reject(error);
                    return;
                }
                this.isDirectory = stat && stat.isDirectory();
                resolve(this);
            });
        });
    }
}

module.exports = FileInformation;