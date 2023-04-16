function poll$() {
  setTimeout(() => {
    const timer = document.querySelector('.hud-timer-text');
    if (timer && timer.innerHTML !== '0:00') {
      (async () => {
        const { currentConfig } = await chrome.storage.sync.get(['currentConfig']);
        if (!currentConfig) return;
        const storage = await chrome.storage.sync.get([currentConfig]);
        const commands = storage[currentConfig];
        const form = document.querySelector('.hud-message-input form');
        const input = document.querySelector('.hud-message-input input');
        commands.forEach((item) => {
          if (item[1]) {
            input.value = `;${item[0]}`;
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        });
      })();
    } else {
      poll$();
    }
  }, 3000);
}

poll$();
