# Mocha Runner (VSCode Extension)

Run & debug mocha tests with ease, from command (ctrl+shift+P)


### Commands (ctrl + shift + P)

| Command | Description |
| --- | --- |
| Mocha Runner: Run Mocha | Runs single (currently edited) mocha test, ignoring brakpoints |
| Mocha Runner: Debug Mocha | Debugs single (currently edited) mocha test |
| Mocha Runner: Repeat Last | Repeat last run or debug |
| Mocha Runner: Run File | Runs currently edited file, ignoring breakpoints |



### Shortcuts

Click File -> Preferences -> Keyboard Shortcuts -> "{}" (top right), the json config file will open, 
add this:

```javascript
{
  "key": "alt+1",
  "command": "extension.runMocha"
},
{
  "key": "alt+2",
  "command": "extension.debugMocha"
},
```


### Install

* Download zip of projects or git clone it
* `npm i`
* `node_modules/.bin/vsce package` to generates vsix file "mocha-runner-debugger-0.0.0.vsix"
* Open VsCode, ctrl+shift+P 'install from vsix'... -- or -- `code --install-extension [path/to/previously/generated/mocha-runner-debugger-0.0.0.vsix]`