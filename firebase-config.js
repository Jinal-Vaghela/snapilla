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
        hero_title: "Where Every Moment Becomes A Memory",
        hero_subtitle: "From the tiniest smiles to the biggest celebrations, Snapilla Studio captures moments that deserve to be remembered. We provide professional Baby, Product, Wedding, Model, Portrait, Family, Birthday, and Special Occasion Photography from our dedicated studio.",
        phone: "+91 XXXXX XXXXX",
        whatsapp_number: "919000000000",
        email: "snapillastudio@gmail.com",
        address: "Ahmedabad, Gujarat, India",
        instagram_url: "https://instagram.com",
        facebook_url: "https://facebook.com",
        youtube_url: "https://youtube.com",
        tagline: "Where Every Moment Becomes A Memory"
    },
    services: [
        {
            title: "Baby Shoots",
            description: "Little Moments. Big Memories. Precious giggles captured forever.",
            image: "baby.png",
            background_color: "#FFCA28"
        },
        {
            title: "Weddings",
            description: "Your Day. Your People. Your Story. Grand cinematic romance.",
            image: "wedding.png",
            background_color: "#ECEFF1"
        },
        {
            title: "Products",
            description: "Make Your Product Impossible to Ignore. High-converting commercial visuals.",
            image: "product.png",
            background_color: "#FF7043"
        },
        {
            title: "Modeling",
            description: "Confidence Looks Good On Camera. High-fashion portfolios.",
            image: "modeling.png",
            background_color: "#263238"
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
    ]
};
