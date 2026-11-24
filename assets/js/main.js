document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var header = document.getElementById('header');
  var scrollProgress = document.getElementById('scrollProgress');
  var mobileBtn = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuOverlay = document.getElementById('menuOverlay');
  var navLinks = document.querySelectorAll('.nav-link, .menu-nav-link');
  var sections = document.querySelectorAll('main section[id]');

  function setMenu(open) {
    if (!mobileBtn || !mobileMenu || !menuOverlay) return;
    mobileBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    menuOverlay.classList.toggle('active', open);
    body.classList.toggle('menu-open', open);
    mobileBtn.setAttribute('aria-expanded', String(open));
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('active'));
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', function () {
      setMenu(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  function updateProgress() {
    if (!scrollProgress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var value = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = value + '%';
  }

  function updateActiveLink() {
    var activeId = '';
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= 130 && rect.bottom >= 130) activeId = section.id;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
    });
  }

  window.addEventListener('scroll', function () {
    updateHeader();
    updateProgress();
    updateActiveLink();
  }, { passive: true });

  updateHeader();
  updateProgress();
  updateActiveLink();

  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  var counters = document.querySelectorAll('.stat-number[data-target]');
  var countersDone = false;

  function animateCounters() {
    if (countersDone) return;
    countersDone = true;

    counters.forEach(function (counter) {
      var targetText = counter.getAttribute('data-target');
      var target = parseInt(targetText, 10);
      var suffix = counter.getAttribute('data-suffix') || '';

      if (Number.isNaN(target)) {
        counter.textContent = targetText;
        return;
      }

      var start = null;
      var duration = 1400;

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounters();
        counterObserver.disconnect();
      });
    }, { threshold: 0.35 });

    var heroStats = document.querySelector('.hero__stats');
    if (heroStats) counterObserver.observe(heroStats);
  } else {
    animateCounters();
  }

  var accentMap = {
    red: '#ff2d2d',
    yellow: '#e5ff00',
    cyan: '#39d5ff'
  };

  var accentSections = document.querySelectorAll('[data-accent]');
  if ('IntersectionObserver' in window && accentSections.length) {
    var accentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var accent = entry.target.getAttribute('data-accent');
        if (accentMap[accent]) {
          document.documentElement.style.setProperty('--section-accent', accentMap[accent]);
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.05 });

    accentSections.forEach(function (section) {
      accentObserver.observe(section);
    });
  }
});

// Google Ads conversion: every click on phone / messenger counts as a lead.
// The extra event says which channel was used (call, whatsapp, viber, telegram)
// and on which page, so you can compare them in Google Ads / GA4.
var ADS_CONVERSION = 'AW-18196972209/eng0CLa-nLYcELGF_-RD';

function contactChannel(href) {
  if (!href) return '';
  if (href.indexOf('tel:') === 0) return 'call';
  if (href.indexOf('wa.me') !== -1) return 'whatsapp';
  if (href.indexOf('viber:') === 0) return 'viber';
  if (href.indexOf('t.me') !== -1) return 'telegram';
  return '';
}

function trackConversion(channel) {
  if (typeof gtag !== 'function') return;
  gtag('event', 'conversion', { send_to: ADS_CONVERSION });
  gtag('event', channel === 'call' ? 'click_call' : 'click_messenger', {
    contact_channel: channel || 'unknown',
    page_path: location.pathname
  });
}

document.addEventListener('click', function (event) {
  var link = event.target.closest ? event.target.closest('a[href]') : null;
  if (!link) return;
  var channel = contactChannel(link.getAttribute('href'));
  if (channel) trackConversion(channel);
});
