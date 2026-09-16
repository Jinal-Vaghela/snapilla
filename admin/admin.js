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
function getAdminCredentials() {
    try {
        const stored = localStorage.getItem('snapilla_admin_creds');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
        email: "admin@snapilla.com",
        password: "snapilla2026"
    };
}

function saveAdminCredentials(email, password) {
    localStorage.setItem('snapilla_admin_creds', JSON.stringify({ email, password }));
}

// ----------------------------------------------------
// 1. AUTHENTICATION HANDLING
// ----------------------------------------------------
function initAuth() {
    const sessionActive = sessionStorage.getItem('snapilla_admin_session');

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
}

function showApp(email) {
    authWrapper.style.display = 'none';
    adminApp.style.display = 'flex';
    userEmailText.textContent = email;
    sessionStorage.setItem('snapilla_admin_session', 'true');
}

// Login Submit
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputEmail = document.getElementById('loginEmail').value.trim();
        const inputPassword = document.getElementById('loginPassword').value;
        authError.style.display = 'none';

        const adminCreds = getAdminCredentials();

        // Check if input matches master admin credentials or custom credentials
        const matchesLocal = (inputEmail.toLowerCase() === adminCreds.email.toLowerCase() && inputPassword === adminCreds.password);

        if (isFirebaseInitialized && auth) {
            try {
                // Try logging in with Firebase
                await auth.signInWithEmailAndPassword(inputEmail, inputPassword);
                showToast('Welcome back, Admin!', 'success');
            } catch (err) {
                // If account doesn't exist in Firebase yet but matches master credentials, create it automatically
                if (matchesLocal || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                    try {
                        await auth.createUserWithEmailAndPassword(inputEmail, inputPassword);
                        showToast('Admin Account Initialized and Logged In!', 'success');
                    } catch (createErr) {
                        // Fallback to local session login
                        if (matchesLocal) {
                            showApp(inputEmail);
                            loadAllContent();
                            loadBookings();
                            showToast('Logged In Successfully', 'success');
                        } else {
                            authError.textContent = 'Incorrect Admin ID or Password.';
                            authError.style.display = 'block';
                        }
                    }
                } else {
                    authError.textContent = err.message || 'Incorrect Admin ID or Password.';
                    authError.style.display = 'block';
                }
            }
        } else {
            // Standalone mode validation
            if (matchesLocal) {
                showApp(inputEmail);
                loadAllContent();
                showToast('Welcome to Snapilla Admin Dashboard!', 'success');
            } else {
                authError.textContent = 'Incorrect Admin ID or Password. Default: admin@snapilla.com / snapilla2026';
                authError.style.display = 'block';
            }
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
    'tab-settings': 'Hero & Site Settings',
    'tab-services': 'Photography Services / Expertise',
    'tab-portfolio': '3D Rotating Portfolio Photos',
    'tab-pricing': 'Investment / Pricing Plans',
    'tab-testimonials': 'Client Reviews & Marquee',
    'tab-faq': 'Frequently Asked Questions',
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
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tabId = link.dataset.tab;
        if (tabId) switchTab(tabId);
    });
});

// ----------------------------------------------------
// 3. FIRESTORE DATA SYNC
// ----------------------------------------------------
async function loadAllContent() {
    if (isFirebaseInitialized && db) {
        try {
            // Settings
            const setSnap = await db.collection('content').doc('settings').get();
            if (setSnap.exists) currentContent.settings = setSnap.data();

            // Services
            const servSnap = await db.collection('content').doc('services').get();
            if (servSnap.exists && Array.isArray(servSnap.data().items)) {
                currentContent.services = servSnap.data().items;
            }

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
        } catch (e) {
            console.warn('Error reading from Firestore, using cached/default data', e);
        }
    } else {
        // Read from localStorage if stored locally in demo mode
        const localData = localStorage.getItem('snapilla_local_content');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (parsed.settings) {
                    if (parsed.settings.whatsapp_number === '919876543210' || parsed.settings.whatsapp_number === '919000000000' || !parsed.settings.whatsapp_number) {
                        parsed.settings.whatsapp_number = '918780286850';
                    }
                    if (parsed.settings.phone === '+91 98765 43210' || parsed.settings.phone === '+91 XXXXX XXXXX' || !parsed.settings.phone) {
                        parsed.settings.phone = '+91 87802 86850';
                    }
                }
                currentContent = {
                    ...SNAP_DEFAULT_DATA,
                    ...parsed,
                    settings: { ...SNAP_DEFAULT_DATA.settings, ...(parsed.settings || {}) },
                    services: (parsed.services && parsed.services.length >= 9) ? parsed.services : SNAP_DEFAULT_DATA.services,
                    faqs: (parsed.faqs && parsed.faqs.length >= 7) ? parsed.faqs : SNAP_DEFAULT_DATA.faqs,
                    pricing: (parsed.pricing && parsed.pricing.length > 0) ? parsed.pricing : SNAP_DEFAULT_DATA.pricing,
                    portfolio: (parsed.portfolio && parsed.portfolio.length > 0) ? parsed.portfolio : SNAP_DEFAULT_DATA.portfolio,
                    testimonials: (parsed.testimonials && parsed.testimonials.length > 0) ? parsed.testimonials : SNAP_DEFAULT_DATA.testimonials
                };
                localStorage.setItem('snapilla_local_content', JSON.stringify(currentContent));
            } catch (err) {}
        } else {
            currentContent = JSON.parse(JSON.stringify(SNAP_DEFAULT_DATA));
        }
    }

    renderAllViews();
}

function renderAllViews() {
    renderSettingsView();
    renderServicesView();
    renderPortfolioView();
    renderPricingView();
    renderTestimonialsView();
    renderFaqView();
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
    const s = currentContent.settings;
    document.getElementById('setHeroTitle').value = s.hero_title || '';
    document.getElementById('setHeroSubtitle').value = s.hero_subtitle || '';
    document.getElementById('setWhatsapp').value = s.whatsapp_number || '';
    document.getElementById('setPhone').value = s.phone || '';
    document.getElementById('setEmail').value = s.email || '';
    document.getElementById('setAddress').value = s.address || '';
    document.getElementById('setInstagram').value = s.instagram_url || '';
    document.getElementById('setFacebook').value = s.facebook_url || '';
    document.getElementById('setYoutube').value = s.youtube_url || '';
    document.getElementById('setTagline').value = s.tagline || '';

    const adminCreds = getAdminCredentials();
    const adminEmailInput = document.getElementById('setAdminEmail');
    const adminPassInput = document.getElementById('setAdminPassword');
    if (adminEmailInput) adminEmailInput.value = adminCreds.email;
    if (adminPassInput) adminPassInput.value = adminCreds.password;
}

const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.settings = {
            hero_title: document.getElementById('setHeroTitle').value,
            hero_subtitle: document.getElementById('setHeroSubtitle').value,
            whatsapp_number: document.getElementById('setWhatsapp').value,
            phone: document.getElementById('setPhone').value,
            email: document.getElementById('setEmail').value,
            address: document.getElementById('setAddress').value,
            instagram_url: document.getElementById('setInstagram').value,
            facebook_url: document.getElementById('setFacebook').value,
            youtube_url: document.getElementById('setYoutube').value,
            tagline: document.getElementById('setTagline').value
        };

        const newAdminEmail = document.getElementById('setAdminEmail')?.value.trim();
        const newAdminPass = document.getElementById('setAdminPassword')?.value;
        if (newAdminEmail && newAdminPass) {
            saveAdminCredentials(newAdminEmail, newAdminPass);
            if (activeUser && auth && isFirebaseInitialized) {
                try {
                    await activeUser.updatePassword(newAdminPass);
                } catch (passErr) {
                    console.warn('Firebase password update note:', passErr);
                }
            }
        }

        await saveDoc('settings', currentContent.settings);
        showToast('Site & Admin Settings Saved Successfully!', 'success');
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
        currentContent.services.splice(index, index + 1);
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
// 10. BOOKING INQUIRIES
// ----------------------------------------------------
async function loadBookings() {
    const tbody = document.getElementById('bookingTableBody');
    const badge = document.getElementById('badgeBookingCount');
    const statBookings = document.getElementById('statBookings');

    if (!tbody) return;

    if (isFirebaseInitialized && db) {
        try {
            const snap = await db.collection('bookings').orderBy('timestamp', 'desc').get();
            const bookings = [];
            snap.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));

            if (badge) badge.textContent = bookings.length;
            if (statBookings) statBookings.textContent = bookings.length;

            if (bookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No booking inquiries yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = bookings.map(b => {
                const dateStr = b.timestamp ? new Date(b.timestamp.toDate ? b.timestamp.toDate() : b.timestamp).toLocaleDateString() : 'Recent';
                return `
                    <tr>
                        <td>${dateStr}</td>
                        <td><strong>${b.name || 'Anonymous'}</strong></td>
                        <td><span class="badge-pill badge-warning">${b.shootType || 'Photography'}</span></td>
                        <td>${b.date || 'Flexible'}</td>
                        <td>
                            <div>${b.phone || ''}</div>
                            <small style="color: var(--text-muted);">${b.email || ''}</small>
                        </td>
                        <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-muted);">${b.message || 'No message'}</td>
                        <td>
                            <a href="https://wa.me/${(b.phone || '').replace(/\D/g, '')}" target="_blank" class="btn btn-primary btn-sm" title="Chat on WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <button class="btn btn-danger btn-sm" onclick="deleteBooking('${b.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.warn('Error loading bookings', e);
        }
    }
}

async function deleteBooking(id) {
    if (confirm('Delete this booking record?')) {
        if (isFirebaseInitialized && db) {
            await db.collection('bookings').doc(id).delete();
            loadBookings();
            showToast('Booking record deleted', 'info');
        }
    }
}

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
        if (confirm('Reset and seed all latest Snapilla content (Hero, all 9 Services, 3D Portfolio, Pricing, Testimonials, FAQ)?')) {
            currentContent = JSON.parse(JSON.stringify(SNAP_DEFAULT_DATA));
            await saveDoc('settings', SNAP_DEFAULT_DATA.settings);
            await saveDoc('services', { items: SNAP_DEFAULT_DATA.services });
            await saveDoc('portfolio', { items: SNAP_DEFAULT_DATA.portfolio });
            await saveDoc('pricing', { items: SNAP_DEFAULT_DATA.pricing });
            await saveDoc('testimonials', { items: SNAP_DEFAULT_DATA.testimonials });
            await saveDoc('faqs', { items: SNAP_DEFAULT_DATA.faqs });

            renderAllViews();
            showToast('All default content successfully seeded and updated!', 'success');
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
    // Also save in localStorage as cache/fallback
    localStorage.setItem('snapilla_local_content', JSON.stringify(currentContent));
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

// Mobile sidebar toggle
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const sidebar = document.getElementById('sidebar');
if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
