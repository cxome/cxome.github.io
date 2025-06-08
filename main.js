// === 랜덤 엔딩 텍스트 배열 ===
const endingTexts = [
  { left: "you've entered", right: "the space" },
  { left: "you've felt", right: "beyond" },
  { left: "this website", right: "is amazing" },
  { left: "welcome to", right: "the void" },
  { left: "reality has", right: "shifted" },
  { left: "you're now", right: "awakened" },
  { left: "the journey", right: "continues" },
  { left: "something", right: "has changed" },
  { left: "you found", right: "the secret" },
  { left: "congratulations", right: "explorer" },
  { left: "the matrix", right: "glitched" },
  { left: "you transcended", right: "dimensions" }
];

// === 현재 엔딩 텍스트 인덱스 ===
let currentEndingIndex = 0;

// === 엔딩 텍스트 업데이트 함수 ===
function updateEndingText() {
  const leftTextEl = document.querySelector('.left-text');
  const rightTextEl = document.querySelector('.right-text');
  
  if (leftTextEl && rightTextEl) {
    const newText = endingTexts[currentEndingIndex];
    leftTextEl.textContent = newText.left;
    rightTextEl.textContent = newText.right;
  }
}

// === 다음 랜덤 텍스트 선택 함수 ===
function selectNextEndingText() {
  // 현재 텍스트와 다른 텍스트를 랜덤하게 선택 (연속 중복 방지)
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * endingTexts.length);
  } while (nextIndex === currentEndingIndex && endingTexts.length > 1);
  
  currentEndingIndex = nextIndex;
}

// === 상태 변수 ===
let trailActive = false;
let againClickCount = 0;
let isFirstEndingEntry = true;

// === 카운터 표시 함수 ===
function createCounterDisplay() {
  const counterEl = document.createElement('div');
  counterEl.id = 'again-counter';
  counterEl.className = 'again-counter';
  counterEl.textContent = `Again: ${againClickCount}`;
  
  const endingSection = document.getElementById('ending-section');
  if (endingSection) {
    endingSection.appendChild(counterEl);
  }
  
  return counterEl;
}

function updateCounter() {
  const counterEl = document.getElementById('again-counter');
  if (counterEl) {
    counterEl.textContent = `Again: ${againClickCount}`;
    
    if (isFirstEndingEntry) {
      counterEl.classList.add('updated');
      setTimeout(() => {
        counterEl.classList.remove('updated');
      }, 600);
      isFirstEndingEntry = false;
    }
  }
}

// === 카운터 애니메이션 리셋 및 재실행 함수 ===
function resetAndAnimateCounter() {
  const counterEl = document.getElementById('again-counter');
  if (counterEl) {
    counterEl.classList.remove('counter-fade-in');
    counterEl.offsetHeight;
    
    counterEl.style.opacity = '0';
    counterEl.style.transform = 'translateY(-15px)';
    counterEl.style.filter = 'blur(5px)';
    
    requestAnimationFrame(() => {
      counterEl.classList.add('counter-fade-in');
    });
  }
}

// === 애니메이션 초기화 함수 ===
function resetAnimations() {
  document.querySelectorAll('.section').forEach(el => {
    el.classList.remove('active');
  });
  
  // bg-zoom 섹션들의 상태를 완전히 리셋하여 재애니메이션 가능하게 함
  document.querySelectorAll('.bg-zoom').forEach(el => {
    el.classList.remove('active', 'stabilized', 'animate');
  });
  
  const intro = document.querySelector('.intro-container');
  if (intro) intro.classList.remove('not-active');
}

// === Trail Dot 함수 ===
function createTrailDot(x, y) {
  if (!trailActive) return;
  const dot = document.createElement('div');
  dot.classList.add('trail-dot');
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
}

// === 마우스 트레일 지속 생성 함수 ===
let trailInterval;
let currentMouseX = 0;
let currentMouseY = 0;

function startContinuousTrail() {
  if (trailInterval) return;
  
  trailInterval = setInterval(() => {
    if (trailActive) {
      createTrailDot(currentMouseX, currentMouseY);
    }
  }, 100);
}

function stopContinuousTrail() {
  if (trailInterval) {
    clearInterval(trailInterval);
    trailInterval = null;
  }
}

// === 마우스 위치 추적 ===
document.addEventListener('mousemove', (e) => {
  currentMouseX = e.clientX;
  currentMouseY = e.clientY;
  
  if (trailActive) {
    createTrailDot(e.clientX, e.clientY);
  }
});

// === 암전 효과 함수 ===
function createFadeOverlay() {
  const overlay = document.createElement('div');
  overlay.classList.add('fade-overlay');
  document.body.appendChild(overlay);
  return overlay;
}

// === IntersectionObserver ===
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll('.section');
  const introSection = document.querySelector('.intro-container');
  const chromeSection = document.querySelector('.chrome');
  const endingSection = document.getElementById('ending-section');
  const againButton = document.querySelector('.again-button');
  const bodyEl = document.body;
  const resetTimers = new Map();

  // === 초기 랜덤 텍스트 설정 ===
  selectNextEndingText();
  updateEndingText();

  chromeSection?.style.setProperty('opacity', '0');
  const preventScroll = (e) => e.preventDefault();
  bodyEl.addEventListener('wheel', preventScroll, { passive: false });

  setTimeout(() => {
    chromeSection?.style.setProperty('opacity', '1');
    bodyEl.removeEventListener('wheel', preventScroll, { passive: false });
  }, 2500);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const target = entry.target;
      const id = target.id || target.dataset.section;

      if (entry.isIntersecting) {
        // bg-zoom 애니메이션 로직 - stabilized 상태와 관계없이 항상 애니메이션 발동
        if (target.classList.contains('bg-zoom')) {
          // 이미 animate 중이 아닐 때만 애니메이션 시작
          if (!target.classList.contains('animate')) {
            target.classList.add('animate');
            setTimeout(() => {
              target.classList.remove('animate');
              target.classList.add('stabilized');
            }, 1200);
          }
        }

        if (resetTimers.has(id)) {
          clearTimeout(resetTimers.get(id));
          resetTimers.delete(id);
        }

        target.classList.add('active');
      } else {
        target.classList.remove('active');

        // 섹션을 벗어날 때 stabilized 상태 해제하여 다음 진입 시 재애니메이션 가능하게 함
        if (target.classList.contains('bg-zoom')) {
          const timer = setTimeout(() => {
            target.classList.remove('stabilized');
            resetTimers.delete(id);
          }, 800);
          resetTimers.set(id, timer);
        }

        if (target.classList.contains('intro-container')) {
          target.classList.add('not-active');
        }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
  if (introSection) observer.observe(introSection);

  // === Trail Observer ===
  if (endingSection) {
    const trailObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            trailActive = true;
            startContinuousTrail();
          }, 5600);
          
          if (againClickCount > 0) {
            if (!document.getElementById('again-counter')) {
              createCounterDisplay();
            }
            
            updateCounter();
            
            setTimeout(() => {
              resetAndAnimateCounter();
            }, 100);
          }
        } else {
          const counterEl = document.getElementById('again-counter');
          if (counterEl) {
            counterEl.style.opacity = '0';
            counterEl.style.transform = 'translateY(-15px)';
            counterEl.style.filter = 'blur(5px)';
            counterEl.classList.remove('counter-fade-in');
          }
          
          trailActive = false;
          stopContinuousTrail();
        }
      });
    }, { threshold: 0.5 });

    trailObserver.observe(endingSection);
  }

  // === Again 버튼 클릭 시 (랜덤 텍스트 변경 포함) ===
  againButton?.addEventListener('click', () => {
    againClickCount++;
    isFirstEndingEntry = true;
    
    // === 다음 랜덤 텍스트 선택 및 업데이트 ===
    selectNextEndingText();
    
    if (againClickCount === 1 && !document.getElementById('again-counter')) {
      createCounterDisplay();
    }
    
    const fadeOverlay = createFadeOverlay();
    
    setTimeout(() => {
      fadeOverlay.classList.add('fade-in');
    }, 50);
    
    setTimeout(() => {
      resetAnimations();
      trailActive = false;
      stopContinuousTrail();
      
      document.querySelector('main').scrollTop = 0;
      
      // === 엔딩 텍스트 업데이트 (암전 중에 수행) ===
      updateEndingText();
      
      const introSection = document.querySelector('.intro-container');
      if (introSection) {
        introSection.classList.remove('not-active');
        setTimeout(() => {
          introSection.classList.add('active');
        }, 200);
      }
      
    }, 1800);
    
    setTimeout(() => {
      fadeOverlay.classList.remove('fade-in');
      
      // === 암전 해제 후 Observer 완전 재초기화 ===
      setTimeout(() => {
        // 모든 bg-zoom 요소들이 새로 진입할 때 애니메이션이 발동되도록 강제 리셋
        document.querySelectorAll('.bg-zoom').forEach(el => {
          el.classList.remove('active', 'stabilized', 'animate');
          // Observer 재등록으로 상태 초기화
          observer.unobserve(el);
          observer.observe(el);
        });
        
        fadeOverlay.remove();
      }, 1800);
    }, 2200);
  });
});
