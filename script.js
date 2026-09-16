document.addEventListener('DOMContentLoaded', () => {
    // Current Site Settings state
    let liveSettings = (typeof SNAP_DEFAULT_DATA !== 'undefined') ? SNAP_DEFAULT_DATA.settings : {
        whatsapp_number: '919000000000'
    };

    // 1. Navbar scroll & Mobile Menu Toggle
    const nav = document.querySelector('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    // 2. Lightbox Gallery Setup
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.lightbox-close');

    function attachLightboxHandlers() {
        const cards = document.querySelectorAll('.portfolio-card, .portfolio-item');
        cards.forEach(item => {
            if (item.dataset.lightboxBound) return;
            item.dataset.lightboxBound = 'true';

            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img && lightbox && lightboxImg) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    if (closeLightbox && lightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    attachLightboxHandlers();

    // 3. Booking Form - WhatsApp & Firestore Integration
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const shootType = document.getElementById('shootType')?.value || '';
            const date = document.getElementById('date')?.value || '';
            const message = document.getElementById('message')?.value || '';

            // Save lead in Firebase Firestore if initialized
            if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized && db) {
                try {
                    await db.collection('bookings').add({
                        name,
                        email,
                        phone,
                        shootType,
                        date,
                        message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (err) {
                    console.warn('Could not save booking to Firestore', err);
                }
            }

            // Prepare WhatsApp message
            const whatsappText = `*New Booking Request - Snapilla Studio*%0A%0A` +
                                `*Name:* ${encodeURIComponent(name)}%0A` +
                                `*Email:* ${encodeURIComponent(email)}%0A` +
                                `*Phone:* ${encodeURIComponent(phone)}%0A` +
                                `*Shoot Type:* ${encodeURIComponent(shootType)}%0A` +
                                `*Preferred Date:* ${encodeURIComponent(date)}%0A` +
                                `*Message:* ${encodeURIComponent(message)}`;

            const targetPhone = (liveSettings.whatsapp_number || '919000000000').replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappText}`;

            window.open(whatsappUrl, '_blank');
            bookingForm.reset();
        });
    }

    // 4. Scroll reveal animation
    const observerOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    function observeElements() {
        document.querySelectorAll('.service-card, .portfolio-item, .section-title').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            revealObserver.observe(el);
        });
    }

    observeElements();

    // ----------------------------------------------------
    // 5. DYNAMIC DATA HYDRATION (FIREBASE & LOCAL CACHE)
    // ----------------------------------------------------
    function updateSettingsDOM(data) {
        if (!data) return;
        liveSettings = { ...liveSettings, ...data };

        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle && data.hero_title) heroTitle.textContent = data.hero_title;

        const heroSubtitle = document.getElementById('heroSubtitle');
        if (heroSubtitle && data.hero_subtitle) heroSubtitle.textContent = data.hero_subtitle;

        const contactAddress = document.getElementById('contactAddress');
        if (contactAddress && data.address) contactAddress.textContent = `📍 ${data.address}`;

        const contactPhone = document.getElementById('contactPhone');
        if (contactPhone && data.phone) contactPhone.textContent = `📞 ${data.phone}`;

        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail && data.email) contactEmail.textContent = `📧 ${data.email}`;

        const footerTagline = document.getElementById('footerTagline');
        if (footerTagline && data.tagline) footerTagline.textContent = `“${data.tagline}”`;

        const socialContainer = document.getElementById('socialLinks');
        if (socialContainer) {
            let html = '';
            if (data.instagram_url) html += `<a href="${data.instagram_url}" target="_blank"><i class="fab fa-instagram"></i></a>`;
            if (data.facebook_url) html += `<a href="${data.facebook_url}" target="_blank"><i class="fab fa-facebook"></i></a>`;
            if (data.youtube_url) html += `<a href="${data.youtube_url}" target="_blank"><i class="fab fa-youtube"></i></a>`;
            if (html) socialContainer.innerHTML = html;
        }
    }

    function updateServicesDOM(servicesList) {
        if (!Array.isArray(servicesList) || servicesList.length === 0) return;
        const grid = document.getElementById('servicesGrid');
        if (grid) {
            grid.innerHTML = servicesList.map(item => `
                <div class="camera-unit reveal">
                    <div class="boxy-camera-shell" style="background: ${item.background_color || '#FFCA28'};">
                        <div class="boxy-screen"><img src="${item.image}" alt="${item.title}"></div>
                    </div>
                    <div class="camera-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    function updatePortfolioDOM(photosList) {
        if (!Array.isArray(photosList) || photosList.length === 0) return;
        const spinner = document.getElementById('portfolioSpinner');
        if (spinner) {
            const total = photosList.length;
            const angleStep = 360 / total;
            spinner.innerHTML = photosList.map((photo, index) => {
                const rot = index * angleStep;
                return `
                    <div class="portfolio-card" style="transform: rotateY(${rot}deg) translateZ(500px);">
                        <img src="${photo.image}" alt="${photo.alt || photo.title || 'Photography Album'}">
                    </div>
                `;
            }).join('');
            attachLightboxHandlers();
        }
    }

    function updateTestimonialsDOM(reviewsList) {
        if (!Array.isArray(reviewsList) || reviewsList.length === 0) return;
        const row1Reviews = reviewsList.filter(r => (r.row == 1 || !r.row));
        const row2Reviews = reviewsList.filter(r => r.row == 2);

        const buildCards = (list) => {
            const itemsHtml = list.map(item => `
                <div class="testimonial-card">
                    <p>“${item.quote}”</p>
                    <div class="clint-info">
                        <div class="clint-avatar"></div>
                        <div class="clint-details">
                            <h4>${item.name}</h4>
                            <p>${item.role}</p>
                        </div>
                    </div>
                </div>
            `).join('');
            // Double for infinite marquee effect
            return itemsHtml + itemsHtml;
        };

        const track1 = document.getElementById('testimonialTrack1');
        if (track1 && row1Reviews.length > 0) {
            track1.innerHTML = buildCards(row1Reviews);
        }

        const track2 = document.getElementById('testimonialTrack2');
        if (track2 && row2Reviews.length > 0) {
            track2.innerHTML = buildCards(row2Reviews);
        }
    }

    function updatePricingDOM(plansList) {
        if (!Array.isArray(plansList) || plansList.length === 0) return;
        const table = document.getElementById('pricingTable');
        if (table) {
            table.innerHTML = plansList.map(plan => {
                const featuresList = (plan.features || []).map(f => {
                    const featText = typeof f === 'object' ? (f.feature || '') : f;
                    return `<li><i class="fas fa-check"></i> ${featText}</li>`;
                }).join('');

                const popularBadge = plan.popular ? '<div class="popular-tag">Popular</div>' : '';

                return `
                    <div class="pricing-card">
                        ${popularBadge}
                        <div style="font-size: 2.5rem; margin-bottom: 20px;">${plan.icon || '📸'}</div>
                        <h3 style="font-size: 1.8rem; margin-bottom: 10px;">${plan.title}</h3>
                        <p style="color: #666; font-size: 0.9rem;">${plan.subtitle || ''}</p>
                        <div style="font-size: 2.5rem; font-weight: 800; margin: 20px 0;">${plan.price}</div>
                        <ul class="pricing-list">
                            ${featuresList}
                        </ul>
                        <a href="#booking" class="price-btn" style="text-decoration: none; text-align: center; display: block; box-sizing: border-box;">Book Plan</a>
                    </div>
                `;
            }).join('');
        }
    }

    function updateFaqDOM(faqsList) {
        if (!Array.isArray(faqsList) || faqsList.length === 0) return;
        const container = document.getElementById('faqContainer');
        if (container) {
            container.innerHTML = faqsList.map(item => `
                <div style="margin-bottom: 30px;">
                    <h4 style="color: var(--primary-color);">Q: ${item.question}</h4>
                    <p>👉 ${item.answer}</p>
                </div>
            `).join('');
        }
    }

    // 6. Connect Real-time Listeners or fetch cached data
    function initDynamicContent() {
        // Check local storage cache first
        try {
            const localData = localStorage.getItem('snapilla_local_content');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.settings) updateSettingsDOM(parsed.settings);
                if (parsed.services) updateServicesDOM(parsed.services);
                if (parsed.portfolio) updatePortfolioDOM(parsed.portfolio);
                if (parsed.pricing) updatePricingDOM(parsed.pricing);
                if (parsed.testimonials) updateTestimonialsDOM(parsed.testimonials);
                if (parsed.faqs) updateFaqDOM(parsed.faqs);
            }
        } catch (err) {}

        // If Firebase is configured, connect real-time Firestore listeners
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized && db) {
            // Realtime Settings
            db.collection('content').doc('settings').onSnapshot(doc => {
                if (doc.exists) updateSettingsDOM(doc.data());
            }, err => console.warn('Settings listener error', err));

            // Realtime Services
            db.collection('content').doc('services').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updateServicesDOM(doc.data().items);
            }, err => console.warn('Services listener error', err));

            // Realtime Portfolio
            db.collection('content').doc('portfolio').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updatePortfolioDOM(doc.data().items);
            }, err => console.warn('Portfolio listener error', err));

            // Realtime Pricing
            db.collection('content').doc('pricing').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updatePricingDOM(doc.data().items);
            }, err => console.warn('Pricing listener error', err));

            // Realtime Testimonials
            db.collection('content').doc('testimonials').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updateTestimonialsDOM(doc.data().items);
            }, err => console.warn('Testimonials listener error', err));

            // Realtime FAQs
            db.collection('content').doc('faqs').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updateFaqDOM(doc.data().items);
            }, err => console.warn('FAQs listener error', err));
        }
    }

    initDynamicContent();
});
