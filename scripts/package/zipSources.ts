import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { zip } from 'zip-a-folder';
import packageJson from '../../package.json';
import { bash, BOLD, CODE, run, subStep, title } from '../utils';
import { downloadTarball } from './downloadTarball';

function isPrivateDependency(dependency: string) {
  return dependency.startsWith('@anime-skip/');
}
function dependencyFilename(dependency: string) {
  return dependency.replace(/@/g, '').replace(/\//, '-') + '.tgz';
}

export async function zipSources(OUTPUT_DIR: string) {
  title(`Creating ${CODE}sources.zip`);
  const tempFolder = path.join(OUTPUT_DIR, '.temp-sources');
  const sourcesZip = path.join(OUTPUT_DIR, 'sources.zip');
  const sources = [
    'scripts/',
    'src/',
    '.nvmrc',
    'package.json',
    'pnpm-lock.yaml',
    'postcss.config.js',
    'SOURCE_CODE_REVIEW.md',
    'tailwind.config.js',
    'tsconfig.json',
    'vite.config.ts',
  ];

  await run(`Moving essential sources to temp folder`, async () => {
    fs.ensureDirSync(tempFolder);
    for (const source of sources) {
      const flags = [];
      if (source.endsWith('/')) flags.push('-r');

      await bash(`cp ${flags.join(' ')} "${source}" "${tempFolder}"`);
    }
  });
  subStep(`${BOLD}${sources.join(' ')}`);

  const privateDeps = Object.keys(packageJson.dependencies).filter(isPrivateDependency);
  if (privateDeps.length > 0) {
    await run(`Download private modules to ${CODE}local_modules/`, async () => {
      const localModulesDir = path.resolve(tempFolder, 'local_modules');
      fs.mkdirSync(localModulesDir);
      await Promise.all(
        privateDeps.map(async dep => {
          const url = execSync(`npm view ${dep} dist.tarball`, { encoding: 'utf-8' }).trim();
          const filename = dependencyFilename(dep);
          const tarballPath = path.resolve(localModulesDir, filename);
          await downloadTarball(url, tarballPath);
        })
      );
    });
    subStep(`${BOLD}${privateDeps.join(' ')}`);

    await run(`Pointing to local_modules in ${CODE}package.json`, () => {
      const packageJsonCopy = JSON.parse(JSON.stringify(packageJson));
      const depReplacer = (dep: string) => {
        if (packageJsonCopy.dependencies[dep] != null) {
          packageJsonCopy.dependencies[dep] = `./local_modules/${dependencyFilename(dep)}`;
        }
        if (packageJsonCopy.devDependencies[dep] != null) {
          packageJsonCopy.dependencies[dep] = `./local_modules/${dependencyFilename(dep)}`;
        }
      };
      privateDeps.forEach(depReplacer);
      fs.writeFileSync(
        path.join(tempFolder, 'package.json'),
        JSON.stringify(packageJsonCopy, null, 2),
        { encoding: 'utf-8' }
      );
    });
  }

  await run(`Zipping ${CODE}sources.zip`, () => zip(tempFolder, sourcesZip));

  await run('Remove temp folder', () => {
    fs.emptyDirSync(tempFolder);
    fs.rmdirSync(tempFolder);
  });
}
