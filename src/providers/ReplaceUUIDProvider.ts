import * as vscode from "vscode";
import { getNonce } from "../utils/utils";
import { v4 } from "uuid";

export class ReplaceUUIDProvider implements vscode.WebviewViewProvider {
    public static readonly viewType =
        "test-data-util-extensions.replaceUUIDView";

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const webview = webviewView.webview;

        const personalDir = "media/replaceUUID";
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
            <button id="replace-button">replace</button>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.cmd) {
                case "replace": {
                    vscode.window.showInformationMessage("replace UUID");
                    this.replace();
                    break;
                }
            }
        });
    }

    replace() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();

        const lines = text.split("\n");

        const re =
            /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/;

        const targetList: vscode.Range[] = [];
        lines.forEach((line, lineIndex) => {
            let start = 0;
            do {
                const match = line.substring(start).match(re);
                if (match) {
                    const startPos = new vscode.Position(
                        lineIndex,
                        start + (match.index ?? 0)
                    );
                    const endPos = new vscode.Position(
                        startPos.line,
                        startPos.character + match[0].length
                    );
                    targetList.push(new vscode.Range(startPos, endPos));

                    start = start + (match.index ?? 0) + match[0].length;
                } else {
                    start = -1;
                }
            } while (0 <= start);
        });

        editor.edit((editBuilder) => {
            targetList.forEach((range) => {
                editBuilder.replace(range, v4());
            });
        });
    }
}
