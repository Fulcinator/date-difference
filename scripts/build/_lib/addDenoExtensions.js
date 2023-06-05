"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const fs_1 = tslib_1.__importDefault(require("fs"));
const globby_1 = tslib_1.__importDefault(require("globby"));
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const { readFile, writeFile, stat } = fs_1.default.promises;
const pattern = /\.(ts|js)$/;
const ignore = [/\.d\.ts$/];
const resolvedExtensions = {};
(0, globby_1.default)('deno')
    .then((files) => files.filter((file) => pattern.test(file) && !ignore.find((p) => p.test(file))))
    .then((files) => Promise.all(files.map((file) => readFile(file, 'utf8').then((content) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const source = typescript_1.default.createSourceFile(file, content, typescript_1.default.ScriptTarget.Latest);
    const imports = [];
    source.forEachChild((node) => {
        if ([
            typescript_1.default.SyntaxKind.ImportDeclaration,
            typescript_1.default.SyntaxKind.ExportDeclaration,
        ].includes(node.kind)) {
            const importNode = node;
            const specifier = importNode.moduleSpecifier;
            const importPath = specifier.text;
            const isLocal = /\.\/.+/;
            if (isLocal)
                imports.push(importPath);
        }
    });
    yield Promise.all(imports.map((importPath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (resolvedExtensions[importPath])
            return;
        const fullPath = resolveFullPath(file, importPath);
        let isTs = false;
        try {
            yield stat(fullPath + '.ts');
            isTs = true;
        }
        catch (_) { }
        resolvedExtensions[fullPath] = isTs ? '.ts' : '.js';
    })));
    return writeFile(file, imports.reduce((acc, importPath) => {
        const fullPath = resolveFullPath(file, importPath);
        return acc.replace(new RegExp(importPath, 'g'), importPath + resolvedExtensions[fullPath]);
    }, content));
})))));
function resolveFullPath(file, importPath) {
    return (0, path_1.resolve)((0, path_1.dirname)(file), importPath);
}
//# sourceMappingURL=addDenoExtensions.js.map