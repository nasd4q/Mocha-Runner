import { MochaParser } from 'mocha-parser';
import * as vscode from 'vscode';
import { escapeSingleQuotes, normalizePath, pushMany, quote, unquote } from './util';

interface DebugCommand {
    documentUri: vscode.Uri;
    config: vscode.DebugConfiguration;
    noDebug: boolean;
}

export class MochaRunner {
    private previousCommand: DebugCommand;

    public async runCurrentTest(currentTestName?: string) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const debugCommand = this.getDebugCommand(editor, true, currentTestName, false);
        this.executeDebugCommand(debugCommand);
    }


    public async debugCurrentTest(currentTestName?: string) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const debugCommand = this.getDebugCommand(editor, false, currentTestName, false);
        this.executeDebugCommand(debugCommand);
    }

    public async runPrevious() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        this.executeDebugCommand(this.previousCommand);
    }

    public async runCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const debugCommand = this.getDebugCommand(editor, true, null, true);
        this.executeDebugCommand(debugCommand);
    }



    /* ****************************************************************************** *
     *                              PRIVATE   METHODS                                 *
     * ****************************************************************************** */


    private getDebugCommand(editor: vscode.TextEditor, noDebug: boolean,
        currentTestName: string, wholeFile: boolean): DebugCommand {
        //1.retrieve debug config : user-defined or provided    
        let config = this.retrieveUserDefinedDebugConfig();
        if (!config) {
            config = this.provideDefaultDebugConfig();

            if (noDebug) {
                //PROBLEM : " symbol is escaped when run from terminal...
                //          (when providing last argument = the reg exp
                //              needed to run only one test)
                //config.internalConsoleOptions = "neverOpen";
                //config.console = "integratedTerminal";
            }
        }

        //2.add args to make it run selected file and, if 'not `wholefile`',
        //  to make it run only 'current' test
        config.args = config.args ? config.args.slice() : [];

        const filePath = editor.document.fileName;
        let testName = null;
        if (!wholeFile) {
            testName = currentTestName || this.findCurrentTestName(editor);
        }

        const standardArgs = this.buildMochaArgs(filePath, testName, false);
        pushMany(config.args, standardArgs);

        //3.conclude
        return {
            config,
            documentUri: editor.document.uri,
            noDebug
        };
    }

    /**
     * Launches debugging of the debug command and updates the value of
     * `this.previousCommand` to the passed `debugCommand`
     * @param debugCommand Specifies the debug configuration (which includes
     * args indicating test file and potentially test name), allows to 
     * retrieve 'workspace folder' (via `documentUri` property), and indicates
     * whether in 'run' mode or 'debug' mode (`noDebug` property)
     */
    private executeDebugCommand(debugCommand: DebugCommand) {
        vscode.debug.startDebugging(
            vscode.workspace.getWorkspaceFolder(debugCommand.documentUri),
            debugCommand.config,
            { noDebug: debugCommand.noDebug }
        );
        this.previousCommand = debugCommand;
    }

    //TODO
    /**
     * Should return the name for the test (or 'describe' section) being currently edited, 
     * meaning the test (or section) which encloses current position of cursor
     * @param editor 
     */
    private findCurrentTestName(editor: vscode.TextEditor): string | undefined {
        // from selection
        const { selection, document } = editor;
        if (!selection.isEmpty) {
            return unquote(document.getText(selection));
        }

        const selectedLine = selection.active.line + 1;

        let matchingDs = MochaParser.extractNodes(editor.document.getText())
            .filter(d=>d.range.start.line <= selectedLine &&
                        d.range.end.line >= selectedLine)
            .sort((d1,d2)=> d2.range.start.line - d1.range.start.line);

        if (matchingDs.length > 0) {
            return '"' + matchingDs[0].regexp.toString() + '"';
        }
        return undefined;
    }

    private buildMochaArgs(filePath: string, testName: string, withQuotes: boolean, options: string[] = []): string[] {
        const args: string[] = [];
        const quoter = withQuotes ? quote : str => str;

        args.push(quoter(normalizePath(filePath)));

        /* if (this.config.jestConfigPath) {
            args.push('-c');
            args.push(quoter(normalizePath(this.config.jestConfigPath)));
        } */

        if (testName) {
            args.push('-g');
            args.push(quoter(escapeSingleQuotes(testName)));
        }

        /* const setOptions = new Set(options);

        if (this.config.runOptions) {
            this.config.runOptions.forEach(option => setOptions.add(option));
        }

        args.push(...setOptions); */

        return args;
    }

    private retrieveUserDefinedDebugConfig(): vscode.DebugConfiguration {
        let nameToLookUp: string = vscode.workspace.getConfiguration().get('mochaRunner.debugConfigName');
        if (nameToLookUp) {
            let c = vscode.workspace.getConfiguration('launch');
            if (c && c.configurations && c.configurations.filter) {
                let matchingConfig = c.configurations.filter(c=>c.name === nameToLookUp);
                if (matchingConfig.length > 0) {
                    return JSON.parse(JSON.stringify(matchingConfig[0]));
                }
            } 
            return null;
        }
    }

    //TODO test mochaPath config option works for both absolute and relative paths
    private provideDefaultDebugConfig(): vscode.DebugConfiguration {
        let mochaPath = vscode.workspace.getConfiguration().get("mochaRunner.mochaPath");
        let mochaEnv = vscode.workspace.getConfiguration().get("mochaRunner.mochaEnv");
        let mochaOptions = vscode.workspace.getConfiguration().get("mochaRunner.mochaOpts");
        
        let config: vscode.DebugConfiguration = {
            internalConsoleOptions: "openOnSessionStart",
            name: 'Mocha Runner Default\'s Debug Configuration',
            type: 'pwa-node',
            program: mochaPath ? mochaPath : 'node_modules/.bin/mocha',
            request: "launch",
            skipFiles: [
                "<node_internals>/**"
            ],
            args: mochaOptions && (mochaOptions as any).length > 0 ? mochaOptions : [],
            cwd: "${workspaceFolder}",
            env : mochaEnv ? mochaEnv : {}
        };

        return config;
    }
}