#!/usr/bin/env yarn ts-node
"use strict";
/**
 * @file
 * The script generates the FP functions using the docs JSON file.
 *
 * It's a part of the build process.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
;
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const jsDocs = JSON.parse((yield (0, promises_1.readFile)('./tmp/docs.json')).toString());
    const fpFns = Object.keys(jsDocs)
        .map((category) => jsDocs[category])
        .reduce((previousValue, newValue) => [...previousValue, ...newValue], [])
        .filter((doc) => doc.kind === 'function' && doc.isFPFn);
    fpFns.forEach(buildFPFn);
}))();
function getFPFn(initialFnName, arity) {
    return `// This file is generated automatically by \`scripts/build/fp.ts\`. Please, don't change it.

import fn from '../../${initialFnName}/index'
import convertToFP from '../_lib/convertToFP/index'

export default convertToFP(fn, ${arity})
`;
}
function buildFPFn({ title, generatedFrom, args: { length }, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const source = getFPFn(generatedFrom, length);
        const dir = `./src/fp/${title}`;
        if (!(0, fs_1.existsSync)(dir))
            yield (0, promises_1.mkdir)(dir);
        (0, promises_1.writeFile)(`${dir}/index.ts`, source);
        // remove legacy index.js (if any)
        const jsPath = `${dir}/index.js`;
        if ((0, fs_1.existsSync)(jsPath))
            (0, promises_1.unlink)(jsPath);
    });
}
//# sourceMappingURL=fp.js.map