export interface FilesStat {
  name: string;
  isDirectory: boolean;
}
export interface LevInfo {
  level: number;
  ancestor: string;
  pathName: string;
  lasStatus: number[];
}

export class File {
  private ancestor!: string;
  private pathName!: string;
  private level!: number;
  constructor(ancestor: string, pathName: string, level: number) {
    this.ancestor = ancestor;
    this.pathName = pathName;
    this.level = level;
  }
  getAncestor() {
    return this.ancestor;
  }
  getPathName() {
    return this.pathName;
  }
  getLevel() {
    return this.level;
  }
}

export class Folder {
  private ancestor: string;
  private pathName: string;
  private level: number;
  private children: (Folder | File)[];
  constructor(
    ancestor: string = "",
    pathName: string = "",
    level: number = 0,
    children: (Folder | File)[] = []
  ) {
    this.ancestor = ancestor;
    this.pathName = pathName;
    this.level = level;
    this.children = children;
  }
  getAncestor() {
    return this.ancestor;
  }
  getPathName() {
    return this.pathName;
  }
  getLevel() {
    return this.level;
  }
  getChildren() {
    return this.children;
  }
  addChild(child: Folder | File) {
    this.children.push(child);
  }
}
