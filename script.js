/**
 * PLURON STUDIO - Interactive JavaScript
 * Owner: Plamedi
 * Handles: Real Services & Pricing Calculator, Stepper, Form Submission, Dynamic Year
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Pricing Calculator
  initCalculator();

  // Initialize Contact Form Simulation
  initContactForm();

  // Update Footer Copyright Year
  updateYear();
});

/**
 * Pricing Calculator Logic
 */
function initCalculator() {
  const packageRadios = document.querySelectorAll('input[name="packageSelect"]');
  const packageCards = document.querySelectorAll('.package-card');
  const featuresTitle = document.getElementById('selectedPackageTitle');
  const featuresList = document.getElementById('packageFeaturesList');
  
  const extraPagesInput = document.getElementById('extraPages');
  const stepperMinus = document.getElementById('stepperMinus');
  const stepperPlus = document.getElementById('stepperPlus');
  
  const addonEcommerce = document.getElementById('addonEcommerce');
  const addonLogo = document.getElementById('addonLogo');

  const oneTimePriceElement = document.getElementById('oneTimePrice');
  const monthlyPriceElement = document.getElementById('monthlyPrice');
  const depositPriceElement = document.getElementById('depositPrice');

  if (!packageRadios.length || !oneTimePriceElement) return;

  // Package Data Definition
  const packages = {
    starter: {
      name: 'Starter Package',
      basePrice: 800,
      features: [
        '1 page website',
        'WhatsApp direct button',
        'mybusiness.co.za domain',
        'Professional email'
      ]
    },
    growth: {
      name: 'Growth Package',
      basePrice: 1200,
      features: [
        '3 page website',
        'Google Maps setup',
        'mybusiness.co.za domain',
        'Professional email'
      ]
    },
    pro: {
      name: 'Pro Package',
      basePrice: 1500,
      features: [
        '5 page website',
        'Google Maps setup',
        'mybusiness.co.za domain',
        'Professional email'
      ]
    }
  };

  // Helper to format currency numbers with commas (e.g. R1,200)
  function formatCurrency(amount) {
    return 'R' + amount.toLocaleString('en-ZA');
  }

  // Update features list UI
  function updateFeatures(packageKey) {
    const pkg = packages[packageKey] || packages.starter;
    if (featuresTitle) {
      featuresTitle.textContent = `${pkg.name} Includes:`;
    }
    if (featuresList) {
      featuresList.innerHTML = pkg.features
        .map(feat => `<li><span class="check-icon">&#10003;</span> ${feat}</li>`)
        .join('');
    }
  }

  // Calculate live total price & deposit
  function calculatePrice() {
    let selectedKey = 'starter';
    packageRadios.forEach(radio => {
      if (radio.checked) {
        selectedKey = radio.value;
      }
    });

    // Update active package card styling
    packageCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const selectedPkg = packages[selectedKey] || packages.starter;

    // Calculate Add-ons
    const extraPagesCount = Math.max(0, parseInt(extraPagesInput ? extraPagesInput.value : 0) || 0);
    const extraPagesCost = extraPagesCount * 100;
    const ecommerceCost = (addonEcommerce && addonEcommerce.checked) ? 600 : 0;
    const logoCost = (addonLogo && addonLogo.checked) ? 350 : 0;

    const totalOneTime = selectedPkg.basePrice + extraPagesCost + ecommerceCost + logoCost;
    const depositAmount = Math.round(totalOneTime / 2);

    // Update UI elements
    oneTimePriceElement.textContent = formatCurrency(totalOneTime);
    if (depositPriceElement) {
      depositPriceElement.textContent = formatCurrency(depositAmount);
    }
    if (monthlyPriceElement) {
      monthlyPriceElement.textContent = 'R150/pm';
    }

    // Update checklist
    updateFeatures(selectedKey);
  }

  // Stepper controls for extra pages
  if (stepperMinus && extraPagesInput) {
    stepperMinus.addEventListener('click', () => {
      let currentVal = parseInt(extraPagesInput.value) || 0;
      if (currentVal > 0) {
        extraPagesInput.value = currentVal - 1;
        calculatePrice();
      }
    });
  }

  if (stepperPlus && extraPagesInput) {
    stepperPlus.addEventListener('click', () => {
      let currentVal = parseInt(extraPagesInput.value) || 0;
      if (currentVal < 20) {
        extraPagesInput.value = currentVal + 1;
        calculatePrice();
      }
    });
  }

  // Event Listeners for radio options & add-on checkboxes
  packageRadios.forEach(radio => {
    radio.addEventListener('change', calculatePrice);
  });

  if (addonEcommerce) addonEcommerce.addEventListener('change', calculatePrice);
  if (addonLogo) addonLogo.addEventListener('change', calculatePrice);
  if (extraPagesInput) extraPagesInput.addEventListener('input', calculatePrice);

  // Initial Calculation Run
  calculatePrice();
}

/**
 * Formspree Contact Form Integration
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

  if (!contactForm || !formFeedback) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const businessName = document.getElementById('businessName')?.value.trim();
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://formspree.io/f/mqpzowdz', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        formFeedback.textContent = `Thank you${businessName ? ', ' + businessName : ''}! Your message has been sent. Plamedi will reply to you within 24 hours.`;
        formFeedback.className = 'form-feedback success';
        contactForm.reset();
      } else {
        const data = await response.json();
        if (data && Object.hasOwn(data, 'errors')) {
          formFeedback.textContent = data["errors"].map(error => error["message"]).join(", ");
        } else {
          formFeedback.textContent = "Oops! There was a problem submitting your message. Please try again.";
        }
        formFeedback.className = 'form-feedback error';
      }
    } catch (error) {
      formFeedback.textContent = "Network error. Please check your connection or email plum@pluron.co.za directly.";
      formFeedback.className = 'form-feedback error';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      formFeedback.style.display = 'block';

      // Hide message after 10 seconds
      setTimeout(() => {
        formFeedback.style.display = 'none';
        formFeedback.className = 'form-feedback';
      }, 10000);
    }
  });
}

/**
 * Auto-update Copyright Year
 */
function updateYear() {
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}
