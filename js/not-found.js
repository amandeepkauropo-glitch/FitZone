const THEME_KEY = 'fitzone_theme';
const themeToggle = document.querySelector('#themeToggle');
const themeLabel = document.querySelector('#themeLabel');
const themeIcon = document.querySelector('#themeIcon');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeIcon.textContent = isDark ? '☀' : '☾';
}

applyTheme(localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

const steps = [
  {
    title: 'Roll your shoulders',
    instructions: 'If comfortable, roll your shoulders gently backward five times.'
  },
  {
    title: 'Reach and reset',
    instructions: 'Sit or stand tall and reach up gently, or simply relax your arms.'
  },
  {
    title: 'Take three easy breaths',
    instructions: 'Breathe naturally and slowly. No need to hold your breath.'
  }
];

const progressTrack = document.querySelector('#progressTrack');
const progressCount = document.querySelector('#progressCount');
const progressFill = document.querySelector('#progressFill');
const questStep = document.querySelector('#questStep');
const stepNumber = document.querySelector('#stepNumber');
const stepTitle = document.querySelector('#stepTitle');
const stepInstructions = document.querySelector('#stepInstructions');
const questMessage = document.querySelector('#questMessage');
const questButton = document.querySelector('#questButton');
let completedSteps = 0;
let started = false;

function updateProgress() {
  progressCount.textContent = `${completedSteps} of ${steps.length}`;
  progressTrack.setAttribute('aria-valuenow', String(completedSteps));
  progressFill.style.width = `${(completedSteps / steps.length) * 100}%`;
}

function showStep() {
  if (completedSteps >= steps.length) {
    questStep.hidden = true;
    questMessage.textContent = 'Quest complete! Nice work taking a moment for yourself.';
    questButton.textContent = 'Play again';
    started = false;
    return;
  }

  const step = steps[completedSteps];
  stepNumber.textContent = `Step ${completedSteps + 1} of ${steps.length}`;
  stepTitle.textContent = step.title;
  stepInstructions.textContent = step.instructions;
  questStep.hidden = false;
  questMessage.textContent = 'Take your time. Complete the step whenever you feel ready.';
  questButton.textContent = 'Complete this step';
}

questButton.addEventListener('click', () => {
  if (!started && completedSteps === steps.length) {
    completedSteps = 0;
    updateProgress();
  }
  if (!started) {
    started = true;
    showStep();
    return;
  }
  completedSteps += 1;
  updateProgress();
  showStep();
});
