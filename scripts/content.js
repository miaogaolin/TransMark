// 创建一个div用于存储图标
var container = document.createElement('div');
container.id = 'transmark-container';
// container.style.position = 'fixed';
// container.style.right = '10px'
// container.style.top = '10px';
// container.style.zIndex = 9999;
// 将div添加到页面中
document.body.appendChild(container);

// icon 图标
let icon = document.createElement('div');
icon.id = 'transmark-icon';
icon.innerHTML = '<svg t="1679468983537" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17706" width="40" height="40"><path d="M566.464 710.4v85.824h150.848a31.232 31.232 0 0 1 0 62.4H353.216a31.232 31.232 0 1 1 0-62.4h150.848V710.4H275.2A83.2 83.2 0 0 1 192 627.2V211.2A83.2 83.2 0 0 1 275.2 128h520.064a83.2 83.2 0 0 1 83.2 83.2v416a83.2 83.2 0 0 1-83.2 83.2z m249.6-190.272H254.4V627.2a20.864 20.864 0 0 0 20.8 20.8h520.064a20.8 20.8 0 0 0 20.8-20.8z" fill="#588AF6" p-id="17707"></path></svg>';
container.appendChild(icon);

// 预览
let preview = document.createElement('div');
preview.id = 'transmark-preview';
preview.style.visibility = 'hidden';
container.appendChild(preview);


let articleContainer = document.createElement('textarea');
articleContainer.id = 'transmark-article';
preview.appendChild(articleContainer);


var simplemde = new SimpleMDE({ element: articleContainer });

// 添加点击事件
icon.addEventListener('click', function (event) {
    if (preview.style.visibility == 'hidden') {
        let article = getArticleFromDom(document.documentElement.outerHTML);
        simplemde.value(convertArticleToMarkdown(article));
        // articleContainer.innerText = convertArticleToMarkdown(article);
        console.log(convertArticleToMarkdown(article));
        // preview.innerHTML = convertArticleToMarkdown(article);
        // chrome.runtime.sendMessage({ article: article }, function (response) {
        //     // Do something with the Markdown response
        //     preview.innerHTML = response.markdown;
        // });
        preview.style.visibility = 'visible';
    } else {
        preview.style.visibility = 'hidden';
    }


    event.stopPropagation();
});