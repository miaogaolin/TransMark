const defaultOptions = {
    headingStyle: "atx",
    hr: "___",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    imageStyle: "markdown",
    imageRefStyle: "inlined",
    frontmatter: "---\ncreated: {date:YYYY-MM-DDTHH:mm:ss} (UTC {date:Z})\ntags: [{keywords}]\nsource: {baseURI}\nauthor: {byline}\n---\n\n# {pageTitle}\n\n> ## Excerpt\n> {excerpt}\n\n---",
    backmatter: "",
    title: "{pageTitle}",
    includeTemplate: false,
    saveAs: false,
    downloadImages: false,
    imagePrefix: '{pageTitle}/',
    mdClipsFolder: null,
    disallowedChars: '[]#^',
    downloadMode: 'downloadsApi',
    turndownEscape: true,
    contextMenus: true,
    obsidianIntegration: false,
    obsidianVault: "",
    obsidianFolder: "",
};


// 使用哈希函数生成唯一标识
function generateUniqueId(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// get Readability article info from the dom passed in
function getArticleFromDom(domString) {
    // parse the dom
    const parser = new DOMParser();
    const dom = parser.parseFromString(domString, "text/html");
    if (dom.documentElement.nodeName == "parsererror") {
        console.error("error while parsing");
    }

    const math = {};

    const storeMathInfo = (el, mathInfo) => {
        let randomId = URL.createObjectURL(new Blob([]));
        randomId = randomId.substring(randomId.length - 36);
        el.id = randomId;
        math[randomId] = mathInfo;
    };

    dom.body.querySelectorAll('script[id^=MathJax-Element-]')?.forEach(mathSource => {
        const type = mathSource.attributes.type.value
        storeMathInfo(mathSource, {
            tex: mathSource.innerText,
            inline: type ? !type.includes('mode=display') : false
        });
    });

    dom.body.querySelectorAll('.katex-mathml')?.forEach(kaTeXNode => {
        storeMathInfo(kaTeXNode, {
            tex: kaTeXNode.querySelector('annotation').textContent,
            inline: true
        });
    });

    dom.body.querySelectorAll('[class*=highlight-text],[class*=highlight-source]')?.forEach(codeSource => {
        const language = codeSource.className.match(/highlight-(?:text|source)-([a-z0-9]+)/)?.[1]
        if (codeSource.firstChild.nodeName == "PRE") {
            codeSource.firstChild.id = `code-lang-${language}`
        }
    });

    dom.body.querySelectorAll('[class*=language-]')?.forEach(codeSource => {
        const language = codeSource.className.match(/language-([a-z0-9]+)/)?.[1]
        codeSource.id = `code-lang-${language}`;
    });

    dom.body.querySelectorAll('pre br')?.forEach(br => {
        // we need to keep <br> tags because they are removed by Readability.js
        br.outerHTML = '<br-keep></br-keep>';
    });

    dom.body.querySelectorAll('.codehilite > pre')?.forEach(codeSource => {
        if (codeSource.firstChild.nodeName !== 'CODE' && !codeSource.className.includes('language')) {
            codeSource.id = `code-lang-text`;
        }
    });


    // simplify the dom into an article
    const article = new Readability(dom).parse();
    // get the base uri from the dom and attach it as important article info

    if (!article) {
        return;
    }
    // also grab the page title
    if (dom.title) {
        article.pageTitle = dom.title;
    }
    if (dom.baseURI) {
        article.baseURI = dom.baseURI;
        // and some URL info
        const url = new URL(dom.baseURI);
        if (url.hash) {
            article.hash = url.hash;
        } else {
            article.hash = generateUniqueId(dom.baseURI);
        }

        article.host = url.host;
        article.origin = url.origin;
        article.hostname = url.hostname;
        article.pathname = url.pathname;
        article.port = url.port;
        article.protocol = url.protocol;
        article.search = url.search;
    }


    // make sure the dom has a head
    if (dom.head) {
        // and the keywords, should they exist, as an array
        article.keywords = dom.head.querySelector('meta[name="keywords"]')?.content?.split(',')?.map(s => s.trim());

        // add all meta tags, so users can do whatever they want
        dom.head.querySelectorAll('meta[name][content], meta[property][content]')?.forEach(meta => {
            const key = (meta.getAttribute('name') || meta.getAttribute('property'))
            const val = meta.getAttribute('content')
            if (key && val && !article[key]) {
                article[key] = val;
            }
        })
    }

    article.math = math

    // return the article
    return article;
}



function validateUri(href, baseURI) {
    // check if the href is a valid url
    try {
        new URL(href);
    }
    catch {
        // if it's not a valid url, that likely means we have to prepend the base uri
        const baseUri = new URL(baseURI);

        // if the href starts with '/', we need to go from the origin
        if (href.startsWith('/')) {
            href = baseUri.origin + href
        }
        // otherwise we need to go from the local folder
        else {
            href = baseUri.href + (baseUri.href.endsWith('/') ? '/' : '') + href
        }
    }
    return href;
}

function cleanAttribute(attribute) {
    return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : ''
}

function turndown(content, options, article) {

    if (options.turndownEscape) TurndownService.prototype.escape = TurndownService.prototype.defaultEscape;
    else TurndownService.prototype.escape = s => s;

    var turndownService = new TurndownService(options);

    turndownService.use(turndownPluginGfm.gfm)

    turndownService.keep(['iframe', 'sub', 'sup', 'u', 'ins', 'small', 'big']);

    let imageList = {};
    // add an image rule
    turndownService.addRule('images', {
        filter: function (node, tdopts) {
            // if we're looking at an img node with a src
            if (node.nodeName == 'IMG' && node.getAttribute('src')) {

                // get the original src
                let src = node.getAttribute('src')
                // set the new src
                node.setAttribute('src', validateUri(src, article.baseURI));

                return true;
            }
            // don't pass the filter, just output a normal markdown link
            return false;
        },
        replacement: function (content, node, tdopts) {
            // if we're stripping images, output nothing
            if (options.imageStyle == 'noImage') return '';
            // if this is an obsidian link, so output that
            else if (options.imageStyle.startsWith('obsidian')) return `![[${node.getAttribute('src')}]]`;
            // otherwise, output the normal markdown link
            else {
                var alt = cleanAttribute(node.getAttribute('alt'));
                var src = node.getAttribute('src') || '';
                var title = cleanAttribute(node.getAttribute('title'));
                var titlePart = title ? ' "' + title + '"' : '';
                if (options.imageRefStyle == 'referenced') {
                    var id = this.references.length + 1;
                    this.references.push('[fig' + id + ']: ' + src + titlePart);
                    return '![' + alt + '][fig' + id + ']';
                }
                else return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
            }
        },
        references: [],
        append: function (options) {
            var references = '';
            if (this.references.length) {
                references = '\n\n' + this.references.join('\n') + '\n\n';
                this.references = []; // Reset references
            }
            return references
        }

    });

    // add a rule for links
    turndownService.addRule('links', {
        filter: (node, tdopts) => {
            // check that this is indeed a link
            if (node.nodeName == 'A' && node.getAttribute('href')) {
                // get the href
                const href = node.getAttribute('href');
                // set the new href
                node.setAttribute('href', validateUri(href, article.baseURI));
                // if we are to strip links, the filter needs to pass
                return options.linkStyle == 'stripLinks';
            }
            // we're not passing the filter, just do the normal thing.
            return false;
        },
        // if the filter passes, we're stripping links, so just return the content
        replacement: (content, node, tdopts) => content
    });

    // handle multiple lines math
    turndownService.addRule('mathjax', {
        filter(node, options) {
            return article.math.hasOwnProperty(node.id);
        },
        replacement(content, node, options) {
            const math = article.math[node.id];
            let tex = math.tex.trim().replaceAll('\xa0', '');

            if (math.inline) {
                tex = tex.replaceAll('\n', ' ');
                return `$${tex}$`;
            }
            else
                return `$$\n${tex}\n$$`;
        }
    });

    function repeat(character, count) {
        return Array(count + 1).join(character);
    }

    function convertToFencedCodeBlock(node, options) {
        node.innerHTML = node.innerHTML.replaceAll('<br-keep></br-keep>', '<br>');
        const langMatch = node.id?.match(/code-lang-(.+)/);
        const language = langMatch?.length > 0 ? langMatch[1] : '';

        var code;

        if (language) {
            var div = document.createElement('div');
            document.body.appendChild(div);
            div.appendChild(node);
            code = node.innerText;
            div.remove();
        } else {
            code = node.innerHTML;
        }

        var fenceChar = options.fence.charAt(0);
        var fenceSize = 3;
        var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');

        var match;
        while ((match = fenceInCodeRegex.exec(code))) {
            if (match[0].length >= fenceSize) {
                fenceSize = match[0].length + 1;
            }
        }

        var fence = repeat(fenceChar, fenceSize);

        return (
            '\n\n' + fence + language + '\n' +
            code.replace(/\n$/, '') +
            '\n' + fence + '\n\n'
        )
    }

    turndownService.addRule('fencedCodeBlock', {
        filter: function (node, options) {
            return (
                options.codeBlockStyle === 'fenced' &&
                node.nodeName === 'PRE' &&
                node.firstChild &&
                node.firstChild.nodeName === 'CODE'
            );
        },
        replacement: function (content, node, options) {
            return convertToFencedCodeBlock(node.firstChild, options);
        }
    });

    // handle <pre> as code blocks
    turndownService.addRule('pre', {
        filter: (node, tdopts) => node.nodeName == 'PRE' && (!node.firstChild || node.firstChild.nodeName != 'CODE'),
        replacement: (content, node, tdopts) => {
            return convertToFencedCodeBlock(node, tdopts);
        }
    });

    let markdown = options.frontmatter + turndownService.turndown(content)
        + options.backmatter;

    // strip out non-printing special characters which CodeMirror displays as a red dot
    // see: https://codemirror.net/doc/manual.html#option_specialChars
    markdown = markdown.replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g, '');

    return { markdown: markdown, imageList: imageList };
}


function getCheckedValue(radioObj) {
    if (!radioObj)
        return "";
    var radioLength = radioObj.length;
    if (radioLength == undefined)
        if (radioObj.checked)
            return radioObj.value;
        else
            return "";
    for (var i = 0; i < radioLength; i++) {
        if (radioObj[i].checked) {
            return radioObj[i].value;
        }
    }
    return "";
}

// function to convert an article info object into markdown
function convertArticleToMarkdown(article) {
    defaultOptions.frontmatter = '';
    let result = turndown(article.content, defaultOptions, article);
    return result.markdown;
}
;
