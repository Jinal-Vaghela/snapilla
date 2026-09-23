/**
 * Snapilla Studio - Admin Dashboard Management Logic
 */

// State
let currentContent = JSON.parse(JSON.stringify(SNAP_DEFAULT_DATA));
let isDemoMode = false;
let activeUser = null;

// DOM Elements
const authWrapper = document.getElementById('authWrapper');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const btnLogout = document.getElementById('btnLogout');
const userEmailText = document.getElementById('userEmailText');
const btnSeedData = document.getElementById('btnSeedData');
const tabTitle = document.getElementById('tabTitle');

// Master Admin Credentials
const MASTER_ADMIN_EMAIL = "snapillastudio@gmail.com";
const MASTER_ADMIN_PASSWORD = "Snapilla@2410";

function getAdminCredentials() {
    try {
        const stored = localStorage.getItem('snapilla_admin_creds');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
        email: MASTER_ADMIN_EMAIL,
        password: MASTER_ADMIN_PASSWORD
    };
}

function saveAdminCredentials(email, password) {
    localStorage.setItem('snapilla_admin_creds', JSON.stringify({ email, password }));
}

function clearLoginInputs() {
    const emailField = document.getElementById('loginEmail');
    const passField = document.getElementById('loginPassword');
    if (emailField) {
        emailField.value = '';
    }
    if (passField) {
        passField.value = '';
    }
}

// ----------------------------------------------------
// 1. AUTHENTICATION HANDLING
// ----------------------------------------------------
function initAuth() {
    const sessionActive = sessionStorage.getItem('snapilla_admin_session');

    // Always clear login inputs first
    clearLoginInputs();

    if (isFirebaseInitialized && auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                activeUser = user;
                showApp(user.email || 'Admin');
                loadAllContent();
                loadBookings();
            } else if (sessionActive === 'true') {
                showApp(getAdminCredentials().email);
                loadAllContent();
                loadBookings();
            } else {
                showLogin();
            }
        });
    } else {
        if (sessionActive === 'true') {
            showApp(getAdminCredentials().email);
            loadAllContent();
            loadBookings();
        } else {
            showLogin();
        }
        const dot = document.getElementById('fbStatusDot');
        const text = document.getElementById('fbStatusText');
        if (dot) dot.style.background = '#FFA000';
        if (text) text.textContent = 'Firebase Standalone / Direct Mode';
    }
}

function showLogin() {
    authWrapper.style.display = 'flex';
    adminApp.style.display = 'none';
    if (loginForm) loginForm.reset();
    clearLoginInputs();
    if (authError) authError.style.display = 'none';
}

function showApp(email) {
    authWrapper.style.display = 'none';
    adminApp.style.display = 'flex';
    userEmailText.textContent = email;
    sessionStorage.setItem('snapilla_admin_session', 'true');
    clearLoginInputs();
    loadBookings();
}

// Password Visibility Toggles
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const loginPasswordInput = document.getElementById('loginPassword');
const loginEyeIcon = document.getElementById('loginEyeIcon');
if (toggleLoginPassword && loginPasswordInput && loginEyeIcon) {
    toggleLoginPassword.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isPassword = loginPasswordInput.type === 'password';
        loginPasswordInput.type = isPassword ? 'text' : 'password';
        loginEyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
}

const toggleSetAdminPassword = document.getElementById('toggleSetAdminPassword');
const setAdminPasswordInput = document.getElementById('setAdminPassword');
const setEyeIcon = document.getElementById('setEyeIcon');
if (toggleSetAdminPassword && setAdminPasswordInput && setEyeIcon) {
    toggleSetAdminPassword.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isPassword = setAdminPasswordInput.type === 'password';
        setAdminPasswordInput.type = isPassword ? 'text' : 'password';
        setEyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
}

// Login Submit
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputEmail = (document.getElementById('loginEmail').value || '').trim();
        const inputPassword = (document.getElementById('loginPassword').value || '').trim();
        authError.style.display = 'none';

        if (!inputEmail || !inputPassword) {
            authError.textContent = 'Please enter both Admin Email and Password.';
            authError.style.display = 'block';
            return;
        }

        const adminCreds = getAdminCredentials();

        // Check if input matches master admin credentials or stored custom credentials
        const matchesMaster = (inputEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && inputPassword === MASTER_ADMIN_PASSWORD);
        const matchesStored = (inputEmail.toLowerCase() === (adminCreds.email || '').toLowerCase() && inputPassword === adminCreds.password);
        const matchesLocal = matchesMaster || matchesStored;

        if (matchesLocal) {
            // Local master match verified -> sign in immediately
            if (isFirebaseInitialized && auth) {
                try {
                    await auth.signInWithEmailAndPassword(inputEmail, inputPassword);
                } catch (err) {
                    try {
                        await auth.createUserWithEmailAndPassword(inputEmail, inputPassword);
                    } catch (createErr) {
                        console.info('Firebase auth fallback to local session', createErr);
                    }
                }
            }
            showApp(inputEmail);
            loadAllContent();
            loadBookings();
            showToast('Welcome back, Admin!', 'success');
            return;
        }

        // If not matching local credentials, check if user exists in Firebase Auth
        if (isFirebaseInitialized && auth) {
            try {
                await auth.signInWithEmailAndPassword(inputEmail, inputPassword);
                showApp(inputEmail);
                loadAllContent();
                loadBookings();
                showToast('Welcome back, Admin!', 'success');
            } catch (err) {
                authError.textContent = 'Incorrect Admin ID or Password. Please try again.';
                authError.style.display = 'block';
            }
        } else {
            authError.textContent = 'Incorrect Admin ID or Password. Please try again.';
            authError.style.display = 'block';
        }
    });
}

// Logout
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        sessionStorage.removeItem('snapilla_admin_session');
        if (isFirebaseInitialized && auth) {
            try { await auth.signOut(); } catch (e) {}
        }
        showLogin();
        showToast('Logged out successfully', 'info');
    });
}

// ----------------------------------------------------
// 2. TAB SWITCHING
// ----------------------------------------------------
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const tabPanes = document.querySelectorAll('.tab-pane');

const tabTitles = {
    'tab-overview': 'Overview & Quick Actions',
    'tab-settings': 'Hero & Brand Settings',
    'tab-why-us': 'Why Us (6 Core Value Pillars)',
    'tab-services': 'Photography Services / Expertise',
    'tab-experience': '8-Step Snapilla Experience Workflow',
    'tab-studio': 'Studio Visit & Operating Hours',
    'tab-about': 'About Us, Story & Vision',
    'tab-portfolio': '3D Rotating Portfolio Photos',
    'tab-pricing': 'Investment / Pricing Plans',
    'tab-testimonials': 'Client Reviews & Marquee',
    'tab-faq': 'Frequently Asked Questions',
    'tab-cta': 'Final High-Impact CTA Banner',
    'tab-bookings': 'Customer Inquiries & Leads',
    'tab-firebase': 'Firebase Setup & Credentials'
};

function switchTab(tabId) {
    sidebarLinks.forEach(link => {
        if (link.dataset.tab === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    tabPanes.forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    if (tabTitles[tabId]) {
        tabTitle.textContent = tabTitles[tabId];
    }

    if (tabId === 'tab-bookings') {
        loadBookings();
    }

    // Auto-close sidebar on mobile
    if (window.innerWidth <= 900 && sidebar) {
        sidebar.classList.remove('open');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (backdrop) backdrop.classList.remove('active');
    }
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tabId = link.dataset.tab;
        if (tabId) switchTab(tabId);
    });
});

// ----------------------------------------------------
// 3. FIRESTORE DATA SYNC & LOCAL CACHE
// ----------------------------------------------------
async function loadAllContent() {
    // 1. Read from localStorage first so user customizations are never lost
    const localData = localStorage.getItem('snapilla_local_content');
    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            currentContent = {
                ...SNAP_DEFAULT_DATA,
                ...parsed,
                settings: { ...SNAP_DEFAULT_DATA.settings, ...(parsed.settings || {}) },
                why_us: { ...SNAP_DEFAULT_DATA.why_us, ...(parsed.why_us || {}) },
                experience: { ...SNAP_DEFAULT_DATA.experience, ...(parsed.experience || {}) },
                studio_info: { ...SNAP_DEFAULT_DATA.studio_info, ...(parsed.studio_info || {}) },
                about_us: { ...SNAP_DEFAULT_DATA.about_us, ...(parsed.about_us || {}) },
                final_cta: { ...SNAP_DEFAULT_DATA.final_cta, ...(parsed.final_cta || {}) },
                services: (parsed.services && parsed.services.length > 0) ? parsed.services : SNAP_DEFAULT_DATA.services,
                faqs: (parsed.faqs && parsed.faqs.length > 0) ? parsed.faqs : SNAP_DEFAULT_DATA.faqs,
                pricing: (parsed.pricing && parsed.pricing.length > 0) ? parsed.pricing : SNAP_DEFAULT_DATA.pricing,
                portfolio: (parsed.portfolio && parsed.portfolio.length > 0) ? parsed.portfolio : SNAP_DEFAULT_DATA.portfolio,
                testimonials: (parsed.testimonials && parsed.testimonials.length > 0) ? parsed.testimonials : SNAP_DEFAULT_DATA.testimonials
            };
        } catch (err) {}
    } else {
        currentContent = JSON.parse(JSON.stringify(SNAP_DEFAULT_DATA));
    }

    // 2. If Firebase is active, pull cloud data and merge
    if (isFirebaseInitialized && db) {
        try {
            // Settings
            const setSnap = await db.collection('content').doc('settings').get();
            if (setSnap.exists) currentContent.settings = { ...currentContent.settings, ...setSnap.data() };

            // Why Us
            const whySnap = await db.collection('content').doc('why_us').get();
            if (whySnap.exists) currentContent.why_us = { ...currentContent.why_us, ...whySnap.data() };

            // Services
            const servSnap = await db.collection('content').doc('services').get();
            if (servSnap.exists && Array.isArray(servSnap.data().items)) {
                currentContent.services = servSnap.data().items;
            }

            // Experience
            const expSnap = await db.collection('content').doc('experience').get();
            if (expSnap.exists) currentContent.experience = { ...currentContent.experience, ...expSnap.data() };

            // Studio Info
            const studSnap = await db.collection('content').doc('studio_info').get();
            if (studSnap.exists) currentContent.studio_info = { ...currentContent.studio_info, ...studSnap.data() };

            // About Us
            const abtSnap = await db.collection('content').doc('about_us').get();
            if (abtSnap.exists) currentContent.about_us = { ...currentContent.about_us, ...abtSnap.data() };

            // Portfolio
            const portSnap = await db.collection('content').doc('portfolio').get();
            if (portSnap.exists && Array.isArray(portSnap.data().items)) {
                currentContent.portfolio = portSnap.data().items;
            }

            // Pricing
            const priceSnap = await db.collection('content').doc('pricing').get();
            if (priceSnap.exists && Array.isArray(priceSnap.data().items)) {
                currentContent.pricing = priceSnap.data().items;
            }

            // Testimonials
            const testSnap = await db.collection('content').doc('testimonials').get();
            if (testSnap.exists && Array.isArray(testSnap.data().items)) {
                currentContent.testimonials = testSnap.data().items;
            }

            // FAQs
            const faqSnap = await db.collection('content').doc('faqs').get();
            if (faqSnap.exists && Array.isArray(faqSnap.data().items)) {
                currentContent.faqs = faqSnap.data().items;
            }

            // Final CTA
            const ctaSnap = await db.collection('content').doc('final_cta').get();
            if (ctaSnap.exists) currentContent.final_cta = { ...currentContent.final_cta, ...ctaSnap.data() };

            localStorage.setItem('snapilla_local_content', JSON.stringify(currentContent));
        } catch (e) {
            console.warn('Firestore read notice, using local cache', e);
        }
    }

    renderAllViews();
}

function renderAllViews() {
    renderSettingsView();
    renderWhyUsView();
    renderServicesView();
    renderExperienceView();
    renderStudioView();
    renderAboutView();
    renderPortfolioView();
    renderPricingView();
    renderTestimonialsView();
    renderFaqView();
    renderCtaView();
    updateOverviewStats();
}

function updateOverviewStats() {
    document.getElementById('statServices').textContent = currentContent.services.length;
    document.getElementById('statPortfolio').textContent = currentContent.portfolio.length;
    document.getElementById('statPricing').textContent = currentContent.pricing.length;
}

// ----------------------------------------------------
// 4. SETTINGS FORM
// ----------------------------------------------------
function renderSettingsView() {
    const s = currentContent.settings || {};
    const st = currentContent.studio_info || {};
    document.getElementById('setHeroTitle').value = s.hero_title || '';
    document.getElementById('setHeroSubtitle').value = s.hero_subtitle || '';
    document.getElementById('setWhatsapp').value = s.whatsapp_number || '';
    document.getElementById('setPhone').value = s.phone || '';
    document.getElementById('setEmail').value = s.email || '';
    document.getElementById('setAddress').value = s.address || st.location || st.address || '';
    const mapsVal = s.maps_url || st.maps_url || '';
    const setMapsInput = document.getElementById('setMapsUrl');
    if (setMapsInput) setMapsInput.value = (mapsVal === 'https://maps.google.com') ? '' : mapsVal;
    document.getElementById('setInstagram').value = s.instagram_url || '';
    document.getElementById('setTagline').value = s.tagline || '';

    const adminCreds = getAdminCredentials();
    const adminEmailInput = document.getElementById('setAdminEmail');
    const adminPassInput = document.getElementById('setAdminPassword');
    if (adminEmailInput) adminEmailInput.value = adminCreds.email || '';
    if (adminPassInput) adminPassInput.value = ''; // Always keep password field blank for security
}

const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newAddress = document.getElementById('setAddress').value.trim();
        const newMapsUrl = document.getElementById('setMapsUrl') ? document.getElementById('setMapsUrl').value.trim() : '';

        currentContent.settings = {
            ...currentContent.settings,
            hero_title: document.getElementById('setHeroTitle').value,
            hero_subtitle: document.getElementById('setHeroSubtitle').value,
            whatsapp_number: document.getElementById('setWhatsapp').value,
            phone: document.getElementById('setPhone').value,
            email: document.getElementById('setEmail').value,
            address: newAddress,
            maps_url: newMapsUrl,
            instagram_url: document.getElementById('setInstagram').value,
            tagline: document.getElementById('setTagline').value
        };

        // Also sync to studio_info location and maps_url so both collections and DOM sections are updated
        if (!currentContent.studio_info) currentContent.studio_info = {};
        currentContent.studio_info.location = newAddress;
        currentContent.studio_info.address = newAddress;
        currentContent.studio_info.maps_url = newMapsUrl;

        const newAdminEmail = document.getElementById('setAdminEmail')?.value.trim();
        const newAdminPass = document.getElementById('setAdminPassword')?.value;
        const currentCreds = getAdminCredentials();

        if (newAdminEmail) {
            const passToSave = (newAdminPass && newAdminPass.trim().length > 0) ? newAdminPass : currentCreds.password;
            saveAdminCredentials(newAdminEmail, passToSave);
            
            if (activeUser && auth && isFirebaseInitialized && newAdminPass && newAdminPass.trim().length > 0) {
                try {
                    await activeUser.updatePassword(newAdminPass);
                } catch (passErr) {
                    console.warn('Firebase password update note:', passErr);
                }
            }
        }

        await saveDoc('settings', currentContent.settings);
        await saveDoc('studio_info', currentContent.studio_info);
        showToast('Settings & Contact Information Saved Successfully!', 'success');
    });
}

// ----------------------------------------------------
// 4B. WHY US & 6 PILLARS CRUD
// ----------------------------------------------------
function renderWhyUsView() {
    const w = currentContent.why_us || {};
    const setWhyTitle = document.getElementById('setWhyTitle');
    const setWhySubtitle = document.getElementById('setWhySubtitle');
    const setWhyQuote = document.getElementById('setWhyQuote');

    if (setWhyTitle) setWhyTitle.value = w.title || '';
    if (setWhySubtitle) setWhySubtitle.value = w.subtitle || '';
    if (setWhyQuote) setWhyQuote.value = w.quote || '';

    const container = document.getElementById('adminPillarsGrid');
    if (!container) return;

    const pillars = w.pillars || [];
    container.innerHTML = pillars.map((item, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.8rem;">${item.icon || '📸'}</span>
                    <h4 class="item-card-title">${item.title}</h4>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="editPillar(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deletePillar(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-top: 8px;">${item.desc}</p>
        </div>
    `).join('');
}

const whyUsForm = document.getElementById('whyUsForm');
if (whyUsForm) {
    whyUsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.why_us = currentContent.why_us || {};
        currentContent.why_us.title = document.getElementById('setWhyTitle').value;
        currentContent.why_us.subtitle = document.getElementById('setWhySubtitle').value;
        currentContent.why_us.quote = document.getElementById('setWhyQuote').value;

        await saveDoc('why_us', currentContent.why_us);
        showToast('Why Us Header Saved Successfully!', 'success');
    });
}

function openPillarModal(index = null) {
    const modal = document.getElementById('modalPillar');
    const title = document.getElementById('modalPillarTitle');
    const idxInput = document.getElementById('pillarIndex');

    currentContent.why_us = currentContent.why_us || {};
    currentContent.why_us.pillars = currentContent.why_us.pillars || [];

    if (index !== null) {
        title.textContent = 'Edit Value Pillar';
        idxInput.value = index;
        const item = currentContent.why_us.pillars[index];
        document.getElementById('pillarIcon').value = item.icon;
        document.getElementById('pillarTitle').value = item.title;
        document.getElementById('pillarDesc').value = item.desc;
    } else {
        title.textContent = 'Add Value Pillar';
        idxInput.value = '';
        document.getElementById('pillarForm').reset();
    }

    modal.classList.add('active');
}

function editPillar(index) {
    openPillarModal(index);
}

async function deletePillar(index) {
    if (confirm('Delete this pillar card?')) {
        currentContent.why_us.pillars.splice(index, 1);
        await saveDoc('why_us', currentContent.why_us);
        renderWhyUsView();
        showToast('Pillar card deleted', 'info');
    }
}

const pillarForm = document.getElementById('pillarForm');
if (pillarForm) {
    pillarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('pillarIndex').value;
        const item = {
            icon: document.getElementById('pillarIcon').value,
            title: document.getElementById('pillarTitle').value,
            desc: document.getElementById('pillarDesc').value
        };

        currentContent.why_us = currentContent.why_us || {};
        currentContent.why_us.pillars = currentContent.why_us.pillars || [];

        if (idx !== '') {
            currentContent.why_us.pillars[parseInt(idx)] = item;
        } else {
            currentContent.why_us.pillars.push(item);
        }

        await saveDoc('why_us', currentContent.why_us);
        closeModal('modalPillar');
        renderWhyUsView();
        showToast('Pillar saved successfully!', 'success');
    });
}

// ----------------------------------------------------
// 4C. 8-STEP EXPERIENCE CRUD
// ----------------------------------------------------
function renderExperienceView() {
    const exp = currentContent.experience || {};
    const setExpTitle = document.getElementById('setExpTitle');
    const setExpSubtitle = document.getElementById('setExpSubtitle');

    if (setExpTitle) setExpTitle.value = exp.title || '';
    if (setExpSubtitle) setExpSubtitle.value = exp.subtitle || '';

    const container = document.getElementById('adminStepsGrid');
    if (!container) return;

    const steps = exp.steps || [];
    container.innerHTML = steps.map((item, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <div>
                    <span style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary);">${item.step}</span>
                    <h4 class="item-card-title" style="margin-top: 4px;">${item.title}</h4>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="editStep(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deleteStep(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-top: 8px;">${item.desc}</p>
        </div>
    `).join('');
}

const experienceForm = document.getElementById('experienceForm');
if (experienceForm) {
    experienceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.experience = currentContent.experience || {};
        currentContent.experience.title = document.getElementById('setExpTitle').value;
        currentContent.experience.subtitle = document.getElementById('setExpSubtitle').value;

        await saveDoc('experience', currentContent.experience);
        showToast('Experience Header Saved Successfully!', 'success');
    });
}

function openStepModal(index = null) {
    const modal = document.getElementById('modalStep');
    const title = document.getElementById('modalStepTitle');
    const idxInput = document.getElementById('stepIndex');

    currentContent.experience = currentContent.experience || {};
    currentContent.experience.steps = currentContent.experience.steps || [];

    if (index !== null) {
        title.textContent = 'Edit Experience Step';
        idxInput.value = index;
        const item = currentContent.experience.steps[index];
        document.getElementById('stepNum').value = item.step;
        document.getElementById('stepTitle').value = item.title;
        document.getElementById('stepDesc').value = item.desc;
    } else {
        title.textContent = 'Add Experience Step';
        idxInput.value = '';
        document.getElementById('stepForm').reset();
    }

    modal.classList.add('active');
}

function editStep(index) {
    openStepModal(index);
}

async function deleteStep(index) {
    if (confirm('Delete this step?')) {
        currentContent.experience.steps.splice(index, 1);
        await saveDoc('experience', currentContent.experience);
        renderExperienceView();
        showToast('Experience step deleted', 'info');
    }
}

const stepForm = document.getElementById('stepForm');
if (stepForm) {
    stepForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('stepIndex').value;
        const item = {
            step: document.getElementById('stepNum').value,
            title: document.getElementById('stepTitle').value,
            desc: document.getElementById('stepDesc').value
        };

        currentContent.experience = currentContent.experience || {};
        currentContent.experience.steps = currentContent.experience.steps || [];

        if (idx !== '') {
            currentContent.experience.steps[parseInt(idx)] = item;
        } else {
            currentContent.experience.steps.push(item);
        }

        await saveDoc('experience', currentContent.experience);
        closeModal('modalStep');
        renderExperienceView();
        showToast('Step saved successfully!', 'success');
    });
}

// ----------------------------------------------------
// 4D. STUDIO VISIT & OPERATING HOURS
// ----------------------------------------------------
function renderStudioView() {
    const st = currentContent.studio_info || {};
    const s = currentContent.settings || {};
    const setStudioBadge = document.getElementById('setStudioBadge');
    const setStudioTitle = document.getElementById('setStudioTitle');
    const setStudioDesc = document.getElementById('setStudioDesc');
    const setStudioLocation = document.getElementById('setStudioLocation');
    const setStudioWeekday = document.getElementById('setStudioWeekday');
    const setStudioSunday = document.getElementById('setStudioSunday');
    const setStudioNotice = document.getElementById('setStudioNotice');
    const setStudioMaps = document.getElementById('setStudioMaps');

    if (setStudioBadge) setStudioBadge.value = st.badge || '';
    if (setStudioTitle) setStudioTitle.value = st.title || '';
    if (setStudioDesc) setStudioDesc.value = st.desc || '';
    if (setStudioLocation) setStudioLocation.value = st.location || st.address || s.address || '';
    if (setStudioWeekday) setStudioWeekday.value = st.hours_weekday || '';
    if (setStudioSunday) setStudioSunday.value = st.hours_sunday || '';
    if (setStudioNotice) setStudioNotice.value = st.notice || '';
    const mapsVal = st.maps_url || s.maps_url || '';
    if (setStudioMaps) setStudioMaps.value = (mapsVal === 'https://maps.google.com') ? '' : mapsVal;
}

const studioForm = document.getElementById('studioForm');
if (studioForm) {
    studioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studioLoc = document.getElementById('setStudioLocation') ? document.getElementById('setStudioLocation').value.trim() : '';
        const mapsUrl = document.getElementById('setStudioMaps') ? document.getElementById('setStudioMaps').value.trim() : '';

        currentContent.studio_info = {
            ...currentContent.studio_info,
            badge: document.getElementById('setStudioBadge').value,
            title: document.getElementById('setStudioTitle').value,
            desc: document.getElementById('setStudioDesc').value,
            location: studioLoc,
            address: studioLoc,
            hours_weekday: document.getElementById('setStudioWeekday').value,
            hours_sunday: document.getElementById('setStudioSunday').value,
            notice: document.getElementById('setStudioNotice').value,
            maps_url: mapsUrl
        };

        if (!currentContent.settings) currentContent.settings = {};
        currentContent.settings.address = studioLoc;
        currentContent.settings.maps_url = mapsUrl;

        await saveDoc('studio_info', currentContent.studio_info);
        await saveDoc('settings', currentContent.settings);
        showToast('Studio Details & Hours Saved Successfully!', 'success');
    });
}

// ----------------------------------------------------
// 4E. ABOUT US STORY & VISION
// ----------------------------------------------------
function renderAboutView() {
    const ab = currentContent.about_us || {};
    const setAboutTitle = document.getElementById('setAboutTitle');
    const setAboutP1 = document.getElementById('setAboutP1');
    const setAboutP2 = document.getElementById('setAboutP2');
    const setMissionTitle = document.getElementById('setMissionTitle');
    const setMissionDesc = document.getElementById('setMissionDesc');
    const setVisionTitle = document.getElementById('setVisionTitle');
    const setVisionDesc = document.getElementById('setVisionDesc');

    if (setAboutTitle) setAboutTitle.value = ab.title || '';
    if (setAboutP1) setAboutP1.value = ab.p1 || '';
    if (setAboutP2) setAboutP2.value = ab.p2 || '';
    if (setMissionTitle) setMissionTitle.value = ab.mission_title || '';
    if (setMissionDesc) setMissionDesc.value = ab.mission_desc || '';
    if (setVisionTitle) setVisionTitle.value = ab.vision_title || '';
    if (setVisionDesc) setVisionDesc.value = ab.vision_desc || '';
}

const aboutForm = document.getElementById('aboutForm');
if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.about_us = {
            title: document.getElementById('setAboutTitle').value,
            p1: document.getElementById('setAboutP1').value,
            p2: document.getElementById('setAboutP2').value,
            mission_title: document.getElementById('setMissionTitle').value,
            mission_desc: document.getElementById('setMissionDesc').value,
            vision_title: document.getElementById('setVisionTitle').value,
            vision_desc: document.getElementById('setVisionDesc').value
        };

        await saveDoc('about_us', currentContent.about_us);
        showToast('About Us Details Saved Successfully!', 'success');
    });
}

// ----------------------------------------------------
// 4F. FINAL CTA BANNER
// ----------------------------------------------------
function renderCtaView() {
    const cta = currentContent.final_cta || {};
    const setCtaTitle = document.getElementById('setCtaTitle');
    const setCtaDesc = document.getElementById('setCtaDesc');

    if (setCtaTitle) setCtaTitle.value = cta.title || '';
    if (setCtaDesc) setCtaDesc.value = cta.desc || '';
}

const ctaForm = document.getElementById('ctaForm');
if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.final_cta = {
            title: document.getElementById('setCtaTitle').value,
            desc: document.getElementById('setCtaDesc').value
        };

        await saveDoc('final_cta', currentContent.final_cta);
        showToast('Final CTA Banner Saved Successfully!', 'success');
    });
}

// ----------------------------------------------------
// 5. SERVICES CRUD
// ----------------------------------------------------
function renderServicesView() {
    const container = document.getElementById('adminServicesGrid');
    if (!container) return;

    container.innerHTML = currentContent.services.map((item, index) => `
        <div class="item-card">
            <div class="item-card-media" style="background: ${item.background_color || '#FFCA28'}22; display: flex; align-items: center; justify-content: center;">
                <img src="${getImageUrl(item.image)}" alt="${item.title}" style="max-height: 120px; object-fit: contain;">
            </div>
            <div class="item-card-header">
                <div>
                    <h4 class="item-card-title">${item.title}</h4>
                    <span class="badge-pill" style="background: ${item.background_color || '#FFCA28'}; color: #000; font-weight: 800; font-size: 0.7rem;">${item.background_color}</span>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="editService(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deleteService(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">${item.description}</p>
        </div>
    `).join('');
}

function openServiceModal(index = null) {
    const modal = document.getElementById('modalService');
    const title = document.getElementById('modalServiceTitle');
    const idxInput = document.getElementById('serviceIndex');

    if (index !== null) {
        title.textContent = 'Edit Service';
        idxInput.value = index;
        const item = currentContent.services[index];
        document.getElementById('serviceTitle').value = item.title;
        document.getElementById('serviceDesc').value = item.description;
        document.getElementById('serviceImage').value = item.image;
        document.getElementById('serviceBgColor').value = item.background_color || '#FFCA28';
        document.getElementById('serviceColorPicker').value = item.background_color || '#FFCA28';
    } else {
        title.textContent = 'Add New Service';
        idxInput.value = '';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceBgColor').value = '#FFCA28';
        document.getElementById('serviceColorPicker').value = '#FFCA28';
    }

    modal.classList.add('active');
}

function editService(index) {
    openServiceModal(index);
}

async function deleteService(index) {
    if (confirm('Are you sure you want to delete this service?')) {
        currentContent.services.splice(index, 1);
        await saveDoc('services', { items: currentContent.services });
        renderServicesView();
        updateOverviewStats();
        showToast('Service deleted', 'info');
    }
}

// Color picker synchronization
const serviceColorPicker = document.getElementById('serviceColorPicker');
const serviceBgColor = document.getElementById('serviceBgColor');
if (serviceColorPicker && serviceBgColor) {
    serviceColorPicker.addEventListener('input', (e) => {
        serviceBgColor.value = e.target.value.toUpperCase();
    });
    serviceBgColor.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            serviceColorPicker.value = e.target.value;
        }
    });
}

// File input to Base64
handleImageFileInput('serviceFile', 'serviceImage');

const serviceForm = document.getElementById('serviceForm');
if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('serviceIndex').value;
        const item = {
            title: document.getElementById('serviceTitle').value,
            description: document.getElementById('serviceDesc').value,
            image: document.getElementById('serviceImage').value,
            background_color: document.getElementById('serviceBgColor').value
        };

        if (idx !== '') {
            currentContent.services[parseInt(idx)] = item;
        } else {
            currentContent.services.push(item);
        }

        await saveDoc('services', { items: currentContent.services });
        closeModal('modalService');
        renderServicesView();
        updateOverviewStats();
        showToast('Service saved successfully!', 'success');
    });
}

// ----------------------------------------------------
// 6. PORTFOLIO 3D CRUD
// ----------------------------------------------------
function renderPortfolioView() {
    const container = document.getElementById('adminPortfolioGrid');
    if (!container) return;

    container.innerHTML = currentContent.portfolio.map((item, index) => `
        <div class="item-card">
            <div class="item-card-media">
                <img src="${getImageUrl(item.image)}" alt="${item.title}">
            </div>
            <div class="item-card-header">
                <h4 class="item-card-title" style="font-size: 0.95rem;">${item.title}</h4>
                <div class="item-card-actions">
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="editPortfolio(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deletePortfolio(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function openPortfolioModal(index = null) {
    const modal = document.getElementById('modalPortfolio');
    const title = document.getElementById('modalPortfolioTitle');
    const idxInput = document.getElementById('portfolioIndex');

    if (index !== null) {
        title.textContent = 'Edit 3D Portfolio Photo';
        idxInput.value = index;
        const item = currentContent.portfolio[index];
        document.getElementById('portfolioPhotoTitle').value = item.title;
        document.getElementById('portfolioPhotoImage').value = item.image;
        document.getElementById('portfolioPhotoAlt').value = item.alt || '';
    } else {
        title.textContent = 'Add 3D Portfolio Photo';
        idxInput.value = '';
        document.getElementById('portfolioForm').reset();
    }

    modal.classList.add('active');
}

function editPortfolio(index) {
    openPortfolioModal(index);
}

async function deletePortfolio(index) {
    if (confirm('Delete this photo from the 3D rotating portfolio?')) {
        currentContent.portfolio.splice(index, 1);
        await saveDoc('portfolio', { items: currentContent.portfolio });
        renderPortfolioView();
        updateOverviewStats();
        showToast('Photo removed', 'info');
    }
}

handleImageFileInput('portfolioPhotoFile', 'portfolioPhotoImage');

const portfolioForm = document.getElementById('portfolioForm');
if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('portfolioIndex').value;
        const item = {
            title: document.getElementById('portfolioPhotoTitle').value,
            image: document.getElementById('portfolioPhotoImage').value,
            alt: document.getElementById('portfolioPhotoAlt').value
        };

        if (idx !== '') {
            currentContent.portfolio[parseInt(idx)] = item;
        } else {
            currentContent.portfolio.push(item);
        }

        await saveDoc('portfolio', { items: currentContent.portfolio });
        closeModal('modalPortfolio');
        renderPortfolioView();
        updateOverviewStats();
        showToast('Photo saved to 3D portfolio!', 'success');
    });
}

// ----------------------------------------------------
// 7. PRICING PLANS CRUD
// ----------------------------------------------------
function renderPricingView() {
    const container = document.getElementById('adminPricingGrid');
    if (!container) return;

    container.innerHTML = currentContent.pricing.map((item, index) => {
        const featList = (item.features || []).map(f => `<li><i class="fas fa-check" style="color: var(--primary); margin-right: 6px;"></i>${f}</li>`).join('');
        const badge = item.popular ? `<span class="badge-pill badge-warning">Popular</span>` : '';

        return `
            <div class="item-card">
                <div class="item-card-header">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.5rem;">${item.icon || '📸'}</span>
                        <h4 class="item-card-title">${item.title}</h4>
                    </div>
                    ${badge}
                </div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--primary); margin: 6px 0;">${item.price}</div>
                <p style="color: var(--text-muted); font-size: 0.85rem;">${item.subtitle || ''}</p>
                <ul style="list-style: none; padding: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
                    ${featList}
                </ul>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                    <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="editPricing(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePricing(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function openPricingModal(index = null) {
    const modal = document.getElementById('modalPricing');
    const title = document.getElementById('modalPricingTitle');
    const idxInput = document.getElementById('pricingIndex');

    if (index !== null) {
        title.textContent = 'Edit Pricing Tier';
        idxInput.value = index;
        const item = currentContent.pricing[index];
        document.getElementById('pricingTitle').value = item.title;
        document.getElementById('pricingIcon').value = item.icon || '📸';
        document.getElementById('pricingPrice').value = item.price;
        document.getElementById('pricingSubtitle').value = item.subtitle || '';
        document.getElementById('pricingPopular').value = item.popular ? 'true' : 'false';
        document.getElementById('pricingFeatures').value = (item.features || []).join('\n');
    } else {
        title.textContent = 'Add New Pricing Tier';
        idxInput.value = '';
        document.getElementById('pricingForm').reset();
        document.getElementById('pricingIcon').value = '📸';
    }

    modal.classList.add('active');
}

function editPricing(index) {
    openPricingModal(index);
}

async function deletePricing(index) {
    if (confirm('Delete this pricing plan?')) {
        currentContent.pricing.splice(index, 1);
        await saveDoc('pricing', { items: currentContent.pricing });
        renderPricingView();
        updateOverviewStats();
        showToast('Pricing plan deleted', 'info');
    }
}

const pricingForm = document.getElementById('pricingForm');
if (pricingForm) {
    pricingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('pricingIndex').value;
        const feats = document.getElementById('pricingFeatures').value.split('\n').map(s => s.trim()).filter(Boolean);

        const item = {
            title: document.getElementById('pricingTitle').value,
            icon: document.getElementById('pricingIcon').value,
            price: document.getElementById('pricingPrice').value,
            subtitle: document.getElementById('pricingSubtitle').value,
            popular: document.getElementById('pricingPopular').value === 'true',
            features: feats
        };

        if (idx !== '') {
            currentContent.pricing[parseInt(idx)] = item;
        } else {
            currentContent.pricing.push(item);
        }

        await saveDoc('pricing', { items: currentContent.pricing });
        closeModal('modalPricing');
        renderPricingView();
        updateOverviewStats();
        showToast('Pricing plan saved!', 'success');
    });
}

// ----------------------------------------------------
// 8. TESTIMONIALS CRUD
// ----------------------------------------------------
function renderTestimonialsView() {
    const container = document.getElementById('adminTestimonialsGrid');
    if (!container) return;

    container.innerHTML = currentContent.testimonials.map((item, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <div>
                    <h4 class="item-card-title">${item.name}</h4>
                    <span style="font-size: 0.8rem; color: var(--primary);">${item.role}</span>
                </div>
                <div class="item-card-actions">
                    <span class="badge-pill badge-warning">Row ${item.row || 1}</span>
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="editTestimonial(${index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deleteTestimonial(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; font-style: italic;">“${item.quote}”</p>
        </div>
    `).join('');
}

function openTestimonialModal(index = null) {
    const modal = document.getElementById('modalTestimonial');
    const title = document.getElementById('modalTestimonialTitle');
    const idxInput = document.getElementById('testimonialIndex');

    if (index !== null) {
        title.textContent = 'Edit Testimonial';
        idxInput.value = index;
        const item = currentContent.testimonials[index];
        document.getElementById('testName').value = item.name;
        document.getElementById('testRole').value = item.role;
        document.getElementById('testQuote').value = item.quote;
        document.getElementById('testRow').value = item.row || 1;
    } else {
        title.textContent = 'Add Testimonial';
        idxInput.value = '';
        document.getElementById('testimonialForm').reset();
    }

    modal.classList.add('active');
}

function editTestimonial(index) {
    openTestimonialModal(index);
}

async function deleteTestimonial(index) {
    if (confirm('Delete this testimonial?')) {
        currentContent.testimonials.splice(index, 1);
        await saveDoc('testimonials', { items: currentContent.testimonials });
        renderTestimonialsView();
        showToast('Testimonial deleted', 'info');
    }
}

const testimonialForm = document.getElementById('testimonialForm');
if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('testimonialIndex').value;
        const item = {
            name: document.getElementById('testName').value,
            role: document.getElementById('testRole').value,
            quote: document.getElementById('testQuote').value,
            row: parseInt(document.getElementById('testRow').value) || 1
        };

        if (idx !== '') {
            currentContent.testimonials[parseInt(idx)] = item;
        } else {
            currentContent.testimonials.push(item);
        }

        await saveDoc('testimonials', { items: currentContent.testimonials });
        closeModal('modalTestimonial');
        renderTestimonialsView();
        showToast('Testimonial saved!', 'success');
    });
}

// ----------------------------------------------------
// 9. FAQ CRUD
// ----------------------------------------------------
function renderFaqView() {
    const container = document.getElementById('adminFaqContainer');
    if (!container) return;

    container.innerHTML = currentContent.faqs.map((item, index) => `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border-bottom: 1px solid var(--dark-border);">
            <div style="max-width: 80%;">
                <h4 style="color: var(--primary); margin-bottom: 6px; font-size: 1rem;">Q: ${item.question}</h4>
                <p style="color: var(--text-main); font-size: 0.9rem;">👉 ${item.answer}</p>
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-icon btn-sm" onclick="editFaq(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="deleteFaq(${index})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function openFaqModal(index = null) {
    const modal = document.getElementById('modalFaq');
    const title = document.getElementById('modalFaqTitle');
    const idxInput = document.getElementById('faqIndex');

    if (index !== null) {
        title.textContent = 'Edit FAQ';
        idxInput.value = index;
        const item = currentContent.faqs[index];
        document.getElementById('faqQuestion').value = item.question;
        document.getElementById('faqAnswer').value = item.answer;
    } else {
        title.textContent = 'Add FAQ';
        idxInput.value = '';
        document.getElementById('faqForm').reset();
    }

    modal.classList.add('active');
}

function editFaq(index) {
    openFaqModal(index);
}

async function deleteFaq(index) {
    if (confirm('Delete this FAQ question?')) {
        currentContent.faqs.splice(index, 1);
        await saveDoc('faqs', { items: currentContent.faqs });
        renderFaqView();
        showToast('FAQ deleted', 'info');
    }
}

const faqForm = document.getElementById('faqForm');
if (faqForm) {
    faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idx = document.getElementById('faqIndex').value;
        const item = {
            question: document.getElementById('faqQuestion').value,
            answer: document.getElementById('faqAnswer').value
        };

        if (idx !== '') {
            currentContent.faqs[parseInt(idx)] = item;
        } else {
            currentContent.faqs.push(item);
        }

        await saveDoc('faqs', { items: currentContent.faqs });
        closeModal('modalFaq');
        renderFaqView();
        showToast('FAQ saved!', 'success');
    });
}

// ----------------------------------------------------
// 10. BOOKING INQUIRIES & LEAD MANAGEMENT
// ----------------------------------------------------
let allBookingsList = [];
let bookingsListenerAttached = false;

async function loadBookings() {
    const tbody = document.getElementById('bookingTableBody');
    const badge = document.getElementById('badgeBookingCount');
    const statBookings = document.getElementById('statBookings');

    if (!tbody) return;

    let firestoreBookings = [];
    let localBookings = [];

    // 1. Fetch from LocalStorage leads
    try {
        const stored = localStorage.getItem('snapilla_bookings_leads');
        if (stored) {
            localBookings = JSON.parse(stored);
            if (!Array.isArray(localBookings)) localBookings = [];
        }
    } catch (e) {
        console.warn('Error reading local bookings', e);
    }

    // 2. Fetch from Firebase Firestore if available
    if (isFirebaseInitialized && db) {
        try {
            const snap = await db.collection('bookings').orderBy('timestamp', 'desc').get();
            snap.forEach(doc => {
                firestoreBookings.push({ id: doc.id, ...doc.data() });
            });

            // Auto-sync any local leads to Firestore that are missing
            for (const lb of localBookings) {
                const exists = firestoreBookings.some(fb => fb.id === lb.id || (fb.phone && fb.phone === lb.phone && fb.timestamp === lb.timestamp));
                if (!exists && lb.id) {
                    try {
                        await db.collection('bookings').doc(lb.id).set({
                            ...lb,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        firestoreBookings.unshift(lb);
                    } catch (syncErr) {
                        console.warn('Sync lead to Firestore note:', syncErr);
                    }
                }
            }

            // Attach real-time snapshot listener once
            if (!bookingsListenerAttached) {
                bookingsListenerAttached = true;
                db.collection('bookings').onSnapshot(snapshot => {
                    const updated = [];
                    const seen = new Set();
                    snapshot.forEach(d => {
                        const data = d.data();
                        const sig = `${(data.phone || '').trim()}_${(data.name || '').trim().toLowerCase()}_${(data.submittedAt || '').trim()}_${data.shootType || ''}`;
                        if (!seen.has(sig)) {
                            seen.add(sig);
                            updated.push({ id: d.id, ...data });
                        }
                    });
                    renderBookingsTable(updated);
                }, err => console.warn('Bookings listener note:', err));
            }
        } catch (e) {
            console.warn('Error querying Firestore bookings, fallback to local', e);
        }
    }

    // Merge both sources and deduplicate by lead signature (phone + name + submittedAt + shootType)
    const combinedMap = new Map();
    [...firestoreBookings, ...localBookings].forEach(item => {
        const sig = `${(item.phone || '').trim()}_${(item.name || '').trim().toLowerCase()}_${(item.submittedAt || '').trim()}_${item.shootType || ''}`;
        if (!combinedMap.has(sig)) {
            combinedMap.set(sig, item);
        }
    });

    allBookingsList = Array.from(combinedMap.values());
    // Sort newest first
    allBookingsList.sort((a, b) => {
        const tA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : (typeof a.timestamp === 'number' ? a.timestamp : new Date(a.submittedAt || 0).getTime());
        const tB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : (typeof b.timestamp === 'number' ? b.timestamp : new Date(b.submittedAt || 0).getTime());
        return (tB || 0) - (tA || 0);
    });

    renderBookingsTable(allBookingsList);
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingTableBody');
    const badge = document.getElementById('badgeBookingCount');
    const statBookings = document.getElementById('statBookings');

    allBookingsList = bookings || [];

    if (badge) badge.textContent = allBookingsList.length;
    if (statBookings) statBookings.textContent = allBookingsList.length;

    if (!tbody) return;

    if (allBookingsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 35px; font-size: 0.95rem;">
            <i class="fas fa-inbox" style="font-size: 1.8rem; display: block; margin-bottom: 10px; color: #555;"></i>
            No booking inquiries yet. When visitors submit the form or click inquiry buttons on the site, their leads will appear here in real-time.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = allBookingsList.map((b, idx) => {
        let dateDisplay = 'Recent';
        if (b.submittedAt) {
            dateDisplay = b.submittedAt;
        } else if (b.timestamp) {
            try {
                const d = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                dateDisplay = d.toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                });
            } catch (err) {}
        }

        const rawPhone = (b.phone || '').replace(/\D/g, '');
        const cleanPhone = b.phone || 'No phone';

        return `
            <tr>
                <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-muted);">
                    <i class="far fa-clock" style="margin-right: 4px;"></i> ${dateDisplay}
                </td>
                <td>
                    <strong style="color: #fff; font-size: 0.95rem;">${b.name || 'Anonymous Visitor'}</strong>
                </td>
                <td>
                    <span class="badge-pill badge-warning" style="font-weight: 700; font-size: 0.78rem;">
                        ${b.shootType || 'Photography Inquiry'}
                    </span>
                </td>
                <td style="font-size: 0.88rem; color: var(--text-main);">
                    📅 ${b.date || 'Flexible'}
                </td>
                <td>
                    <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">${cleanPhone}</div>
                    ${b.email ? `<small style="color: var(--text-muted); font-size: 0.8rem;">📧 ${b.email}</small>` : ''}
                </td>
                <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                    ${b.message || 'Inquired via booking button'}
                </td>
                <td style="white-space: nowrap;">
                    <div style="display: flex; gap: 6px;">
                        ${rawPhone ? `
                            <a href="https://wa.me/${rawPhone}" target="_blank" class="btn btn-primary btn-sm" title="Chat on WhatsApp" style="padding: 6px 10px;">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <a href="tel:${rawPhone}" class="btn btn-secondary btn-sm" title="Call Customer" style="padding: 6px 10px;">
                                <i class="fas fa-phone"></i>
                            </a>
                        ` : ''}
                        <button class="btn btn-danger btn-sm" onclick="deleteBooking('${b.id || idx}')" title="Delete lead" style="padding: 6px 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this customer inquiry?')) {
        // 1. Delete from Firestore if active
        if (isFirebaseInitialized && db && id) {
            try {
                await db.collection('bookings').doc(id).delete();
            } catch (e) {
                console.warn('Firestore delete note:', e);
            }
        }

        // 2. Delete from LocalStorage
        try {
            let local = JSON.parse(localStorage.getItem('snapilla_bookings_leads') || '[]');
            local = local.filter((item, index) => item.id !== id && String(index) !== String(id));
            localStorage.setItem('snapilla_bookings_leads', JSON.stringify(local));
        } catch (e) {}

        // Reload
        await loadBookings();
        showToast('Lead record removed', 'info');
    }
}

async function clearAllBookings() {
    if (allBookingsList.length === 0) {
        showToast('No leads to clear', 'info');
        return;
    }
    if (confirm(`Delete all ${allBookingsList.length} booking records? This cannot be undone.`)) {
        if (isFirebaseInitialized && db) {
            try {
                const snap = await db.collection('bookings').get();
                const batch = db.batch();
                snap.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            } catch (e) {
                console.warn('Firestore batch clear error', e);
            }
        }
        localStorage.removeItem('snapilla_bookings_leads');
        allBookingsList = [];
        renderBookingsTable([]);
        showToast('All leads cleared', 'info');
    }
}

function exportBookingsCSV() {
    if (allBookingsList.length === 0) {
        showToast('No booking leads to export!', 'error');
        return;
    }

    const headers = ['Submitted Date', 'Customer Name', 'Email', 'Phone', 'Shoot Type', 'Preferred Date', 'Message'];
    const rows = allBookingsList.map(b => [
        `"${b.submittedAt || b.date || ''}"`,
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${(b.email || '').replace(/"/g, '""')}"`,
        `"${(b.phone || '').replace(/"/g, '""')}"`,
        `"${(b.shootType || '').replace(/"/g, '""')}"`,
        `"${(b.date || '').replace(/"/g, '""')}"`,
        `"${(b.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Snapilla_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported as CSV!', 'success');
}

// Listen to storage changes across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'snapilla_bookings_leads') {
        loadBookings();
    }
});

// ----------------------------------------------------
// 11. FIREBASE CONFIG FORM
// ----------------------------------------------------
const firebaseConfigForm = document.getElementById('firebaseConfigForm');
if (firebaseConfigForm) {
    const curr = getFirebaseConfig();
    if (curr.apiKey && curr.apiKey !== "YOUR_API_KEY") {
        document.getElementById('fbApiKey').value = curr.apiKey || '';
        document.getElementById('fbProjectId').value = curr.projectId || '';
        document.getElementById('fbAuthDomain').value = curr.authDomain || '';
        document.getElementById('fbStorageBucket').value = curr.storageBucket || '';
        document.getElementById('fbMessagingSenderId').value = curr.messagingSenderId || '';
        document.getElementById('fbAppId').value = curr.appId || '';
    }

    firebaseConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const conf = {
            apiKey: document.getElementById('fbApiKey').value.trim(),
            projectId: document.getElementById('fbProjectId').value.trim(),
            authDomain: document.getElementById('fbAuthDomain').value.trim(),
            storageBucket: document.getElementById('fbStorageBucket').value.trim(),
            messagingSenderId: document.getElementById('fbMessagingSenderId').value.trim(),
            appId: document.getElementById('fbAppId').value.trim()
        };

        localStorage.setItem('snapilla_firebase_config', JSON.stringify(conf));
        showToast('Firebase Credentials Saved! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1200);
    });

    const btnClear = document.getElementById('btnClearConfig');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('Reset stored Firebase credentials?')) {
                localStorage.removeItem('snapilla_firebase_config');
                showToast('Credentials cleared. Reloading...', 'info');
                setTimeout(() => window.location.reload(), 1000);
            }
        });
    }
}

// ----------------------------------------------------
// 12. SEED DEFAULT DATA BUTTON
// ----------------------------------------------------
if (btnSeedData) {
    btnSeedData.addEventListener('click', async () => {
        if (confirm('Reset and seed all latest Snapilla content (Hero, Why Us, all 9 Services, Experience, Studio, About Us, 3D Portfolio, Pricing, Testimonials, FAQ, Final CTA)?')) {
            currentContent = JSON.parse(JSON.stringify(SNAP_DEFAULT_DATA));
            await saveDoc('settings', SNAP_DEFAULT_DATA.settings);
            await saveDoc('why_us', SNAP_DEFAULT_DATA.why_us);
            await saveDoc('services', { items: SNAP_DEFAULT_DATA.services });
            await saveDoc('experience', SNAP_DEFAULT_DATA.experience);
            await saveDoc('studio_info', SNAP_DEFAULT_DATA.studio_info);
            await saveDoc('about_us', SNAP_DEFAULT_DATA.about_us);
            await saveDoc('portfolio', { items: SNAP_DEFAULT_DATA.portfolio });
            await saveDoc('pricing', { items: SNAP_DEFAULT_DATA.pricing });
            await saveDoc('testimonials', { items: SNAP_DEFAULT_DATA.testimonials });
            await saveDoc('faqs', { items: SNAP_DEFAULT_DATA.faqs });
            await saveDoc('final_cta', SNAP_DEFAULT_DATA.final_cta);

            renderAllViews();
            showToast('All 12+ website sections successfully seeded and updated!', 'success');
        }
    });
}

// ----------------------------------------------------
// 13. HELPERS
// ----------------------------------------------------
async function saveDoc(docName, data) {
    if (isFirebaseInitialized && db) {
        try {
            await db.collection('content').doc(docName).set(data, { merge: true });
        } catch (e) {
            console.error('Error saving to Firestore', e);
            showToast('Firebase write failed: ' + e.message, 'error');
        }
    }
    // Save in localStorage as cache/fallback
    localStorage.setItem('snapilla_local_content', JSON.stringify(currentContent));

    // Broadcast sync across tabs in real-time
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('snapilla_sync_channel');
            bc.postMessage({ type: 'content_updated', docName, content: currentContent });
            bc.close();
        }
    } catch (e) {}
}

function getImageUrl(imgPath) {
    if (!imgPath) return '../p1.png';
    if (imgPath.startsWith('data:') || imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        return imgPath;
    }
    return '../' + imgPath.replace(/^\//, '');
}

function handleImageFileInput(fileInputId, textInputId) {
    const fileInput = document.getElementById(fileInputId);
    const textInput = document.getElementById(textInputId);
    if (fileInput && textInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    textInput.value = event.target.result;
                    showToast('Image loaded', 'info');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Mobile sidebar toggle & backdrop
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.toggle('active', isOpen);
        }
    });
}

if (sidebarBackdrop && sidebar) {
    sidebarBackdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('active');
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
