// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ReassignUUIDProvider } from "./providers/ReassignUUIDProvider";
import { ChangeTimezoneProvider } from "./providers/ChangeTimezoneProvider";

export function activate(context: vscode.ExtensionContext) {
    {
        const provider = new ReassignUUIDProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ReassignUUIDProvider.viewType,
                provider
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand("furikake.reassignUUID", () => {
                try {
                    provider.reassign();
                    vscode.window.showInformationMessage(
                        "Success: reassign UUID"
                    );
                } catch {
                    vscode.window.showInformationMessage(
                        "Failed: reassign UUID"
                    );
                }
            })
        );
    }
    {
        const provider = new ChangeTimezoneProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ChangeTimezoneProvider.viewType,
                provider
            )
        );

        context.subscriptions.push(
            vscode.commands.registerCommand(
                "furikake.changeTimeZone",
                async () => {
                    const opt: vscode.InputBoxOptions = {
                        validateInput: (text) => {
                            if (text === "") {
                                return "input number";
                            }
                            const value = Number(text);
                            if (isNaN(value)) {
                                return "input number";
                            }
                            return null;
                        },
                        prompt: "input timezone [h]",
                    };
                    const input = vscode.window.showInputBox(opt);

                    try {
                        await input.then((value) => {
                            if (value === undefined) {
                                return;
                            }
                            const tz = Number(value);
                            provider.change(tz);
                            vscode.window.showInformationMessage(
                                "Success: change timezone"
                            );
                        });
                    } catch {
                        vscode.window.showInformationMessage(
                            "Failed: change timezone"
                        );
                    }
                }
            )
        );
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
