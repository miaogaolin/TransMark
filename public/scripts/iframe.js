

let articleEle = document.getElementById("transmark-article");
let simplemde = new SimpleMDE({
    element: articleEle,
    forceSync: true,
    autosave: {
        enabled: true,
        uniqueId: getParameterByName("id"),
        delay: 1000,
    },
    renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
    },
    hideIcons: ["guide"],
});

function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.addEventListener("message", function (event) {
    if (event.source != window.parent)
        return;

    switch (event.data.type) {
        case "markdown-load":
            if (simplemde.value() == "") {
                simplemde.value(event.data.message);
            }
            break;
        case "refresh":
            simplemde.value(event.data.message);
            break;
        case "translate-click":
            let md = simplemde.value();
            simplemde.value('');
            window.parent.postMessage({ type: "translate-click", message: md }, "*");
            break;
        case "markdown-clear":
            simplemde.value('');
        case "translate-result":
            simplemde.value(simplemde.value() + event.data.message);
            break;
    }
}, false);