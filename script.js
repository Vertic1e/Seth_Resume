/* ============================================================
   PORTFOLIO INTERACTIVE ENGINE & DYNAMIC EDITING SYSTEM
   - Dynamic box adding, duplication & deletion in Edit Mode
   - Direct tag editing, adding (➕ Tag), and deleting (×)
   - Inline text editing with instant persistence
   - Particle system canvas
   - Scroll animations & navigation highlights
   - Clean HTML export & reset functionality
   ============================================================ */

let editMode = false;

document.addEventListener('DOMContentLoaded', () => {

  // ── Particles ──────────────────────────────────────────────
  initParticles();

  // ── Footer year ────────────────────────────────────────────
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Navbar scroll effect ───────────────────────────────────
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  // ── Scroll-to-top button ───────────────────────────────────
  if (scrollTop) {
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Mobile nav toggle ──────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── Active nav link on scroll (Intersection Observer) ──────
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[data-section]');
  const observerNav = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(a => {
          a.classList.toggle('active', a.getAttribute('data-section') === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -70% 0px' });

  sections.forEach(section => observerNav.observe(section));

  // ── Scroll reveal for sections ─────────────────────────────
  const sectionEls = document.querySelectorAll('.section');
  const observerReveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerReveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sectionEls.forEach(el => observerReveal.observe(el));

  // ── Mouse-follow gradient ──────────────────────────────────
  document.addEventListener('mousemove', e => {
    document.body.style.setProperty('--mouse-x', e.clientX + 'px');
    document.body.style.setProperty('--mouse-y', e.clientY + 'px');
  }, { passive: true });

  // ── Setup dynamic box builders ─────────────────────────────
  setupBoxContainers();

  // ── Profile image click-to-change ──────────────────────────
  const profileImg = document.getElementById('profileImg');
  if (profileImg) {
    profileImg.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => {
            profileImg.src = ev.target.result;
            localStorage.setItem('portfolio_profileImg', ev.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });

    const savedImg = localStorage.getItem('portfolio_profileImg');
    if (savedImg) profileImg.src = savedImg;
  }

});


/* ============================================================
   BOX TEMPLATES FOR DYNAMIC CREATION
   ============================================================ */
const BOX_TEMPLATES = {
  about: `
    <div class="card skill-card">
      <div class="skill-card-icon">✨</div>
      <div class="skill-card-title">New Key Skill Area</div>
      <p class="skill-card-desc">Describe this highlight area, core expertise, or specialized capability.</p>
      <div class="tags">
        <span class="tag tag-cyan">Focus Area</span>
        <span class="tag tag-gold">Key Skill</span>
      </div>
    </div>`,

  'experience-tech': `
    <div class="card skill-card">
      <div class="skill-card-icon">🔬</div>
      <div class="skill-card-title">New Security Role / Lab Project</div>
      <div class="timeline-date">2025 — Present</div>
      <div class="timeline-org">Organization / Independent Lab</div>
      <p class="skill-card-desc">Describe key responsibilities, testing methodologies, tools used, and infrastructure managed.</p>
      <p class="skill-card-desc" style="margin-top: var(--space-sm);">Detail the impact, discovered vulnerabilities, mitigations applied, or reports generated.</p>
      <div class="tags">
        <span class="tag tag-cyan">Tool / Platform</span>
        <span class="tag tag-cyan">Methodology</span>
        <span class="tag tag-gold">Impact</span>
      </div>
    </div>`,

  'experience-other': `
    <div class="card skill-card">
      <div class="skill-card-icon">💼</div>
      <div class="skill-card-title">Additional Professional Role</div>
      <div class="timeline-date">Date Range</div>
      <div class="timeline-org">Company / Organization</div>
      <p class="skill-card-desc">Summary of core responsibilities, operational skills, teamwork, and quality standards maintained.</p>
      <div class="tags">
        <span class="tag tag-cyan">Skill 1</span>
        <span class="tag tag-gold">Skill 2</span>
      </div>
    </div>`,

  skills: `
    <div class="card skill-card">
      <div class="skill-card-icon">⚡</div>
      <div class="skill-card-title">New Technical Domain</div>
      <p class="skill-card-desc">Overview of technical capabilities, frameworks, and competencies in this domain.</p>
      <div class="tags">
        <span class="tag tag-cyan">Skill 1</span>
        <span class="tag tag-cyan">Skill 2</span>
        <span class="tag tag-cyan">Tool / Framework</span>
        <span class="tag tag-gold">Specialty</span>
      </div>
    </div>`,

  projects: `
    <div class="card project-card">
      <div class="project-card-body">
        <div class="project-card-header">
          <span class="project-type">Category / Security Tool</span>
          <a href="#" target="_blank" class="project-link" title="View Project">🔗</a>
        </div>
        <div class="project-title">New Project Name</div>
        <p class="project-desc">
          Overview of what the project does, architecture, security features, technologies utilized, and measurable outcomes.
        </p>
        <div class="tags">
          <span class="tag tag-cyan">Technology</span>
          <span class="tag tag-cyan">Framework</span>
          <span class="tag tag-gold">Feature</span>
        </div>
      </div>
    </div>`,

  certifications: `
    <div class="card cert-card">
      <div class="cert-icon">🏅</div>
      <div class="cert-info">
        <div class="cert-name">New Certification / Qualification</div>
        <div class="cert-issuer">Issuing Organization / Institution</div>
        <div class="cert-year">Year</div>
        <p class="cert-desc">
          Describe the credential, key domains covered, competencies validated, and professional significance.
        </p>
      </div>
    </div>`,

  achievements: `
    <div class="timeline-item">
      <div class="timeline-date">Year</div>
      <div class="timeline-title">Award / Academic Recognition Title</div>
      <p class="timeline-desc">
        Details regarding the achievement, subject area, exceptional performance criteria, or coursework completed.
      </p>
    </div>`,

  education: `
    <div class="timeline-item">
      <div class="timeline-date">Date Range</div>
      <div class="timeline-title">Degree / Certificate Name</div>
      <div class="timeline-org">University or Institution Name</div>
      <p class="timeline-desc">
        Major coursework, key projects, specialized subjects, and academic accomplishments.
      </p>
    </div>`,

  contact: `
    <a href="#" class="card contact-card">
      <div class="contact-icon">🔗</div>
      <div>
        <div class="contact-label">Channel</div>
        <div class="contact-value">contact@example.com</div>
      </div>
    </a>`
};


/* ============================================================
   BOX MANAGEMENT SYSTEM
   ============================================================ */

function setupBoxContainers() {
  const containerMap = [
    { selector: '#about .grid-2', type: 'about', label: 'Key Skill Box' },
    { selector: '#about .grid-4', type: 'about', label: 'Key Skill Box' },
    { selector: '#experience .grid-2:nth-of-type(1)', type: 'experience-tech', label: 'Technical Experience' },
    { selector: '#experience .grid-2:nth-of-type(2)', type: 'experience-other', label: 'Additional Role' },
    { selector: '#skills .grid-3', type: 'skills', label: 'Skill Category' },
    { selector: '#projects .grid-3', type: 'projects', label: 'Project' },
    { selector: '#certifications .grid-2', type: 'certifications', label: 'Certification' },
    { selector: '#certifications .timeline', type: 'achievements', label: 'Academic Achievement' },
    { selector: '#education .timeline', type: 'education', label: 'Education Item' },
    { selector: '#contact .contact-grid', type: 'contact', label: 'Contact Box' },
  ];

  containerMap.forEach(({ selector, type, label }) => {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.hasAttribute('data-box-container')) {
        el.setAttribute('data-box-container', type);
        el.setAttribute('data-box-label', label);
      }
    });
  });

  document.querySelectorAll('[data-box-container]').forEach(container => {
    attachCardActionBars(container);
    attachAddBoxButton(container);
  });
}

function removeTag(btn, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const tag = btn.closest('.tag');
  if (tag) {
    tag.remove();
  }
}

function addNewTag(btn, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const tagsWrapper = btn.closest('.tags');
  if (!tagsWrapper) return;

  const newTag = document.createElement('span');
  newTag.className = 'tag tag-cyan';
  newTag.textContent = 'New Tag';
  if (editMode) newTag.contentEditable = 'true';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'tag-remove-btn';
  removeBtn.title = 'Remove tag';
  removeBtn.innerHTML = '×';
  removeBtn.onclick = (e) => removeTag(removeBtn, e);
  newTag.appendChild(removeBtn);

  tagsWrapper.insertBefore(newTag, btn);

  // Focus and select text in the new tag
  newTag.focus();
  try {
    const range = document.createRange();
    const sel = window.getSelection();
    if (newTag.firstChild) {
      range.selectNodeContents(newTag.firstChild);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } catch (e) {}
}

function attachTagActions(tagsWrapper) {
  if (!tagsWrapper) return;

  // Add remove button to every tag if not present
  tagsWrapper.querySelectorAll(':scope > .tag').forEach(tag => {
    if (!tag.querySelector('.tag-remove-btn')) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tag-remove-btn';
      removeBtn.title = 'Remove tag';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = (e) => removeTag(removeBtn, e);
      tag.appendChild(removeBtn);
    }
  });

  // Add "+ Tag" button to the end of the tags wrapper
  if (!tagsWrapper.querySelector('.btn-add-tag')) {
    const addTagBtn = document.createElement('button');
    addTagBtn.type = 'button';
    addTagBtn.className = 'btn-add-tag';
    addTagBtn.innerHTML = '<span>➕</span> Tag';
    addTagBtn.onclick = (e) => addNewTag(addTagBtn, e);
    tagsWrapper.appendChild(addTagBtn);
  }
}

function attachCardActionBars(container) {
  // Direct card children or timeline-items
  const items = container.querySelectorAll(':scope > .card, :scope > .timeline-item');
  items.forEach(card => {
    if (!card.querySelector('.card-edit-actions')) {
      const actions = document.createElement('div');
      actions.className = 'card-edit-actions';
      actions.innerHTML = `
        <button type="button" class="card-action-btn" title="Duplicate this box" onclick="duplicateBox(this, event)">📋 Duplicate</button>
        <button type="button" class="card-action-btn btn-delete" title="Delete this box" onclick="deleteBox(this, event)">🗑️ Delete</button>
      `;
      card.style.position = card.style.position || 'relative';
      card.appendChild(actions);
    }

    // Attach tag actions to tags container if present
    const tagsWrapper = card.querySelector('.tags');
    if (tagsWrapper) {
      attachTagActions(tagsWrapper);
    }
  });
}

function attachAddBoxButton(container) {
  const containerType = container.getAttribute('data-box-container');
  const label = container.getAttribute('data-box-label') || 'Box';
  
  // Check if button already exists right after container
  let nextEl = container.nextElementSibling;
  if (!nextEl || !nextEl.classList.contains('add-box-trigger')) {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-box-trigger';
    addBtn.setAttribute('data-target-container', containerType);
    addBtn.innerHTML = `<span>➕</span> Add New ${label}`;
    addBtn.onclick = () => addNewBox(container, containerType);
    container.parentNode.insertBefore(addBtn, container.nextSibling);
  }
}

function addNewBox(container, containerType) {
  const template = BOX_TEMPLATES[containerType] || BOX_TEMPLATES.skills;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template.trim();
  const newCard = tempDiv.firstElementChild;

  if (editMode) {
    newCard.querySelectorAll('h1, h2, h3, h4, p, span, div, a').forEach(el => {
      if (!el.closest('.card-edit-actions') && !el.classList.contains('btn-add-tag')) {
        el.contentEditable = 'true';
      }
    });
  }

  // Append new card
  container.appendChild(newCard);
  attachCardActionBars(container);

  // Focus on the first text element in the new card
  const firstText = newCard.querySelector('.skill-card-title, .project-title, .cert-name, .timeline-title');
  if (firstText) {
    firstText.focus();
  }
}

function duplicateBox(btn, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const card = btn.closest('.card, .timeline-item');
  if (!card) return;

  const clone = card.cloneNode(true);

  // Remove cloned actions to re-attach fresh ones
  const clonedActions = clone.querySelector('.card-edit-actions');
  if (clonedActions) clonedActions.remove();

  if (editMode) {
    clone.querySelectorAll('h1, h2, h3, h4, p, span, div, a').forEach(el => {
      if (!el.closest('.card-edit-actions') && !el.classList.contains('btn-add-tag')) {
        el.contentEditable = 'true';
      }
    });
  }

  card.parentNode.insertBefore(clone, card.nextSibling);
  attachCardActionBars(card.parentNode);
}

function deleteBox(btn, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const card = btn.closest('.card, .timeline-item');
  if (!card) return;

  if (confirm('Are you sure you want to delete this box?')) {
    card.remove();
  }
}


/* ============================================================
   INLINE EDITING SYSTEM
   ============================================================ */

function toggleEditMode() {
  editMode = !editMode;
  const bar = document.getElementById('editBar');

  document.body.classList.toggle('edit-mode-active', editMode);
  if (bar) bar.classList.toggle('active', editMode);

  if (editMode) {
    document.querySelectorAll('.tags').forEach(wrapper => attachTagActions(wrapper));
  }

  // Make text elements, titles, paragraphs, and tags editable
  const editableTargets = document.querySelectorAll(
    '.hero-name, .hero-title, .hero-bio, .hero-greeting, .stat-value, .stat-label, ' +
    '.section-title, .section-subtitle, .section-label, .card p, .card h2, .card h3, ' +
    '.skill-card-title, .skill-card-desc, .skill-card-icon, .timeline-title, .timeline-date, ' +
    '.timeline-org, .timeline-desc, .project-title, .project-desc, .project-type, ' +
    '.cert-name, .cert-issuer, .cert-year, .cert-desc, .contact-label, .contact-value, .tag, [data-editable]'
  );

  editableTargets.forEach(el => {
    if (!el.closest('.navbar') && !el.closest('#editBar') && !el.closest('.card-edit-actions') && !el.classList.contains('btn-add-tag') && !el.classList.contains('tag-remove-btn')) {
      el.contentEditable = editMode ? 'true' : 'false';
    }
  });
}

function exportContent() {
  // Create a clean clone of the document
  const cloneDoc = document.documentElement.cloneNode(true);

  // Clean edit artifacts from the clone
  cloneDoc.classList.remove('edit-mode-active');
  const bar = cloneDoc.querySelector('#editBar');
  if (bar) bar.classList.remove('active');

  cloneDoc.querySelectorAll('.card-edit-actions').forEach(el => el.remove());
  cloneDoc.querySelectorAll('.add-box-trigger').forEach(el => el.remove());
  cloneDoc.querySelectorAll('.btn-add-tag').forEach(el => el.remove());
  cloneDoc.querySelectorAll('.tag-remove-btn').forEach(el => el.remove());
  cloneDoc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  const html = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ============================================================
   PARTICLE SYSTEM (Canvas)
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.02;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
        this.reset();
      }
    }
    draw() {
      const currentOpacity = this.opacity * (0.6 + Math.sin(this.pulse) * 0.4);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${currentOpacity})`;
      ctx.fill();
    }
  }

  const count = window.innerWidth < 768 ? 30 : 60;
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animFrame = requestAnimationFrame(animate);
  }
  animate();
}


/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
