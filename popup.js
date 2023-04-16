const input = document.querySelector('.js-input-command');
const buttonSave = document.querySelector('.js-button-save');
const listCommands = document.querySelector('.js-list-commands');
const select = document.querySelector('.js-select');

async function addCommand() {
  const inputValue = input.value.trim();
  if (!inputValue) return;
  input.value = '';
  const { currentConfig } = await chrome.storage.sync.get(['currentConfig']);
  const storage = await chrome.storage.sync.get([currentConfig]);
  const commands = storage[currentConfig];
  if (commands.find((command) => command[0] === inputValue)) return;
  commands.unshift([inputValue, true]);
  await chrome.storage.sync.set({ [currentConfig]: commands });
  await renderCommands();
}

async function init() {
  const { currentConfig } = await chrome.storage.sync.get(['currentConfig']);
  if (currentConfig) {
    select.value = currentConfig;
    return renderCommands();
  }
  await chrome.storage.sync.set({ currentConfig: 'Config 1' });
  for (let i = 1; i < 6; i++) {
    await chrome.storage.sync.set({ [`Config ${i}`]: [] });
  }
}

async function renderCommands() {
  const { currentConfig } = await chrome.storage.sync.get(['currentConfig']);
  const storage = await chrome.storage.sync.get([currentConfig]);
  let commands = storage[currentConfig];
  let commandsString = '';
  commands.forEach((command, i) => {
    const [value, isEnabled] = command;
    commandsString += `
      <li class="list-item">
        <input class="checkbox js-checkbox" type="checkbox" id="${i}" ${
      isEnabled ? 'checked' : ''
    }/>
        <label class="command-label" for="${i}">${value}</label>
        <button class="button-remove js-button-remove">Del</button>
      </li>
    `;
  });
  listCommands.innerHTML = commandsString;
  const checkboxes = document.querySelectorAll('.js-checkbox');
  const buttonsRemove = document.querySelectorAll('.js-button-remove');
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].onchange = async function () {
      commands[i][1] = this.checked;
      await chrome.storage.sync.set({ [currentConfig]: commands });
      renderCommands();
    };
    buttonsRemove[i].onclick = async function () {
      commands = commands.filter((command, index) => index !== i);
      await chrome.storage.sync.set({ [currentConfig]: commands });
      renderCommands();
    };
  }
}

document.addEventListener('keydown', async (event) => {
  const { keyCode } = event;
  if (keyCode === 13) {
    addCommand();
  }
});

buttonSave.addEventListener('click', addCommand);

select.addEventListener('change', async function () {
  await chrome.storage.sync.set({ currentConfig: this.value });
  await renderCommands();
});

init();
