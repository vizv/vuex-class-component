"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var actions_1 = require("./actions");
var _1 = require(".");
var VuexModule = /** @class */ (function () {
    function VuexModule() {
    }
    VuexModule.CreateSubModule = function (SubModule) {
        return {
            type: _1._submodule,
            store: SubModule
        };
    };
    VuexModule.CreateProxy = function ($store, cls) {
        return createProxy($store, cls, _1._proxy);
    };
    VuexModule.ExtractVuexModule = function (cls) {
        var proxiedActions = actions_1.getMutatedActions(cls);
        var rawActions = cls.prototype[_1._actions];
        var actions = __assign({}, proxiedActions, rawActions);
        //Update prototype with mutated actions.
        cls.prototype[_1._actions] = actions;
        var mod = {
            namespaced: cls.prototype[_1._namespacedPath].length > 0 ? true : false,
            state: cls.prototype[_1._state],
            mutations: cls.prototype[_1._mutations],
            actions: actions,
            getters: cls.prototype[_1._getters],
            modules: cls.prototype[_1._module]
        };
        return mod;
    };
    return VuexModule;
}());
exports.VuexModule = VuexModule;
function createProxy($store, cls, cachePath) {
    var rtn = {};
    var path = cls.prototype[_1._namespacedPath];
    var prototype = cls.prototype;
    if (prototype[cachePath] === undefined) { // Proxy has not been cached.
        Object.getOwnPropertyNames(prototype[_1._getters] || {}).map(function (name) {
            Object.defineProperty(rtn, name, {
                get: function () { return $store.getters[path + name]; },
                value: prototype[_1._state][name]
            });
        });
        Object.getOwnPropertyNames(prototype[_1._mutations] || {}).map(function (name) {
            rtn[name] = function (payload) {
                $store.commit(path + name, payload);
            };
        });
        Object.getOwnPropertyNames(prototype[_1._actions] || {}).map(function (name) {
            rtn[name] = function (payload) {
                return $store.dispatch(path + name, payload);
            };
        });
        Object.getOwnPropertyNames(cls.prototype[_1._submodule] || {}).map(function (name) {
            var vxmodule = cls.prototype[_1._submodule][name];
            vxmodule.prototype[_1._namespacedPath] = path + name + "/";
            rtn[name] = vxmodule.CreateProxy($store, vxmodule);
        });
        // Cache proxy.
        prototype[_1._proxy] = rtn;
    }
    else {
        // Use cached proxy.
        rtn = prototype[cachePath];
    }
    return rtn;
}
exports.createProxy = createProxy;
var defaultOptions = {
    namespacedPath: ""
};
function Module(options) {
    if (options === void 0) { options = defaultOptions; }
    return function (target) {
        var targetInstance = new target();
        var states = Object.getOwnPropertyNames(targetInstance);
        var stateObj = {};
        if (target.prototype[_1._map] === undefined)
            target.prototype[_1._map] = [];
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var stateField = states_1[_i];
            // @ts-ignore
            var stateValue = targetInstance[stateField];
            if (stateValue === undefined)
                continue;
            if (subModuleObjectIsFound(stateValue)) {
                handleSubModule(target, stateField, stateValue);
                continue;
            }
            stateObj[stateField] = stateValue;
            target.prototype[_1._map].push({ value: stateField, type: "state" });
        }
        target.prototype[_1._state] = stateObj;
        var fields = Object.getOwnPropertyDescriptors(target.prototype);
        if (target.prototype[_1._getters] === undefined)
            target.prototype[_1._getters] = {};
        var _loop_1 = function (field) {
            var getterField = fields[field].get;
            if (getterField) {
                var func = function (state) {
                    return getterField.call(state);
                };
                target.prototype[_1._getters][field] = func;
            }
        };
        for (var field in fields) {
            _loop_1(field);
        }
        if (options)
            target.prototype[_1._namespacedPath] = options.namespacedPath;
    };
}
exports.Module = Module;
function subModuleObjectIsFound(stateValue) {
    if (stateValue === null)
        return false;
    return (typeof stateValue === "object") && (stateValue.type === _1._submodule);
}
function handleSubModule(target, stateField, stateValue) {
    var _a, _b;
    if (target.prototype[_1._module] === undefined) {
        target.prototype[_1._module] = (_a = {},
            _a[stateField] = stateValue.store.ExtractVuexModule(stateValue.store),
            _a);
        target.prototype[_1._submodule] = (_b = {},
            _b[stateField] = stateValue.store,
            _b);
    }
    else {
        target.prototype[_1._module][stateField] = stateValue.store.ExtractVuexModule(stateValue.store);
        target.prototype[_1._submodule][stateField] = stateValue.store;
    }
}
//# sourceMappingURL=module.js.map