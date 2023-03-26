console.log('This is the background page.');
console.log('Put the background scripts here.2');

chrome.runtime.onMessage.addListener((request) => {
  console.log('i am inside the on message listener');
  if (request == 'qw_open_popup') {
    chrome.windows.create(
      {
        url: 'popup.html',
        type: 'popup',
        focused: true,
        width: 400,
        height: 600,
        top: 0,
        left: 0,
      },
      () => {
        console.log('Opened popup!');
      }
    );
  }
});
