
// 预览
let iconContainer = document.createElement('div');
iconContainer.id = 'icon-container';
document.body.appendChild(iconContainer);

let previewIcon = document.createElement('div');
previewIcon.id = 'transmark-preview-icon';
previewIcon.innerHTML = '<svg t="1680075071349" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5543" width="32" height="32"><path d="M1024 1024H0V877.714286h1024v146.285714zM877.714286 146.285714v438.857143H146.285714V146.285714h731.428572M1024 0H0v731.428571h1024V0zM402.285714 219.428571v292.571429l219.428572-146.285714-219.428572-146.285715z" fill="#4881F3" p-id="5544"></path></svg>';
iconContainer.appendChild(previewIcon);


let tranSvg = '<svg t="1680075306650" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2905" width="32" height="32"><path d="M599.392 72.608a448 448 0 0 0-297.408 43.648 15.552 15.552 0 0 0-5.984 21.632l16 27.712c4.416 7.648 14.176 10.24 22.016 6.144A384 384 0 0 1 869.888 651.2c-4.064 10.432 2.88 22.176 13.824 24.416 8.416 1.76 16.608 4.064 24.512 6.976 8.544 3.072 18.336-0.512 21.6-8.96A447.936 447.936 0 0 0 599.392 72.576zM553.312 958.08c12.096-1.12 17.92-15.232 12.096-25.888a175.2 175.2 0 0 1-11.424-25.632 16.864 16.864 0 0 0-16.864-11.392A384 384 0 0 1 154.24 372.384l41.76 72.32a16 16 0 0 0 21.856 5.856l27.712-16a16 16 0 0 0 5.856-21.856L179.456 288a32 32 0 0 0-55.424 0A448 448 0 0 0 553.28 958.08z" fill="#4881F3" p-id="2906"></path><path d="M512 240a32 32 0 0 1 29.44 19.392l165.12 385.28a16 16 0 0 1-8.416 21.024l-29.44 12.608a16 16 0 0 1-20.992-8.416L621.184 608h-218.368l-47.104 109.888a16 16 0 0 1-20.992 8.416l-29.44-12.608a16 16 0 0 1-8.384-21.024l185.696-433.28A32 32 0 0 1 512 240z m81.76 304L512 353.248 430.24 544h163.52zM608 848a112 112 0 0 1 112-112h128a112 112 0 1 1 0 224h-128a112 112 0 0 1-112-112z m160 0a48 48 0 1 0-96 0 48 48 0 0 0 96 0z" fill="#4881F3" p-id="2907"></path></svg>';

let pauseSvg = '<svg t="1680229382735" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1446" width="32" height="32"><path d="M512 42.667008C254.733312 42.667008 42.665984 254.736384 42.665984 512s212.067328 469.331968 469.331968 469.331968c257.26464 0 469.334016-212.067328 469.334016-469.331968 0-257.26464-212.069376-469.334016-469.334016-469.334016M512 1024C228.692992 1024 0 795.307008 0 512 0 228.692992 228.692992 0 512 0c283.307008 0 512 228.692992 512 512 0 283.307008-228.692992 512-512 512" fill="#333333" p-id="1447"></path><path d="M384 341.332992h85.332992v341.332992H384zM554.667008 341.332992H640v341.332992h-85.332992z" fill="#333333" p-id="1448"></path></svg>'

let tranIcon = document.createElement('div');
tranIcon.id = 'transmark-transalte-icon';
tranIcon.style.display = 'none';
tranIcon.innerHTML = tranSvg;
tranIcon.addEventListener('click', function () {
    if (toggleTranIcon(tranIcon)) {
        return;
    }
    frame.contentWindow.postMessage({ type: "translate-click" }, "*");

});
iconContainer.appendChild(tranIcon);


function toggleTranIcon(tranIcon) {
    if (tranIcon.classList.contains('icon-pause')) {
        tranIcon.classList.remove('icon-pause');
        tranIcon.innerHTML = tranSvg;
        if (port) {
            port.disconnect();
        }
        return true
    }
    tranIcon.classList.add('icon-pause');
    tranIcon.innerHTML = pauseSvg;
    return false;
}

let refreshIcon = document.createElement('div');
refreshIcon.id = "transmark-refresh-icon";
refreshIcon.style.display = 'none';
refreshIcon.innerHTML = '<svg t="1680074877840" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1992" width="32" height="32"><path d="M512 0C228.266667 0 0 228.266667 0 512s228.266667 512 512 512 512-228.266667 512-512S795.733333 0 512 0z m234.666667 390.4h-25.6c21.333333 36.266667 32 78.933333 32 121.6 0 136.533333-110.933333 249.6-249.6 249.6C366.933333 761.6 256 648.533333 256 512s110.933333-249.6 249.6-249.6c29.866667 0 57.6 4.266667 85.333333 14.933333 10.666667 4.266667 17.066667 17.066667 12.8 27.733334s-17.066667 17.066667-27.733333 12.8a204.8 204.8 0 0 0-70.4-12.8c-113.066667 0-206.933333 91.733333-206.933333 206.933333s91.733333 206.933333 206.933333 206.933333 206.933333-91.733333 206.933333-206.933333c0-40.533333-10.666667-78.933333-34.133333-113.066667v51.2c0 12.8-8.533333 21.333333-21.333333 21.333334s-21.333333-8.533333-21.333334-21.333334v-55.466666c0-25.6 21.333333-46.933333 46.933334-46.933334h64c12.8 0 21.333333 8.533333 21.333333 21.333334 0 10.666667-8.533333 21.333333-21.333333 21.333333z" fill="#4881F3" p-id="1993"></path></svg>';
refreshIcon.addEventListener('click', function () {
    if (tranIcon.classList.contains('icon-pause')) {
        tranIcon.classList.remove('icon-pause');
        tranIcon.innerHTML = tranSvg;
        if (port) {
            port.disconnect();
        }
    }
    frame.contentWindow.postMessage({ type: "refresh", message: renderMd() }, "*");
})
iconContainer.appendChild(refreshIcon);

let article = getArticleFromDom(document.documentElement.outerHTML);
let hash = '';
if (article) {
    hash = article.hash;
}
let frameSrc = chrome.runtime.getURL('iframe.html?id=' + hash);
let frame = document.createElement('iframe');
frame.id = "transmark-iframe";
frame.setAttribute('src', frameSrc);
frame.style.display = 'none';
document.body.appendChild(frame);

previewIcon.addEventListener('click', function (event) {
    if (frame.style.display == 'none') {
        tranIcon.style.display = 'block';
        refreshIcon.style.display = 'block';
        frame.style.display = 'block';
    } else {
        frame.style.display = 'none';
        tranIcon.style.display = 'none';
        refreshIcon.style.display = 'none';
    }
});

function renderMd() {
    let article = getArticleFromDom(document.documentElement.outerHTML);
    if (!article) {
        return;
    }
    return convertArticleToMarkdown(article);
}

window.addEventListener("load", function (event) {
    frame.contentWindow.postMessage({ type: "markdown-load", message: renderMd() }, "*");
});


window.addEventListener("message", function (event) {
    if (event.data.type == "translate-click" && event.data.message.length > 0) {
        tranlsate(event.data.message);
    }
}, false);
   