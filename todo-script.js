// =====================================================
// TaskFlow To-Do App JavaScript
// =====================================================

// ===== State Management =====
let tasks = [];
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let currentCategoryFilter = 'all';
let editingTaskId = null;
let currentUser = null;

// ===== DOM Elements =====
const welcomeOverlay = document.getElementById('welcomeOverlay');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const taskFrequencyInput = document.getElementById('taskFrequency');
const taskPriorityInput = document.getElementById('taskPriority');
const taskCategoryInput = document.getElementById('taskCategory');
const taskDueDateInput = document.getElementById('taskDueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskBtnText = document.getElementById('addTaskBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');

const filterButtons = document.querySelectorAll('.filter-btn');
const priorityFilter = document.getElementById('priorityFilter');
const categoryFilter = document.getElementById('categoryFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const overdueTasksEl = document.getElementById('overdueTasks');

// ===== Authentication =====
const VALID_CREDENTIALS = {
  username: 'demo',
  pin: '1234'
};

// Check if already authenticated
if (sessionStorage.getItem('taskflow_authenticated') === 'true') {
  const username = sessionStorage.getItem('taskflow_username');
  showApp(username);
}

// Login form submission
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const pin = document.getElementById('pin').value.trim();
  
  if (username === VALID_CREDENTIALS.username && pin === VALID_CREDENTIALS.pin) {
    errorMessage.style.display = 'none';
    sessionStorage.setItem('taskflow_authenticated', 'true');
    sessionStorage.setItem('taskflow_username', username);
    showApp(username);
  } else {
    errorMessage.textContent = 'Invalid username or PIN. Please try again.';
    errorMessage.style.display = 'block';
    loginForm.style.animation = 'shake 0.5s';
    setTimeout(() => {
      loginForm.style.animation = '';
    }, 500);
  }
});

// Logout
logoutBtn.addEventListener('click', function() {
  sessionStorage.removeItem('taskflow_authenticated');
  sessionStorage.removeItem('taskflow_username');

  // redirect to landing page
  window.location.href = "landing-page.html";
});

function showApp(username) {
  currentUser = username;
  userInfo.textContent = `Welcome, ${username}`;
  welcomeOverlay.classList.add('hidden');
  appContainer.classList.remove('hidden');
  loadTasks();
  renderTasks();
  updateStats();
  updateCategoryFilter();
}

// ===== Task Management =====

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem('taskflow_tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// Add new task
taskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const taskData = {
    id: editingTaskId || Date.now().toString(),
    name: taskNameInput.value.trim(),
    frequency: taskFrequencyInput.value,
    priority: taskPriorityInput.value,
    category: taskCategoryInput.value.trim() || 'Uncategorized',
    dueDate: taskDueDateInput.value,
    completed: false,
    createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : new Date().toISOString()
  };
  
  if (editingTaskId) {
    // Update existing task
    const index = tasks.findIndex(t => t.id === editingTaskId);
    tasks[index] = taskData;
    editingTaskId = null;
    addTaskBtnText.textContent = 'Add Task';
    cancelEditBtn.style.display = 'none';
  } else {
    // Add new task
    tasks.unshift(taskData);
  }
  
  saveTasks();
  renderTasks();
  updateStats();
  updateCategoryFilter();
  taskForm.reset();
  showToast('Task saved successfully!', 'success');
});

// Cancel edit
cancelEditBtn.addEventListener('click', function() {
  editingTaskId = null;
  taskForm.reset();
  addTaskBtnText.textContent = 'Add Task';
  cancelEditBtn.style.display = 'none';
});

// Render tasks
function renderTasks() {
  tasksContainer.innerHTML = '';
  
  const filteredTasks = getFilteredTasks();
  
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    
    filteredTasks.forEach(task => {
      const taskEl = createTaskElement(task);
      tasksContainer.appendChild(taskEl);
    });
  }
}

// Create task element
function createTaskElement(task) {
  const taskItem = document.createElement('div');
  taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));
  
  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';
  
  const taskHeader = document.createElement('div');
  taskHeader.className = 'task-header';
  
  const taskName = document.createElement('div');
  taskName.className = 'task-name';
  taskName.textContent = task.name;
  
  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'task-btn task-btn-edit';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => editTask(task.id));
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-btn task-btn-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
  taskActions.appendChild(editBtn);
  taskActions.appendChild(deleteBtn);
  
  taskHeader.appendChild(taskName);
  taskHeader.appendChild(taskActions);
  
  const taskMeta = document.createElement('div');
  taskMeta.className = 'task-meta';
  
  const frequencyBadge = document.createElement('span');
  frequencyBadge.className = 'task-badge badge-frequency';
  frequencyBadge.textContent = task.frequency;
  
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `task-badge badge-priority ${task.priority}`;
  priorityBadge.textContent = task.priority;
  
  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'task-badge badge-category';
  categoryBadge.textContent = task.category;
  
  taskMeta.appendChild(frequencyBadge);
  taskMeta.appendChild(priorityBadge);
  taskMeta.appendChild(categoryBadge);
  
  if (task.dueDate) {
    const dueDate = document.createElement('span');
    dueDate.className = 'task-due';
    const dueDateObj = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDateObj < today && !task.completed) {
      dueDate.classList.add('overdue');
      dueDate.textContent = `⚠️ Overdue: ${formatDate(task.dueDate)}`;
    } else {
      dueDate.textContent = `📅 Due: ${formatDate(task.dueDate)}`;
    }
    
    taskMeta.appendChild(dueDate);
  }
  
  taskContent.appendChild(taskHeader);
  taskContent.appendChild(taskMeta);
  
  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskContent);
  
  return taskItem;
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

// Edit task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    editingTaskId = id;
    taskNameInput.value = task.name;
    taskFrequencyInput.value = task.frequency;
    taskPriorityInput.value = task.priority;
    taskCategoryInput.value = task.category !== 'Uncategorized' ? task.category : '';
    taskDueDateInput.value = task.dueDate;
    
    addTaskBtnText.textContent = 'Update Task';
    cancelEditBtn.style.display = 'inline-flex';
    
    // Scroll to form
    document.querySelector('.add-task-section').scrollIntoView({ behavior: 'smooth' });
  }
}

// Delete task
function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    updateCategoryFilter();
    showToast('Task deleted successfully!', 'success');
  }
}

// ===== Filtering =====

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    filterButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderTasks();
  });
});

// Priority filter
priorityFilter.addEventListener('change', function() {
  currentPriorityFilter = this.value;
  renderTasks();
});

// Category filter
categoryFilter.addEventListener('change', function() {
  currentCategoryFilter = this.value;
  renderTasks();
});

// Clear filters
clearFiltersBtn.addEventListener('click', function() {
  currentFilter = 'all';
  currentPriorityFilter = 'all';
  currentCategoryFilter = 'all';
  
  filterButtons.forEach(btn => btn.classList.remove('active'));
  filterButtons[0].classList.add('active');
  priorityFilter.value = 'all';
  categoryFilter.value = 'all';
  
  renderTasks();
});

// Clear completed tasks
clearCompletedBtn.addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all completed tasks?')) {
    const completedCount = tasks.filter(t => t.completed).length;
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateStats();
    showToast(`${completedCount} completed task(s) deleted!`, 'success');
  }
});

// Get filtered tasks
function getFilteredTasks() {
  return tasks.filter(task => {
    // Frequency filter
    if (currentFilter === 'daily' && task.frequency !== 'daily') return false;
    if (currentFilter === 'weekly' && task.frequency !== 'weekly') return false;
    if (currentFilter === 'monthly' && task.frequency !== 'monthly') return false;
    if (currentFilter === 'completed' && !task.completed) return false;
    if (currentFilter === 'pending' && task.completed) return false;
    
    // Priority filter
    if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;
    
    // Category filter
    if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;
    
    return true;
  });
}

// Update category filter options
function updateCategoryFilter() {
  const categories = [...new Set(tasks.map(t => t.category))];
  const currentValue = categoryFilter.value;
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (categories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

// ===== Statistics =====
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate < today;
  }).length;
  
  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  overdueTasksEl.textContent = overdue;
}

// ===== Utilities =====

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Toast notification
function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  
  const toastStyles = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    background: type === 'success' ? '#8FEC78' : type === 'error' ? '#ff5252' : '#42a5f5',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '0.9375rem',
    fontWeight: '500',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease',
    maxWidth: '90%'
  };
  
  Object.assign(toast.style, toastStyles);
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(toastStyle);

// ===== Initialize =====
console.log('🎯 TaskFlow To-Do App Loaded!');
console.log('📝 Demo Credentials: username: demo | pin: 1234');