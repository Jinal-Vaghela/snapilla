document.addEventListener('DOMContentLoaded', () => {
    // Current Site Settings state
    let liveSettings = (typeof SNAP_DEFAULT_DATA !== 'undefined') ? SNAP_DEFAULT_DATA.settings : {
        whatsapp_number: '918780286850'
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

    // Function to show on-page feedback toast
    function showBookingToast(message, isSuccess = true) {
        let toast = document.getElementById('snapilla-booking-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'snapilla-booking-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #111;
                color: #fff;
                padding: 16px 24px;
                border-radius: 12px;
                border-left: 5px solid #FF9800;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                font-family: 'Poppins', sans-serif;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.4s ease;
                transform: translateY(100px);
                opacity: 0;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="font-size: 1.3rem;">${isSuccess ? '✅' : 'ℹ️'}</span> <div><strong>${message}</strong></div>`;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 5000);
    }

    // 3. Booking Form - Instant Lead Capture & Direct WhatsApp Connection
    const bookingForm = document.getElementById('bookingForm');
    const btnSubmitBooking = document.getElementById('btnSubmitBooking');

    function handleBookingSubmit(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const name = (document.getElementById('name')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const phone = (document.getElementById('phone')?.value || '').trim();
        const shootType = document.getElementById('shootType')?.value || 'General Studio Inquiry';
        const date = document.getElementById('date')?.value || '';
        const message = (document.getElementById('message')?.value || '').trim();

        const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const formattedDate = new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        const leadRecord = {
            id: leadId,
            name: name || 'Website Visitor',
            email: email || 'Not provided',
            phone: phone || 'Not provided',
            shootType: shootType,
            date: date || 'Flexible',
            message: message || 'Inquired via website booking form',
            source: 'Website Booking Form',
            status: 'New Lead',
            submittedAt: formattedDate,
            timestamp: Date.now()
        };

        // 1. Immediately save lead to LocalStorage cache
        try {
            const existingLeads = JSON.parse(localStorage.getItem('snapilla_bookings_leads') || '[]');
            existingLeads.unshift(leadRecord);
            localStorage.setItem('snapilla_bookings_leads', JSON.stringify(existingLeads));
        } catch (err) {
            console.warn('LocalStorage lead cache error:', err);
        }

        // 2. Save lead to Firebase Firestore in background
        try {
            if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized && db) {
                db.collection('bookings').doc(leadId).set({
                    ...leadRecord,
                    timestamp: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
                }).catch(err => console.warn('Firestore err', err));
            }
        } catch (fbErr) {
            console.warn('Firestore set error:', fbErr);
        }

        // 3. Show instant confirmation toast
        showBookingToast('Opening WhatsApp to connect with Snapilla Studio...');

        // 4. Prepare WhatsApp booking message text
        const lines = [
            "📸 *NEW BOOKING INQUIRY - SNAPILLA STUDIO*",
            "━━━━━━━━━━━━━━━━━━━━━",
            `👤 *Name:* ${name || 'Not provided'}`,
            `📧 *Email:* ${email || 'Not provided'}`,
            `📞 *Phone:* ${phone || 'Not provided'}`,
            `🎯 *Shoot Type:* ${shootType}`,
            `📅 *Preferred Date:* ${date || 'Flexible'}`,
            `💬 *Details:* ${message || 'Looking forward to booking my shoot!'}`,
            "━━━━━━━━━━━━━━━━━━━━━",
            "✨ _Sent directly via Snapilla Studio Website_"
        ];
        const whatsappText = encodeURIComponent(lines.join('\n'));
        const rawNumber = (liveSettings && liveSettings.whatsapp_number) ? liveSettings.whatsapp_number : '918780286850';
        const targetPhone = rawNumber.replace(/\D/g, '') || '918780286850';
        const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappText}`;

        // 5. Open WhatsApp directly via link click (unblockable by popup blockers)
        try {
            const waLink = document.createElement('a');
            waLink.href = whatsappUrl;
            waLink.target = '_blank';
            waLink.rel = 'noopener noreferrer';
            document.body.appendChild(waLink);
            waLink.click();
            setTimeout(() => waLink.remove(), 200);
        } catch (navErr) {
            window.location.href = whatsappUrl;
        }

        return false;
    }

    // Expose globally for inline onclick backup
    window.handleBookingSubmit = handleBookingSubmit;

    if (btnSubmitBooking) {
        btnSubmitBooking.addEventListener('click', handleBookingSubmit);
    }
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // 3B. Wire "Book Plan", Studio Visit & "Book Service" buttons to redirect/scroll to form
    function wireBookingTriggers() {
        // Handle all booking triggers and links pointing to #booking
        document.querySelectorAll('.price-btn, .btn-service-book, .btn-studio-wa, #studioBookBtn, a[href="#booking"]').forEach(btn => {
            if (btn.dataset.bookingBound) return;
            btn.dataset.bookingBound = 'true';

            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const isStudioBtn = btn.classList.contains('btn-studio-wa') || btn.id === 'studioBookBtn';
                const card = btn.closest('.pricing-card, .service-detail-card, .camera-unit');
                let planOrService = '';
                if (card) {
                    const titleEl = card.querySelector('h3');
                    if (titleEl) planOrService = titleEl.textContent.trim();
                }

                const bookingSection = document.getElementById('booking');
                const shootTypeSelect = document.getElementById('shootType');
                const messageTextarea = document.getElementById('message');
                const nameInput = document.getElementById('name');

                if (isStudioBtn) {
                    if (messageTextarea && (!messageTextarea.value || messageTextarea.value.trim() === '')) {
                        messageTextarea.value = "Hello Snapilla Studio! I would like to book an appointment / photography session at your studio.";
                    }
                } else if (planOrService && shootTypeSelect) {
                    let matched = false;
                    for (let i = 0; i < shootTypeSelect.options.length; i++) {
                        if (shootTypeSelect.options[i].text.toLowerCase().includes(planOrService.toLowerCase()) ||
                            shootTypeSelect.options[i].value.toLowerCase().includes(planOrService.toLowerCase())) {
                            shootTypeSelect.selectedIndex = i;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched && messageTextarea && (!messageTextarea.value || messageTextarea.value.trim() === '')) {
                        messageTextarea.value = `Hi Snapilla Team! I am interested in booking the "${planOrService}".`;
                    }
                }

                // Smooth scroll to booking form
                if (bookingSection) {
                    bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                // Focus name input after scroll completes
                if (nameInput) {
                    setTimeout(() => {
                        nameInput.focus();
                        nameInput.classList.add('highlight-pulse');
                        setTimeout(() => nameInput.classList.remove('highlight-pulse'), 1200);
                    }, 500);
                }
            });
        });
    }

    wireBookingTriggers();

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

        if (data.whatsapp_number) {
            const rawWa = data.whatsapp_number.replace(/\D/g, '');
            const cleanText = encodeURIComponent("Hello Snapilla Studio! I would like to inquire about booking a photoshoot session.");
            document.querySelectorAll('a[href*="wa.me"]').forEach(waBtn => {
                waBtn.href = `https://wa.me/${rawWa}?text=${cleanText}`;
            });
        }

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
            wireBookingTriggers();
        }
    }

    function updateFaqDOM(faqsList) {
        if (!Array.isArray(faqsList) || faqsList.length === 0) return;
        const container = document.getElementById('faqContainer');
        if (container) {
            container.innerHTML = faqsList.map(item => `
                <div class="faq-card">
                    <h4><i class="fas fa-question-circle" style="color: #FF9800;"></i> ${item.question}</h4>
                    <p>${item.answer}</p>
                </div>
            `).join('');
        }
    }

    function updateWhyUsDOM(data) {
        if (!data) return;
        const whyTitle = document.getElementById('whyTitle');
        if (whyTitle && data.title) whyTitle.textContent = data.title;

        const whySubtitle = document.getElementById('whySubtitle');
        if (whySubtitle && data.subtitle) whySubtitle.textContent = data.subtitle;

        const whyQuote = document.getElementById('whyQuote');
        if (whyQuote && data.quote) whyQuote.textContent = `“${data.quote}”`;

        if (Array.isArray(data.pillars) && data.pillars.length > 0) {
            const grid = document.getElementById('whyPillarsGrid');
            if (grid) {
                grid.innerHTML = data.pillars.map(p => `
                    <div class="why-pillar-card">
                        <span class="why-pillar-icon">${p.icon || '📸'}</span>
                        <h3>${p.title}</h3>
                        <p>${p.desc}</p>
                    </div>
                `).join('');
            }
        }
    }

    function updateExperienceDOM(data) {
        if (!data) return;
        const expTitle = document.getElementById('expTitle');
        if (expTitle && data.title) expTitle.textContent = data.title;

        const expSubtitle = document.getElementById('expSubtitle');
        if (expSubtitle && data.subtitle) expSubtitle.textContent = data.subtitle;

        if (Array.isArray(data.steps) && data.steps.length > 0) {
            const grid = document.getElementById('experienceGrid');
            if (grid) {
                grid.innerHTML = data.steps.map(s => `
                    <div class="experience-step-card">
                        <div class="step-number">${s.number || '01'}</div>
                        <h3>${s.title}</h3>
                        <p>${s.desc}</p>
                    </div>
                `).join('');
            }
        }
    }

    function updateStudioDOM(data) {
        if (!data) return;
        const badge = document.getElementById('studioBadge');
        if (badge && data.badge) badge.textContent = data.badge;

        const title = document.getElementById('studioTitle');
        if (title && data.title) title.textContent = data.title;

        const desc = document.getElementById('studioDesc');
        if (desc && data.desc) desc.innerHTML = data.desc.replace(/\n/g, '<br>');

        const weekday = document.getElementById('studioHoursWeekday');
        if (weekday && data.hours_weekday) weekday.textContent = data.hours_weekday;

        const sunday = document.getElementById('studioHoursSunday');
        if (sunday && data.hours_sunday) sunday.textContent = data.hours_sunday;

        const notice = document.getElementById('studioNotice');
        if (notice && data.notice) notice.textContent = data.notice;

        const mapsBtn = document.getElementById('studioMapsBtn');
        if (mapsBtn && data.maps_url) mapsBtn.href = data.maps_url;
    }

    function updateAboutDOM(data) {
        if (!data) return;
        const title = document.getElementById('aboutTitle');
        if (title && data.title) title.textContent = data.title;

        const p1 = document.getElementById('aboutP1');
        if (p1 && data.p1) p1.innerHTML = data.p1;

        const p2 = document.getElementById('aboutP2');
        if (p2 && data.p2) p2.innerHTML = data.p2;

        const mTitle = document.getElementById('aboutMissionTitle');
        if (mTitle && data.mission_title) mTitle.textContent = data.mission_title;

        const mDesc = document.getElementById('aboutMissionDesc');
        if (mDesc && data.mission_desc) mDesc.textContent = data.mission_desc;

        const vTitle = document.getElementById('aboutVisionTitle');
        if (vTitle && data.vision_title) vTitle.textContent = data.vision_title;

        const vDesc = document.getElementById('aboutVisionDesc');
        if (vDesc && data.vision_desc) vDesc.textContent = data.vision_desc;
    }

    function updateFinalCtaDOM(data) {
        if (!data) return;
        const title = document.getElementById('finalCtaTitle');
        if (title && data.title) title.textContent = data.title;

        const desc = document.getElementById('finalCtaDesc');
        if (desc && data.desc) desc.innerHTML = data.desc.replace(/\n/g, '<br>');
    }

    // 6. Connect Real-time Listeners or fetch cached data
    function initDynamicContent() {
        // Check local storage cache first
        try {
            const localData = localStorage.getItem('snapilla_local_content');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.settings) {
                    if (parsed.settings.whatsapp_number === '919876543210' || parsed.settings.whatsapp_number === '919000000000' || !parsed.settings.whatsapp_number) {
                        parsed.settings.whatsapp_number = '918780286850';
                    }
                    if (parsed.settings.phone === '+91 98765 43210' || parsed.settings.phone === '+91 XXXXX XXXXX' || !parsed.settings.phone) {
                        parsed.settings.phone = '+91 87802 86850';
                    }
                    localStorage.setItem('snapilla_local_content', JSON.stringify(parsed));
                }
                if (parsed.settings) updateSettingsDOM(parsed.settings);
                if (parsed.why_us) updateWhyUsDOM(parsed.why_us);
                if (parsed.services) updateServicesDOM(parsed.services);
                if (parsed.experience) updateExperienceDOM(parsed.experience);
                if (parsed.studio_info) updateStudioDOM(parsed.studio_info);
                if (parsed.about_us) updateAboutDOM(parsed.about_us);
                if (parsed.portfolio) updatePortfolioDOM(parsed.portfolio);
                if (parsed.pricing) updatePricingDOM(parsed.pricing);
                if (parsed.testimonials) updateTestimonialsDOM(parsed.testimonials);
                if (parsed.faqs) updateFaqDOM(parsed.faqs);
                if (parsed.final_cta) updateFinalCtaDOM(parsed.final_cta);
            }
        } catch (err) {}

        // If Firebase is configured, connect real-time Firestore listeners
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized && db) {
            // Realtime Settings
            db.collection('content').doc('settings').onSnapshot(doc => {
                if (doc.exists) updateSettingsDOM(doc.data());
            }, err => console.warn('Settings listener error', err));

            // Realtime Why Us
            db.collection('content').doc('why_us').onSnapshot(doc => {
                if (doc.exists) updateWhyUsDOM(doc.data());
            }, err => console.warn('Why Us listener error', err));

            // Realtime Services
            db.collection('content').doc('services').onSnapshot(doc => {
                if (doc.exists && doc.data().items) updateServicesDOM(doc.data().items);
            }, err => console.warn('Services listener error', err));

            // Realtime Experience Steps
            db.collection('content').doc('experience').onSnapshot(doc => {
                if (doc.exists) updateExperienceDOM(doc.data());
            }, err => console.warn('Experience listener error', err));

            // Realtime Studio Info
            db.collection('content').doc('studio_info').onSnapshot(doc => {
                if (doc.exists) updateStudioDOM(doc.data());
            }, err => console.warn('Studio listener error', err));

            // Realtime About Us
            db.collection('content').doc('about_us').onSnapshot(doc => {
                if (doc.exists) updateAboutDOM(doc.data());
            }, err => console.warn('About Us listener error', err));

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

            // Realtime Final CTA
            db.collection('content').doc('final_cta').onSnapshot(doc => {
                if (doc.exists) updateFinalCtaDOM(doc.data());
            }, err => console.warn('Final CTA listener error', err));
        }
    }

    initDynamicContent();
});
