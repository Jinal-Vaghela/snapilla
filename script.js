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

    // Hero Section Floating Elements Mouse Parallax
    const heroSec = document.querySelector('.webgl-hero');
    const floatItems = document.querySelectorAll('.hero-floating-elements .floating-item');
    if (heroSec && floatItems.length > 0) {
        heroSec.addEventListener('mousemove', (e) => {
            const rect = heroSec.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            floatItems.forEach((item, idx) => {
                const depth = (idx % 3 + 1) * 14;
                const moveX = -relX * depth;
                const moveY = -relY * depth;
                item.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });

        heroSec.addEventListener('mouseleave', () => {
            floatItems.forEach(item => {
                item.style.transform = '';
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
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                transform: translateY(100px);
                opacity: 0;
                max-width: 90vw;
            `;
            document.body.appendChild(toast);
        }
        toast.style.borderLeftColor = isSuccess ? '#4CAF50' : '#E53935';
        toast.innerHTML = `<span style="font-size: 1.3rem;">${isSuccess ? '✅' : '⚠️'}</span> <div><strong>${message}</strong></div>`;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 4500);
    }

    // Clear error styling on input
    ['name', 'email', 'phone', 'shootType'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => el.classList.remove('field-error'));
            el.addEventListener('change', () => el.classList.remove('field-error'));
        }
    });

    // 3. Booking Form - Instant Lead Capture & Direct WhatsApp Connection
    const bookingForm = document.getElementById('bookingForm');
    const btnSubmitBooking = document.getElementById('btnSubmitBooking');
    let isSubmittingBooking = false;

    function handleBookingSubmit(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Prevent duplicate concurrent submissions
        if (isSubmittingBooking) {
            return false;
        }

        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const phoneEl = document.getElementById('phone');
        const shootTypeEl = document.getElementById('shootType');
        const dateEl = document.getElementById('date');
        const messageEl = document.getElementById('message');

        const name = (nameEl?.value || '').trim();
        const email = (emailEl?.value || '').trim();
        const phone = (phoneEl?.value || '').trim();
        const shootType = (shootTypeEl?.value || '').trim();
        const date = dateEl?.value || '';
        const message = (messageEl?.value || '').trim();

        // Remove previous error highlights
        [nameEl, phoneEl, shootTypeEl].forEach(el => {
            if (el) el.classList.remove('field-error');
        });

        // 1. Validation Checks
        if (!name) {
            if (nameEl) {
                nameEl.classList.add('field-error');
                nameEl.focus();
            }
            showBookingToast('Please enter your Full Name before submitting.', false);
            return false;
        }

        if (!phone) {
            if (phoneEl) {
                phoneEl.classList.add('field-error');
                phoneEl.focus();
            }
            showBookingToast('Please enter your Phone Number / WhatsApp.', false);
            return false;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 7) {
            if (phoneEl) {
                phoneEl.classList.add('field-error');
                phoneEl.focus();
            }
            showBookingToast('Please enter a valid Phone Number (minimum 7 digits).', false);
            return false;
        }

        if (!shootType) {
            if (shootTypeEl) {
                shootTypeEl.classList.add('field-error');
                shootTypeEl.focus();
            }
            showBookingToast('Please select a Photography Service.', false);
            return false;
        }

        // Set submit lock immediately
        isSubmittingBooking = true;
        if (btnSubmitBooking) {
            btnSubmitBooking.disabled = true;
            btnSubmitBooking.style.opacity = '0.7';
        }

        const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const formattedDate = new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        const leadRecord = {
            id: leadId,
            name: name,
            email: email || 'Not provided',
            phone: phone,
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
        showBookingToast('Opening WhatsApp to connect with Snapilla Studio...', true);

        // 4. Prepare WhatsApp booking message text
        const lines = [
            "📸 *NEW BOOKING INQUIRY - SNAPILLA STUDIO*",
            "━━━━━━━━━━━━━━━━━━━━━",
            `👤 *Name:* ${name}`,
            `📧 *Email:* ${email || 'Not provided'}`,
            `📞 *Phone:* ${phone}`,
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

        // Reset submit button after delay
        setTimeout(() => {
            isSubmittingBooking = false;
            if (btnSubmitBooking) {
                btnSubmitBooking.disabled = false;
                btnSubmitBooking.style.opacity = '1';
            }
        }, 3000);

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

    // Expose globally for backup
    window.handleBookingSubmit = handleBookingSubmit;

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
        if (contactAddress && data.address) contactAddress.textContent = data.address;

        const contactPhone = document.getElementById('contactPhone');
        if (contactPhone && data.phone) contactPhone.textContent = data.phone;

        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail && data.email) contactEmail.textContent = data.email;

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
            if (html) socialContainer.innerHTML = html;
        }
    }

    function updateServicesDOM(servicesData) {
        if (!servicesData) return;
        const servicesList = Array.isArray(servicesData) ? servicesData : (servicesData.items || []);
        if (!Array.isArray(servicesList) || servicesList.length === 0) return;

        // 1. Update Boxy Camera Units
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
            observeElements();
        }

        // 2. Update Detailed Services Grid if present
        const detailGrid = document.getElementById('servicesDetailGrid');
        if (detailGrid) {
            detailGrid.innerHTML = servicesList.map(item => {
                const iconMap = {
                    'baby': '👶',
                    'product': '🛍️',
                    'wedding': '💍',
                    'model': '👗',
                    'portrait': '👔',
                    'family': '👨‍👩‍👧',
                    'birthday': '🎂',
                    'couple': '❤️',
                    'creative': '🎨'
                };
                let icon = '📸';
                const lowerTitle = (item.title || '').toLowerCase();
                for (const [k, v] of Object.entries(iconMap)) {
                    if (lowerTitle.includes(k)) { icon = v; break; }
                }

                return `
                    <div class="service-detail-card">
                        <div class="service-card-top">
                            <span class="service-icon-badge">${icon}</span>
                            <h3>${item.title}</h3>
                            <div class="service-tagline" style="color: ${item.background_color || '#E65100'};">${item.title} Experience</div>
                            <p class="service-desc">${item.description}</p>
                        </div>
                        <a href="#booking" class="btn-service-book">Book ${item.title} <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
            }).join('');
            wireBookingTriggers();
        }
    }

    let livePortfolioList = (typeof SNAP_DEFAULT_DATA !== 'undefined' && SNAP_DEFAULT_DATA.portfolio) ? [...SNAP_DEFAULT_DATA.portfolio] : [
        { title: "Photography Album 1", category: "portraits", image: "p1.png", alt: "Signature Portrait Album" },
        { title: "Photography Album 2", category: "family", image: "p2.png", alt: "Family Moments Album" },
        { title: "Photography Album 3", category: "birthdays", image: "p3.png", alt: "Birthday Celebration Album" },
        { title: "Photography Album 4", category: "events", image: "p4.png", alt: "Special Occasion Album" },
        { title: "Baby Shoot Album", category: "baby", image: "baby.png", alt: "Baby & Newborn Album" },
        { title: "Wedding Shoot Album", category: "wedding", image: "wedding.png", alt: "Wedding & Romance Album" },
        { title: "Model Shoot Album", category: "models", image: "modeling.png", alt: "Model & Fashion Album" },
        { title: "Product Shoot Album", category: "products", image: "product.png", alt: "Product Showcase Album" }
    ];
    let currentGalleryFilter = 'all';

    function categorizePhoto(photo) {
        if (photo.category) return photo.category.toLowerCase().trim();
        const str = ((photo.title || '') + ' ' + (photo.alt || '') + ' ' + (photo.image || '')).toLowerCase();
        if (str.includes('baby') || str.includes('newborn') || str.includes('infant') || str.includes('kid')) return 'baby';
        if (str.includes('wedding') || str.includes('bride') || str.includes('groom') || str.includes('marriage') || str.includes('pre-wedding')) return 'wedding';
        if (str.includes('product') || str.includes('commercial') || str.includes('brand') || str.includes('item')) return 'products';
        if (str.includes('model') || str.includes('fashion') || str.includes('portfolio') || str.includes('lookbook')) return 'models';
        if (str.includes('portrait') || str.includes('headshot') || str.includes('executive') || str.includes('p1')) return 'portraits';
        if (str.includes('couple') || str.includes('romance') || str.includes('love') || str.includes('engagement')) return 'couples';
        if (str.includes('family') || str.includes('generations') || str.includes('p2')) return 'family';
        if (str.includes('birthday') || str.includes('cake') || str.includes('p3')) return 'birthdays';
        if (str.includes('event') || str.includes('occasion') || str.includes('celebration') || str.includes('p4')) return 'events';
        return 'all';
    }

    function renderFilteredPortfolio(category) {
        currentGalleryFilter = category || 'all';
        const spinner = document.getElementById('portfolioSpinner');
        if (!spinner) return;

        let displayItems = livePortfolioList;
        if (currentGalleryFilter !== 'all') {
            const normalized = currentGalleryFilter.toLowerCase().trim();
            const filtered = livePortfolioList.filter(item => {
                const itemCat = categorizePhoto(item);
                return itemCat === normalized || 
                       itemCat.startsWith(normalized.replace(/s$/, '')) || 
                       normalized.includes(itemCat) ||
                       itemCat.includes(normalized.replace(/s$/, ''));
            });

            if (filtered.length > 0) {
                displayItems = filtered;
            }
        }

        const total = displayItems.length;
        const radius = window.innerWidth < 768 ? 230 : (window.innerWidth < 992 ? 350 : 500);
        const angleStep = 360 / Math.max(total, 1);

        spinner.innerHTML = displayItems.map((photo, index) => {
            const rot = index * angleStep;
            return `
                <div class="portfolio-card" data-category="${categorizePhoto(photo)}" style="transform: rotateY(${rot}deg) translateZ(${radius}px);">
                    <img src="${photo.image}" alt="${photo.alt || photo.title || 'Photography Album'}">
                </div>
            `;
        }).join('');

        attachLightboxHandlers();
    }

    function updatePortfolioDOM(photosData) {
        if (!photosData) return;
        const photosList = Array.isArray(photosData) ? photosData : (photosData.items || []);
        if (!Array.isArray(photosList) || photosList.length === 0) return;
        livePortfolioList = photosList;
        renderFilteredPortfolio(currentGalleryFilter);
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
                const rawPrice = (plan.price !== undefined && plan.price !== null) ? plan.price.toString().trim() : '';
                const displayPrice = rawPrice.startsWith('₹') ? rawPrice : `₹${rawPrice}`;

                return `
                    <div class="pricing-card">
                        ${popularBadge}
                        <div style="font-size: 2.5rem; margin-bottom: 20px;">${plan.icon || '📸'}</div>
                        <h3 style="font-size: 1.8rem; margin-bottom: 10px;">${plan.title}</h3>
                        <p style="color: #666; font-size: 0.9rem;">${plan.subtitle || ''}</p>
                        <div style="font-size: 2.5rem; font-weight: 800; margin: 20px 0;">${displayPrice}</div>
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
                        <div class="step-number">${s.step || s.number || '01'}</div>
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

        const contactHours = document.getElementById('contactHours');
        if (contactHours && (data.hours_weekday || data.hours_sunday)) {
            const wk = data.hours_weekday || '10:00 AM – 8:00 PM';
            const sun = data.hours_sunday || '10:00 AM – 6:00 PM';
            contactHours.textContent = `Mon – Sat: ${wk} | Sun: ${sun}`;
        }

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

    // Master function to apply entire content state to DOM
    function applyAllContent(parsed) {
        if (!parsed) return;
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

    // Helper to get local cached content
    function getStoredLocalContent() {
        try {
            const raw = localStorage.getItem('snapilla_local_content');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return null;
    }

    function saveLocalContentCache(key, val) {
        try {
            let current = getStoredLocalContent() || JSON.parse(JSON.stringify(typeof SNAP_DEFAULT_DATA !== 'undefined' ? SNAP_DEFAULT_DATA : {}));
            current[key] = val;
            localStorage.setItem('snapilla_local_content', JSON.stringify(current));
        } catch (e) {}
    }

    // 6. Connect Real-time Listeners & fetch cached data
    function initDynamicContent() {
        // 1. Check local storage cache first and apply immediately
        const localData = getStoredLocalContent();
        if (localData) {
            applyAllContent(localData);
        } else if (typeof SNAP_DEFAULT_DATA !== 'undefined') {
            applyAllContent(SNAP_DEFAULT_DATA);
        }

        // 2. Real-time Cross-Tab Synchronization (Live update without refresh!)
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('snapilla_sync_channel');
                bc.onmessage = (event) => {
                    if (event.data && event.data.content) {
                        applyAllContent(event.data.content);
                    }
                };
            }
        } catch (e) {}

        window.addEventListener('storage', (e) => {
            if (e.key === 'snapilla_local_content' && e.newValue) {
                try {
                    const updated = JSON.parse(e.newValue);
                    applyAllContent(updated);
                } catch (err) {}
            }
        });

        // 3. If Firebase is configured, connect real-time Firestore listeners
        if (typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized && db) {
            // Realtime Settings
            db.collection('content').doc('settings').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateSettingsDOM(d);
                    saveLocalContentCache('settings', d);
                }
            }, err => console.warn('Settings listener note', err));

            // Realtime Why Us
            db.collection('content').doc('why_us').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateWhyUsDOM(d);
                    saveLocalContentCache('why_us', d);
                }
            }, err => console.warn('Why Us listener note', err));

            // Realtime Services
            db.collection('content').doc('services').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const items = d.items || d;
                    updateServicesDOM(items);
                    saveLocalContentCache('services', items);
                }
            }, err => console.warn('Services listener note', err));

            // Realtime Experience Steps
            db.collection('content').doc('experience').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateExperienceDOM(d);
                    saveLocalContentCache('experience', d);
                }
            }, err => console.warn('Experience listener note', err));

            // Realtime Studio Info
            db.collection('content').doc('studio_info').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateStudioDOM(d);
                    saveLocalContentCache('studio_info', d);
                }
            }, err => console.warn('Studio listener note', err));

            // Realtime About Us
            db.collection('content').doc('about_us').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateAboutDOM(d);
                    saveLocalContentCache('about_us', d);
                }
            }, err => console.warn('About Us listener note', err));

            // Realtime Portfolio
            db.collection('content').doc('portfolio').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const items = d.items || d;
                    updatePortfolioDOM(items);
                    saveLocalContentCache('portfolio', items);
                }
            }, err => console.warn('Portfolio listener note', err));

            // Realtime Pricing
            db.collection('content').doc('pricing').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const items = d.items || d;
                    updatePricingDOM(items);
                    saveLocalContentCache('pricing', items);
                }
            }, err => console.warn('Pricing listener note', err));

            // Realtime Testimonials
            db.collection('content').doc('testimonials').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const items = d.items || d;
                    updateTestimonialsDOM(items);
                    saveLocalContentCache('testimonials', items);
                }
            }, err => console.warn('Testimonials listener note', err));

            // Realtime FAQs
            db.collection('content').doc('faqs').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const items = d.items || d;
                    updateFaqDOM(items);
                    saveLocalContentCache('faqs', items);
                }
            }, err => console.warn('FAQs listener note', err));

            // Realtime Final CTA
            db.collection('content').doc('final_cta').onSnapshot(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    updateFinalCtaDOM(d);
                    saveLocalContentCache('final_cta', d);
                }
            }, err => console.warn('Final CTA listener note', err));
        }
    }

    // Gallery Submenu & Event Filter Interaction
    function initGalleryFiltering() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const submenuLinks = document.querySelectorAll('.nav-submenu a[data-filter]');

        function applyFilter(cat) {
            filterBtns.forEach(btn => {
                const btnCat = (btn.getAttribute('data-filter') || btn.textContent.trim()).toLowerCase();
                if (btnCat === cat || (cat === 'all' && btnCat.includes('all'))) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            renderFilteredPortfolio(cat);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = (btn.getAttribute('data-filter') || btn.textContent.trim()).toLowerCase();
                applyFilter(cat);
            });
        });

        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const filterVal = (link.getAttribute('data-filter') || 'all').toLowerCase();
                applyFilter(filterVal);

                // Smoothly scroll to portfolio gallery section
                const portfolioSec = document.getElementById('portfolio');
                if (portfolioSec) {
                    portfolioSec.scrollIntoView({ behavior: 'smooth' });
                }

                // Close mobile nav if open
                if (navLinks) navLinks.classList.remove('active');
                if (navToggle) {
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
                const dropdown = link.closest('.nav-item-dropdown');
                if (dropdown) dropdown.classList.remove('open');
            });
        });

        // Mobile dropdown click toggle
        const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');
        const dropdownItem = document.querySelector('.nav-item-dropdown');
        if (dropdownTrigger && dropdownItem) {
            dropdownTrigger.addEventListener('click', (e) => {
                if (window.innerWidth <= 1120) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdownItem.classList.toggle('open');
                }
            });
        }
    }

    initGalleryFiltering();
    initDynamicContent();
});
