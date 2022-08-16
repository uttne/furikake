(function () {
    const vscode = acquireVsCodeApi();

    document.querySelector("#reassign-button").addEventListener("click", () => {
        vscode.postMessage({ cmd: "reassign" });
    });
})();
