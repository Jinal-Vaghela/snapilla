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
    const SNAPILLA_VERIFIED_MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.5719489442154!2d72.5721459!3d23.1127604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e8301a637aa8d%3A0x7caac65cdfe4f745!2sSnapilla%20Studio%20%7C%20Baby%20Shoot%20In%20Ahmedabad!5e0!3m2!1sen!2sin!4v1712670000000!5m2!1sen!2sin";

    function extractEmbedUrl(val) {
        if (!val || typeof val !== 'string') return '';
        const clean = val.trim();
        if (!clean) return '';

        // If user pasted an <iframe> code from Google Maps
        if (clean.includes('<iframe')) {
            const match = clean.match(/src=["']([^"']+)["']/);
            if (match && match[1]) return match[1];
        }

        // If user pasted a direct embed URL
        if (clean.includes('google.com/maps/embed') || clean.includes('output=embed')) {
            return clean;
        }

        // If user pasted pb=!1m...
        if (clean.includes('pb=!1m')) {
            return clean.startsWith('http') ? clean : `https://www.google.com/maps/embed?pb=${clean}`;
        }

        return '';
    }

    function getEmbedMapUrl(mapsUrl, address) {
        const cleanUrl = (mapsUrl && typeof mapsUrl === 'string') ? mapsUrl.trim() : '';
        const cleanAddr = (address && typeof address === 'string') ? address.trim() : '';

        // If neither is provided, no map
        if (!cleanUrl && !cleanAddr) return '';

        // 1. Direct iframe or embed URL provided
        const directEmbed = extractEmbedUrl(cleanUrl);
        if (directEmbed) return directEmbed;

        const combined = `${cleanUrl} ${cleanAddr}`.toLowerCase();

        // 2. If it is for Snapilla Studio / Nakshatra Mall / Chandkheda / Ahmedabad or Google Maps shortlink
        // Return the verified Google Business Profile Place embed (shows red pin, business name, rating, and info card)
        const isSnapilla = combined.includes('snapilla') || 
                           combined.includes('nakshatra') || 
                           combined.includes('chandkheda') || 
                           combined.includes('382424') ||
                           combined.includes('q7nne6sem5vc5pm66') ||
                           combined.includes('afs4f4psaptn3vut9') ||
                           combined.includes('dkw5zzdcn1p1uo87a') ||
                           cleanUrl.includes('maps.app.goo.gl') ||
                           cleanUrl.includes('goo.gl/maps');

        if (isSnapilla) {
            return SNAPILLA_VERIFIED_MAP_EMBED;
        }

        // 3. If place URL with path
        if (cleanUrl.includes('/maps/place/')) {
            try {
                const match = cleanUrl.match(/\/maps\/place\/([^/@?]+)/);
                if (match && match[1]) {
                    const place = decodeURIComponent(match[1].replace(/\+/g, ' '));
                    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`;
                }
            } catch (e) {}
        }

        // 4. If custom address is provided
        if (cleanAddr) {
            return `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddr)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`;
        }

        // 5. Fallback with search URL if available
        if (cleanUrl) {
            return `https://maps.google.com/maps?q=${encodeURIComponent(cleanUrl)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`;
        }

        return '';
    }

    function updateMapDOM(mapsUrl, address) {
        const mapContainer = document.querySelector('.map-container');
        const mapIframe = document.getElementById('contactMapIframe');
        const studioMapsBtn = document.getElementById('studioMapsBtn');

        const cleanMapUrl = (mapsUrl && mapsUrl !== 'https://maps.google.com') ? mapsUrl.trim() : '';
        const cleanAddress = (address && typeof address === 'string') ? address.trim() : '';

        // If neither a map link nor address is provided, hide the map completely
        if (!cleanMapUrl && !cleanAddress) {
            if (mapContainer) mapContainer.style.display = 'none';
            if (mapIframe) mapIframe.src = '';
            if (studioMapsBtn) studioMapsBtn.style.display = 'none';
            return;
        }

        // Calculate dynamic embed src
        const embedSrc = getEmbedMapUrl(cleanMapUrl, cleanAddress);

        if (embedSrc) {
            if (mapContainer) mapContainer.style.display = 'block';
            if (mapIframe && mapIframe.getAttribute('src') !== embedSrc) {
                mapIframe.src = embedSrc;
            }
        } else {
            if (mapContainer) mapContainer.style.display = 'none';
            if (mapIframe) mapIframe.src = '';
        }

        if (studioMapsBtn) {
            if (cleanMapUrl) {
                studioMapsBtn.style.display = 'inline-flex';
                studioMapsBtn.href = cleanMapUrl;
            } else if (cleanAddress) {
                studioMapsBtn.style.display = 'inline-flex';
                studioMapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
            } else {
                studioMapsBtn.style.display = 'none';
            }
        }
    }

    function updateSettingsDOM(data) {
        if (!data) return;
        liveSettings = { ...liveSettings, ...data };

        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle && data.hero_title) heroTitle.textContent = data.hero_title;

        const heroSubtitle = document.getElementById('heroSubtitle');
        if (heroSubtitle && data.hero_subtitle) heroSubtitle.textContent = data.hero_subtitle;

        if (data.address !== undefined) {
            liveSettings.address = data.address;
            const contactAddress = document.getElementById('contactAddress');
            if (contactAddress) contactAddress.textContent = data.address;

            const studioNoticeAddress = document.getElementById('studioNoticeAddress');
            if (studioNoticeAddress) studioNoticeAddress.textContent = data.address;
        }

        if (data.maps_url !== undefined) {
            liveSettings.maps_url = data.maps_url;
        }

        updateMapDOM(liveSettings.maps_url, liveSettings.address);

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

    function wireBookingTriggers() {
        document.querySelectorAll('a[href="#booking"]').forEach(btn => {
            if (btn.dataset.bookingBound) return;
            btn.dataset.bookingBound = 'true';
            btn.addEventListener('click', (e) => {
                const bookingSec = document.getElementById('booking');
                if (bookingSec) {
                    bookingSec.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    const CATEGORY_META = {
        'baby': {
            title: 'Baby & Newborn',
            subtitle: 'Precious giggles, cozy wraps, and milestones captured with love.',
            icon: 'fas fa-baby',
            defaultImg: 'baby.png',
            morePhotos: [
                { image: 'baby.png', title: 'Baby Milestone Portrait', desc: 'Newborn wrapped in cozy warm tones' },
                { image: 'p3.png', title: 'Baby Cake Smash & 1st Birthday', desc: 'Joyful celebration & sweet moments' },
                { image: 'p2.png', title: 'Baby & Family Session', desc: 'Generations welcoming a new life' },
                { image: 'p1.png', title: 'Baby Studio Portrait', desc: 'Warm creative studio lighting' }
            ]
        },
        'wedding': {
            title: 'Wedding & Romance',
            subtitle: 'Grand cinematic romance, emotional rituals, and timeless memories.',
            icon: 'fas fa-ring',
            defaultImg: 'wedding.png',
            morePhotos: [
                { image: 'wedding.png', title: 'Bridal & Couple Portrait', desc: 'Cinematic bridal storytelling' },
                { image: 'p4.png', title: 'Wedding Rituals & Celebrations', desc: 'Special moments and family joy' },
                { image: 'p1.png', title: 'Pre-Wedding Studio Session', desc: 'Editorial couple portraiture' },
                { image: 'p2.png', title: 'Family Wedding Moments', desc: 'Cherished memories with loved ones' }
            ]
        },
        'products': {
            title: 'Product & Commercial',
            subtitle: 'High-converting commercial visuals designed for brands, Amazon & e-commerce.',
            icon: 'fas fa-shopping-bag',
            defaultImg: 'product.png',
            morePhotos: [
                { image: 'product.png', title: 'Commercial Product Shoot', desc: 'Clean studio lighting & sharp detail' },
                { image: 'p1.png', title: 'Editorial Brand Showcase', desc: 'Mood lighting for brand campaigns' },
                { image: 'modeling.png', title: 'Fashion & Product Pairing', desc: 'Lifestyle catalog commercial' },
                { image: 'p4.png', title: 'Luxury Item Photography', desc: 'Crisp texture & premium studio setup' }
            ]
        },
        'models': {
            title: 'Model & Fashion',
            subtitle: 'High-fashion modeling portfolios, headshots, and editorial casting.',
            icon: 'fas fa-tshirt',
            defaultImg: 'modeling.png',
            morePhotos: [
                { image: 'modeling.png', title: 'Fashion Portfolio Headshot', desc: 'Editorial fashion and pose direction' },
                { image: 'p1.png', title: 'Studio High-Fashion Portrait', desc: 'Creative studio lighting & gels' },
                { image: 'p4.png', title: 'Lookbook & Casting Session', desc: 'Clean agency-ready portraits' },
                { image: 'wedding.png', title: 'Bridal Model Shoot', desc: 'High-end ethnic editorial' }
            ]
        },
        'portraits': {
            title: 'Signature Portraits',
            subtitle: 'Expressions that define who you are with creative studio mood lighting.',
            icon: 'fas fa-user-tie',
            defaultImg: 'p1.png',
            morePhotos: [
                { image: 'p1.png', title: 'Signature Studio Portrait', desc: 'Fine art dramatic mood lighting' },
                { image: 'modeling.png', title: 'Executive Headshot', desc: 'Professional leadership portfolio' },
                { image: 'p2.png', title: 'Candid Expression Shoot', desc: 'Natural expressions and clean frames' },
                { image: 'p4.png', title: 'Artistic Character Frame', desc: 'Timeless luxury character portrait' }
            ]
        },
        'couples': {
            title: 'Couple Photography',
            subtitle: 'Two people. One beautiful story. Authentic chemistry and connection.',
            icon: 'fas fa-heart',
            defaultImg: 'wedding.png',
            morePhotos: [
                { image: 'wedding.png', title: 'Romantic Couple Session', desc: 'Intimate and natural chemistry' },
                { image: 'p1.png', title: 'Studio Couple Silhouette', desc: 'Artistic lighting & romantic poses' },
                { image: 'p2.png', title: 'Engagement & Milestone Shoot', desc: 'Celebrating relationship milestones' },
                { image: 'p4.png', title: 'Anniversary Studio Portrait', desc: 'Forever memories captured together' }
            ]
        },
        'family': {
            title: 'Family Photography',
            subtitle: 'Generations together in one perfect frame. Warm, joyful, and timeless.',
            icon: 'fas fa-users',
            defaultImg: 'p2.png',
            morePhotos: [
                { image: 'p2.png', title: 'Grand Family Portrait', desc: 'Three generations united in joy' },
                { image: 'baby.png', title: 'Parents & Newborn Session', desc: 'Tender moments of new parenthood' },
                { image: 'p3.png', title: 'Family Birthday Celebration', desc: 'Laughter, hugs, and true connection' },
                { image: 'p4.png', title: 'Family Holiday & Festival Shoot', desc: 'Traditional festive portraits' }
            ]
        },
        'birthdays': {
            title: 'Birthday & Cake Smash',
            subtitle: 'Celebrate another wonderful year! Vibrant colors, props, and memories.',
            icon: 'fas fa-birthday-cake',
            defaultImg: 'p3.png',
            morePhotos: [
                { image: 'p3.png', title: '1st Birthday Cake Smash', desc: 'Messy fun, bright balloons & joy' },
                { image: 'baby.png', title: 'Baby Milestone Birthday', desc: 'Custom themed studio backdrops' },
                { image: 'p2.png', title: 'Family Birthday Gathering', desc: 'Celebrating another milestone year' },
                { image: 'p4.png', title: 'Grand Milestone Jubilee', desc: 'Golden jubilee & milestone events' }
            ]
        },
        'events': {
            title: 'Events & Celebrations',
            subtitle: 'Anniversaries, graduations, and achievements captured with emotion.',
            icon: 'fas fa-glass-cheers',
            defaultImg: 'p4.png',
            morePhotos: [
                { image: 'p4.png', title: 'Special Milestone Event', desc: 'Grand celebrations & memories' },
                { image: 'wedding.png', title: 'Ceremonial Occasion', desc: 'Authentic traditions and rituals' },
                { image: 'p2.png', title: 'Family Gathering Event', desc: 'Unfiltered candid moments' },
                { image: 'p1.png', title: 'Award & Graduation Portrait', desc: 'Celebrating big life achievements' }
            ]
        }
    };

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
        const stage = document.getElementById('portfolioStage');
        const spinner = document.getElementById('portfolioSpinner');
        const singleShowcase = document.getElementById('portfolioSingleShowcase');
        const moreContainer = document.getElementById('portfolioMoreContainer');
        const showMoreBtn = document.getElementById('galleryShowMoreBtn');
        const moreGrid = document.getElementById('galleryMoreGrid');

        if (!spinner) return;

        const normalized = currentGalleryFilter.toLowerCase().trim();

        // 1. ALL CATEGORIES: 3D Rotating Carousel
        if (normalized === 'all') {
            if (stage) stage.classList.remove('is-single-mode');
            spinner.style.display = 'block';
            if (singleShowcase) singleShowcase.style.display = 'none';
            if (moreContainer) moreContainer.style.display = 'none';
            if (moreGrid) moreGrid.style.display = 'none';

            const total = livePortfolioList.length;
            const radius = window.innerWidth < 768 ? 230 : (window.innerWidth < 992 ? 350 : 500);
            const angleStep = 360 / Math.max(total, 1);

            spinner.innerHTML = livePortfolioList.map((photo, index) => {
                const rot = index * angleStep;
                return `
                    <div class="portfolio-card portfolio-item" data-category="${categorizePhoto(photo)}" style="transform: rotateY(${rot}deg) translateZ(${radius}px);">
                        <img src="${photo.image}" alt="${photo.alt || photo.title || 'Photography Album'}">
                    </div>
                `;
            }).join('');

            attachLightboxHandlers();
            return;
        }

        // 2. SPECIFIC CATEGORY: Stop Rotating -> Show Single Image + Show More Button
        if (stage) stage.classList.add('is-single-mode');
        spinner.style.display = 'none';

        const meta = CATEGORY_META[normalized] || {
            title: normalized.charAt(0).toUpperCase() + normalized.slice(1),
            subtitle: 'Professional dedicated photography session by Snapilla Studio.',
            icon: 'fas fa-camera',
            defaultImg: 'p1.png',
            morePhotos: []
        };

        // Find matching photos from live portfolio
        const matchingLive = livePortfolioList.filter(item => {
            const itemCat = categorizePhoto(item);
            return itemCat === normalized || 
                   itemCat.startsWith(normalized.replace(/s$/, '')) || 
                   normalized.includes(itemCat) ||
                   itemCat.includes(normalized.replace(/s$/, ''));
        });

        const featuredPhoto = matchingLive[0] || (meta.morePhotos && meta.morePhotos[0]) || {
            image: meta.defaultImg || 'p1.png',
            title: meta.title + ' Showcase',
            alt: meta.title
        };

        // Populate Single Showcase Card
        if (singleShowcase) {
            singleShowcase.style.display = 'flex';
            singleShowcase.innerHTML = `
                <div class="single-showcase-card portfolio-item" data-category="${normalized}">
                    <div class="showcase-badge"><i class="${meta.icon}"></i> ${meta.title}</div>
                    <img src="${featuredPhoto.image}" alt="${featuredPhoto.title || meta.title}">
                    <div class="showcase-overlay">
                        <div class="showcase-zoom-hint"><i class="fas fa-search-plus"></i> Click to View Full Size</div>
                        <h3>${featuredPhoto.title || (meta.title + ' Photography')}</h3>
                        <p>${meta.subtitle}</p>
                    </div>
                </div>
            `;
        }

        // Prepare Show More photos pool
        let morePhotosPool = [];
        if (matchingLive.length > 0) {
            morePhotosPool = matchingLive.map(item => ({
                image: item.image,
                title: item.title || meta.title,
                desc: item.alt || meta.subtitle
            }));
        }
        if (meta.morePhotos && meta.morePhotos.length > 0) {
            meta.morePhotos.forEach(mp => {
                if (!morePhotosPool.some(p => p.image === mp.image)) {
                    morePhotosPool.push(mp);
                }
            });
        }
        if (morePhotosPool.length === 0) {
            morePhotosPool = [
                { image: meta.defaultImg || 'p1.png', title: meta.title, desc: meta.subtitle }
            ];
        }

        // Configure Show More Button & Grid
        if (moreContainer && showMoreBtn && moreGrid) {
            moreContainer.style.display = 'block';
            moreGrid.style.display = 'none';
            showMoreBtn.innerHTML = `<i class="fas fa-images"></i> <span>Show More ${meta.title} Photos</span>`;

            showMoreBtn.onclick = () => {
                const isHidden = (moreGrid.style.display === 'none' || !moreGrid.style.display);
                if (isHidden) {
                    moreGrid.innerHTML = `
                        ${morePhotosPool.map(p => `
                            <div class="more-photo-card portfolio-item" data-category="${normalized}">
                                <img src="${p.image}" alt="${p.title || meta.title}">
                                <div class="more-photo-info">
                                    <h4>${p.title || meta.title}</h4>
                                    <p>${p.desc || 'Snapilla Studio'}</p>
                                </div>
                            </div>
                        `).join('')}
                        <div class="more-gallery-cta">
                            <h4>Love Our ${meta.title} Photography?</h4>
                            <p>Let’s craft timeless memories together at our dedicated studio.</p>
                            <a href="#booking" class="btn-service-book" style="display: inline-block; padding: 14px 34px; font-size: 1rem;">📸 Book ${meta.title} Shoot <i class="fas fa-arrow-right"></i></a>
                        </div>
                    `;
                    moreGrid.style.display = 'grid';
                    showMoreBtn.innerHTML = `<i class="fas fa-chevron-up"></i> <span>Show Less</span>`;
                    attachLightboxHandlers();
                    wireBookingTriggers();
                } else {
                    moreGrid.style.display = 'none';
                    showMoreBtn.innerHTML = `<i class="fas fa-images"></i> <span>Show More ${meta.title} Photos</span>`;
                }
            };
        }

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

        const loc = (data.location !== undefined) ? data.location : ((data.address !== undefined) ? data.address : '');
        if (loc !== '') {
            liveSettings.address = loc;
        }
        if (data.maps_url !== undefined) {
            liveSettings.maps_url = data.maps_url;
        }

        const studioNoticeAddress = document.getElementById('studioNoticeAddress');
        if (studioNoticeAddress) {
            studioNoticeAddress.textContent = loc || liveSettings.address || '';
        }

        const contactAddress = document.getElementById('contactAddress');
        if (contactAddress && loc) {
            contactAddress.textContent = loc;
        }

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

        updateMapDOM(liveSettings.maps_url, liveSettings.address);
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
