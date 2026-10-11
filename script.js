/* ═══════════════════════════════════════════════════════════════
   VIBE_N STUDIOS — script.js
   ── All behaviour is pure vanilla JS. No external libraries.
   ── Sections:
      1. Navbar scroll + mobile toggle
      2. Scroll fade-in (IntersectionObserver)
      3. Gallery lightbox
      4. Booking form validation + WhatsApp redirect
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Wait until the DOM is fully parsed ── */
document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════════════════
     1. NAVBAR — scroll shrink + mobile menu toggle
  ══════════════════════════════════════════════════════════ */

  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  /* Add/remove .scrolled class based on scroll position */
  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); /* run once on load */

  /* Hamburger menu open / close */
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    /* Prevent body scroll while menu is open */
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close mobile menu when any nav link is clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close mobile menu when Escape is pressed */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });


  /* ══════════════════════════════════════════════════════════
     2. SCROLL FADE-IN (IntersectionObserver)
     ── Elements with class "fade-in" animate in once they
        enter the viewport. No looping, no polling.
  ══════════════════════════════════════════════════════════ */

  const fadeEls = document.querySelectorAll('.fade-in');

  /* Only animate if the device doesn't prefer reduced motion */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    /* Make everything visible immediately for accessibility */
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); /* animate once only */
          }
        });
      },
      { threshold: 0.12 }  /* trigger when 12% of element is visible */
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ══════════════════════════════════════════════════════════
     3. GALLERY LIGHTBOX
     ── Clicking a gallery button opens a fullscreen overlay.
        The lightbox shows the same placeholder (or real image)
        at larger size.
     ── Security: text is set via textContent; no innerHTML.
  ══════════════════════════════════════════════════════════ */

  const galleryItems   = document.querySelectorAll('.gallery-item');
  const lightbox       = document.getElementById('lightbox');
  const lightboxClose  = document.getElementById('lightboxClose');
  const lightboxContent= document.getElementById('lightboxContent');

  /* Labels for each gallery slot (edit these to match your photos) */
  const galleryLabels = [
    'Control Room',
    'Vocal Booth',
    'Mixing Desk',
    'Live Room',
    'Studio Gear',
    'Artist Session'
  ];

  function openLightbox(index) {
    /* Clear previous content safely */
    while (lightboxContent.firstChild) {
      lightboxContent.removeChild(lightboxContent.firstChild);
    }

    /* ── If you've replaced placeholders with <img> tags,
          clone the <img> element from the gallery item instead. ── */

    /* Build a larger placeholder (or clone your real image here) */
    const placeholder = document.createElement('div');
    placeholder.className = 'img-placeholder';
    placeholder.setAttribute('role', 'img');

    const label = galleryLabels[index] || ('Photo ' + (index + 1));
    placeholder.setAttribute('aria-label', label + ' — enlarged view');

    const span = document.createElement('span');
    span.textContent = label + '\n[Replace with your photo]';
    placeholder.appendChild(span);

    lightboxContent.appendChild(placeholder);

    lightbox.removeAttribute('hidden');
    lightboxClose.focus();

    /* Trap scroll */
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const index = parseInt(btn.getAttribute('data-index'), 10);
      openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  /* Close on backdrop click */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
      closeLightbox();
    }
  });


  /* ══════════════════════════════════════════════════════════
     4. BOOKING FORM — validation + WhatsApp redirect
     ── Data is NEVER sent to a server. On submit the form
        builds a pre-filled WhatsApp message URL and opens it.
     ── User input is sanitised: textContent only, no innerHTML.
  ══════════════════════════════════════════════════════════ */

  const bookForm = document.getElementById('bookForm');

  /* Set the minimum selectable date to today */
  (function setMinDate() {
    const dateInput = document.getElementById('fdate');
    if (!dateInput) return;
    const today = new Date();
    /* Format: YYYY-MM-DD */
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  })();

  /* ── Validation helpers ── */

  function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.closest('.form-group').classList.add('invalid');
    if (error) error.textContent = message;
  }

  function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.closest('.form-group').classList.remove('invalid');
    if (error) error.textContent = '';
  }

  function validateName(value) {
    if (!value.trim()) return 'Please enter your name.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  }

  function validatePhone(value) {
    /* Indian mobile numbers: starts with 6-9, 10 digits total */
    if (!value.trim()) return 'Please enter your phone number.';
    if (!/^[6-9][0-9]{9}$/.test(value.trim())) {
      return 'Enter a valid 10-digit Indian mobile number.';
    }
    return '';
  }

  function validateService(value) {
    if (!value) return 'Please select a service.';
    return '';
  }

  function validateDate(value) {
    if (!value) return 'Please pick a date.';
    const selected = new Date(value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return 'Date cannot be in the past.';
    return '';
  }

  /* Live validation — clear errors as user types / changes */
  document.getElementById('fname').addEventListener('input', function () {
    const err = validateName(this.value);
    if (!err) clearError('fname', 'fnameError');
  });

  document.getElementById('fphone').addEventListener('input', function () {
    /* Strip non-digits so copy-pasted numbers with spaces/dashes still work */
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
    const err = validatePhone(this.value);
    if (!err) clearError('fphone', 'fphoneError');
  });

  document.getElementById('fservice').addEventListener('change', function () {
    const err = validateService(this.value);
    if (!err) clearError('fservice', 'fserviceError');
  });

  document.getElementById('fdate').addEventListener('change', function () {
    const err = validateDate(this.value);
    if (!err) clearError('fdate', 'fdateError');
  });

  /* ── Form submit handler ── */
  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Read values */
    const name    = document.getElementById('fname').value.trim();
    const phone   = document.getElementById('fphone').value.trim();
    const service = document.getElementById('fservice').value;
    const date    = document.getElementById('fdate').value;
    const message = document.getElementById('fmessage').value.trim();

    /* Validate all fields */
    const nameErr    = validateName(name);
    const phoneErr   = validatePhone(phone);
    const serviceErr = validateService(service);
    const dateErr    = validateDate(date);

    let hasError = false;

    if (nameErr) {
      showError('fname', 'fnameError', nameErr);
      hasError = true;
    } else {
      clearError('fname', 'fnameError');
    }

    if (phoneErr) {
      showError('fphone', 'fphoneError', phoneErr);
      hasError = true;
    } else {
      clearError('fphone', 'fphoneError');
    }

    if (serviceErr) {
      showError('fservice', 'fserviceError', serviceErr);
      hasError = true;
    } else {
      clearError('fservice', 'fserviceError');
    }

    if (dateErr) {
      showError('fdate', 'fdateError', dateErr);
      hasError = true;
    } else {
      clearError('fdate', 'fdateError');
    }

    if (hasError) {
      /* Focus the first invalid field */
      const firstInvalid = bookForm.querySelector('.form-group.invalid input, .form-group.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* ── Build WhatsApp message ── */
    /* Format date for readability: DD/MM/YYYY */
    const dateParts  = date.split('-');   /* [YYYY, MM, DD] */
    const dateFormatted = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

    /*
      Build the message as a plain string.
      NOTE: We deliberately do NOT use innerHTML anywhere here.
      The text goes into the URL as a query parameter, never into the DOM.
    */
    let waText = 'Hello Vibe_N Studios!\n\n';
    waText += 'Name: '    + name         + '\n';
    waText += 'Phone: '   + phone        + '\n';
    waText += 'Service: ' + service      + '\n';
    waText += 'Date: '    + dateFormatted;
    if (message) {
      waText += '\n\nMessage: ' + message;
    }

    /* ── Studio WhatsApp number: 91-8870146002 ── */
    /* encodeURIComponent encodes the text safely for the URL */
    const waURL = 'https://wa.me/918870146002?text=' + encodeURIComponent(waText);

    /* Open in a new tab so user stays on the site */
    window.open(waURL, '_blank', 'noopener,noreferrer');
  });


}); /* end DOMContentLoaded */
