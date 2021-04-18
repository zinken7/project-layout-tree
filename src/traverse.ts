import { readdirSync, statSync, Stats } from 'fs';
import { resolve } from 'path';
import { FilesStat, LevInfo, File, Folder } from './type';
import { clone } from './utils';
import { verify, produceRules } from './ignore/index';
let levInfos: LevInfo[] = [];

/**
 * sort these files like VS Code. directories first, and then non-directories
 * @param files
 */
 function sortFilesLikeVSCode (files: FilesStat[]) {
    const directories = files.filter(item => item.isDirectory).sort((a,b) => a.name.localeCompare(b.name));
    const nonDirectories = files.filter(item => !item.isDirectory).sort((a,b) => a.name.localeCompare(b.name));
    return directories.concat(nonDirectories);
  }

/**
 * Load all files and folders in workspace
 * @param ancestor
 * @param pathName
 * @param level
 * @param folder
 * @param callback
 */
export function traverseFolder(
    ancestor: string,
    pathName: string = '',
    level: number = 0,
    folder: Folder = new Folder(),
    callback: Function = function() {}
) {
    const acPath: string = resolve(ancestor, pathName);
    if (level === 0) {
        folder = new Folder(ancestor, pathName, level);
        produceRules(acPath); //detect files in gitignore
    }
    callback(ancestor, pathName, level);
    const rawfiles = readdirSync(acPath, "utf8")
    .map(item => {
        const fileStat: Stats = statSync(resolve(acPath, item));
        const isDirectory: boolean = fileStat.isDirectory();
    
        return {
          name: item,
          isDirectory: isDirectory
        };
      });
    const files: FilesStat[] = sortFilesLikeVSCode(rawfiles);
    files.forEach(item => {
        const curLevel = level + 1;
        const fileStat: Stats = statSync(resolve(acPath, item.name));
        const isDirectory: boolean = fileStat.isDirectory();
        const isBlocked: boolean = verify(acPath, item.name, isDirectory);
        if (isBlocked) {
            return;
        }
        if (isDirectory) {
            const childFolder: Folder = new Folder(acPath, item.name, curLevel);
            folder.addChild(childFolder);
            traverseFolder(acPath, item.name, curLevel, childFolder, callback);
        } else {
            folder.addChild(new File(acPath, item.name, curLevel));
            callback(acPath, item.name, curLevel);
        }
    });
    return folder;
}

/**
 * Load tree files
 * @param folder
 * @param callback
 * @param lasStatus
 */
export function traverse(
    folder: Folder,
    callback: Function = function() {},
    lasStatus: number[] = []
) {
    const ancestor = folder.getAncestor(),
        pathName = folder.getPathName(),
        level = folder.getLevel();
    if (folder.getLevel() === 0) {
        lasStatus = [0];
        levInfos = [
            {
                ancestor,
                pathName,
                level,
                lasStatus
            }
        ];
    }
    callback(ancestor, pathName, level);
    const files: Array<File | Folder> = folder.getChildren();
    files.forEach((item: File | Folder, index: number) => {
        const curLevel = item.getLevel();
        lasStatus = clone(lasStatus);
        lasStatus[curLevel] = Number(index === files.length - 1);
        levInfos.push({
            ancestor: item.getAncestor(),
            pathName: item.getPathName(),
            level: curLevel,
            lasStatus
        });
        if (item instanceof Folder) {
            traverse(<Folder>item, callback, lasStatus);
        } else {
            callback(item.getAncestor(), item.getPathName(), curLevel);
        }
    });
    if (level === 0) {
        return levInfos;
    }
}
