/**
 * Business Configuration
 * Centralized configuration for business contact details and service constants.
 * 
 * IMPORTANT: Update these values with your actual business information.
 */

export const BUSINESS_CONFIG = {
  // Contact Information
  phone: {
    number: "9399330188",
    formatted: "+91 9399330188",
    telLink: "tel:+919399330188"
  },
  whatsapp: {
    number: "919399330188",
    baseUrl: "https://wa.me",
    defaultMessage: "Hello Shree Mahakal Associates, I'm interested in your construction services."
  },
  email: "info@shreemahakalassociates.com",
  
  // Business Details
  name: "Shree Mahakal Building Associates",
  tagline: "Civil Engineer | Architect | Vastu Specialist",
  address: "Nandai Chowk, Rajnandgaon, Chhattisgarh",
  
  // Social/External Links
  googleMapsUrl: "https://maps.google.com/?q=Nandai+Chowk+Rajnandgaon",
  
  // Service Categories (used in booking forms)
  services: [
    { id: 'home-construction', name: 'Home Construction', icon: '🏗️' },
    { id: 'house-design', name: 'House Design & Architecture', icon: '📐' },
    { id: 'renovation', name: 'Renovation & Remodeling', icon: '🔨' },
    { id: 'interior-work', name: 'Interior Design', icon: '🎨' },
    { id: 'repair-maintenance', name: 'Repair & Maintenance', icon: '🔧' },
    { id: 'home-safety', name: 'Home Safety & Waterproofing', icon: '🛡️' },
    { id: 'vaastu-consultation', name: 'Vastu Consultation', icon: '🧭' },
    { id: 'commercial', name: 'Commercial Construction', icon: '🏢' }
  ],
  
  // Project Types
  projectTypes: [
    { id: 'residential', name: 'Residential Home' },
    { id: 'commercial', name: 'Commercial Building' },
    { id: 'renovation', name: 'Renovation/Extension' }
  ],
  
  // Construction Plans
  plans: [
    { 
      id: 'structure', 
      name: 'Structure Plan', 
      price: 849, 
      unit: '/ sq. ft.',
      description: 'Essential Foundation & RCC Frame',
      features: ['Strong Footing & Foundation', 'RCC Frame Structure', 'Brick Masonry & Plastering']
    },
    { 
      id: 'premium', 
      name: 'Premium Plan', 
      price: 1399, 
      unit: '/ sq. ft.',
      description: 'Complete Move-In Home',
      features: ['Complete Structure + Flooring', 'Standard Electrical & Plumbing', 'Modern Exterior Elevation']
    },
    { 
      id: 'royal', 
      name: 'Royal Plan', 
      price: 1500, 
      unit: '/ sq. ft.',
      description: 'Luxury Architecture & Vastu Finish',
      features: ['Premium Vitrified Tiles', 'Branded Sanitary & CP Fittings', 'Vastu-Compliant 3D Layout']
    },
    { 
      id: 'luxury', 
      name: 'Luxury Plan', 
      price: 1599, 
      unit: '/ sq. ft.',
      description: 'Smart Mansion & Ultra Finish',
      features: ['Imported Marble & Tile Options', 'Smart Home Automation Wiring', 'Architectural Lighting Design']
    }
  ],
  
  // Booking Status Options
  bookingStatuses: [
    { id: 'pending', label: 'Pending', color: 'var(--accent-blue)' },
    { id: 'confirmed', label: 'Confirmed', color: 'var(--accent-gold)' },
    { id: 'in-progress', label: 'In Progress', color: 'var(--accent-purple)' },
    { id: 'completed', label: 'Completed', color: '#22c55e' },
    { id: 'cancelled', label: 'Cancelled', color: 'var(--accent-red)' }
  ],
  
  // Budget Ranges
  budgetRanges: [
    { id: '25-40', label: '₹25-40 Lakhs' },
    { id: '40-60', label: '₹40-60 Lakhs' },
    { id: '60-80', label: '₹60-80 Lakhs' },
    { id: '80-100', label: '₹80-100 Lakhs' },
    { id: '100+', label: '₹1 Crore+' }
  ],
  
  // Timeline Options
  timelines: [
    { id: 'immediate', label: 'Immediate (Within 1 Month)' },
    { id: '3-months', label: 'Within 3 Months' },
    { id: '6-months', label: 'Within 6 Months' },
    { id: 'year', label: 'Within a Year' },
    { id: 'flexible', label: 'Flexible' }
  ],
  
  // Architectural Styles
  architecturalStyles: [
    { id: 'modern', label: 'Modern Contemporary' },
    { id: 'traditional', label: 'Traditional Indian' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'luxury', label: 'Luxury/Ultra-Modern' },
    { id: 'fusion', label: 'Fusion (Modern + Traditional)' }
  ],
  
  // Vastu Options
  vastuOptions: [
    { id: 'strict', label: 'Strict Vastu Compliance' },
    { id: 'basic', label: 'Basic Vastu Principles' },
    { id: 'none', label: 'Not Required' }
  ],
  
  // Additional Services
  additionalServices: [
    { id: 'interior', label: 'Interior Design' },
    { id: 'modular-kitchen', label: 'Modular Kitchen' },
    { id: 'false-ceiling', label: 'False Ceiling' },
    { id: 'wardrobes', label: 'Custom Wardrobes' },
    { id: 'wall-paneling', label: 'Wall Paneling' },
    { id: 'landscape', label: 'Landscape Design' },
    { id: 'smart-home', label: 'Smart Home Automation' },
    { id: 'solar', label: 'Solar Panel Installation' },
    { id: 'security', label: 'Security System (CCTV/Access)' },
    { id: 'elevation', label: '3D Exterior Elevation' },
    { id: 'vaastu-consult', label: 'Vastu Consultation' }
  ],
  
  // Material Preferences
  materials: {
    flooring: [
      { id: '', label: 'No Preference' },
      { id: 'vitrified', label: 'Vitrified Tiles (2x2 / 2x4)' },
      { id: 'marble', label: 'Italian/Imported Marble' },
      { id: 'wooden', label: 'Engineered Wooden' },
      { id: 'stone', label: 'Natural Stone' }
    ],
    kitchenCountertop: [
      { id: '', label: 'No Preference' },
      { id: 'granite', label: 'Granite' },
      { id: 'quartz', label: 'Quartz/Nano White' },
      { id: 'marble', label: 'Marble' },
      { id: 'solid-surface', label: 'Solid Surface' }
    ],
    bathroomTiles: [
      { id: '', label: 'No Preference' },
      { id: 'ceramic', label: 'Ceramic (Standard)' },
      { id: 'vitrified', label: 'Vitrified/Porcelain' },
      { id: 'designer', label: 'Designer/Mosaic' }
    ],
    windows: [
      { id: '', label: 'No Preference' },
      { id: 'upvc', label: 'UPVC' },
      { id: 'aluminum', label: 'Aluminum (Anodized)' },
      { id: 'wooden', label: 'Teak/Wooden' },
      { id: 'steel', label: 'Steel' }
    ]
  }
};

// Helper functions
export const getWhatsAppUrl = (message = BUSINESS_CONFIG.whatsapp.defaultMessage) => {
  return `${BUSINESS_CONFIG.whatsapp.baseUrl}/${BUSINESS_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
};

export const getTelUrl = () => {
  return BUSINESS_CONFIG.phone.telLink;
};

export const getPlanById = (planId) => {
  return BUSINESS_CONFIG.plans.find(p => p.id === planId);
};

export const getServiceById = (serviceId) => {
  return BUSINESS_CONFIG.services.find(s => s.id === serviceId);
};

export const getBookingStatus = (statusId) => {
  return BUSINESS_CONFIG.bookingStatuses.find(s => s.id === statusId);
};