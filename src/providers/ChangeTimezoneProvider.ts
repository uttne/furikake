import * as vscode from "vscode";
import { getNonce } from "../utils/utils";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export class ChangeTimezoneProvider implements vscode.WebviewViewProvider {
    public static readonly viewType =
        "test-data-util-extensions.changeTimezoneView";

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const webview = webviewView.webview;

        const personalDir = "media/changeTimezone";
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
            <input id="timezone-value" type="number" name="number" value="0">
            <button id="change-button">change</button>
            <label><input id="not-use-z-checkbox" type="checkbox" name="not-use-z">not use Z</label>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.cmd) {
                case "change_timezone_all": {
                    try {
                        this.replace(data.value.tz, {
                            notUseZ: data.value.notUseZ,
                        });
                        vscode.window.showInformationMessage(
                            "Success: change timezone"
                        );
                    } catch {
                        vscode.window.showInformationMessage(
                            "Failed: change timezone"
                        );
                    }
                    break;
                }
            }
        });
    }

    replace(tz: number, options?: { notUseZ?: boolean }) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const notUseZ = options?.notUseZ ?? false;

        const text = editor.document.getText();

        const lines = text.split("\n");

        const re =
            /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-6]\d:[0-6]\d([.]\d+?|)(Z|[-+][0-2]\d:[0-5]\d)/;

        editor.edit((editBuilder) => {
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
                        const range = new vscode.Range(startPos, endPos);
                        const oldDate = dayjs(match[0]);
                        const newDate = oldDate.utcOffset(tz, false);
                        const newDateFormat = newDate.format();
                        let newValue =
                            newDateFormat.substring(0, 19) +
                            match[1] +
                            newDateFormat.substring(19);

                        if (notUseZ) {
                            newValue = newValue.replace("Z", "+00:00");
                        }

                        editBuilder.replace(range, newValue);

                        start = start + (match.index ?? 0) + match[0].length;
                    } else {
                        start = -1;
                    }
                } while (0 <= start);
            });
        });
    }
}
