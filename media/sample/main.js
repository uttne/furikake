(function () {
    const vscode = acquireVsCodeApi();

    document.querySelector("#sample-button").addEventListener("click", () => {
        vscode.postMessage({ cmd: "sample", value: { data: "test" } });
    });
})();
