let body = {
  model: 'gpt-3.5-turbo',
  temperature: 0,
  // max_tokens: 4000,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1,
  stream: true,
};

const headers = {
  'Content-Type': 'application/json',
}



function spliceText(markdownText) {
  const sentences = markdownText.split(/[.|!|?|;|:]\s/g);
  // 拆分markdown文本成句子

  let chunks = [];
  let currentChunk = "";

  sentences.forEach(sentence => {
    if (currentChunk.length + sentence.length < 2048) {
      currentChunk += sentence + " ";
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    }
  });

  // 将句子拆分成chunks，每个chunk都不超过2048个字符
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

let port;
function translate(text, callback) {
  let arr = spliceText(text);

  const controller = new AbortController();
  const signal = controller.signal;

  port = chrome.runtime.connect({ name: "background-fetch" });
  let i = 0;
  // 监听background script的消息
  port.onMessage.addListener(function (msg) {
    if (msg.response == "[DONE]") {
      i++;
      if (i >= arr.length) {
        callback(port);
        return;
      }
      let messages = getMessagtes(arr[i]);
      streamRequest(messages, signal, port);
    }
    if (msg.status == 200) {
      let resp = JSON.parse(msg.response);
      if (resp.choices && resp.choices.length > 0 && resp.choices[0].delta.content) {
        let frame = document.getElementById('transmark-iframe');
        frame.contentWindow.postMessage({ type: "translate-result", message: resp.choices[0].delta.content }, "*");
      }
    }
  });

  if (arr.length > 0) {
    let messages = getMessagtes(arr[0]);
    streamRequest(messages, signal, port);
  }
}

function getMessagtes(text) {
  return [
    { 'role': 'system', 'content': '我希望你能担任翻译专家的角色。' },
    { 'role': 'user', 'content': '提供给你的文字是markdown格式，翻译的结果需要保留Markdown原有格式' },
    { 'role': 'assistant', 'content': '请提供你的markdown文本' },
    { 'role': 'user', 'content': text }
  ];
}
function streamRequest(messages, signal, port) {
  body['messages'] = messages;

  let query = {
    signal: signal,
    onFinish: (reason) => {
      console.log('reason', reason);
    },
    onMessage: (message) => {
      console.log('message', message);
    },
    onError: (err) => {
      console.log('error', err);
    }
  }

  chrome.storage.local.get(function (obj) {
    let apiKey = obj.apiKey;

    if (!apiKey) {
      console.log("api key is empty");
      return;
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
    // 发送消息给background script
    port.postMessage({
      type: 'open',
      details: {
        url: 'https://api.openai.com/v1/chat/completions',
        options: {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: query.signal,
          onMessage: (msg) => {
            let resp
            try {
              resp = JSON.parse(msg)
              // eslint-disable-next-line no-empty
            } catch {
              query.onFinish('stop')
              return
            }
            const { choices } = resp
            if (!choices || choices.length === 0) {
              return { error: 'No result' };
            }
            const { finish_reason: finishReason } = choices[0]
            if (finishReason) {
              query.onFinish(finishReason)
              return
            }

            let targetTxt = ''

            const { content = '', role } = choices[0].delta
            targetTxt = content

            if (trimFirstQuotation && isFirst && targetTxt && ['“', '"', '「'].indexOf(targetTxt[0]) >= 0) {
              targetTxt = targetTxt.slice(1)
            }

            if (!role) {
              isFirst = false
            }

            query.onMessage({ content: targetTxt, role })
          },
          onError: (err) => {
            const { error } = err
            query.onError(error.message)
          },
        }
      }
    });
  });


}
