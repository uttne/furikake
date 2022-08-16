// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { SampleProvider } from "./providers/SampleProvider";
import { ReplaceUUIDProvider } from "./providers/ReplaceUUIDProvider";
import { ChangeTimezoneProvider } from "./providers/ChangeTimezoneProvider";

export function activate(context: vscode.ExtensionContext) {
    {
        const provider = new ReplaceUUIDProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ReplaceUUIDProvider.viewType,
                provider
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "test-data-util-extensions.replaceUUID",
                () => {
                    provider.replace();
                }
            )
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
                "test-data-util-extensions.changeTimeZone",
                () => {
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

                    input.then((value) => {
                        const tz = Number(value);
                        provider.replace(tz);
                    });
                    provider.replace(0);
                }
            )
        );
    }
    {
        const provider = new SampleProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                SampleProvider.viewType,
                provider
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "test-data-util-extensions.sample",
                () => {
                    vscode.window.showInformationMessage("Sample");
                }
            )
        );
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
