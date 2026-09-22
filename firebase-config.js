/**
 * Firebase Configuration for Snapilla Studio
 * 
 * Replace the values below with your Firebase Project configuration.
 * You can get these from: Firebase Console -> Project Settings -> General -> Your apps -> Web app
 */
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyA54RTk_o4erW43NQzkjBSd16MOu0JhMVM",
    authDomain: "snapilla-studio.firebaseapp.com",
    projectId: "snapilla-studio",
    storageBucket: "snapilla-studio.firebasestorage.app",
    messagingSenderId: "541496035020",
    appId: "1:541496035020:web:aa2962119b6a6422766469"
};

// Check if custom config was saved via Admin UI in localStorage
function getFirebaseConfig() {
    try {
        const stored = localStorage.getItem('snapilla_firebase_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.apiKey && parsed.apiKey !== "YOUR_API_KEY") {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Error reading stored Firebase config', e);
    }
    return DEFAULT_FIREBASE_CONFIG;
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase if valid config exists
let isFirebaseInitialized = false;
let db = null;
let auth = null;
let storage = null;

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        isFirebaseInitialized = true;
        console.log('Firebase initialized successfully for Snapilla Studio.');
    } else {
        console.info('Firebase credentials not set yet. Running in default fallback mode.');
    }
} catch (error) {
    console.warn('Firebase initialization error:', error);
}

// Default Content Data used as fallback and for 1-click seeding
const SNAP_DEFAULT_DATA = {
    settings: {
        hero_title: "Where Every Moment Becomes A Memory",
        hero_subtitle: "From the tiniest smiles to the biggest celebrations, Snapilla Studio captures moments that deserve to be remembered. We provide professional Baby, Product, Wedding, Model, Portrait, Family, Birthday, and Special Occasion Photography from our dedicated studio.",
        phone: "+91 87802 86850",
        whatsapp_number: "918780286850",
        email: "snapillastudio@gmail.com",
        address: "Shop No. 13/13A, Nakshatra Mall, IOC Rd, Chandkheda, Ahmedabad, Gujarat 382424",
        instagram_url: "https://instagram.com",
        tagline: "Where Every Moment Becomes A Memory"
    },
    services: [
        {
            title: "Baby Shoots",
            description: "Little Moments. Big Memories. Precious giggles, cozy wraps, and milestones captured with love.",
            image: "baby.png",
            background_color: "#FFCA28"
        },
        {
            title: "Wedding Photography",
            description: "Your Day. Your People. Your Story. Grand cinematic romance, rituals, and unforgettable celebrations.",
            image: "wedding.png",
            background_color: "#ECEFF1"
        },
        {
            title: "Product Shoots",
            description: "Make Your Product Impossible to Ignore. High-converting commercial visuals for Amazon, Shopify & ads.",
            image: "product.png",
            background_color: "#FF7043"
        },
        {
            title: "Modeling & Portfolio",
            description: "Confidence Looks Good On Camera. High-fashion modeling portfolios, headshots, and editorial casting.",
            image: "modeling.png",
            background_color: "#263238"
        },
        {
            title: "Portrait Photography",
            description: "Expressions that define who you are. Signature studio portraits with creative mood lighting.",
            image: "p1.png",
            background_color: "#FFA000"
        },
        {
            title: "Family Photography",
            description: "Generations together in one perfect frame. Warm, joyful, and timeless family portraits.",
            image: "p2.png",
            background_color: "#FFB300"
        },
        {
            title: "Birthday Photography",
            description: "Celebrate another wonderful year! Vibrant cake smash sessions and birthday memories.",
            image: "p3.png",
            background_color: "#FFC107"
        },
        {
            title: "Special Occasions",
            description: "Anniversaries, graduations, and achievements captured with elegance and emotion.",
            image: "p4.png",
            background_color: "#FF8F00"
        }
    ],
    portfolio: [
        { title: "Photography Album 1", image: "p1.png", alt: "Photography Album 1" },
        { title: "Photography Album 2", image: "p2.png", alt: "Photography Album 2" },
        { title: "Photography Album 3", image: "p3.png", alt: "Photography Album 3" },
        { title: "Photography Album 4", image: "p4.png", alt: "Photography Album 4" },
        { title: "Photography Album 5", image: "baby.png", alt: "Baby Shoot Album" },
        { title: "Photography Album 6", image: "wedding.png", alt: "Wedding Shoot Album" },
        { title: "Photography Album 7", image: "modeling.png", alt: "Model Shoot Album" },
        { title: "Photography Album 8", image: "product.png", alt: "Product Shoot Album" }
    ],
    pricing: [
        {
            title: "Starter",
            icon: "📸",
            subtitle: "Perfect for quick portraits & small memories.",
            price: "₹4,999",
            features: [
                "1 Hour Studio Session",
                "10 Master Edited Images",
                "Online Digital Gallery",
                "Standard Delivery (3–5 Days)"
            ],
            popular: false
        },
        {
            title: "Premium",
            icon: "🎬",
            subtitle: "Best for Family, Baby & Event Sessions.",
            price: "₹14,999",
            features: [
                "3 Hours Studio Session",
                "30 Master Edited Images",
                "Multiple Backdrops & Outfits",
                "Cinematic Short Teaser",
                "Priority Express Delivery"
            ],
            popular: true
        },
        {
            title: "Luxury",
            icon: "💎",
            subtitle: "Elite storytelling & portfolio experience.",
            price: "₹29,999",
            features: [
                "Full Day Studio Coverage",
                "100+ High-Res Edited Images",
                "Cinematic Film (5 min 4K)",
                "Premium Hardcover Photo Album",
                "Complete Raw Files Included"
            ],
            popular: false
        }
    ],
    testimonials: [
        {
            name: "Ananya Patel",
            role: "Family Shoot",
            quote: "Beautiful photographs and a very comfortable experience. The team guided us with natural poses!",
            row: 1
        },
        {
            name: "Rohan Mehta",
            role: "Couple Portrait",
            quote: "The photos came out exactly how we wanted. Great experience from booking to final album!",
            row: 1
        },
        {
            name: "Pooja Shah",
            role: "E-commerce Brand Owner",
            quote: "Professional setup and amazing attention to detail. Our e-commerce sales jumped after this product shoot.",
            row: 1
        },
        {
            name: "Kavita Desai",
            role: "Baby Milestone Shoot",
            quote: "Loved the way our special moments were captured. The baby shoot was heartwarming and adorable!",
            row: 1
        },
        {
            name: "Sana Sheikh",
            role: "Wedding Couple",
            quote: "They made our wedding look like a cinematic movie. The color grading is breathtaking!",
            row: 2
        },
        {
            name: "Hassan Ali",
            role: "Fashion Model",
            quote: "Best modeling portfolio I’ve ever built. Agency loved the lighting and angles!",
            row: 2
        },
        {
            name: "Rahul Sharma",
            role: "Corporate Executive",
            quote: "Smooth experience, transparent pricing, and quick turnaround. The final retouches are flawless.",
            row: 2
        },
        {
            name: "Bilal Ahmed",
            role: "Parent",
            quote: "Capturing our baby’s first birthday with cake smash was pure joy. Highly recommend Snapilla Studio!",
            row: 2
        }
    ],
    faqs: [
        {
            question: "Do I need an appointment?",
            answer: "Yes. We recommend booking your session in advance so our photography team can prepare the studio, lighting, and customized props according to your specific requirements."
        },
        {
            question: "Do you provide home or doorstep photography?",
            answer: "Currently, Snapilla Studio provides photography sessions exclusively at our dedicated studio. Our controlled studio setup allows us to deliver high-end lighting and aesthetic backdrops that cannot be replicated at home."
        },
        {
            question: "Can I bring family or friends?",
            answer: "Yes, absolutely! You are welcome to bring family members or friends depending on the type and package size of your session."
        },
        {
            question: "Can I bring my own outfits and props?",
            answer: "Yes. You can discuss your outfit choices, color palettes, and styling requirements with us before the session. We also have private changing rooms available."
        },
        {
            question: "Do you provide photo editing and retouching?",
            answer: "Yes, professional editing is included in all packages. Selected photographs receive careful skin retouching, color grading, tone adjustments, and polish."
        },
        {
            question: "How long does a photoshoot take?",
            answer: "The duration typically ranges from 1 hour to a full day, depending on the chosen service, number of outfits, backdrops, and creative concepts."
        },
        {
            question: "Can I discuss a custom or creative photoshoot?",
            answer: "Absolutely! If you have a unique concept, theme, editorial moodboard, or commercial idea, simply contact us and we will design a tailored session for you."
        }
    ],
    why_us: {
        title: "Why Snapilla Studio?",
        subtitle: "More Than Just Photography — We blend high-end equipment, creative vision, and personalized direction to capture your most authentic self.",
        quote: "Every picture we click is a story you’ll relive forever.",
        pillars: [
            { icon: "📸", title: "Professional Photography", desc: "We focus on studio lighting, composition, expressions, natural poses, and micro details that make every frame stand out." },
            { icon: "💡", title: "Creative Approach", desc: "Every shoot is thoughtfully planned according to your purpose, personal style, mood, and creative aspirations." },
            { icon: "🏠", title: "Dedicated Studio", desc: "A controlled studio environment allows us to work with precise lighting, customizable backdrops, and creative setups." },
            { icon: "🤝", title: "Client-Focused Experience", desc: "We guide you step-by-step through poses and expressions so you feel completely relaxed and confident in front of the lens." },
            { icon: "✨", title: "Quality Editing", desc: "Selected photographs are retouched and color-graded by skilled photo artists to deliver a magazine-worthy final output." },
            { icon: "🎯", title: "Personalized Sessions", desc: "Your photoshoot is tailored to your exact requirements, wardrobe choices, time preferences, and expectations." }
        ]
    },
    experience: {
        title: "The Snapilla Experience",
        subtitle: "From Idea To Final Photograph — We make your photoshoot effortless, comfortable, and fun through our proven 8-step workflow.",
        steps: [
            { step: "01", title: "Talk To Us", desc: "Tell us about the type of photoshoot, purpose, ideas, and expectations you have in mind." },
            { step: "02", title: "Choose Your Session", desc: "Select your photography service, package, deliverables, and schedule your preferred date." },
            { step: "03", title: "Visit Our Studio", desc: "Come to Snapilla Studio at your scheduled time where our clean, equipped studio awaits you." },
            { step: "04", title: "Get Camera Ready", desc: "Our photographer guides you through positioning, outfits, expressions, and posing ease." },
            { step: "05", title: "The Shoot", desc: "We capture different angles, expressions, creative lighting, and genuine candid moments." },
            { step: "06", title: "Photo Selection", desc: "Review the unedited preview frames together and pick your favorite shots for final retouching." },
            { step: "07", title: "Professional Editing", desc: "Selected images receive detailed color correction, skin retouching, and premium finishing." },
            { step: "08", title: "Memories Are Ready", desc: "Receive your high-res digital files and album prints — ready to share, print, and treasure forever." }
        ]
    },
    studio_info: {
        badge: "Studio-Based Photography Only",
        title: "Welcome To Snapilla Studio",
        desc: "Snapilla Studio currently operates as a dedicated studio-based photography service. Clients are warmly invited to visit our studio for photography sessions. We do not currently provide doorstep or home photography services.",
        location: "Shop No. 13/13A, Nakshatra Mall, IOC Rd, Chandkheda, Ahmedabad, Gujarat 382424",
        hours_weekday: "10:00 AM – 8:00 PM",
        hours_sunday: "10:00 AM – 6:00 PM",
        notice: "* Appointments are highly recommended prior to visiting to ensure studio setup availability.",
        maps_url: "https://maps.app.goo.gl/aFs4f4PSaPtn3VUT9"
    },
    about_us: {
        title: "Who We Are",
        p1: "Snapilla Studio is a premier creative photography studio dedicated to capturing life’s most authentic and joyful milestones.",
        p2: "We believe photography is never just about pressing a button — it’s about light, perspective, emotion, and timeless storytelling.",
        mission_title: "Our Mission",
        mission_desc: "Deliver premium-quality photography that creates lifelong memories and elevates personal & commercial brands.",
        vision_title: "Our Vision",
        vision_desc: "To be the most trusted, artistic, and client-cherished photography studio in the region."
    },
    final_cta: {
        title: "Don’t Let Your Best Moments Become Forgotten Moments.",
        desc: "Your memories deserve more than a camera roll. Whether it’s your child’s first birthday, your wedding day, a new product launch, a modeling portfolio, or simply a moment you want to remember — Let’s capture it beautifully."
    }
};
