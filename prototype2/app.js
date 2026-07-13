(function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });
  }

  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  var researchGallery = document.querySelector('#researchGallery');
  var researchModal = document.querySelector('#researchModal');
  var researchModalImage = document.querySelector('#researchModalImage');
  var researchModalClose = document.querySelector('#researchModalClose');
  var activityGrid = document.querySelector('.activity-grid');
  var activityModal = document.querySelector('#activityModal');
  var activityModalClose = document.querySelector('#activityModalClose');
  var activityModalImage = document.querySelector('#activityModalImage');
  var activityModalDate = document.querySelector('#activityModalDate');
  var activityModalTitle = document.querySelector('#activityModalTitle');
  var activityModalSummary = document.querySelector('#activityModalSummary');

  if (researchGallery) {
    var images = [];
    for (var i = 1; i <= 10; i += 1) {
      images.push({
        src: '../files/research' + i + '.png',
        alt: 'Research image ' + i
      });
    }

    researchGallery.innerHTML = images.map(function (item) {
      return '<button type="button" data-src="' + item.src + '" data-alt="' + item.alt + '"><img src="' + item.src + '" alt="' + item.alt + '"></button>';
    }).join('');

    researchGallery.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-src]');
      if (!button || !researchModal || !researchModalImage) {
        return;
      }
      researchModalImage.src = button.getAttribute('data-src');
      researchModalImage.alt = button.getAttribute('data-alt') || '';
      researchModal.classList.add('is-open');
    });
  }

  if (researchModalClose) {
    researchModalClose.addEventListener('click', function () {
      researchModal.classList.remove('is-open');
    });
  }

  if (researchModal) {
    researchModal.addEventListener('click', function (event) {
      if (event.target === researchModal) {
        researchModal.classList.remove('is-open');
      }
    });
  }

  function openActivityModal(card) {
    if (!card || !activityModal || !activityModalImage || !activityModalDate || !activityModalTitle || !activityModalSummary) {
      return;
    }

    var img = card.querySelector('img');
    var dateEl = card.querySelector('strong');
    var summaryEl = card.querySelector('p');
    var summaryText = summaryEl ? summaryEl.textContent : '';

    activityModalImage.src = img ? img.getAttribute('src') : '';
    activityModalImage.alt = img ? (img.getAttribute('alt') || '') : '';
    activityModalDate.textContent = dateEl ? dateEl.textContent : '';
    activityModalTitle.textContent = summaryText;
    activityModalSummary.textContent = summaryText;
    activityModal.classList.add('is-open');
    activityModal.setAttribute('aria-hidden', 'false');
  }

  function closeActivityModal() {
    if (!activityModal) {
      return;
    }
    activityModal.classList.remove('is-open');
    activityModal.setAttribute('aria-hidden', 'true');
  }

  if (activityGrid) {
    activityGrid.addEventListener('click', function (event) {
      var card = event.target.closest('.activity-item');
      if (!card) {
        return;
      }
      openActivityModal(card);
    });

    activityGrid.addEventListener('keydown', function (event) {
      var card = event.target.closest('.activity-item');
      if (!card) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openActivityModal(card);
      }
    });
  }

  if (activityModalClose) {
    activityModalClose.addEventListener('click', closeActivityModal);
  }

  if (activityModal) {
    activityModal.addEventListener('click', function (event) {
      if (event.target === activityModal) {
        closeActivityModal();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (researchModal) {
        researchModal.classList.remove('is-open');
      }
      closeActivityModal();
    }
  });
})();
