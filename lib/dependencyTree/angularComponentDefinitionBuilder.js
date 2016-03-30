'use strict';
const esprima = require('esprima');

let angularComponentDefinitionBuilder;

angularComponentDefinitionBuilder = {
    buildComponentDefinition: angularComponent => {
        if (Array.isArray(angularComponent)) {
            return angularComponentDefinitionBuilder.buildComponentDefinitionFromArray(angularComponent);
        } else if (typeof angularComponent === 'function') {
            return angularComponentDefinitionBuilder.buildComponentDefinitionFromFunction(angularComponent);
        }
        return undefined;
    },

    buildComponentDefinitionFromArray: angularComponentArray => {
        let componentDefinition = {
            functionImplementation: angularComponentArray.splice(angularComponentArray.length - 1, 1)[0],
            dependencies: angularComponentArray || []
        };
        return componentDefinition;
    },

    buildComponentDefinitionFromFunction: angularComponentFunction => {
        let componentDefinition = {};
        componentDefinition.functionImplementation = angularComponentFunction;
        if (Array.isArray(angularComponentFunction.$inject)) {
            componentDefinition.dependencies = angularComponentFunction.$inject;
        } else {
            componentDefinition.dependencies = angularComponentDefinitionBuilder.getParameterList(angularComponentFunction);
        }
        return componentDefinition
    },

    getParameterList: angularComponentFunction => {
        // since we are parsing just the function, we can safely assume that the function is the first thing in the body.
        let parsedFunction = esprima.parse(`var angularComponentFunction = ${angularComponentFunction}`);
        return angularComponentDefinitionBuilder.getFunctionDefinition(parsedFunction).params.map(param => param.name);
    },

    getFunctionDefinition: (ast) => ast.body[0].declarations[0].init
};


module.exports = angularComponentDefinitionBuilder;