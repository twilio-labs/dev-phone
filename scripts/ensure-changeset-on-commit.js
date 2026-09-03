#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function runGit(args) {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function getStagedFiles() {
    const output = runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
    return output ? output.split('\n').map((file) => file.trim()).filter(Boolean) : [];
}

function hasAddedChangesetFile() {
    const output = runGit(['diff', '--cached', '--name-status', '--diff-filter=A', '--', '.changeset']);
    if (!output) return false;

    return output.split('\n').some((line) => {
        const [status, filePath] = line.split(/\s+/, 2);
        if (status !== 'A' || !filePath) return false;
        if (!filePath.startsWith('.changeset/')) return false;
        const fileName = path.basename(filePath);
        return fileName.endsWith('.md') && fileName !== 'README.md';
    });
}

function getWorkspacePackages(repoRoot) {
    const rootPackageJsonPath = path.join(repoRoot, 'package.json');
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
    const workspaces = Array.isArray(rootPackageJson.workspaces) ? rootPackageJson.workspaces : [];

    const workspacePackages = [];

    for (const workspacePattern of workspaces) {
        if (!workspacePattern.endsWith('/*')) {
            const workspaceDir = workspacePattern.replace(/\/$/, '');
            const packageJsonPath = path.join(repoRoot, workspaceDir, 'package.json');
            if (!fs.existsSync(packageJsonPath)) continue;
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            workspacePackages.push({
                dir: `${workspaceDir.replace(/\\/g, '/')}/`,
                name: packageJson.name,
            });
            continue;
        }

        const workspaceBase = workspacePattern.slice(0, -2).replace(/\/$/, '');
        const workspaceBasePath = path.join(repoRoot, workspaceBase);
        if (!fs.existsSync(workspaceBasePath)) continue;

        const children = fs.readdirSync(workspaceBasePath, { withFileTypes: true });
        for (const child of children) {
            if (!child.isDirectory()) continue;
            const workspaceDir = `${workspaceBase}/${child.name}`;
            const packageJsonPath = path.join(repoRoot, workspaceDir, 'package.json');
            if (!fs.existsSync(packageJsonPath)) continue;

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            workspacePackages.push({
                dir: `${workspaceDir.replace(/\\/g, '/')}/`,
                name: packageJson.name,
            });
        }
    }

    return workspacePackages;
}

function getTouchedPackageNames(stagedFiles, workspacePackages) {
    const touched = new Set();

    for (const filePath of stagedFiles) {
        for (const workspacePkg of workspacePackages) {
            if (filePath.startsWith(workspacePkg.dir)) {
                touched.add(workspacePkg.name);
            }
        }
    }

    return Array.from(touched).sort();
}

function createChangesetFile(repoRoot, packageNames) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const fileName = `auto-${timestamp}-${randomSuffix}.md`;
    const changesetDir = path.join(repoRoot, '.changeset');
    const filePath = path.join(changesetDir, fileName);

    const frontmatter = packageNames.map((name) => `"${name}": patch`).join('\n');
    const content = `---\n${frontmatter}\n---\n\nAuto-generated changeset for staged package updates.\n`;

    fs.writeFileSync(filePath, content, 'utf8');
    runGit(['add', path.relative(repoRoot, filePath)]);

    return path.relative(repoRoot, filePath);
}

function main() {
    try {
        const repoRoot = runGit(['rev-parse', '--show-toplevel']);
        process.chdir(repoRoot);

        const stagedFiles = getStagedFiles();
        if (!stagedFiles.length) {
            process.exit(0);
        }

        if (hasAddedChangesetFile()) {
            process.exit(0);
        }

        const workspacePackages = getWorkspacePackages(repoRoot);
        const touchedPackageNames = getTouchedPackageNames(stagedFiles, workspacePackages);

        if (!touchedPackageNames.length) {
            process.exit(0);
        }

        const createdPath = createChangesetFile(repoRoot, touchedPackageNames);
        console.log(`Created and staged ${createdPath}`);
    } catch (error) {
        console.error('Failed to auto-create changeset:', error.message);
        process.exit(1);
    }
}

main();
