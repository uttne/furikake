(function () {
    const vscode = acquireVsCodeApi();

    const checkboxElm = document.querySelector(
        "#furikake-uuid-upper-case-checkbox"
    );

    document.querySelector("#reassign-button").addEventListener("click", () => {
        const uuidUpperCaseChecked = checkboxElm.checked;
        vscode.postMessage({
            cmd: "reassign",
            value: { uuidUpperCaseChecked: uuidUpperCaseChecked },
        });
    });
})();
