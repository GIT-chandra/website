function setupTheme() {
  const themeSwitcher = document.getElementById('theme-switcher');

  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', (_) => {
      if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
      }
    });
  }
}

function setupMenuToggle() {
  const menuToggle = document.querySelector('#menu-button button');
  if (!menuToggle) return;

  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();

    if (document.body.clientWidth > 768) {
      document.body.classList.toggle('menu-wide-toggled');
    } else {
      document.body.classList.toggle('menu-narrow-toggled');
    }
  });
}

function setupBanner() {
  const bannerClose = document.getElementById('banner-close-button');
  const siteBanner = document.getElementById('site-banner');
  if (!bannerClose || !siteBanner) return;
  const bannerContents = siteBanner.querySelector('p')?.textContent;
  const closedBannerContents = window.localStorage.getItem('banner-contents');
  if (bannerContents == null || bannerContents === closedBannerContents) {
    siteBanner.remove();
    return;
  }

  bannerClose.addEventListener('click', (_) => {
    window.localStorage.setItem('banner-contents', bannerContents);
    document.getElementById('site-banner')?.remove();
  });
  siteBanner.hidden = false;
}

document.addEventListener("DOMContentLoaded", function(_) {
  setupTheme();
  setupBanner();
  setupNav();
  initCookieNotice();
  setUpCodeBlockButtons();

  //setupSearch();
  setupTabs();
  setupInlineToc();
  setupMenuToggle();
});

function setupNav() {
  const toggles = document.querySelectorAll('a.nav-link.collapsible');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', (e) => {
      toggle.classList.toggle('collapsed');
      e.preventDefault();
    });
  });
}

function setupInlineToc() {
  // Set up the inline TOC's ability to expand and collapse.
  const toggles = document.querySelectorAll('.site-toc--inline__toggle');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', (_) => {
      const inlineToc = document.getElementById('site-toc--inline');
      if (inlineToc) {
        inlineToc.classList.toggle('toc-collapsed');
      }
    });
  });
}

/**
 * Get the user's current operating system, or * `null` if not of one "macos", "windows", "linux", or "chromeos".
 *
 * @returns {'macos'|'linux'|'windows'|'chromeos'|null}
 */
function getOS() {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf('Mac') !== -1) {
    // macOS or iPhone
    return 'macos';
  }

  if (userAgent.indexOf('Win') !== -1) {
    // Windows
    return 'windows';
  }

  if ((userAgent.indexOf('Linux') !== -1 || userAgent.indexOf("X11") !== -1)
    && userAgent.indexOf('Android') === -1) {
    // Linux, but not Android
    return 'linux';
  }

  if (userAgent.indexOf('CrOS') !== -1) {
    // ChromeOS
    return 'chromeos';
  }

  // Anything else
  return null;
}

/**
 * Activate the cookie notice footer.
 */
function initCookieNotice() {
  const notice = document.getElementById('cookie-notice');
  const agreeBtn = document.getElementById('cookie-consent');
  const cookieKey = 'cookie-consent';
  const cookieConsentValue = 'true'
  const activeClass = 'show';

  if (Cookies.get(cookieKey) === cookieConsentValue) {
    return;
  }

  notice.classList.add(activeClass);

  agreeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    Cookies.set(cookieKey, cookieConsentValue, { sameSite: 'strict', expires: 90 });
    notice.classList.remove(activeClass);
  });
}

// A pattern to remove terminal command markers when copying code blocks.
const terminalReplacementPattern = /^(\s*\$\s*)|(C:\\(.*)>\s*)/gm;

function setUpCodeBlockButtons() {
  const codeBlocks =
      document.querySelectorAll('.code-block-body');

  const canUseClipboard = !!navigator.clipboard;

  codeBlocks.forEach(codeBlock => {
    const preElement = codeBlock.querySelector('pre');
    if (!preElement) {
      return;
    }

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('code-inner-buttons');

    const dartPadGistId = preElement.getAttribute('data-dartpad-id');
    if (dartPadGistId && dartPadGistId.length > 5) {
      const dartPadButton = document.createElement('button');
      const innerIcon = document.createElement('span');

      dartPadButton.title = 'Open in DartPad';

      innerIcon.textContent = 'open_in_new';
      innerIcon.ariaHidden = 'true';
      innerIcon.classList.add('material-symbols');

      dartPadButton.addEventListener('click',  (e) => {
        const codeBlockBody = e.currentTarget.parentElement;
        if (codeBlockBody) {
          const codePre = codeBlock.querySelector('pre');
          if (codePre) {
            window.open(`https://dartpad.dev?id=${dartPadGistId}&run=true`);
          }
        }
      });

      dartPadButton.appendChild(innerIcon);
      buttonWrapper.appendChild(dartPadButton);
    }

    if (canUseClipboard) {
      const copyButton = document.createElement('button');
      const innerIcon = document.createElement('span');

      copyButton.title = 'Copy to clipboard';

      innerIcon.textContent = 'content_copy';
      innerIcon.ariaHidden = 'true';
      innerIcon.classList.add('material-symbols');

      copyButton.addEventListener('click', async (e) => {
        const codeBlockBody = e.currentTarget.parentElement;
        if (codeBlockBody) {
          const codePre = codeBlock.querySelector('pre');
          if (codePre) {
            const contentToCopy = codePre.textContent
                .replace(terminalReplacementPattern, '');
            if (contentToCopy && contentToCopy.length !== 0) {
              await navigator.clipboard.writeText(contentToCopy);
            }
            e.preventDefault();
          }
        }
      });

      copyButton.appendChild(innerIcon);
      buttonWrapper.appendChild(copyButton);
    }

    codeBlock.appendChild(buttonWrapper);
  });
}
