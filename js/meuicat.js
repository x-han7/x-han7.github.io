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

  const panels = {
    menu: menuItems,
    column: columnItems,
    control: controlItems
  }
  let closeTimer

  const setActivePanel = (type) => {
    window.clearTimeout(closeTimer)
    nav.classList.add('panel-open')
    siteMenu.classList.add('active', type)
    siteMenu.classList.toggle('menu', type === 'menu')
    siteMenu.classList.toggle('column', type === 'column')
    siteMenu.classList.toggle('control', type === 'control')
    Object.keys(panels).forEach((key) => panels[key]?.classList.toggle('active', key === type))
    consoleIcon?.classList.toggle('hide', type === 'control')
  }

  const closePanel = () => {
    nav.classList.remove('panel-open')
    siteMenu.classList.remove('active', 'menu', 'column', 'control')
    consoleIcon?.classList.remove('hide')
  }

  const scheduleClosePanel = () => {
    window.clearTimeout(closeTimer)
    closeTimer = window.setTimeout(() => {
      if (!nav.matches(':hover') && !siteMenu.matches(':hover')) closePanel()
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

  menuBtn?.addEventListener('mouseenter', () => setActivePanel('menu'))
  menuBtn?.addEventListener('click', () => setActivePanel('menu'))
  columnBtn?.addEventListener('mouseenter', () => setActivePanel('column'))
  columnBtn?.addEventListener('click', () => setActivePanel('column'))
  controlBtn?.addEventListener('click', () => setActivePanel('control'))
  controlBtn?.addEventListener('mouseenter', () => setActivePanel('control'))

  nav.addEventListener('mouseenter', cancelClosePanel)
  nav.addEventListener('mouseleave', scheduleClosePanel)
  siteMenu.addEventListener('mouseenter', cancelClosePanel)
  siteMenu.addEventListener('mouseleave', scheduleClosePanel)
  siteMenu.addEventListener('click', (event) => {
    if (event.target.closest('a[href]:not([href^="javascript"])')) closePanel()
  })

  document.getElementById('nav-panel-search')?.addEventListener('click', openSearch)
  navTotopBtn?.addEventListener('click', () => {
    if (window.btf?.scrollToDest) btf.scrollToDest(0, 500)
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

  syncConsoleState()
}

function syncConsoleState() {
  const html = document.documentElement
  const body = document.body
  const isDark = html.getAttribute('data-theme') === 'dark'
  const isAsideVisible = !html.classList.contains('hide-aside')
  const translateTarget = window.btf?.saveToLocal?.get('translate-chn-cht')

  document.getElementById('console-mode')?.classList.toggle('show', isDark)
  document.getElementById('console-readmode')?.classList.toggle('show', body.classList.contains('read-mode'))
  document.getElementById('console-aside')?.classList.toggle('show', isAsideVisible)
  document.getElementById('console-translate')?.classList.toggle('show', Number(translateTarget) === 1)

  const modeText = document.querySelector('#console-mode span')
  if (modeText) modeText.textContent = isDark ? '浅色模式' : '深色模式'

  const asideText = document.querySelector('#console-aside span')
  if (asideText) asideText.textContent = isAsideVisible ? '隐藏侧栏' : '显示侧栏'

  const translateText = document.querySelector('#console-translate span')
  if (translateText) translateText.textContent = Number(translateTarget) === 1 ? '简体中文' : '繁体中文'
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

document.addEventListener('DOMContentLoaded', initNavMenu)
document.addEventListener('pjax:complete', initNavMenu)
document.addEventListener('scroll', updateNavScrollPercent, { passive: true })
document.addEventListener('pjax:complete', updateNavScrollPercent)
