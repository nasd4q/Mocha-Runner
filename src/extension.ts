'use strict';
import * as vscode from 'vscode';
import { CodeLensProvider } from 'vscode';
import { MochaRunnerCodeLensProvider } from './MochaRunnerCodeLensProvider';
import { MochaRunner } from './MochaRunner';

export function activate(context: vscode.ExtensionContext) {
  const codeLensProvider: CodeLensProvider = new MochaRunnerCodeLensProvider();
  const mochaRunner = new MochaRunner();

  const runMocha = vscode.commands.registerCommand('extension.runMocha', async (argument: object | string) => {
    if (typeof argument === 'string') {
      mochaRunner.runCurrentTest(argument);
    } else {
      mochaRunner.runCurrentTest();
    }
  });

  const debugMocha = vscode.commands.registerCommand('extension.debugMocha', async (argument: object | string) => {
    if (typeof argument === 'string') {
      mochaRunner.debugCurrentTest(argument)
    } else {
      mochaRunner.debugCurrentTest()
    }
  });
  const runPrev = vscode.commands.registerCommand('extension.runPrevMocha', async () => mochaRunner.runPrevious());
  const runFile = vscode.commands.registerCommand('extension.runMochaFile', async () => mochaRunner.runCurrentFile());

  /* const runJestFileWithCoverage = vscode.commands.registerCommand('extension.runJestFileWithCoverage', async () =>
    jestRunner.runCurrentFile(['--coverage'])
  ); */

  //TODO make this conditional on some configuration
  if (true) {
    const docSelectors: vscode.DocumentFilter[] = [
      { pattern: "**/*.{test,spec}.{js,jsx,ts,tsx}" },
    ];
    const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(docSelectors, codeLensProvider);
    context.subscriptions.push(codeLensProviderDisposable);
  } 
  context.subscriptions.push(runMocha);
  context.subscriptions.push(runFile);
  context.subscriptions.push(debugMocha);
  context.subscriptions.push(runPrev);
  //context.subscriptions.push(runJestFileWithCoverage);
}

export function deactivate() {
  // deactivate
}
