// Teaching adaptation of native-web-app-dev/4-typing-game.
const quotes = [
  'We build web apps.',
  'Small steps make progress.',
  'Read code and test ideas.'
];
let words = [];
let wordIndex = 0;
let startTime = 0;
let status = 'idle';

const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const feedbackElement = document.getElementById('feedback');
const quoteChoice = document.getElementById('quote-choice');
const startButton = document.getElementById('start');

startButton.addEventListener('click', startGame);
typedValueElement.addEventListener('input', handleInput);

function startGame() {
  const quoteIndex = quoteChoice.value === 'random'
    ? Math.floor(Math.random() * quotes.length)
    : Number(quoteChoice.value);
  words = quotes[quoteIndex].trim().split(/\s+/);
  wordIndex = 0;
  status = 'playing';
  quoteElement.replaceChildren(...words.map(word => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    return span;
  }));
  quoteElement.children[0].classList.add('highlight');
  messageElement.textContent = '';
  typedValueElement.value = '';
  typedValueElement.disabled = false;
  typedValueElement.classList.remove('error');
  typedValueElement.setAttribute('aria-invalid', 'false');
  feedbackElement.textContent = '请输入第 1 个单词。';
  typedValueElement.focus();
  startTime = performance.now();
}

function handleInput(event) {
  if (status !== 'playing' || event.isComposing) return;
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;
  const isLast = wordIndex === words.length - 1;

  if (isLast && typedValue === currentWord) {
    const seconds = (performance.now() - startTime) / 1000;
    status = 'finished';
    markCompleted(wordIndex);
    showError(false);
    typedValueElement.disabled = true;
    feedbackElement.textContent = '所有单词已完成。';
    messageElement.textContent = `完成！用时 ${seconds.toFixed(2)} 秒。`;
    startButton.focus();
  } else if (!isLast && typedValue === currentWord + ' ') {
    markCompleted(wordIndex);
    wordIndex += 1;
    typedValueElement.value = '';
    quoteElement.children[wordIndex].classList.add('highlight');
    showError(false);
    feedbackElement.textContent = `请输入第 ${wordIndex + 1} 个单词。`;
  } else {
    showError(!currentWord.startsWith(typedValue));
  }
}

function markCompleted(index) {
  const span = quoteElement.children[index];
  span.classList.remove('highlight');
  span.classList.add('done');
}
function showError(wrong) {
  typedValueElement.classList.toggle('error', wrong);
  typedValueElement.setAttribute('aria-invalid', String(wrong));
  feedbackElement.textContent = wrong ? '当前输入不匹配，请检查大小写、标点和空格。' : '输入前缀正确。';
}
