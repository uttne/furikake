(function () {
    console.log("start");
    const vscode = acquireVsCodeApi();
    console.log(vscode);

    document.querySelector("#sample-button").addEventListener("click", () => {
        console.log("post message");
        vscode.postMessage({ type: "sample", value: "test" });
    });
})();
