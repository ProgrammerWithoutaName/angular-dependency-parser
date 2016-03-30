'use strict';

function format(options) {
    switch(options.type) {
        case 'provider':
            return `${options.name}Provider`;
        case 'filter':
            return `${options.name}Filter`;
        case 'config':
            return undefined;
        case 'route':
            return undefined;
        default:
            return options.name;
    }
}

module.exports = { format };