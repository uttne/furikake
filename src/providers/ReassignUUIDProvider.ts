import * as vscode from "vscode";
import { getNonce } from "../utils/utils";
import { v4 } from "uuid";

export class ReassignUUIDProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "furikake.reassignUUIDView";

    private timeout: NodeJS.Timer | undefined = undefined;
    readonly uuidRegPattern: string =
        /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/
            .source;

    readonly decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: { id: "furikake.uuidBackgroundColor" },
    });
    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const webview = webviewView.webview;

        const personalDir = "media/reassignUUID";
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
            <label><input id="furikake-uuid-upper-case-checkbox" type="checkbox" name="furikake-uuid-upper-case">UUID Upper Case</label>
            <button id="reassign-button">reassign</button>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.cmd) {
                case "reassign": {
                    try {
                        this.reassign({
                            uuidUpperCaseChecked:
                                data.value.uuidUpperCaseChecked,
                        });
                        vscode.window.showInformationMessage(
                            "Success: reassign UUID"
                        );
                    } catch {
                        vscode.window.showInformationMessage(
                            "Failed: reassign UUID"
                        );
                    }

                    break;
                }
            }
        });
    }

    reassign(options?: { uuidUpperCaseChecked?: boolean }) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();

        const lines = text.split("\n");

        const re = new RegExp(this.uuidRegPattern);

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
                const uuid = options?.uuidUpperCaseChecked
                    ? v4().toUpperCase()
                    : v4();
                editBuilder.replace(range, uuid);
            });
        });
    }

    updateDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const reg = new RegExp(this.uuidRegPattern, "g");
        const text = editor.document.getText();
        const decorationOptionsList: vscode.DecorationOptions[] = [];

        let match: RegExpExecArray | null = null;
        while ((match = reg.exec(text))) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(
                match.index + match[0].length
            );
            const decoration = { range: new vscode.Range(startPos, endPos) };
            decorationOptionsList.push(decoration);
        }
        editor.setDecorations(this.decorationType, decorationOptionsList);
    }

    triggerUpdateDecorations(
        eventDocument: vscode.TextDocument,
        runNow: boolean = false
    ): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        if (editor.document !== eventDocument) return;

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (runNow) {
            this.updateDecorations();
        } else {
            this.timeout = setTimeout(this.updateDecorations.bind(this), 500);
        }
    }
}
