const screens = [...document.querySelectorAll('.device-screen')];
const tabs = [...document.querySelectorAll('.screen-tab')];
const scaleFrame = document.querySelector('.device-scale');
const stage = document.querySelector('.preview-stage');
const title = document.querySelector('#screen-title');
const purpose = document.querySelector('#screen-purpose');
const dimensions = document.querySelector('#dimension-label');
const details = [
  ['01 · Configurator', 'Understand the modular platform.'],
  ['02 · Modules', 'Choose a use case and a circular option.'],
  ['03 · Review', 'Connect the digital choice to the physical form.'],
  ['04 · Ride', 'Keep essential riding information stable.'],
  ['05 · Delivery', 'Adapt the dashboard to the connected delivery box.'],
  ['06 · Child seat', 'Turn a hardware state into clear safety feedback.']
];
let activeScreen = 1;
const initialParams = new URLSearchParams(window.location.search);
const embedMode = initialParams.get('embed');
const exportMode = embedMode === '1';
const fittedEmbed = embedMode === 'fit';
document.body.classList.toggle('embed', Boolean(embedMode));
document.body.classList.toggle('embed-fit', fittedEmbed);

function fitScreen() {
  const portrait = activeScreen <= 3;
  const width = portrait ? 390 : 844;
  const height = portrait ? 844 : 390;
  scaleFrame.className = `device-scale ${portrait ? 'is-portrait' : 'is-landscape'}`;
  if (exportMode) {
    scaleFrame.style.transform = 'none';
    return;
  }
  const availableWidth = fittedEmbed ? stage.clientWidth : Math.max(280, stage.clientWidth - 48);
  const availableHeight = fittedEmbed ? stage.clientHeight : Math.max(220, stage.clientHeight - 40);
  const scale = Math.min(1, availableWidth / width, availableHeight / height);
  scaleFrame.style.transform = `scale(${scale})`;
}

function showScreen(number) {
  activeScreen = Math.max(1, Math.min(6, Number(number)));
  screens.forEach(screen => screen.classList.toggle('is-active', Number(screen.dataset.screen) === activeScreen));
  tabs.forEach(tab => tab.classList.toggle('is-active', Number(tab.dataset.target) === activeScreen));
  title.textContent = details[activeScreen - 1][0];
  purpose.textContent = details[activeScreen - 1][1];
  dimensions.textContent = activeScreen <= 3 ? '390 × 844 px' : '844 × 390 px';
  fitScreen();
  const url = new URL(window.location);
  url.searchParams.set('screen', activeScreen);
  history.replaceState({}, '', url);
  if (window.parent !== window) window.parent.postMessage({ type: 'fika-screen', screen: activeScreen }, '*');
}

tabs.forEach(tab => tab.addEventListener('click', () => showScreen(tab.dataset.target)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
document.querySelector('#previous-screen').addEventListener('click', () => showScreen(activeScreen === 1 ? 6 : activeScreen - 1));
document.querySelector('#next-screen').addEventListener('click', () => showScreen(activeScreen === 6 ? 1 : activeScreen + 1));

document.querySelectorAll('[data-condition]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-condition]').forEach(item => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    const used = button.dataset.condition === 'used';
    document.querySelector('#selected-condition').textContent = used ? 'Second-hand' : 'New';
    document.querySelector('#condition-copy').textContent = used ? 'Returned, checked and ready for another use.' : 'New module from IKEA FIKA.';
  });
});

document.querySelectorAll('.module-option').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.module-option').forEach(item => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-checked', 'false');
      item.querySelector(':scope > b').textContent = '';
    });
    button.classList.add('is-selected');
    button.setAttribute('aria-checked', 'true');
    button.querySelector(':scope > b').textContent = '✓';
    document.querySelector('#selected-module-name').textContent = button.dataset.module;
  });
});

document.querySelector('[data-confirm]').addEventListener('click', event => {
  event.currentTarget.innerHTML = 'Configuration confirmed <span>✓</span>';
  document.querySelector('.confirmation-message').classList.add('is-visible');
});

const childPanel = document.querySelector('#child-panel');
childPanel.addEventListener('click', () => {
  const alert = childPanel.classList.toggle('is-alert');
  childPanel.setAttribute('aria-pressed', String(alert));
  childPanel.setAttribute('aria-label', alert
    ? 'Warning. Child seat buckle open. Stop safely and check harness. Activate to restore normal status.'
    : 'Child seat connected. Buckle fastened. Activate to preview buckle alert.');
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') showScreen(activeScreen === 6 ? 1 : activeScreen + 1);
  if (event.key === 'ArrowLeft') showScreen(activeScreen === 1 ? 6 : activeScreen - 1);
});

new ResizeObserver(fitScreen).observe(stage);
showScreen(initialParams.get('screen') || 1);
if (initialParams.get('state') === 'alert' && activeScreen === 6) childPanel.click();
