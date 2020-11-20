import { parse, ParsedNode } from 'jest-editor-support';
import { CancellationToken, CodeLens, CodeLensProvider, ProviderResult, Range, TextDocument } from 'vscode';
import { findFullTestName, escapeRegExp } from './util';

function getTestsBlocks(parsedNode: ParsedNode, parseResults: ParsedNode[]): CodeLens[] {
  const codeLens: CodeLens[] = [];

  parsedNode.children?.forEach(subNode => {
    codeLens.push(...getTestsBlocks(subNode, parseResults));
  });

  const range = new Range(
    parsedNode.start.line - 1,
    parsedNode.start.column,
    parsedNode.end.line - 1,
    parsedNode.end.column
  );

  if (parsedNode.type === 'expect') {
    return [];
  }

  const fullTestName = escapeRegExp(findFullTestName(parsedNode.start.line, parseResults));

  codeLens.push(
    new CodeLens(range, {
      arguments: [fullTestName],
      command: 'extension.runJest',
      title: 'Run'
    }),
    new CodeLens(range, {
      arguments: [fullTestName],
      command: 'extension.debugJest',
      title: 'Debug'
    })
  );

  return codeLens;
}

export class JestRunnerCodeLensProvider implements CodeLensProvider {

  provideCodeLenses<T>(document: TextDocument, token: CancellationToken): ProviderResult<T[]> {
    const parseResults = parse(document.fileName, document.getText()).root.children;

    const codeLens = [];
    parseResults.forEach(parseResult => codeLens.push(...getTestsBlocks(parseResult, parseResults)));
    return codeLens;
  }
}
