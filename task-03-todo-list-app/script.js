// DayList stores tasks in the browser so they remain after the page is refreshed.
const STORAGE_KEY = 'daylist-tasks';
const THEME_KEY = 'daylist-theme';

let tasks = loadTasks();
let activeFilter = 'all';

const taskForm = document.querySelector('#taskForm');
const taskInput = document.querySelector('#taskInput');
const categoryInput = document.querySelector('#categoryInput');
const priorityInput = document.querySelector('#priorityInput');
const dateInput = document.querySelector('#dateInput');
const searchInput = document.querySelector('#searchInput');
const sortInput = document.querySelector('#sortInput');
const taskList = document.querySelector('#taskList');
const emptyState = document.querySelector('#emptyState');
const editDialog = document.querySelector('#editDialog');

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    console.warn('Saved tasks could not be loaded.', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask(event) {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: createId(),
    title,
    category: categoryInput.value,
    priority: priorityInput.value,
    dueDate: dateInput.value,
    completed: false,
    createdAt: Date.now()
  });

  saveTasks();
  taskForm.reset();
  priorityInput.value = 'medium';
  taskInput.focus();
  renderApp();
  showToast('Task added');
}

function toggleTask(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderApp();
  showToast(task.completed ? 'Task completed' : 'Task reopened');
}

function deleteTask(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  if (!window.confirm(`Delete “${task.title}”?`)) return;
  tasks = tasks.filter(item => item.id !== taskId);
  saveTasks();
  renderApp();
  showToast('Task deleted');
}

function openEditDialog(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  document.querySelector('#editTaskId').value = task.id;
  document.querySelector('#editTaskInput').value = task.title;
  document.querySelector('#editCategoryInput').value = task.category;
  document.querySelector('#editPriorityInput').value = task.priority;
  document.querySelector('#editDateInput').value = task.dueDate;
  editDialog.showModal();
  document.querySelector('#editTaskInput').focus();
}

function updateTask(event) {
  event.preventDefault();
  const taskId = document.querySelector('#editTaskId').value;
  const task = tasks.find(item => item.id === taskId);
  const updatedTitle = document.querySelector('#editTaskInput').value.trim();
  if (!task || !updatedTitle) return;

  task.title = updatedTitle;
  task.category = document.querySelector('#editCategoryInput').value;
  task.priority = document.querySelector('#editPriorityInput').value;
  task.dueDate = document.querySelector('#editDateInput').value;
  saveTasks();
  editDialog.close();
  renderApp();
  showToast('Task updated');
}

function getVisibleTasks() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleTasks = tasks.filter(task => {
    const matchesSearch = `${task.title} ${task.category}`.toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'all'
      || (activeFilter === 'active' && !task.completed)
      || (activeFilter === 'completed' && task.completed);
    return matchesSearch && matchesFilter;
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  visibleTasks.sort((first, second) => {
    if (sortInput.value === 'priority') return priorityOrder[first.priority] - priorityOrder[second.priority];
    if (sortInput.value === 'due-date') {
      if (!first.dueDate && !second.dueDate) return second.createdAt - first.createdAt;
      if (!first.dueDate) return 1;
      if (!second.dueDate) return -1;
      return first.dueDate.localeCompare(second.dueDate);
    }
    return second.createdAt - first.createdAt;
  });

  return visibleTasks;
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.dueDate}T00:00:00`) < today;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = `task-item${task.completed ? ' completed' : ''}`;

  const completeButton = document.createElement('button');
  completeButton.type = 'button';
  completeButton.className = 'complete-button';
  completeButton.setAttribute('aria-label', task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`);
  completeButton.addEventListener('click', () => toggleTask(task.id));

  const content = document.createElement('div');
  const title = document.createElement('p');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const category = document.createElement('span');
  category.className = 'tag';
  category.textContent = task.category;
  const priority = document.createElement('span');
  priority.className = `priority ${task.priority}`;
  priority.textContent = `${task.priority} priority`;
  meta.append(category, priority);

  if (task.dueDate) {
    const dueDate = document.createElement('span');
    dueDate.className = isOverdue(task) ? 'overdue' : '';
    dueDate.textContent = isOverdue(task) ? `Overdue · ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`;
    meta.append(dueDate);
  }
  content.append(title, meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button';
  editButton.textContent = 'Edit';
  editButton.setAttribute('aria-label', `Edit ${task.title}`);
  editButton.addEventListener('click', () => openEditDialog(task.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
  deleteButton.addEventListener('click', () => deleteTask(task.id));
  actions.append(editButton, deleteButton);

  item.append(completeButton, content, actions);
  return item;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  emptyState.hidden = visibleTasks.length !== 0;
  document.querySelector('#resultText').textContent = `${visibleTasks.length} task${visibleTasks.length === 1 ? '' : 's'} shown`;
}

function updateProgress() {
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  document.querySelector('#completedCount').textContent = completed;
  document.querySelector('#totalCount').textContent = total;
  document.querySelector('#progressBar').style.width = `${percentage}%`;
  document.querySelector('#progressMessage').textContent = total === 0
    ? 'Start with one small task.'
    : completed === total
      ? 'Everything is done. Nice work!'
      : `${percentage}% complete — keep going.`;
  const clearButton = document.querySelector('#clearCompletedButton');
  clearButton.disabled = completed === 0;
}

function renderApp() {
  renderTasks();
  updateProgress();
}

function clearCompletedTasks() {
  const completed = tasks.filter(task => task.completed).length;
  if (!completed || !window.confirm(`Clear ${completed} completed task${completed === 1 ? '' : 's'}?`)) return;
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderApp();
  showToast('Completed tasks cleared');
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function setTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

taskForm.addEventListener('submit', addTask);
document.querySelector('#editForm').addEventListener('submit', updateTask);
document.querySelector('#closeDialogButton').addEventListener('click', () => editDialog.close());
searchInput.addEventListener('input', renderTasks);
sortInput.addEventListener('change', renderTasks);
document.querySelector('#clearCompletedButton').addEventListener('click', clearCompletedTasks);

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach(filterButton => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderTasks();
  });
});

document.querySelector('#themeButton').addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && editDialog.open) editDialog.close();
});

document.querySelector('#todayText').textContent = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
}).format(new Date());

setTheme(localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');
renderApp();
