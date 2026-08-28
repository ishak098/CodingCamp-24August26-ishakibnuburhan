const STORAGE_KEYS = {
  name: 'lifeDashboard.name',
  theme: 'lifeDashboard.theme',
  tasks: 'lifeDashboard.tasks',
  links: 'lifeDashboard.links',
  timerMinutes: 'lifeDashboard.timerMinutes'
};

const DEFAULT_LINKS = [
  { id: 'github', name: 'GitHub', url: 'https://github.com' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com' },
  { id: 'calendar', name: 'Calendar', url: 'https://calendar.google.com' }
];

const state = {
  name: localStorage.getItem(STORAGE_KEYS.name) || '',
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
  timerMinutes: readStoredMinutes(),
  secondsLeft: 0,
  timerId: null,
  tasks: readStoredTasks(),
  links: readStoredLinks(),
  isRunning: false
};

state.secondsLeft = state.timerMinutes * 60;

const ui = {
  body: document.body,
  greetingTitle: document.getElementById('greeting-title'),
  dateDisplay: document.getElementById('date-display'),
  clockDisplay: document.getElementById('clock-display'),
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  editNameButton: document.getElementById('edit-name-button'),
  nameDialog: document.getElementById('name-dialog'),
  closeNameDialog: document.getElementById('close-name-dialog'),
  skipNameButton: document.getElementById('skip-name-button'),
  nameForm: document.getElementById('name-form'),
  nameInput: document.getElementById('name-input'),
  timerDisplay: document.getElementById('timer-display'),
  timerStatus: document.getElementById('timer-status'),
  timerMessage: document.getElementById('timer-message'),
  startTimer: document.getElementById('start-timer'),
  pauseTimer: document.getElementById('pause-timer'),
  resetTimer: document.getElementById('reset-timer'),
  durationForm: document.getElementById('duration-form'),
  durationInput: document.getElementById('focus-minutes'),
  durationChips: Array.from(document.querySelectorAll('.duration-chip')),
  taskForm: document.getElementById('task-form'),
  taskInput: document.getElementById('task-input'),
  taskList: document.getElementById('task-list'),
  taskCount: document.getElementById('task-count'),
  taskMessage: document.getElementById('task-message'),
  tasksEmpty: document.getElementById('tasks-empty'),
  linkForm: document.getElementById('link-form'),
  linkNameInput: document.getElementById('link-name-input'),
  linkUrlInput: document.getElementById('link-url-input'),
  quickLinksList: document.getElementById('quick-links-list'),
  linkMessage: document.getElementById('link-message'),
  linksEmpty: document.getElementById('links-empty')
};

function readStoredMinutes() {
  const raw = Number(localStorage.getItem(STORAGE_KEYS.timerMinutes));
  if (Number.isInteger(raw) && raw >= 5 && raw <= 180) return raw;
  return 25;
}

function readStoredTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidTask)
      .sort(sortTasks);
  } catch {
    return [];
  }
}

function readStoredLinks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || 'null');
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_LINKS;
    return parsed.filter(isValidLink);
  } catch {
    return DEFAULT_LINKS;
  }
}

function isValidTask(task) {
  return task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean';
}

function isValidLink(link) {
  return link && typeof link.id === 'string' && typeof link.name === 'string' && typeof link.url === 'string';
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(state.tasks));
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(state.links));
}

function saveTheme() {
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
}

function saveName() {
  localStorage.setItem(STORAGE_KEYS.name, state.name);
}

function saveTimerMinutes() {
  localStorage.setItem(STORAGE_KEYS.timerMinutes, String(state.timerMinutes));
}

function sortTasks(left, right) {
  if (left.done !== right.done) return Number(left.done) - Number(right.done);
  return left.text.localeCompare(right.text, 'id', { sensitivity: 'base' });
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeTaskText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
  const namePart = state.name ? `, ${state.name}` : '';

  ui.greetingTitle.textContent = `${greeting}${namePart}.`;
  ui.dateDisplay.textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  ui.clockDisplay.textContent = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
  ui.clockDisplay.dateTime = now.toISOString();
}

function applyTheme() {
  ui.body.setAttribute('data-theme', state.theme);
  ui.themeIcon.textContent = state.theme === 'dark' ? '☀' : '☾';
  ui.themeToggle.setAttribute('aria-label', state.theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveTheme();
  applyTheme();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function renderTimer() {
  ui.timerDisplay.textContent = formatTime(state.secondsLeft);
  ui.timerDisplay.dateTime = `PT${Math.ceil(state.secondsLeft / 60)}M`;
  ui.durationInput.value = String(state.timerMinutes);
  ui.durationChips.forEach((chip) => {
    chip.classList.toggle('is-selected', Number(chip.dataset.minutes) === state.timerMinutes);
  });

  if (state.isRunning) {
    ui.timerStatus.textContent = 'Berjalan';
    ui.timerMessage.textContent = 'Jaga ritme. Satu hal kecil selesai lebih baik dari banyak hal tertunda.';
  } else if (state.secondsLeft === state.timerMinutes * 60) {
    ui.timerStatus.textContent = 'Siap';
    ui.timerMessage.textContent = 'Pilih durasi, lalu mulai saat siap.';
  } else {
    ui.timerStatus.textContent = 'Jeda';
    ui.timerMessage.textContent = 'Sesi berhenti sementara. Lanjutkan saat fokus kembali.';
  }

  ui.startTimer.disabled = state.isRunning;
  ui.pauseTimer.disabled = !state.isRunning;
}

function stopTimerState() {
  if (!state.timerId) return;
  clearInterval(state.timerId);
  state.timerId = null;
  state.isRunning = false;
}

function finishTimer() {
  stopTimerState();
  state.secondsLeft = state.timerMinutes * 60;
  renderTimer();
  ui.timerStatus.textContent = 'Selesai';
  ui.timerMessage.textContent = 'Sesi fokus selesai. Ambil jeda singkat, lalu lanjut lagi.';
  window.alert('Sesi fokus selesai.');
}

function startTimer() {
  if (state.isRunning) return;
  state.isRunning = true;
  renderTimer();

  state.timerId = window.setInterval(() => {
    state.secondsLeft -= 1;
    if (state.secondsLeft <= 0) {
      finishTimer();
      return;
    }
    renderTimer();
  }, 1000);
}

function pauseTimer() {
  stopTimerState();
  renderTimer();
}

function resetTimer() {
  stopTimerState();
  state.secondsLeft = state.timerMinutes * 60;
  renderTimer();
}

function setTimerMinutes(minutes) {
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180) {
    ui.timerMessage.textContent = 'Durasi valid: 5 sampai 180 menit.';
    return;
  }

  state.timerMinutes = minutes;
  saveTimerMinutes();
  resetTimer();
}

function renderTasks() {
  state.tasks.sort(sortTasks);
  saveTasks();

  ui.taskList.innerHTML = state.tasks.map((task) => {
    const taskText = escapeHtml(task.text);
    const createdAt = new Date(task.createdAt || Date.now()).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <li class="task-item ${task.done ? 'is-done' : ''}" data-task-id="${task.id}">
        <div class="task-row">
          <div class="task-main">
            <input class="task-check" type="checkbox" ${task.done ? 'checked' : ''} aria-label="Tandai tugas selesai" data-action="toggle" data-id="${task.id}">
            <div class="task-text-wrap">
              <span class="task-text">${taskText}</span>
              <div class="task-meta">Dibuat ${createdAt}</div>
            </div>
          </div>
          <div class="task-actions">
            <button class="task-action" type="button" data-action="edit" data-id="${task.id}">Edit</button>
            <button class="task-action task-action-danger" type="button" data-action="delete" data-id="${task.id}">Hapus</button>
          </div>
        </div>
      </li>
    `;
  }).join('');

  const total = state.tasks.length;
  const done = state.tasks.filter((task) => task.done).length;
  ui.taskCount.textContent = `${total} tugas · ${done} selesai`;
  ui.tasksEmpty.hidden = total > 0;
}

function setTaskMessage(message, type = '') {
  ui.taskMessage.textContent = message;
  ui.taskMessage.className = `form-message${type ? ` is-${type}` : ''}`;
}

function setLinkMessage(message, type = '') {
  ui.linkMessage.textContent = message;
  ui.linkMessage.className = `form-message${type ? ` is-${type}` : ''}`;
}

function addTask(text) {
  const normalized = normalizeTaskText(text);
  if (!normalized) {
    setTaskMessage('Isi tugas tidak boleh kosong.', 'error');
    return;
  }

  const duplicate = state.tasks.some((task) => task.text.toLocaleLowerCase('id-ID') === normalized.toLocaleLowerCase('id-ID'));
  if (duplicate) {
    setTaskMessage('Tugas sama sudah ada. Gunakan nama lain.', 'error');
    return;
  }

  state.tasks.push({
    id: makeId('task'),
    text: normalized,
    done: false,
    createdAt: new Date().toISOString()
  });

  renderTasks();
  setTaskMessage('Tugas ditambahkan.', 'success');
  ui.taskForm.reset();
  ui.taskInput.focus();
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  renderTasks();
  setTaskMessage(task.done ? 'Tugas ditandai selesai.' : 'Tugas dibuka kembali.', 'success');
}

function deleteTask(id) {
  const nextTasks = state.tasks.filter((task) => task.id !== id);
  if (nextTasks.length === state.tasks.length) return;
  state.tasks = nextTasks;
  renderTasks();
  setTaskMessage('Tugas dihapus.', 'success');
}

function enterEditMode(id) {
  const taskItem = ui.taskList.querySelector(`[data-task-id="${id}"]`);
  const task = state.tasks.find((item) => item.id === id);
  if (!taskItem || !task) return;

  const wrap = taskItem.querySelector('.task-text-wrap');
  const actions = taskItem.querySelector('.task-actions');
  wrap.innerHTML = `
    <label class="sr-only" for="edit-${id}">Edit tugas</label>
    <input class="task-edit-input" id="edit-${id}" type="text" maxlength="120" value="${escapeHtml(task.text)}">
    <div class="task-meta">Tekan Enter untuk simpan, Escape untuk batal.</div>
  `;
  actions.innerHTML = `
    <button class="task-action" type="button" data-action="save" data-id="${id}">Simpan</button>
    <button class="task-action" type="button" data-action="cancel" data-id="${id}">Batal</button>
  `;

  const input = taskItem.querySelector('.task-edit-input');
  input.focus();
  input.select();
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveTaskEdit(id, input.value);
    }
    if (event.key === 'Escape') {
      renderTasks();
      setTaskMessage('Edit dibatalkan.');
    }
  });
}

function saveTaskEdit(id, nextText) {
  const normalized = normalizeTaskText(nextText);
  if (!normalized) {
    setTaskMessage('Isi tugas tidak boleh kosong.', 'error');
    return;
  }

  const duplicate = state.tasks.some((task) => task.id !== id && task.text.toLocaleLowerCase('id-ID') === normalized.toLocaleLowerCase('id-ID'));
  if (duplicate) {
    setTaskMessage('Nama tugas bentrok dengan tugas lain.', 'error');
    return;
  }

  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.text = normalized;
  renderTasks();
  setTaskMessage('Tugas diperbarui.', 'success');
}

function renderLinks() {
  saveLinks();

  ui.quickLinksList.innerHTML = state.links.map((link) => {
    const safeName = escapeHtml(link.name);
    const safeUrl = escapeHtml(link.url);
    return `
      <li class="link-item" data-link-id="${link.id}">
        <div class="link-row">
          <div>
            <a class="link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a>
            <div class="link-url">${safeUrl}</div>
          </div>
          <div class="link-actions">
            <button class="task-action task-action-danger" type="button" data-link-action="delete" data-id="${link.id}">Hapus</button>
          </div>
        </div>
      </li>
    `;
  }).join('');

  ui.linksEmpty.hidden = state.links.length > 0;
}

function parseUrl(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function addLink(name, urlText) {
  const normalizedName = normalizeTaskText(name);
  const parsedUrl = parseUrl(urlText.trim());

  if (!normalizedName) {
    setLinkMessage('Nama tautan tidak boleh kosong.', 'error');
    return;
  }

  if (!parsedUrl) {
    setLinkMessage('URL harus valid dan diawali http:// atau https://.', 'error');
    return;
  }

  state.links.push({
    id: makeId('link'),
    name: normalizedName,
    url: parsedUrl
  });

  renderLinks();
  setLinkMessage('Tautan disimpan.', 'success');
  ui.linkForm.reset();
  ui.linkNameInput.focus();
}

function deleteLink(id) {
  const nextLinks = state.links.filter((link) => link.id !== id);
  if (nextLinks.length === state.links.length) return;
  state.links = nextLinks;
  renderLinks();
  setLinkMessage('Tautan dihapus.', 'success');
}

function openNameDialog() {
  ui.nameInput.value = state.name;
  if (typeof ui.nameDialog.showModal === 'function') {
    ui.nameDialog.showModal();
    window.setTimeout(() => ui.nameInput.focus(), 20);
    return;
  }

  // ponytail: fallback minimal if dialog unsupported; upgrade path use custom modal wrapper.
  const value = window.prompt('Masukkan nama Anda:', state.name);
  if (value === null) return;
  saveNameFromInput(value);
}

function closeNameDialog() {
  if (ui.nameDialog.open) ui.nameDialog.close();
}

function saveNameFromInput(raw) {
  const nextName = normalizeTaskText(raw).slice(0, 30);
  state.name = nextName;
  saveName();
  updateClock();
  closeNameDialog();
}

function bindEvents() {
  ui.themeToggle.addEventListener('click', toggleTheme);
  ui.editNameButton.addEventListener('click', openNameDialog);
  ui.closeNameDialog.addEventListener('click', closeNameDialog);
  ui.skipNameButton.addEventListener('click', closeNameDialog);

  ui.nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveNameFromInput(ui.nameInput.value);
  });

  ui.startTimer.addEventListener('click', startTimer);
  ui.pauseTimer.addEventListener('click', pauseTimer);
  ui.resetTimer.addEventListener('click', resetTimer);

  ui.durationChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      setTimerMinutes(Number(chip.dataset.minutes));
    });
  });

  ui.durationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setTimerMinutes(Number(ui.durationInput.value));
  });

  ui.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTask(ui.taskInput.value);
  });

  ui.taskList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === 'delete') deleteTask(id);
    if (action === 'edit') enterEditMode(id);
    if (action === 'save') {
      const taskItem = target.closest('[data-task-id]');
      const input = taskItem?.querySelector('.task-edit-input');
      if (input instanceof HTMLInputElement) saveTaskEdit(id, input.value);
    }
    if (action === 'cancel') {
      renderTasks();
      setTaskMessage('Edit dibatalkan.');
    }
  });

  ui.taskList.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action === 'toggle' && target.dataset.id) toggleTask(target.dataset.id);
  });

  ui.linkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addLink(ui.linkNameInput.value, ui.linkUrlInput.value);
  });

  ui.quickLinksList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.linkAction === 'delete' && target.dataset.id) deleteLink(target.dataset.id);
  });
}

function init() {
  applyTheme();
  updateClock();
  renderTimer();
  renderTasks();
  renderLinks();
  bindEvents();

  window.setInterval(updateClock, 1000);

  if (!state.name && typeof ui.nameDialog.showModal === 'function') {
    window.setTimeout(openNameDialog, 300);
  }
}

init();

(function selfCheck() {
  console.assert(formatTime(1500) === '25:00', 'Timer format fail');
  console.assert(parseUrl('https://github.com') === 'https://github.com/', 'URL parser fail');
  console.assert(parseUrl('ftp://example.com') === null, 'URL protocol validation fail');
  console.assert(normalizeTaskText('  tesis   AI  ') === 'tesis AI', 'Task normalization fail');
})();
