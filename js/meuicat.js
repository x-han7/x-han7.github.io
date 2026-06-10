const changeTime = (time, more = false) => {
  const currentDate = new Date()

  const formatTimestamp = (date) => {
    const d = new Date(date)
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(d.getFullYear())}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const calculateDiff = (date1, date2, unit) => {
    const units = { day: 24 * 60 * 60 * 1000, hour: 60 * 60 * 1000 }
    return Math.floor(Math.abs(date1 - date2) / units[unit])
  }

  const describeTime = (datetime) => {
    const timeObj = new Date(datetime)
    const diffDays = calculateDiff(timeObj, currentDate, 'day')
    const diffHours = calculateDiff(timeObj, currentDate, 'hour')

    if (diffHours < 1) return '最近'
    if (diffHours <= 24) return `${diffHours}小时前`
    if (diffDays === 1) return '昨天'
    if (diffDays === 2) return '前天'
    if (diffDays <= 7) return `${diffDays}天前`

    const year = timeObj.getFullYear()
    const month = timeObj.getMonth() + 1
    const date = timeObj.getDate()
    return year !== currentDate.getFullYear() ? `${year}/${month}/${date}` : `${month}/${date}`
  }

  if (more) return formatTimestamp(time)
  if (time) return describeTime(time)

  document.querySelectorAll('time.datatime').forEach((e) => { e.textContent = describeTime(e.getAttribute('datetime')) })
}

// AI-Modify: 保留原有特殊日期网站置灰逻辑。
if (PublicSacrificeDay()) {
  document.documentElement.setAttribute('style', 'filter:gray !important;filter:grayscale(100%);-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);')
}

function PublicSacrificeDay() {
  const PSFarr = ['0707', '0909', '0918', '1109', '1213']
  const currentdate = new Date()
  const mm = String(currentdate.getMonth() + 1).padStart(2, '0')
  const dd = String(currentdate.getDate()).padStart(2, '0')
  return PSFarr.includes(`${mm}${dd}`)
}

// AI-Modify: 模仿参考站头部菜单和中控台交互，并接入 Butterfly 现有功能。
function initNavMenu() {
  const nav = document.getElementById('nav')
  const menuBtn = document.getElementById('menu-btn')
  const columnBtn = document.getElementById('column-btn')
  const controlBtn = document.getElementById('control_btn')
  const siteMenu = document.getElementById('site-menu')
  const menuItems = document.querySelector('.menu_items')
  const columnItems = document.querySelector('.column_items')
  const controlItems = document.querySelector('.control_items')
  const consoleIcon = controlBtn
  const navTotopBtn = document.getElementById('nav-totop-btn')
  const sayhiInfo = document.getElementById('sayhi-info')

  if (!nav || !siteMenu) return
  if (nav.dataset.aiMenuBound === 'true') {
    syncConsoleState()
    updateNavScrollPercent()
    return
  }
  nav.dataset.aiMenuBound = 'true'

  const panels = {
    menu: menuItems,
    column: columnItems,
    control: controlItems
  }
  const panelTriggers = [menuBtn, columnBtn, controlBtn].filter(Boolean)
  let closeTimer
  let closeAnimationTimer

  const getActivePanel = () => Object.values(panels).find((panel) => panel?.classList.contains('active'))

  const isHoveringTriggerOrPanel = () => {
    const activePanel = getActivePanel()
    return panelTriggers.some((trigger) => trigger.matches(':hover')) || Boolean(activePanel?.matches(':hover'))
  }

  const setActivePanel = (type) => {
    window.clearTimeout(closeTimer)
    window.clearTimeout(closeAnimationTimer)
    nav.classList.add('panel-open')
    siteMenu.classList.remove('closing')
    siteMenu.classList.add('active', type)
    siteMenu.classList.toggle('menu', type === 'menu')
    siteMenu.classList.toggle('column', type === 'column')
    siteMenu.classList.toggle('control', type === 'control')
    Object.keys(panels).forEach((key) => panels[key]?.classList.toggle('active', key === type))
    consoleIcon?.classList.toggle('hide', type === 'control')
  }

  const closePanel = () => {
    window.clearTimeout(closeTimer)
    window.clearTimeout(closeAnimationTimer)
    nav.classList.remove('panel-open')
    consoleIcon?.classList.remove('hide')
    if (!siteMenu.classList.contains('active')) return

    siteMenu.classList.add('closing')
    siteMenu.classList.remove('menu', 'column', 'control')
    closeAnimationTimer = window.setTimeout(() => {
      siteMenu.classList.remove('active', 'closing')
      Object.values(panels).forEach((panel) => panel?.classList.remove('active'))
    }, 360)
  }

  const scheduleClosePanel = () => {
    window.clearTimeout(closeTimer)
    closeTimer = window.setTimeout(() => {
      if (!isHoveringTriggerOrPanel()) closePanel()
    }, 180)
  }

  const cancelClosePanel = () => {
    window.clearTimeout(closeTimer)
  }

  const openSearch = () => {
    const searchButton = document.querySelector('#search-button > .search')
    if (searchButton) {
      searchButton.click()
      closePanel()
    }
  }

  // AI-Modify: 只把触发按钮和实际下拉面板视为安全 hover 区域，避免全屏遮罩导致面板不自动收起。
  const bindPanelTrigger = (trigger, type) => {
    trigger?.addEventListener('mouseenter', () => setActivePanel(type))
    trigger?.addEventListener('focus', () => setActivePanel(type))
    trigger?.addEventListener('click', (event) => {
      event.preventDefault()
      setActivePanel(type)
    })
    trigger?.addEventListener('mouseleave', scheduleClosePanel)
    trigger?.addEventListener('blur', scheduleClosePanel)
  }

  bindPanelTrigger(menuBtn, 'menu')
  bindPanelTrigger(columnBtn, 'column')
  bindPanelTrigger(controlBtn, 'control')

  Object.values(panels).forEach((panel) => {
    panel?.addEventListener('mouseenter', cancelClosePanel)
    panel?.addEventListener('mouseleave', scheduleClosePanel)
  })

  siteMenu.addEventListener('click', (event) => {
    if (event.target.closest('a[href]:not([href^="javascript"])')) closePanel()
  })

  document.getElementById('nav-panel-search')?.addEventListener('click', openSearch)
  navTotopBtn?.addEventListener('click', () => {
    if (window.__aiLenis) window.__aiLenis.scrollTo(0, { duration: 0.8 })
    else if (window.btf?.scrollToDest) btf.scrollToDest(0, 500)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  sayhiInfo?.addEventListener('click', () => sayhiInfo.classList.toggle('show'))

  document.querySelectorAll('[data-console-action]').forEach((item) => {
    item.addEventListener('click', () => runConsoleAction(item.dataset.consoleAction))
  })

  syncConsoleState()
  updateNavScrollPercent()
}

function runConsoleAction(action) {
  const html = document.documentElement
  const body = document.body

  const setTheme = (theme) => {
    if (theme === 'dark') {
      window.btf?.activateDarkMode?.()
    } else {
      window.btf?.activateLightMode?.()
    }
    window.btf?.saveToLocal?.set('theme', theme, 2)
    window.globalFn?.themeChange && Object.keys(window.globalFn.themeChange).forEach((key) => window.globalFn.themeChange[key](theme))
  }

  if (action === 'darkmode') {
    const nextTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  if (action === 'readmode') {
    if (!body.classList.contains('read-mode')) {
      document.getElementById('readmode')?.click()
    } else {
      document.querySelector('.exit-readmode')?.click()
    }
  }

  if (action === 'translate') {
    const translateButton = document.getElementById('translateLink')
    if (window.translateFn?.translatePage) window.translateFn.translatePage()
    else translateButton?.click()
  }

  if (action === 'aside') {
    document.getElementById('hide-aside-btn')?.click()
  }

  if (action === 'search') {
    document.querySelector('#search-button > .search')?.click()
  }

  if (action === 'smooth') {
    if (isSmoothScrollBlockedPage()) {
      window.btf?.saveToLocal?.set('nav-smooth-scroll', 'disable', 365)
      stopSmoothScroll()
      syncConsoleState()
      return
    }
    const nextSmooth = !isSmoothScrollEnabled()
    window.btf?.saveToLocal?.set('nav-smooth-scroll', nextSmooth ? 'enable' : 'disable', 365)
    if (nextSmooth) startSmoothScroll()
    else stopSmoothScroll()
  }

  if (action === 'comment-visible' && isOwnerMode()) {
    setCommentSetting('visible', isCommentVisible() ? 'hide' : 'show')
  }

  if (action === 'comment-write' && isOwnerMode()) {
    setCommentSetting('write', isCommentWritable() ? 'closed' : 'open')
  }

  applyCommentControls()
  syncConsoleState()
}

// AI-Modify: 参考站滑动阻尼使用 Lenis，这里按中控台开关懒加载并持久化状态。
const AI_LENIS_CLASSES = ['lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling', 'lenis-locked']

function isSmoothScrollEnabled() {
  const saved = window.btf?.saveToLocal?.get('nav-smooth-scroll')
  if (saved === 'disable') return false
  if (saved === 'enable') return true
  return false
}

function isSmoothScrollBlockedPage() {
  return Boolean(
    document.getElementById('post-comment') ||
    document.querySelector('[data-role="twikoo-recent-comments"]')
  )
}

function isElementShown(element) {
  if (!element) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

function isPageScrollLockedByUI() {
  const loadingBox = document.getElementById('loading-box')
  const searchMask = document.getElementById('search-mask')
  const searchDialog = document.querySelector('#local-search .search-dialog, #algolia-search .search-dialog')

  return Boolean(
    (loadingBox && !loadingBox.classList.contains('loaded')) ||
    document.querySelector('#sidebar-menus.open') ||
    document.querySelector('.code-fullpage') ||
    document.querySelector('.fancybox__container:not([aria-hidden="true"]), .pswp--open') ||
    isElementShown(searchMask) ||
    isElementShown(searchDialog)
  )
}

function clearSmoothScrollClasses() {
  AI_LENIS_CLASSES.forEach((className) => {
    document.documentElement.classList.remove(className)
    document.body?.classList.remove(className)
  })
  document.documentElement.classList.remove('ai-scroll-lock')
}

function unlockPageScroll(force = false) {
  if (!force && isPageScrollLockedByUI()) return

  document.documentElement.classList.remove('lenis-stopped', 'lenis-locked', 'ai-scroll-lock')
  if (document.body) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }

  const fixedMenus = document.querySelector('#page-header.nav-fixed #menus')
  if (fixedMenus) fixedMenus.style.paddingRight = ''
}

function schedulePageScrollUnlock() {
  unlockPageScroll()
  window.setTimeout(unlockPageScroll, 80)
  window.setTimeout(unlockPageScroll, 420)
  window.setTimeout(() => {
    window.__aiLenis?.resize?.()
    unlockPageScroll()
  }, 1200)
}

function loadSmoothScrollScript() {
  if (window.Lenis) return Promise.resolve()
  if (window.__aiLenisLoading) return window.__aiLenisLoading

  const source = 'https://unpkg.com/lenis@1.1.20/dist/lenis.min.js'
  if (window.btf?.getScript) {
    window.__aiLenisLoading = window.btf.getScript(source)
  } else {
    window.__aiLenisLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = source
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return window.__aiLenisLoading
}

function startSmoothScroll() {
  if (isSmoothScrollBlockedPage()) {
    stopSmoothScroll()
    return
  }

  if (!isSmoothScrollEnabled()) {
    stopSmoothScroll()
    return
  }

  if (window.__aiLenis) {
    refreshSmoothScroll()
    return
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    schedulePageScrollUnlock()
    return
  }

  // AI-Modify: 首次打开时等资源加载完成后再接管滚动，避免 Lenis 过早计算页面高度导致滚轮失效。
  if (document.readyState !== 'complete') {
    if (!window.__aiLenisStartAfterLoad) {
      window.__aiLenisStartAfterLoad = true
      window.addEventListener('load', () => {
        window.__aiLenisStartAfterLoad = false
        startSmoothScroll()
      }, { once: true })
    }
    schedulePageScrollUnlock()
    return
  }

  loadSmoothScrollScript().then(() => {
    if (!window.Lenis || window.__aiLenis || !isSmoothScrollEnabled()) return
    unlockPageScroll()
    window.__aiLenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9
    })

    const raf = (time) => {
      if (!window.__aiLenis) return
      window.__aiLenis.raf(time)
      window.__aiLenisFrame = requestAnimationFrame(raf)
    }
    window.__aiLenisFrame = requestAnimationFrame(raf)
    refreshSmoothScroll()
    window.setTimeout(refreshSmoothScroll, 120)
    window.setTimeout(refreshSmoothScroll, 650)

    if (!window.__aiLenisResizeBound) {
      window.__aiLenisResizeBound = true
      window.addEventListener('resize', () => window.__aiLenis?.resize?.(), { passive: true })
    }
  }).catch(() => {
    window.btf?.saveToLocal?.set('nav-smooth-scroll', 'disable', 365)
    stopSmoothScroll()
    syncConsoleState()
  })
}

function refreshSmoothScroll() {
  if (!window.__aiLenis) {
    schedulePageScrollUnlock()
    return
  }
  if (isPageScrollLockedByUI()) return

  window.__aiLenis.start?.()
  window.__aiLenis.resize?.()
  unlockPageScroll()
}

function stopSmoothScroll() {
  if (window.__aiLenisFrame) {
    cancelAnimationFrame(window.__aiLenisFrame)
    window.__aiLenisFrame = null
  }
  window.__aiLenis?.destroy?.()
  window.__aiLenis = null
  clearSmoothScrollClasses()
  schedulePageScrollUnlock()
}

function initSmoothScroll() {
  schedulePageScrollUnlock()
  if (isSmoothScrollBlockedPage()) stopSmoothScroll()
  else if (isSmoothScrollEnabled()) startSmoothScroll()
  else stopSmoothScroll()
}

// AI-Modify: 兜底清理异常滚动锁，避免评论脚本或 Lenis 状态残留导致全站无法继续滚动。
function bindEmergencyScrollUnlock() {
  if (window.__aiEmergencyScrollUnlockBound) return
  window.__aiEmergencyScrollUnlockBound = true

  const unlockWhenUnexpected = () => {
    if (isPageScrollLockedByUI()) return
    const html = document.documentElement
    const body = document.body
    if (
      html.classList.contains('lenis-stopped') ||
      html.classList.contains('lenis-locked') ||
      body?.style.overflow === 'hidden'
    ) {
      unlockPageScroll(true)
      clearSmoothScrollClasses()
    }
  }

  window.addEventListener('wheel', unlockWhenUnexpected, { passive: true, capture: true })
  window.addEventListener('touchmove', unlockWhenUnexpected, { passive: true, capture: true })
}

// AI-Modify: 主人模式下开放评论区工作台开关；普通访客不显示控制按钮。
function storageGet(key) {
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // Ignore storage failures in private mode.
  }
}

function storageRemove(key) {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    // Ignore storage failures in private mode.
  }
}

function syncOwnerModeFromUrl() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('owner') === '1') storageSet('xu-blog-owner', 'true')
  if (params.get('owner') === '0') storageRemove('xu-blog-owner')
}

function isOwnerMode() {
  return isLocalOwnerHost() || storageGet('xu-blog-owner') === 'true'
}

function isLocalOwnerHost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

function getCommentSetting(name, defaultValue) {
  return storageGet(`xu-comment-${name}`) || defaultValue
}

function setCommentSetting(name, value) {
  storageSet(`xu-comment-${name}`, value)
}

function isCommentVisible() {
  return getCommentSetting('visible', 'show') !== 'hide'
}

function isCommentWritable() {
  return getCommentSetting('write', 'open') !== 'closed'
}

function ensureCommentNotice(postComment) {
  let notice = postComment.querySelector('.ai-comment-notice')
  if (!notice) {
    notice = document.createElement('div')
    notice.className = 'ai-comment-notice'
    postComment.querySelector('.comment-head')?.after(notice)
  }
  return notice
}

function applyCommentControls() {
  syncOwnerModeFromUrl()
  const html = document.documentElement
  const visible = isCommentVisible()
  const writable = isCommentWritable()
  const postComment = document.getElementById('post-comment')

  html.classList.toggle('is-owner-mode', isOwnerMode())
  html.classList.toggle('comments-hidden', !visible)
  html.classList.toggle('comments-readonly', !writable)

  document.querySelectorAll('#to_comment, a[href$="#post-comment"]').forEach((item) => {
    item.classList.toggle('comment-link-hidden', !visible)
  })

  if (!postComment) return
  postComment.classList.toggle('comment-readonly', !writable)

  const notice = ensureCommentNotice(postComment)
  if (!writable && visible) {
    notice.textContent = '评论区当前仅展示历史评论，暂时不开放新评论。'
    notice.hidden = false
  } else {
    notice.hidden = true
  }
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]))
}

function cleanCommentText(comment = '') {
  const withPlaceholders = String(comment)
    .replace(/<img\b[^>]*>/gi, '[图片]')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '[代码]')
    .replace(/<code[\s\S]*?<\/code>/gi, '[代码]')
  const div = document.createElement('div')
  div.innerHTML = withPlaceholders
  return div.textContent.replace(/\s+/g, ' ').trim() || '这条评论悄悄藏起来了'
}

function formatCommentTime(date) {
  return changeTime(date) || new Date(date).toLocaleDateString()
}

function loadTwikooScript(src) {
  if (window.twikoo) return Promise.resolve()
  if (window.__aiTwikooLoading) return window.__aiTwikooLoading
  window.__aiTwikooLoading = window.btf?.getScript
    ? window.btf.getScript(src)
    : new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  return window.__aiTwikooLoading
}

function renderRecentComments(container, comments) {
  if (!comments.length) {
    container.innerHTML = '<div class="comments-page-status">暂时还没有评论。</div>'
    return
  }

  container.innerHTML = comments.map((item) => {
    const target = `${item.url || ''}${item.id ? `#${item.id}` : ''}`
    const title = item.pageTitle || item.title || '前往原文'
    return `
      <article class="comment-card">
        <div class="comment-info">
          <img src="${escapeHtml(item.avatar || '/img/friend_404.gif')}" alt="${escapeHtml(item.nick || '访客')}" loading="lazy">
          <div class="comment-information">
            <div class="comment-user">${escapeHtml(item.nick || '访客')}</div>
            <time class="comment-time" datetime="${escapeHtml(item.created || '')}">${escapeHtml(formatCommentTime(item.created))}</time>
          </div>
        </div>
        <div class="comment-content">${escapeHtml(cleanCommentText(item.comment))}</div>
        <a class="comment-more" href="${escapeHtml(target)}">
          <div class="comment-title">
            <span><i class="fas fa-comment-dots"></i>${escapeHtml(title)}</span>
            <em>去围观</em>
          </div>
          <div id="comment-tool">
            <span>${escapeHtml(item.mailMd5 ? '已认证访客' : '评论访客')}</span>
            <span>${escapeHtml(formatCommentTime(item.created))}</span>
          </div>
        </a>
      </article>
    `
  }).join('')
}

function initRecentCommentsPage() {
  const container = document.querySelector('[data-role="twikoo-recent-comments"]')
  if (!container || container.dataset.aiBound === 'true') return
  container.dataset.aiBound = 'true'

  const envId = container.dataset.envId
  const region = container.dataset.region
  const twikooJs = container.dataset.twikooJs
  if (!envId || !twikooJs) {
    container.innerHTML = '<div class="comments-page-status">需要先配置 Twikoo 后端地址。</div>'
    return
  }

  loadTwikooScript(twikooJs).then(() => {
    return window.twikoo.getRecentComments({
      envId,
      region,
      pageSize: 24,
      includeReply: true
    })
  }).then((comments) => {
    renderRecentComments(container, comments)
  }).catch((error) => {
    console.error(error)
    container.innerHTML = '<div class="comments-page-status">最新评论加载失败，请稍后再试。</div>'
  })
}

function syncConsoleState() {
  const html = document.documentElement
  const body = document.body
  const isDark = html.getAttribute('data-theme') === 'dark'
  const isAsideVisible = !html.classList.contains('hide-aside')
  const translateTarget = window.btf?.saveToLocal?.get('translate-chn-cht')
  const isSmooth = isSmoothScrollEnabled()
  const commentVisible = isCommentVisible()
  const commentWritable = isCommentWritable()

  document.getElementById('console-mode')?.classList.toggle('show', isDark)
  document.getElementById('console-readmode')?.classList.toggle('show', body.classList.contains('read-mode'))
  document.getElementById('console-aside')?.classList.toggle('show', isAsideVisible)
  document.getElementById('console-translate')?.classList.toggle('show', Number(translateTarget) === 1)
  document.getElementById('console-smooth')?.classList.toggle('show', isSmooth)
  document.getElementById('console-comment-visible')?.classList.toggle('show', commentVisible)
  document.getElementById('console-comment-write')?.classList.toggle('show', commentWritable)

  const modeText = document.querySelector('#console-mode span')
  if (modeText) modeText.textContent = isDark ? '浅色模式' : '深色模式'

  const asideText = document.querySelector('#console-aside span')
  if (asideText) asideText.textContent = isAsideVisible ? '隐藏侧栏' : '显示侧栏'

  const translateText = document.querySelector('#console-translate span')
  if (translateText) translateText.textContent = Number(translateTarget) === 1 ? '简体中文' : '繁体中文'

  const smoothText = document.querySelector('#console-smooth span')
  if (smoothText) smoothText.textContent = isSmooth ? '关闭阻尼' : '滑动阻尼'

  const commentVisibleText = document.querySelector('#console-comment-visible span')
  if (commentVisibleText) commentVisibleText.textContent = commentVisible ? '隐藏评论' : '显示评论'

  const commentWriteText = document.querySelector('#console-comment-write span')
  if (commentWriteText) commentWriteText.textContent = commentWritable ? '关闭评论' : '允许评论'
}

function updateNavScrollPercent() {
  const percentEle = document.getElementById('percent')
  const progressEle = document.getElementById('nav-read-percent')
  const topEle = document.getElementById('nav-totop')
  if (!percentEle && !progressEle) return

  const currentTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const clientHeight = window.innerHeight
  const percent = scrollHeight <= clientHeight ? 100 : Math.round((currentTop / (scrollHeight - clientHeight)) * 100)
  const safePercent = Math.max(0, Math.min(100, percent))

  if (percentEle) percentEle.textContent = `${safePercent}%`
  if (progressEle) progressEle.textContent = `${safePercent}%`
  topEle?.classList.toggle('long', safePercent >= 95)
}

function updateAuthorState() {
  const authorState = document.getElementById('author-state')
  const lastActive = authorState?.dataset.lastActive
  if (!authorState || !lastActive) return

  const lastActiveTime = new Date(lastActive).getTime()
  if (Number.isNaN(lastActiveTime)) return

  const inactiveDays = Math.max(0, Math.floor((Date.now() - lastActiveTime) / 86400000))
  const stateRules = [
    { limit: 0, className: 'active', text: '今天刚刚活跃' },
    { limit: 1, className: 'active', text: '昨天刚刚冒泡' },
    { limit: 3, className: 'active', text: `${inactiveDays}天前还在活跃` },
    { limit: 7, className: 'recent', text: `已经${inactiveDays}天没活跃了` },
    { limit: 30, className: 'recent', text: `潜水${inactiveDays}天了` },
    { limit: Infinity, className: 'away', text: `销声匿迹${inactiveDays}天了` }
  ]
  const currentState = stateRules.find((rule) => inactiveDays <= rule.limit)
  const textNode = Array.from(authorState.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())

  authorState.classList.remove('active', 'recent', 'away')
  authorState.classList.add(currentState.className)
  if (textNode) textNode.textContent = currentState.text
  else authorState.append(currentState.text)
}

// AI-Modify: 还原文章中被 markdown 转成代码文本的 <font> 片段，避免默认与多风格正文里出现字面量标签。
function restoreInlineFontCode(container = document.getElementById('article-container')) {
  if (!container) return

  container.querySelectorAll('code').forEach((code) => {
    if (code.closest('pre, figure.highlight')) return
    const rawText = code.textContent?.trim()
    if (!rawText) return
    if (code.dataset.aiInlineFontRestored === 'true') return

    const fontMatch = rawText.match(/^<font\b[^>]*>([\s\S]*)<\/font>$/i)
    if (!fontMatch) return

    code.textContent = fontMatch[1]
    code.dataset.aiInlineFontRestored = 'true'
  })
}

document.addEventListener('DOMContentLoaded', initNavMenu)
document.addEventListener('DOMContentLoaded', initSmoothScroll)
document.addEventListener('DOMContentLoaded', bindEmergencyScrollUnlock)
document.addEventListener('DOMContentLoaded', applyCommentControls)
document.addEventListener('DOMContentLoaded', initRecentCommentsPage)
document.addEventListener('DOMContentLoaded', updateAuthorState)
document.addEventListener('DOMContentLoaded', restoreInlineFontCode)
document.addEventListener('pjax:complete', initNavMenu)
document.addEventListener('pjax:complete', initSmoothScroll)
document.addEventListener('pjax:complete', applyCommentControls)
document.addEventListener('pjax:complete', initRecentCommentsPage)
document.addEventListener('pjax:complete', updateAuthorState)
document.addEventListener('pjax:complete', restoreInlineFontCode)
document.addEventListener('scroll', updateNavScrollPercent, { passive: true })
document.addEventListener('pjax:send', stopSmoothScroll)
document.addEventListener('pjax:complete', updateNavScrollPercent)
