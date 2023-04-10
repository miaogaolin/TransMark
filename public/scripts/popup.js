let apiKeyInput = document.getElementById('api-key');
let saveBtn = document.getElementById('save');
chrome.storage.local.get(function (obj) {
  apiKeyInput.value = obj.apiKey || '';
});


saveBtn.addEventListener('click', function () {
  chrome.storage.local.set({ apiKey: apiKeyInput.value }, function () {
    console.log('Data saved');
  });
});
