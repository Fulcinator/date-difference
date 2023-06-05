"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const js_fns_1 = require("js-fns");
const simple_git_1 = tslib_1.__importDefault(require("simple-git"));
const core_1 = require("@octokit/core");
const format_1 = tslib_1.__importDefault(require("../../src/format"));
const git = (0, simple_git_1.default)();
const gh = new core_1.Octokit({ auth: process.env.GITHUB_TOKEN });
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const changelog = yield buildChangelog();
    console.log(renderChangelog(changelog));
}))();
function renderChangelog(changelog) {
    let markdown = `## ${renderVersion(changelog.version)} - ${(0, format_1.default)(Date.now(), 'yyyy-MM-dd')}

${(0, js_fns_1.sample)(thanksOptions)(renderAuthors(changelog.authors))}`;
    if (changelog.fixed.length)
        markdown += `

### Fixed

${changelog.fixed.map(renderItem).join('\n\n')}`;
    if (changelog.changed.length)
        markdown += `

### Changed

${changelog.changed.map(renderItem).join('\n\n')}`;
    if (changelog.added.length)
        markdown += `

### Added

${changelog.added.map(renderItem).join('\n\n')}`;
    return markdown;
}
function buildChangelog() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const lastTag = (0, js_fns_1.last)((yield git.tags()).all);
        if (!lastTag)
            throw new Error("Can't find tags");
        const commits = yield git.log({ from: lastTag, to: 'HEAD' });
        const authorsMap = (0, js_fns_1.fromEntries)(yield Promise.all(commits.all.map((c) => gh
            .request('GET /repos/{owner}/{repo}/commits/{ref}', {
            owner: 'date-fns',
            repo: 'date-fns',
            ref: c.hash,
        })
            .then(({ data }) => { var _a; return [c.hash, (_a = data.author) === null || _a === void 0 ? void 0 : _a.login]; }))));
        const items = [];
        const authors = [];
        commits.all.forEach((commit) => {
            var _a;
            const author = {
                login: authorsMap[commit.hash],
                email: commit.author_email,
                name: commit.author_name,
            };
            const prCaptures = commit.message.match(/\(#(\d+)\)/);
            const pr = prCaptures ? parseInt(prCaptures[1]) : undefined;
            let issues;
            (_a = commit.message.match(new RegExp(closesRegExp, 'g'))) === null || _a === void 0 ? void 0 : _a.forEach((str) => {
                const issueCaptures = str.match(closesRegExp);
                if (issueCaptures)
                    issues = (issues || []).concat(issueCaptures.slice(1).map((issue) => parseInt(issue)));
            });
            if (!(issues === null || issues === void 0 ? void 0 : issues.length))
                issues = undefined;
            const commitItems = extractItems(commit.body.trim(), { author, pr, issues });
            if (!authors.find((a) => a.login === author.login))
                authors.push(author);
            items.push(...commitItems);
        });
        const changed = items.filter((i) => i.type === 'changed');
        const fixed = items.filter((i) => i.type === 'fixed');
        const added = items.filter((i) => i.type === 'added');
        const lastVersion = parseVersion(lastTag);
        let version;
        if (items.find((i) => i.breaking)) {
            version = { major: lastVersion.major + 1, minor: 0, patch: 0 };
        }
        else if (changed.length || added.length) {
            version = {
                major: lastVersion.major,
                minor: lastVersion.minor + 1,
                patch: 0,
            };
        }
        else {
            version = {
                major: lastVersion.major,
                minor: lastVersion.minor,
                patch: lastVersion.patch + 1,
            };
        }
        return { version, changed, fixed, added, authors };
    });
}
function parseVersion(tag) {
    const captures = tag.match(/v(\d+)\.(\d+).(\d+)/);
    if (!captures)
        throw new Error(`Can't parse version from tag "${tag}"`);
    return {
        major: parseInt(captures[1]),
        minor: parseInt(captures[2]),
        patch: parseInt(captures[3]),
    };
}
function extractItems(message, { author, pr, issues, }) {
    const item = ({ type, message, }) => {
        const issuesCaptures = message.match(issuesRegExp);
        const messageIssues = issuesCaptures === null || issuesCaptures === void 0 ? void 0 : issuesCaptures.reduce((acc, capture) => acc.concat((capture.match(/#\d+/g) || []).map((str) => parseInt(str.slice(1)))), []);
        const itemIssues = (messageIssues === null || messageIssues === void 0 ? void 0 : messageIssues.length)
            ? (0, js_fns_1.uniq)(messageIssues.concat(issues || []))
            : issues;
        const breaking = /^breaking:\s?/i.test(message);
        return {
            type,
            author,
            message: message.replace(issuesRegExp, ''),
            pr,
            issues: itemIssues,
            breaking,
        };
    };
    switch (true) {
        // Fixed
        case fixedSentenceRegExp.test(message): {
            const captures = message.match(fixedSentenceRegExp);
            return [item({ type: 'fixed', message: captures[2] })];
        }
        case fixedOneLinerRegExp.test(message): {
            const captures = message.match(fixedOneLinerRegExp);
            return [item({ type: 'fixed', message: captures[1] })];
        }
        // Changed
        case changedSentenceRegExp.test(message): {
            const captures = message.match(changedSentenceRegExp);
            return [item({ type: 'changed', message: captures[2] })];
        }
        case changedOneLinerRegExp.test(message): {
            const captures = message.match(changedOneLinerRegExp);
            return [item({ type: 'changed', message: captures[1] })];
        }
        // Added
        case addedSentenceRegExp.test(message): {
            const captures = message.match(addedSentenceRegExp);
            return [item({ type: 'added', message: captures[2] })];
        }
        case addedOneLinerRegExp.test(message): {
            const captures = message.match(addedOneLinerRegExp);
            return [item({ type: 'added', message: captures[1] })];
        }
        default:
            return [];
    }
}
function renderVersion({ major, minor, patch }) {
    return `v${major}.${minor}.${patch}`;
}
function renderAuthors(authors) {
    if (authors.length > 1) {
        return (authors
            .slice(0, authors.length - 1)
            .map(renderAuthor)
            .join(', ') +
            ' and ' +
            renderAuthor((0, js_fns_1.last)(authors)));
    }
    else {
        return renderAuthor(authors[0]);
    }
}
function renderAuthor(author) {
    return `@${author.login}`;
}
function renderItem(item) {
    const message = item.pr
        ? `[${item.message}](https://github.com/date-fns/date-fns/pull/${item.pr})`
        : item.message;
    const issues = item.issues
        ? ` (${item.issues
            .map((i) => `[#${i}](https://github.com/date-fns/date-fns/issues/${i})`)
            .join(', ')})`
        : '';
    return `- ${message}${issues}`;
}
const closesRegExp = /(?:closes|fixes) #(\d+)/;
const issuesRegExp = /\s?\(((?:#\d+(?:,\s?)?)+)\)/g;
const thanksOptions = [
    (authors) => `Kudos to ${authors} for working on the release.`,
    (authors) => `Thanks to ${authors} for working on the release.`,
    (authors) => `This release is brought to you by ${authors}.`,
    (authors) => `On this release worked ${authors}.`,
];
const fixedSentenceRegExp = /^(breaking:\s?)?(fixed\s.+)/i;
const fixedOneLinerRegExp = /^fixed:\s(.+)/i;
const changedSentenceRegExp = /^(breaking:\s?)?(changed\s.+)/i;
const changedOneLinerRegExp = /^changed:\s(.+)/i;
const addedSentenceRegExp = /^(breaking:\s?)?(added\s.+)/i;
const addedOneLinerRegExp = /^added:\s(.+)/i;
//# sourceMappingURL=buildChangelog.js.map