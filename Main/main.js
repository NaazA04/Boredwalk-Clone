// ==============================
// Load Header via fetch
// ==============================
fetch('headermain.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('headermain').innerHTML = data;

    // After header is loaded, add event listeners to header icons
    const bagIcon = document.querySelector('.icon.bag');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.querySelector('.cart-close');

    if (bagIcon && cartModal && cartClose) {
      bagIcon.addEventListener('click', () => {
        cartModal.classList.add('active');
      });

      cartClose.addEventListener('click', () => {
        cartModal.classList.remove('active');
      });
    }
  });


// ==============================
// Image Slideshow Controls
// ==============================
const images = document.querySelectorAll('.product-img');
const nextBtn = document.querySelector('.rightnextbtn');
const prevBtn = document.querySelector('.leftnextbtn');
let current = 0;

function showImage(index) {
  images.forEach((img, i) => img.classList.remove('active'));
  images[index].classList.add('active');
}

if (nextBtn && prevBtn) {
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % images.length;
    showImage(current);
  });

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + images.length) % images.length;
    showImage(current);
  });
}


// ==============================
// Setup Carousels (Reusable)
// ==============================
document.addEventListener("DOMContentLoaded", function () {
  const visibleCards = 3;
  const cardWidths = {
    journalsSlider: 390,
    messengerSlider: 390,
    productSlider2: 390
  };

  function setupCarousel(containerSelector, cardSelector, leftBtnClass, rightBtnClass, sliderId) {
    const slider = document.getElementById(sliderId);
    const totalCards = slider.querySelectorAll(cardSelector).length;
    let currentSlide = 0;
    const cardWidth = cardWidths[sliderId];

    const leftBtn = document.querySelector(leftBtnClass);
    const rightBtn = document.querySelector(rightBtnClass);

    rightBtn.addEventListener("click", () => {
      if (currentSlide < totalCards - visibleCards) {
        currentSlide++;
        slider.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
      }
    });

    leftBtn.addEventListener("click", () => {
      if (currentSlide > 0) {
        currentSlide--;
        slider.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
      }
    });
  }

  setupCarousel(".carousel", ".product-card", ".leftnextbtn2[data-slider='journalsSlider']", ".rightnextbtn2[data-slider='journalsSlider']", "journalsSlider");
  setupCarousel(".carousel2", ".product-card2", ".leftnextbtn3", ".rightnextbtn3", "productSlider2");
  setupCarousel(".carousel", ".product-card", ".leftnextbtn2[data-slider='messengerSlider']", ".rightnextbtn2[data-slider='messengerSlider']", "messengerSlider");
});


// ==============================
// Quantity Increment/Decrement Buttons
// ==============================
document.querySelector('.qty-plus')?.addEventListener('click', () => {
  const input = document.getElementById('qty');
  input.value = parseInt(input.value) + 1;
});

document.querySelector('.qty-minus')?.addEventListener('click', () => {
  const input = document.getElementById('qty');
  input.value = Math.max(1, parseInt(input.value) - 1);
});


// ==============================
// Cart Logic + Modal UI Handling
// ==============================
const FREE_SHIPPING = 65;
let cart = [];

// ==== Elements ====
const cartModal = document.getElementById('cartModal');
const progressBarFill = document.querySelector('.progress-bar-fill');
const progressText = document.querySelector('.progress-text');
const cartEmptyDiv = document.querySelector('.cart-empty');
const cartSummary = document.getElementById('cartSummary');
const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');

// === Ensure cartItemsDiv exists ===
let cartItemsDiv = document.getElementById('cartItems');
if (!cartItemsDiv) {
  cartItemsDiv = document.createElement('div');
  cartItemsDiv.id = 'cartItems';
  cartItemsDiv.style.padding = '16px';

  //  Insert cart items above the Checkout Summary (not above suggestions anymore)
  const cartSummarySection = document.getElementById('cartSummary');
  if (cartSummarySection && cartModal) {
    cartModal.insertBefore(cartItemsDiv, cartSummarySection);
  }
}

// ==== Update Cart UI ====
function updateCartUI() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const away = Math.max(0, FREE_SHIPPING - subtotal);
  const percent = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (progressText) {
    progressText.innerHTML = away > 0
      ? `You are $${away.toFixed(2)} away from <b>FREE SHIPPING</b>`
      : `<b>Congratulations! You have FREE SHIPPING</b>`;
  }

  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    if (cartEmptyDiv) cartEmptyDiv.style.display = '';
    if (cartSummary) cartSummary.style.display = 'none';
  } else {
    if (cartEmptyDiv) cartEmptyDiv.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    if (cartSubtotalAmount) cartSubtotalAmount.textContent = `$${subtotal.toFixed(2)}`;

    cart.forEach((item, idx) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.style.marginBottom = '12px';
      cartItem.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
          <img src="${item.img}" alt="${item.title}" width="60" style="border-radius: 4px;">
          <div style="flex-grow: 1;">
            <div style="font-weight: bold;">${item.title}</div>
            <div>Qty: ${item.qty}</div>
            <div>$${(item.price * item.qty).toFixed(2)}</div>
          </div>
          <button class="remove-item-btn" data-index="${idx}" style="background:none;border:none;font-size:18px;color:#f00;cursor:pointer;">🗑️</button>
        </div>
      `;
      cartItemsDiv.appendChild(cartItem);
    });

    // Handle remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const index = parseInt(this.dataset.index);
        cart.splice(index, 1);
        updateCartUI();
      });
    });
  }
}

// ==== Add to Cart from Suggestions ====
document.querySelectorAll('.suggestion-item').forEach(item => {
  const title = item.querySelector('.suggestion-name')?.textContent.trim();
  const priceText = item.querySelector('.suggestion-price')?.textContent.trim();
  const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  const img = item.querySelector('img')?.src;

  item.querySelector('.add-btn')?.addEventListener('click', () => {
    const found = cart.find(i => i.title === title);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ title, price, img, qty: 1 });
    }
    updateCartUI();
    cartModal?.classList.add('active');
  });
});

// ==== Modal Open/Close ====
document.querySelector('.icon.bag')?.addEventListener('click', () => {
  cartModal?.classList.add('active');
});

document.querySelector('.cart-close')?.addEventListener('click', () => {
  cartModal?.classList.remove('active');
});

// ==== Checkout Button ====
document.querySelector('.checkout-btn')?.addEventListener('click', () => {
  alert('🛒 Checkout donee!!');
});

// ==== Initialize ====
updateCartUI();


// ==============================
// Flash Sale Countdown Timer
// ==============================
// Check if there's a saved countdown target in localStorage
let countdownTarget = localStorage.getItem('countdownTarget');

if (!countdownTarget) {
  // If not, set a new one (4 days from now) and save it
  countdownTarget = new Date().getTime() + 4 * 24 * 60 * 60 * 1000;
  localStorage.setItem('countdownTarget', countdownTarget);
} else {
  // Convert it back to a number
  countdownTarget = parseInt(countdownTarget);
}

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownTarget - now;

  if (distance <= 0) {
    document.getElementById("countdown").textContent = "EXPIRED";
    clearInterval(timerInterval);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("countdown").textContent =
    `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

// Start countdown
const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();


// ==============================
// Load Product Data + Search Filter
// ==============================
let products = {
  hoodies: [],
  tanktops: [],
  stickers: [],
  messengerbags: [],
  dishtowels: []
};

async function fetchProducts() {
  async function loadCategory(url, category) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const productList = doc.querySelector('.product-list');
      if (!productList) return;

      const cards = productList.querySelectorAll('.product');

      products[category] = Array.from(cards).map(card => {
        const name = card.querySelector('h4')?.textContent.trim() || '';
        const priceText = card.querySelector('p')?.textContent.trim() || '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const image = card.querySelector('img')?.src || '';

        return { name, price, image, category };
      });
    } catch (e) {
      console.error(`Error loading ${category} from ${url}:`, e);
    }
  }

  await Promise.all([
    loadCategory('unisexhoodies.html', 'hoodies'),
    loadCategory('unisextanktops.html', 'tanktops'),
    loadCategory('Stickers.html', 'stickers'),
    loadCategory('messengerbags.html', 'messengerbags'),
    loadCategory('dishtowels.html', 'dishtowels')
  ]);
}

function searchProducts(query, filters = {}) {
  const allProducts = Object.values(products).flat();
  return allProducts.filter(product => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesMinPrice = !filters.minPrice || product.price >= filters.minPrice;
    const matchesMaxPrice = !filters.maxPrice || product.price <= filters.maxPrice;
    return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
}

function updateSearchResults(results) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(product => {
    const card = document.createElement('div');
    card.className = 'search-result-item';
    const link = document.createElement('a');
    link.href = `${product.category}.html`;
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    link.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
      </div>
    `;
    card.appendChild(link);
    container.appendChild(card);
  });
}

// ==============================
// Search Modal Handlers
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const minPriceFilter = document.getElementById('minPrice');
  const maxPriceFilter = document.getElementById('maxPrice');
  const searchModal = document.getElementById('searchModal');
  const searchIcon = document.querySelector('.search-icon');
  const closeSearchBtn = document.querySelector('.close-search');

  if (!searchInput || !categoryFilter || !minPriceFilter || !maxPriceFilter || !searchModal || !searchIcon || !closeSearchBtn) return;

  function performSearch() {
    const query = searchInput.value.trim();
    const filters = {
      category: categoryFilter.value,
      minPrice: parseFloat(minPriceFilter.value) || null,
      maxPrice: parseFloat(maxPriceFilter.value) || null
    };
    const results = searchProducts(query, filters);
    updateSearchResults(results);
  }

  searchIcon.addEventListener('click', () => {
    searchModal.style.display = 'block';
    searchInput.focus();
  });

  closeSearchBtn.addEventListener('click', () => {
    searchModal.style.display = 'none';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchModal.style.display = 'none';
  });

  searchInput.addEventListener('input', performSearch);
  categoryFilter.addEventListener('change', performSearch);
  minPriceFilter.addEventListener('input', performSearch);
  maxPriceFilter.addEventListener('input', performSearch);
});


// ==============================
// Newsletter Modal Handling
// ==============================
// Show the modal 4 seconds after every page load
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    document.getElementById('newsletterModal').style.display = 'block';
  }, 4000);
});

// Close button logic
document.addEventListener('click', function (event) {
  if (event.target.id === 'closeModal') {
    document.getElementById('newsletterModal').style.display = 'none';
  }
});

// Form submission logic
document.addEventListener('submit', function (e) {
  if (e.target.id === 'newsletterForm') {
    e.preventDefault();
    alert("✨ You're in, superstar! Get ready for inbox magic and a shot at that $50! 💌🤑");
    document.getElementById('newsletterModal').style.display = 'none';
  }
});



