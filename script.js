let score = 0;
let time = 60;
let combo = 0;
let correctAnswer;
let timer;
let maxNumber = 10;

let totalSolved = 0;
let correctCount = 0;
let isClickable = true;

// --- Web Audio API 이펙트 생성 시스템 ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type, customFreq = 0) {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, now);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  } 
  else if (type === 'warning') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(customFreq || 800, now);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } 
  else if (type === 'boom') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
    gainNode.gain.setValueAtTime(0.6, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.8);
  }
}

function startGame(levelMax) {
  maxNumber = levelMax;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('playScreen').classList.remove('hidden');
  
  nextQuestion();
  
  timer = setInterval(() => {
    time--;
    document.getElementById('time').textContent = time;
    
    if (time <= 10 && time > 0) {
      document.getElementById('gameWindow').classList.add('panic');
      document.getElementById('timerBox').classList.add('emergency');
      
      let emergencyFreq = 800 + ((10 - time) * 80); 
      playSound('warning', emergencyFreq);
    }
    
    if (time <= 0) {
      clearInterval(timer);
      handleExplosion();
    }
  }, 1000);
}

function nextQuestion() {
  isClickable = true;
  let a = Math.floor(Math.random() * (maxNumber + 1));
  let b = Math.floor(Math.random() * (maxNumber + 1));
  let ops = ['+', '-', '*'];
  let op = ops[Math.floor(Math.random() * ops.length)];

  if (op === '-' && a < b) { let temp = a; a = b; b = temp; }

  if (op === '+') correctAnswer = a + b;
  if (op === '-') correctAnswer = a - b;
  if (op === '*') correctAnswer = a * b;

  document.getElementById('question').textContent = `${a} ${op} ${b}`;

  let answers = [correctAnswer];
  while (answers.length < 4) {
    let range = maxNumber > 10 ? 15 : 5;
    let wrong = correctAnswer + Math.floor(Math.random() * (range * 2) - range);
    if (!answers.includes(wrong) && wrong >= 0) answers.push(wrong);
  }

  answers.sort(() => Math.random() - 0.5);

  let choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  answers.forEach(ans => {
    let btn = document.createElement('button');
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(btn, ans);
    choicesDiv.appendChild(btn);
  });
}

function checkAnswer(button, answer) {
  if (!isClickable) return;
  isClickable = false;
  
  playSound('click');
  totalSolved++;
  let feedback = document.getElementById('feedback');

  if (answer === correctAnswer) {
    correctCount++;
    score += 10 + combo * 2;
    combo++;
    
    button.classList.add('correct');
    feedback.textContent = '⚡ SECURE';
    feedback.style.color = '#00ff66';
  } else {
    combo = 0;
    time = Math.max(0, time - 4); 
    document.getElementById('time').textContent = time;
    
    button.classList.add('wrong');
    document.body.classList.add('screen-shake');
    feedback.textContent = '🚨 OVERLOAD -4s';
    feedback.style.color = '#ff0055';
    
    if (time <= 0) {
      clearInterval(timer);
      handleExplosion();
      return;
    }
  }

  document.getElementById('score').textContent = score;
  document.getElementById('combo').textContent = combo;

  setTimeout(() => {
    document.body.classList.remove('screen-shake');
    feedback.textContent = '';
    if (time > 0) nextQuestion();
  }, 350);
}

function handleExplosion() {
  document.body.classList.remove('screen-shake');
  document.body.classList.add('detonated'); 
  playSound('boom');

  setTimeout(() => {
    document.getElementById('gameWindow').classList.remove('panic');
    document.getElementById('playScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    
    let accuracyPercent = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = totalSolved;
    document.getElementById('accuracy').textContent = accuracyPercent + '%';
  }, 600);
}

// CodePen 우회를 위한 게임 완전 초기화(리셋) 함수
function resetGame() {
  score = 0;
  time = 60;
  combo = 0;
  totalSolved = 0;
  correctCount = 0;
  isClickable = true;
  
  document.getElementById('score').textContent = score;
  document.getElementById('combo').textContent = combo;
  document.getElementById('time').textContent = time;
  document.getElementById('feedback').textContent = '';
  
  document.body.classList.remove('detonated', 'screen-shake');
  document.getElementById('gameWindow').classList.remove('panic');
  document.getElementById('timerBox').classList.remove('emergency');
  
  document.getElementById('endScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
}
