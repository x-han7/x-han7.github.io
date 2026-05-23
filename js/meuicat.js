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
    const nextSmooth = !isSmoothScrollEnabled()
    window.btf?.saveToLocal?.set('nav-smooth-scroll', nextSmooth ? 'enable' : 'disable', 365)
    if (nextSmooth) startSmoothScroll()
    else stopSmoothScroll()
  }

  syncConsoleState()
}

// AI-Modify: 参考站滑动阻尼使用 Lenis，这里按中控台开关懒加载并持久化状态。
function isSmoothScrollEnabled() {
  const saved = window.btf?.saveToLocal?.get('nav-smooth-scroll')
  if (saved === 'disable') return false
  if (saved === 'enable') return true
  return false
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
  if (window.__aiLenis) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  loadSmoothScrollScript().then(() => {
    if (!window.Lenis || window.__aiLenis || !isSmoothScrollEnabled()) return
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
  }).catch(() => {
    window.btf?.saveToLocal?.set('nav-smooth-scroll', 'disable', 365)
    syncConsoleState()
  })
}

function stopSmoothScroll() {
  if (window.__aiLenisFrame) {
    cancelAnimationFrame(window.__aiLenisFrame)
    window.__aiLenisFrame = null
  }
  window.__aiLenis?.destroy?.()
  window.__aiLenis = null
}

function initSmoothScroll() {
  if (isSmoothScrollEnabled()) startSmoothScroll()
  else stopSmoothScroll()
}

function syncConsoleState() {
  const html = document.documentElement
  const body = document.body
  const isDark = html.getAttribute('data-theme') === 'dark'
  const isAsideVisible = !html.classList.contains('hide-aside')
  const translateTarget = window.btf?.saveToLocal?.get('translate-chn-cht')
  const isSmooth = isSmoothScrollEnabled()

  document.getElementById('console-mode')?.classList.toggle('show', isDark)
  document.getElementById('console-readmode')?.classList.toggle('show', body.classList.contains('read-mode'))
  document.getElementById('console-aside')?.classList.toggle('show', isAsideVisible)
  document.getElementById('console-translate')?.classList.toggle('show', Number(translateTarget) === 1)
  document.getElementById('console-smooth')?.classList.toggle('show', isSmooth)

  const modeText = document.querySelector('#console-mode span')
  if (modeText) modeText.textContent = isDark ? '浅色模式' : '深色模式'

  const asideText = document.querySelector('#console-aside span')
  if (asideText) asideText.textContent = isAsideVisible ? '隐藏侧栏' : '显示侧栏'

  const translateText = document.querySelector('#console-translate span')
  if (translateText) translateText.textContent = Number(translateTarget) === 1 ? '简体中文' : '繁体中文'

  const smoothText = document.querySelector('#console-smooth span')
  if (smoothText) smoothText.textContent = isSmooth ? '关闭阻尼' : '滑动阻尼'
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

document.addEventListener('DOMContentLoaded', initNavMenu)
document.addEventListener('DOMContentLoaded', initSmoothScroll)
document.addEventListener('DOMContentLoaded', updateAuthorState)
document.addEventListener('pjax:complete', initNavMenu)
document.addEventListener('pjax:complete', initSmoothScroll)
document.addEventListener('pjax:complete', updateAuthorState)
document.addEventListener('scroll', updateNavScrollPercent, { passive: true })
document.addEventListener('pjax:complete', updateNavScrollPercent)
