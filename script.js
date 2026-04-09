document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Lightbox Gallery
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const closeLightbox = document.querySelector('.lightbox-close');

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

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

    // Booking Form - WhatsApp Integration
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const shootType = document.getElementById('shootType').value;
            const date = document.getElementById('date').value;
            const message = document.getElementById('message').value;

            // Prepare WhatsApp message
            const whatsappText = `*New Booking Request - Snapilla Studio*%0A%0A` +
                                `*Name:* ${name}%0A` +
                                `*Email:* ${email}%0A` +
                                `*Phone:* ${phone}%0A` +
                                `*Shoot Type:* ${shootType}%0A` +
                                `*Preferred Date:* ${date}%0A` +
                                `*Message:* ${message}`;

            // Replace with actual business number
            const phoneNumber = '919000000000'; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappText}`;

            window.open(whatsappUrl, '_blank');
            bookingForm.reset();
        });
    }

    // Scroll reveal animation (Simple implementation)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .portfolio-item, .section-title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});
