(function () {
    const vscode = acquireVsCodeApi();

    const tzElm = document.querySelector("#timezone-value");
    const notUseZElm = document.querySelector("#not-use-z-checkbox");

    document.querySelector("#change-button").addEventListener("click", () => {
        const tz = parseInt(tzElm.value);
        const notUseZ = notUseZElm.checked;
        vscode.postMessage({
            cmd: "change_timezone_all",
            value: { tz: tz, notUseZ: notUseZ },
        });
    });
})();
