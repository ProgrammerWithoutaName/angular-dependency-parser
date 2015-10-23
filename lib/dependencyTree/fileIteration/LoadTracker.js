'use strict';

class LoadTracker {
    constructor() {
        this.items = [];
        this._loadingAll = true;

        this.promise = new Promise(resolve => {
            this._resolve = resolve;
        });
    }
    get loadingAll() { return this._loadingAll; }
    set loadingAll(value) {
        this._loadingAll = value;
        this.checkLoading();
    }

    get doneLoading() { return !this.loadingAll && this.items.every(item => !item.loading); }
    checkLoading() {
        if(this.doneLoading) {
            this._resolve();
        }
    }

    generateLoadResults(item) {
        let loadItem = {
            item,
            loading: true
        };
        this.items.push(loadItem);
        return () => {
            loadItem.loading = false;
            this.checkLoading();
        }
    }
}

module.exports = LoadTracker;