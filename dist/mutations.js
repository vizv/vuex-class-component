"use strict";
exports.__esModule = true;
var _1 = require(".");
function mutation(target, key, descriptor) {
    var _a;
    var func = descriptor.value || new Function();
    var newFunc = function (state, payload) {
        func.call(state, payload);
    };
    var mutations = target[_1._mutations];
    if (mutations === undefined) {
        target[_1._mutations] = (_a = {},
            _a[key] = newFunc,
            _a);
    }
    else {
        target[_1._mutations][key] = newFunc;
    }
}
exports.mutation = mutation;
//# sourceMappingURL=mutations.js.map