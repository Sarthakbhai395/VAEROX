// Global Dynamic FAQ Utility for Admin Management & Homepage Sync
export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    q: 'Are all VÆROX products 100% authentic and certified?',
    a: 'Yes. Every VÆROX item is meticulously handcrafted or sourced directly from verified luxury ateliers. Each purchase includes a digital Certificate of Authenticity and unique serial verification.',
  },
  {
    id: 'faq-2',
    q: 'Can I request bespoke sizing or custom tailoring for formal wear?',
    a: 'Absolutely. We offer complimentary luxury concierge tailoring services. After placing your order, select "Custom Fit" in your user dashboard or contact our 24/7 VIP Concierge.',
  },
  {
    id: 'faq-3',
    q: 'What are the delivery timelines and shipping charges?',
    a: 'We offer complimentary express delivery across India on all orders above ₹1999. Standard orders are dispatched within 24 hours and delivered within 2-4 business days via insured express transit.',
  },
  {
    id: 'faq-4',
    q: 'Do you offer real-time order tracking and discrete packaging?',
    a: 'Yes. All orders are packed in signature VÆROX hard-box luxury packaging with tamper-evident security seals. Real-time SMS and email tracking links are provided upon dispatch.',
  },
  {
    id: 'faq-5',
    q: 'What is the VÆROX return and exchange policy?',
    a: 'We provide a 15-day hassle-free return and instant exchange policy. Items must be unworn, undamaged, with original luxury tags and security seals intact.',
  },
  {
    id: 'faq-6',
    q: 'How long does a refund take to reflect in my bank account?',
    a: 'Once returned items pass quality verification at our atelier, refunds are processed instantly within 24-48 business hours back to your original payment mode.',
  }
];

export const getFaqs = () => {
  try {
    const saved = localStorage.getItem('vaerox_website_faqs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading FAQs from storage:', e);
  }
  return DEFAULT_FAQS;
};

export const saveFaqs = (faqs) => {
  try {
    localStorage.setItem('vaerox_website_faqs', JSON.stringify(faqs));
    window.dispatchEvent(new Event('vaerox_faqs_updated'));
    return faqs;
  } catch (e) {
    console.error('Error saving FAQs to storage:', e);
    return getFaqs();
  }
};

export const resetFaqsToDefault = () => {
  try {
    localStorage.removeItem('vaerox_website_faqs');
    window.dispatchEvent(new Event('vaerox_faqs_updated'));
    return DEFAULT_FAQS;
  } catch (e) {
    console.error('Error resetting FAQs:', e);
    return DEFAULT_FAQS;
  }
};
