(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };
  const copyText = async (text, done = '已複製到剪貼簿') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(done);
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      showToast(copied ? done : '無法自動複製，請手動選取文字');
    }
  };

  $('#year').textContent = new Date().getFullYear();

  // Mobile navigation reports its open state to assistive technology and closes after selection.
  const menuToggle = $('.menu-toggle');
  const primaryNav = $('#primaryNav');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    primaryNav.classList.toggle('is-open', open);
  });
  $$('#primaryNav a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '開啟選單');
    primaryNav.classList.remove('is-open');
  }));

  // Portfolio filters announce the number of visible projects.
  const workCards = $$('.work-card');
  const filterFeedback = $('#filterFeedback');
  const filterNames = { all: '全部', editorial: '編輯設計', social: '社群視覺', seo: 'SEO / GEO' };
  $$('.filter-chip').forEach((chip) => chip.addEventListener('click', () => {
    const filter = chip.dataset.filter;
    let shown = 0;
    $$('.filter-chip').forEach((item) => {
      const active = item === chip;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    workCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    filterFeedback.textContent = `顯示${filterNames[filter]} ${shown} 件作品`;
  }));

  // Work previews use a native dialog: Esc, close button, and backdrop all dismiss it.
  const workDialog = $('#workDialog');
  const dialogImage = $('#dialogImage');
  workCards.forEach((card) => card.addEventListener('click', () => {
    const image = card.querySelector('img');
    dialogImage.src = card.dataset.image;
    dialogImage.alt = image.alt;
    $('#dialogTitle').textContent = card.dataset.title;
    $('#dialogDetail').textContent = card.dataset.detail;
    workDialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  const closeDialog = () => {
    workDialog.close();
    document.body.classList.remove('dialog-open');
  };
  $('.dialog-close').addEventListener('click', closeDialog);
  workDialog.addEventListener('click', (event) => {
    if (event.target === workDialog) closeDialog();
  });
  workDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  // Service finder offers a relevant next step based on the visitor's stated goal.
  const recommendations = {
    search: ['SEO / GEO 文章企劃與撰寫', '先從受眾問題與搜尋意圖盤點，規劃文章主題與內容架構。', '#services'],
    social: ['社群圖文企劃與設計', '一起整理社群主題、貼文文案與可持續延伸的視覺方向。', '#services'],
    editorial: ['電子書、DM 與編輯排版', '梳理資料的主次層級與閱讀順序，讓專業資訊更容易理解。', '#services'],
  };
  $$('.match-option').forEach((option) => option.addEventListener('click', () => {
    $$('.match-option').forEach((item) => {
      const active = item === option;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-pressed', String(active));
      item.lastElementChild.textContent = active ? '✓' : '＋';
    });
    const [title, description, href] = recommendations[option.dataset.match];
    $('#matchResultTitle').textContent = title;
    $('#matchResultText').textContent = description;
    $('#matchResultLink').href = href;
  }));

  // The four process rows act as accessible disclosure controls.
  $$('.process-step').forEach((step) => step.addEventListener('click', () => {
    const willOpen = step.getAttribute('aria-expanded') !== 'true';
    $$('.process-step').forEach((item) => {
      const active = item === step && willOpen;
      item.classList.toggle('is-open', active);
      item.setAttribute('aria-expanded', String(active));
      item.querySelector('.step-toggle').textContent = active ? '−' : '＋';
    });
  }));

  const captions = {
    seo: '有曝光，不等於有被找到。\n\n從受眾正在搜尋的問題出發，整理關鍵字、文章架構與內容方向，讓專業資訊更清楚，也更有機會被需要的人遇見。\n\n提供 SEO / GEO 文章企劃、原創撰寫與舊文章優化。\n\n想整理品牌內容？歡迎私訊聊聊你的需求。\n\n#SEO #GEO #內容行銷 #文章企劃',
    visual: '好內容，值得被好好呈現。\n\n用清楚的閱讀動線、恰當的留白與一致的品牌視覺，讓電子書、DM 和社群貼文都更容易被理解。\n\n提供電子書與型錄排版、社群圖文設計和客製視覺。\n\n想讓資料更好讀？歡迎私訊聊聊你的需求。\n\n#品牌視覺 #社群設計 #編輯設計 #電子書排版',
    integrated: '內容和視覺，一起替品牌加分。\n\n從搜尋文章、社群圖文到電子書排版，依照你的目標安排合適的內容與呈現方式。可以單項合作，也能一起討論整合規劃。\n\n先從你目前最想解決的一件事開始。\n\n歡迎私訊分享你的品牌與需求。\n\n#內容策略 #SEO #社群圖文 #視覺設計',
  };
  $$('.copy-caption').forEach((button) => button.addEventListener('click', () => copyText(captions[button.dataset.copy], '貼文文案已複製')));

  const messageField = $('[name="message"]');
  messageField.addEventListener('input', () => {
    $('#messageCount').textContent = `${messageField.value.length} / 500`;
  });

  // Validate locally, then create a copyable brief without transmitting visitor data.
  const form = $('#contactForm');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const service = form.elements.service.value;
    const errors = {
      name: name ? '' : '請填寫稱呼，方便回覆。',
      email: emailPattern.test(email) ? '' : '請確認 Email 格式正確。',
      service: service ? '' : '請選擇想先了解的服務。',
    };
    ['name', 'email', 'service'].forEach((key) => {
      const control = form.elements[key];
      const message = control.parentElement.querySelector('.field-error');
      message.textContent = errors[key];
      control.setAttribute('aria-invalid', String(Boolean(errors[key])));
    });
    const invalid = Object.values(errors).some(Boolean);
    if (invalid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid.focus();
      showToast('請先確認標示的欄位');
      return;
    }
    const brief = [
      '合作需求摘要',
      `稱呼：${name}`,
      `Email：${email}`,
      `想了解的服務：${service}`,
      `需求說明：${messageField.value.trim() || '尚未填寫'}`,
    ].join('\n');
    $('#briefOutput').value = brief;
    $('#formResult').hidden = false;
    $('#formResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('需求摘要已整理好；資料只留在此頁面');
  });
  $$('.contact-form input, .contact-form select').forEach((control) => control.addEventListener('input', () => {
    control.removeAttribute('aria-invalid');
    const message = control.parentElement.querySelector('.field-error');
    if (message) message.textContent = '';
  }));
  $('#copyBrief').addEventListener('click', () => copyText($('#briefOutput').value, '合作需求摘要已複製'));

  // A lightweight reading indicator keeps long-page orientation visible.
  const progress = $('#readingProgress');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
      ticking = false;
    });
  }, { passive: true });
})();
