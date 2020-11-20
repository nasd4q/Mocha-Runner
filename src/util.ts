export function isWindows(): boolean {
  return process.platform.includes('win32');
}

export function normalizePath(path: string): string {
  return isWindows() ? path.replace(/\\/g, '/') : path;
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function findFullTestName(selectedLine: number, children: any[]): string | undefined {
  if (!children) {
    return;
  }
  for (const element of children) {
    if (element.type === 'describe' && selectedLine === element.start.line) {
      return element.name;
    }
    if (element.type !== 'describe' && selectedLine >= element.start.line && selectedLine <= element.end.line) {
      return element.name;
    }
  }
  for (const element of children) {
    const result = findFullTestName(selectedLine, element.children);
    if (result) {
      return element.name + ' ' + result;
    }
  }
}

const QUOTES = {
  '"': true,
  // tslint:disable-next-line:prettier
  '\'': true,
  '`': true
};

export function exactRegexMatch(s: string): string {
  return ['^', s, '$'].join('');
}

export function escapeSingleQuotes(s: string): string {
  return isWindows() ? s : s.replace(/'/g, "'\\''");
}

export function quote(s: string): string {
  const q = isWindows() ? '"' : `'`;
  return [q, s, q].join('');
}

export function unquote(s: string): string {
  if (QUOTES[s[0]]) {
    s = s.substring(1);
  }

  if (QUOTES[s[s.length - 1]]) {
    s = s.substring(0, s.length - 1);
  }

  return s;
}

export function pushMany<T>(arr: T[], items: T[]): number {
  return Array.prototype.push.apply(arr, items);
}
