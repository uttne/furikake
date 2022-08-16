import * as vscode from "vscode";
import { getNonce } from "../utils/utils";

export class SampleProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "test-data-util-extensions.sampleView";

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const webview = webviewView.webview;

        const personalDir = "media/sample";
        webviewView.webview.options = {
            enableScripts: true,
        };

        const styleResetUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
        );
        const styleVSCodeUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
        );
        const scriptUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, personalDir, "main.js")
        );

        const nonce = getNonce();
        webviewView.webview.html = `<!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">

            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource}; script-src 'nonce-${nonce}';">
            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
        </head>
        <body>
            <button id="sample-button">test</button>
            <input type="text" name="text">
            <input type="number" name="number">
            <input type="date" name="date">
            <input type="radio" name="radio">
            <input type="radio" name="radio">
            <input type="checkbox" name="checkbox">
            <input type="checkbox" name="checkbox">
            <input type="color" name="color">
            <input type="range" name="range" min="0" max="100">
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.cmd) {
                case "sample": {
                    vscode.window.showInformationMessage(
                        "sample: " + data.value.data
                    );
                    break;
                }
            }
        });
    }
}
