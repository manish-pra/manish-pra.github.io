/**
 * Academic Website - Main JavaScript
 * Handles: dark mode, mobile nav, smooth scroll, animations, modals
 */

(function() {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================
  const html = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const newsToggle = document.querySelector('.news-toggle');
  const newsItems = document.querySelectorAll('.news-item');
  const pubFilters = document.querySelectorAll('.pub-filter');
  const pubCards = document.querySelectorAll('.pub-card');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalContent = document.querySelector('.modal-content pre');
  const modalClose = document.querySelector('.modal-close');
  const copyBibtexBtn = document.querySelector('.copy-bibtex');
  const fadeElements = document.querySelectorAll('.fade-in');

  // ============================================
  // Theme Toggle (Dark Mode)
  // ============================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      html.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Initialize theme on load
  initTheme();

  // ============================================
  // Mobile Navigation
  // ============================================
  function toggleMobileNav() {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileNav() {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav when clicking a link
  if (navLinks) {
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeModal();
    }
  });

  // ============================================
  // Smooth Scroll for Navigation
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // News Toggle (Show More/Less)
  // ============================================
  const INITIAL_NEWS_COUNT = 5;
  let newsExpanded = false;

  function initNewsToggle() {
    if (!newsToggle || newsItems.length <= INITIAL_NEWS_COUNT) {
      if (newsToggle) newsToggle.style.display = 'none';
      return;
    }

    // Hide items beyond initial count
    newsItems.forEach((item, index) => {
      if (index >= INITIAL_NEWS_COUNT) {
        item.classList.add('hidden');
      }
    });

    updateNewsToggleText();
  }

  function updateNewsToggleText() {
    if (!newsToggle) return;
    const hiddenCount = newsItems.length - INITIAL_NEWS_COUNT;
    newsToggle.innerHTML = newsExpanded
      ? 'Show less <span aria-hidden="true">&uarr;</span>'
      : `View all (${hiddenCount} more) <span aria-hidden="true">&darr;</span>`;
  }

  function toggleNews() {
    newsExpanded = !newsExpanded;

    newsItems.forEach((item, index) => {
      if (index >= INITIAL_NEWS_COUNT) {
        item.classList.toggle('hidden', !newsExpanded);
      }
    });

    updateNewsToggleText();
  }

  if (newsToggle) {
    newsToggle.addEventListener('click', toggleNews);
  }

  initNewsToggle();

  // ============================================
  // Publication Filters
  // ============================================
  function filterPublications(filter) {
    pubCards.forEach(card => {
      const year = card.dataset.year;
      const topic = card.dataset.topic;

      if (filter === 'all' || filter === year || filter === topic) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  pubFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      pubFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPublications(btn.dataset.filter);
    });
  });

  // ============================================
  // BibTeX Modal
  // ============================================
  const bibtexData = {
    'policy-priors': `@inproceedings{wendl2026safe,
  title={Safe Exploration via Policy Priors},
  author={Wendl, Manuel and As, Yarden and Prajapat, Manish and Pollak, Anton and Coros, Stelian and Krause, Andreas},
  booktitle={International Conference on Learning Representations (ICLR)},
  year={2026}
}`,
    'mpc-autotuner': `@article{puigjaner2025performance,
  title={Performance-Driven Constrained Optimal Auto-Tuner for MPC},
  author={Puigjaner, Albert Gassol and Carron, Andrea and Prajapat, Manish and Krause, Andreas and Zeilinger, Melanie N.},
  journal={IEEE Robotics and Automation Letters},
  volume={10},
  number={5},
  pages={4698--4705},
  year={2025}
}`,
    'safe-exploration': `@article{prajapat2025safe,
  title={Safe Guaranteed Exploration for Non-linear Systems},
  author={Prajapat, Manish and K{\"o}hler, Johannes and Turchetta, Matteo and Krause, Andreas and Zeilinger, Melanie N.},
  journal={IEEE Transactions on Automatic Control},
  year={2025}
}`,
    'submodular-rl': `@inproceedings{prajapat2024submodular,
  title={Submodular Reinforcement Learning},
  author={Prajapat, Manish and Mutny, Mojmir and Zeilinger, Melanie N. and Krause, Andreas},
  booktitle={International Conference on Learning Representations (ICLR)},
  year={2024},
  note={Spotlight}
}`,
    'global-rl': `@inproceedings{desanti2024global,
  title={Global Reinforcement Learning: Beyond Linear and Convex Rewards via Submodular Semi-gradient Methods},
  author={De Santi, Gabriele and Prajapat, Manish and Krause, Andreas},
  booktitle={International Conference on Machine Learning (ICML)},
  year={2024}
}`,
    'gp-mpc': `@inproceedings{prajapat2024gpmpc,
  title={Towards Safe and Tractable Gaussian Process-Based MPC: Efficient Sampling within a Sequential Quadratic Programming Framework},
  author={Prajapat, Manish and Lahr, Amon and K{\"o}hler, Johannes and Krause, Andreas and Zeilinger, Melanie N.},
  booktitle={IEEE Conference on Decision and Control (CDC)},
  year={2024},
  note={Best Paper Award Finalist}
}`,
    'safe-coverage': `@inproceedings{prajapat2022near,
  title={Near-optimal Multi-agent Learning for Safe Coverage Control},
  author={Prajapat, Manish and Turchetta, Matteo and Zeilinger, Melanie N. and Krause, Andreas},
  booktitle={Advances in Neural Information Processing Systems (NeurIPS)},
  volume={35},
  year={2022}
}`,
    'copo': `@inproceedings{prajapat2021competitive,
  title={Competitive Policy Optimization},
  author={Prajapat, Manish and Azizzadenesheli, Kamyar and Liniger, Alexander and Yue, Yisong and Anandkumar, Anima},
  booktitle={Uncertainty in Artificial Intelligence (UAI)},
  pages={64--74},
  year={2021},
  organization={PMLR}
}`,
    'amz': `@article{kabzan2020amz,
  title={AMZ Driverless: The Full Autonomous Racing System},
  author={Kabzan, Juraj and Valls, Miguel and Reijgwart, Victor and Hendrikx, Hubertus and Ehmke, Claas and Prajapat, Manish and others},
  journal={Journal of Field Robotics},
  volume={37},
  number={7},
  pages={1267--1294},
  year={2020},
  publisher={Wiley}
}`
  };

  let currentBibtex = '';

  function openModal(paperId) {
    if (!modalOverlay || !modalContent) return;

    currentBibtex = bibtexData[paperId] || 'BibTeX not available';
    modalContent.textContent = currentBibtex;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function copyBibtex() {
    navigator.clipboard.writeText(currentBibtex).then(() => {
      const btn = copyBibtexBtn;
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  // Expose openModal to global scope for onclick handlers
  window.openBibtexModal = openModal;

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  if (copyBibtexBtn) {
    copyBibtexBtn.addEventListener('click', copyBibtex);
  }

  // ============================================
  // Scroll Animations (Intersection Observer)
  // ============================================
  function initScrollAnimations() {
    if (!fadeElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
  }

  initScrollAnimations();

  // ============================================
  // Active Navigation Highlighting
  // ============================================
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navHeight = document.querySelector('.nav').offsetHeight;

    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  // Throttled scroll handler
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      updateActiveNav();
      scrollTimeout = null;
    }, 100);
  });

  // ============================================
  // Keyboard Navigation
  // ============================================
  document.addEventListener('keydown', (e) => {
    // Skip to main content with Tab
    if (e.key === 'Tab' && !e.shiftKey) {
      const skipLink = document.querySelector('.skip-link');
      if (skipLink && document.activeElement === skipLink) {
        e.preventDefault();
        const main = document.querySelector('main');
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus();
        }
      }
    }
  });

})();
