#!/usr/bin/env yarn ts-node
"use strict";
/**
 * @file
 * The script generates index files for submodules.
 *
 * It's a part of the build process.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const promises_1 = require("fs/promises");
const listFns_1 = tslib_1.__importDefault(require("../_lib/listFns"));
const listFPFns_1 = tslib_1.__importDefault(require("../_lib/listFPFns"));
const listLocales_1 = tslib_1.__importDefault(require("../_lib/listLocales"));
;
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const locales = yield (0, listLocales_1.default)();
    const fns = yield (0, listFns_1.default)();
    const fpFns = (0, listFPFns_1.default)();
    (0, promises_1.writeFile)('src/index.ts', generateIndex(fns, false, true));
    (0, promises_1.writeFile)('src/fp/index.ts', generateIndex(fpFns, true, true));
    (0, promises_1.writeFile)('src/locale/index.ts', generateIndex(locales, false, false));
}))();
function generateIndex(files, isFP, includeConstants) {
    const lines = files.map((file) => `export { default as ${file.name} } from '${file.path}/index'`);
    if (includeConstants)
        lines.push(`export * from '${isFP ? '..' : '.'}/constants/index'`);
    return `// This file is generated automatically by \`scripts/build/indices.ts\`. Please, don't change it.

${lines.join('\n')}
`;
}
//# sourceMappingURL=indices.js.map