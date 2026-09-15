/**
 * Firebase Configuration for Snapilla Studio
 * 
 * Replace the values below with your Firebase Project configuration.
 * You can get these from: Firebase Console -> Project Settings -> General -> Your apps -> Web app
 */
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
        hero_title: "Capturing Moments That Last Forever",
        hero_subtitle: "At Snapilla Studio, we don’t just take photos — we create timeless memories filled with emotions, beauty, and storytelling.",
        phone: "+91 XXXXX XXXXX",
        whatsapp_number: "919000000000",
        email: "snapillastudio@gmail.com",
        address: "Ahmedabad, India",
        instagram_url: "https://instagram.com",
        facebook_url: "https://facebook.com",
        youtube_url: "https://youtube.com",
        tagline: "Turning Moments Into Memories"
    },
    services: [
        {
            title: "Baby Shoots",
            description: "Precious giggles and innocent moments captured beautifully.",
            image: "baby.png",
            background_color: "#FFCA28"
        },
        {
            title: "Weddings",
            description: "Your grand love story, framed in cinematic perfection.",
            image: "wedding.png",
            background_color: "#ECEFF1"
        },
        {
            title: "Products",
            description: "Commercial-grade visuals that drive sales and branding.",
            image: "product.png",
            background_color: "#FF7043"
        },
        {
            title: "Modeling",
            description: "High-fashion portfolios for creators and professionals.",
            image: "modeling.png",
            background_color: "#263238"
        }
    ],
    portfolio: [
        { title: "Photography Album 1", image: "p1.png", alt: "Photography Album 1" },
        { title: "Photography Album 2", image: "p2.png", alt: "Photography Album 2" },
        { title: "Photography Album 3", image: "p3.png", alt: "Photography Album 3" },
        { title: "Photography Album 4", image: "p4.png", alt: "Photography Album 4" },
        { title: "Photography Album 5", image: "baby.png", alt: "Photography Album 5" },
        { title: "Photography Album 6", image: "wedding.png", alt: "Photography Album 6" },
        { title: "Photography Album 7", image: "modeling.png", alt: "Photography Album 7" },
        { title: "Photography Album 8", image: "product.png", alt: "Photography Album 8" }
    ],
    pricing: [
        {
            title: "Starter",
            icon: "📸",
            subtitle: "Perfect for small memories.",
            price: "₹4,999",
            features: [
                "1 Hour Session",
                "10 Edited Images",
                "Online Gallery",
                "Standard Delivery"
            ],
            popular: false
        },
        {
            title: "Premium",
            icon: "🎬",
            subtitle: "Best for Family & Events.",
            price: "₹14,999",
            features: [
                "3 Hours Session",
                "30 Edited Images",
                "Cinematic Teaser",
                "Priority Delivery"
            ],
            popular: true
        },
        {
            title: "Luxury",
            icon: "💎",
            subtitle: "Elite storytelling experience.",
            price: "₹29,999",
            features: [
                "Full Day Coverage",
                "100+ Edited Images",
                "Cinematic Film (5 min)",
                "Premium Photo Album"
            ],
            popular: false
        }
    ],
    testimonials: [
        {
            name: "Bilal Ahmed",
            role: "IT Manager",
            quote: "The baby shoot was absolutely adorable. Highly professional team! They captured every smile perfectly.",
            row: 1
        },
        {
            name: "Sana Sheikh",
            role: "Sales Manager",
            quote: "They made our wedding look like a movie. Amazing work, high-end quality throughout!",
            row: 1
        },
        {
            name: "Zainab Hussain",
            role: "Project Manager",
            quote: "Best product shoot I’ve ever done. My sales increased! Professionalism at its peak.",
            row: 1
        },
        {
            name: "Hassan Ali",
            role: "E-commerce Manager",
            quote: "Using this studio, our brand presence significantly improved. Amazing visuals!",
            row: 2
        },
        {
            name: "Saman Malik",
            role: "Customer Support Lead",
            quote: "The support team is exceptional, guiding us through setup and providing assistance.",
            row: 2
        },
        {
            name: "Rahul Sharma",
            role: "Marketing Head",
            quote: "Smooth implementation and quick delivery. The final edits were breathless!",
            row: 2
        }
    ],
    faqs: [
        {
            question: "How long does it take to deliver photos?",
            answer: "3–7 days depending on the shoot type"
        },
        {
            question: "Do you provide raw photos?",
            answer: "Yes, on request"
        },
        {
            question: "Can I customize my shoot theme?",
            answer: "Absolutely! We love creative ideas"
        },
        {
            question: "Do you travel for shoots?",
            answer: "Yes, we cover multiple locations"
        }
    ]
};
