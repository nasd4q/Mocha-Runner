import { CancellationToken, CodeLens, CodeLensProvider, ProviderResult, Range, TextDocument } from 'vscode';
import { MochaParser } from 'mocha-parser';


export class MochaRunnerCodeLensProvider implements CodeLensProvider {

  provideCodeLenses<T>(document: TextDocument, token: CancellationToken): ProviderResult<T[]> {
    const codeLens = [];
    
    MochaParser.extractNodes(document.getText()).forEach(d => {
      codeLens.push(new CodeLens(
        new Range(
          d.range.start.line - 1,
          d.range.start.column,
          d.range.end.line - 1,
          d.range.end.column),
        {
          arguments: [d.name],
          command: 'extension.runMocha',
          title: 'Run'
        }
      ));
      codeLens.push(new CodeLens(
        new Range(
          d.range.start.line - 1,
          d.range.start.column,
          d.range.end.line - 1,
          d.range.end.column),
        {
          arguments: [d.name],
          command: 'extension.debugMocha',
          title: 'Debug'
        }
      ));
    });
    return codeLens;
  }
}
