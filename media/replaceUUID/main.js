(function () {
    const vscode = acquireVsCodeApi();

    document.querySelector("#replace-button").addEventListener("click", () => {
        vscode.postMessage({ cmd: "replace" });
    });
})();
