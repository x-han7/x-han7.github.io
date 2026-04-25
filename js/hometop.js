/**
 * 随机打乱数组（Fisher-Yates 算法）
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 渲染随机文章卡片
 */
function renderRandomArticles(posts) {
  const container = document.getElementById('random-articles-container');
  if (!container || !posts || posts.length === 0) return;

  const html = posts.map(post => `
    <a class="random-card" href="${post.path}" data-pjax-state="">
      <div class="ramdom-info">
        <img data-lazy-src="${post.cover}"  src="${post.cover}"
             onerror="this.onerror=null;this.src='/media/default.webp'" 
             alt="${post.title}">
        <div class="random-time">
          <i class="MeuiCat icon-calendar-todo-fill"></i>
          <time>${post.date}</time>
        </div>
      </div>
      <div class="random-title">${post.title}</div>
    </a>
  `).join('');

  container.innerHTML = html;
}

/**
 * 换一批随机文章
 */
function articlesRandom() {
  if (!window.sitePosts || window.sitePosts.length === 0) return;
  
  // 随机抽取 6 篇
  const count = Math.min(6, window.sitePosts.length);
  const randomPosts = shuffleArray(window.sitePosts).slice(0, count);
  renderRandomArticles(randomPosts);
}

/**
 * 初始化 Swiper 轮播图
 */
function initSwiper() {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper not loaded');
    return;
  }

  new Swiper('.carousel-section', {
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-next',
      prevEl: '.swiper-prev',
    },
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    grabCursor: true,
  });
}

// DOM 加载完成后执行
function initPage() {
  initSwiper();
  articlesRandom();
}

document.addEventListener('DOMContentLoaded', initPage);
document.addEventListener('pjax:complete', initPage);