"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aspotLocal = exports.aspot = void 0;
const basicStoreNode_1 = require("./basicStoreNode");
const localNode_1 = require("./localNode");
const rootNode_1 = require("./rootNode");
__exportStar(require("./match"), exports);
const aspot = () => (0, rootNode_1.default)((0, basicStoreNode_1.default)());
exports.aspot = aspot;
const aspotLocal = (name) => (0, rootNode_1.default)((0, localNode_1.default)(name)((0, basicStoreNode_1.default)()));
exports.aspotLocal = aspotLocal;
//# sourceMappingURL=aspot.js.map