let categoriesStatus = {
  cakes: true,
  oriental: true,
  dates: true,
  tarts: true
};

// ============================================
// Global Variables
// ============================================
let currentLang = 'en';
const cart = [];
const WHATSAPP_BUSINESS_NUMBER = '201125933005';

if (typeof data !== "undefined" && data) {
  categoriesStatus = {
    cakes: true,
    GATO: true,
    dates: true,
    tarts: true,
    ...data
  };
}

// ============================================
// DOM Elements
// ============================================
const menuToggle = document.querySelector('.menu-toggle');
const languageMenu = document.getElementById('languageMenu');
const langButtons = document.querySelectorAll('.lang-btn');
const cartToggle = document.querySelector('.cart-toggle');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.querySelector('.cart-close');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.querySelector('.cart-count');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutModal = document.getElementById('checkoutModal');
const modalClose = document.getElementById('modalClose');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const orderForm = document.getElementById('orderForm');
const orderSummary = document.getElementById('orderSummary');
const orderTotal = document.getElementById('orderTotal');

const categoryButtons = document.querySelectorAll('[data-category]');
const detailsSection = document.getElementById('categoryDetails');
const detailsTitle = document.getElementById('detailsTitle');
const detailsText = document.getElementById('detailsText');
const detailsGrid = document.getElementById('detailsGrid');
const detailsClose = document.getElementById('detailsClose');

// 🎬 Video Elements
const videoElement = document.getElementById('videoPlayer');
const lastFrameImage = document.getElementById('lastFrameImage');
const heroSection = document.getElementById('heroSection');

function safeAddEvent(element, event, callback) {
  if (element) {
    element.addEventListener(event, callback);
  }
}

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAJT6uIjmlFOvDy2owEUsZAwhCV8ReLkag",
  authDomain: "western-78cd9.firebaseapp.com",
  projectId: "western-78cd9",
  storageBucket: "western-78cd9.appspot.com",
  messagingSenderId: "148042495076",
  appId: "1:148042495076:web:eae114fa658321524d1b71",
  measurementId: "G-GLYH0DDVKQ",
  databaseURL: "https://western-78cd9-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ============================================
// 🎬 Video Handler - Auto Play & Last Frame
// ============================================
function captureLastFrame() {
  if (!videoElement) return;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  // تحويل الـ canvas إلى صورة
  const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
  lastFrameImage.src = imageUrl;
  
  // إظهار الصورة وإخفاء الفيديو
  videoElement.style.display = 'none';
  lastFrameImage.style.display = 'block';
}

function setupVideoHandling() {
  if (!videoElement) return;

  // بدون controls للفيديو
  videoElement.controls = false;
  videoElement.muted = true;
  videoElement.autoplay = true;
  videoElement.playsInline = true;

  // عند انتهاء الفيديو
  videoElement.addEventListener('ended', () => {
    captureLastFrame();
  });

  // إذا فشل تحميل الفيديو
  videoElement.addEventListener('error', () => {
    console.error('Video failed to load');
  });

  // تشغيل الفيديو
  videoElement.play().catch(err => {
    console.error('Autoplay failed:', err);
  });
}

// ============================================
// Language Toggle
// ============================================
safeAddEvent(menuToggle, 'click', () => {
  languageMenu.hidden = !languageMenu.hidden;
});

langButtons.forEach(btn => {
  safeAddEvent(btn, 'click', () => {
    currentLang = btn.dataset.lang;
    updateLanguage();
    languageMenu.hidden = true;
  });
});

function updateLanguage() {
  const htmlElement = document.documentElement;
  htmlElement.lang = currentLang;
  htmlElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-en][data-ar]').forEach(element => {
    element.textContent = currentLang === 'en' ? element.dataset.en : element.dataset.ar;
  });

  updateCategoryDetails();
}

// ============================================
// Shopping Cart
// ============================================
safeAddEvent(cartToggle, 'click', () => {
  cartSidebar.hidden = !cartSidebar.hidden;
});

safeAddEvent(cartClose, 'click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  cartSidebar.hidden = true;
});

safeAddEvent(clearCartBtn, 'click', () => {
  if (confirm(currentLang === 'en' ? 'Clear entire cart?' : 'مسح جميع العناصر؟')) {
    cart.length = 0;
    updateCartUI();
  }
});

safeAddEvent(checkoutBtn, 'click', () => {
  if (cart.length === 0) {
    alert(currentLang === 'en' ? 'Your cart is empty!' : 'عربتك فارغة!');
  } else {
    cartSidebar.hidden = true;
    showCheckoutModal();
  }
});

function addToCart(itemName, price) {
  const item = {
    name: itemName,
    price: price,
    id: Date.now()
  };
  cart.push(item);
  updateCartUI();
  showNotification(currentLang === 'en' ? 'Added to cart!' : 'تمت الإضافة للسلة!');
}

function removeFromCart(itemId) {
  const index = cart.findIndex(item => item.id === itemId);
  if (index > -1) {
    cart.splice(index, 1);
    updateCartUI();
  }
}

function updateCartUI() {
  cartCountElement.textContent = cart.length;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-cart" data-en="Your cart is empty" data-ar="عربتك فارغة">Your cart is empty</p>`;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${item.price} جنيه</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">✕</button>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotalElement.textContent = total;
}

// ============================================
// Checkout Modal
// ============================================
function showCheckoutModal() {
  updateOrderSummary();
  checkoutModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  checkoutModal.hidden = true;
  document.body.style.overflow = 'auto';
}

safeAddEvent(modalClose, 'click', closeCheckoutModal);
safeAddEvent(cancelOrderBtn, 'click', closeCheckoutModal);

safeAddEvent(checkoutModal, 'click', (e) => {
  if (e.target === checkoutModal) {
    closeCheckoutModal();
  }
});

function updateOrderSummary() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  orderSummary.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.name}</span>
      <span>${item.price} جنيه</span>
    </div>
  `).join('');
  orderTotal.textContent = total;
}

// ============================================
// Generate WhatsApp Message
// ============================================
function generateWhatsAppMessage(orderData) {
  const itemsList = orderData.items.map(item => `• ${item.name}: ${item.price} جنيه`).join('\n');
  
  let message = '';
  
  if (currentLang === 'ar') {
    message = `
📦 *طلب جديد من أبو السعود*

👤 *الاسم:* ${orderData.name}
📱 *رقم الهاتف:* ${orderData.phone}
🗺️ *العنوان:* ${orderData.address}

📝 *الطلب:*
${itemsList}

💰 *الإجمالي:* ${orderData.total} جنيه

📌 *ملاحظات:* ${orderData.notes || 'بدون ملاحظات'}
    `.trim();
  } else {
    message = `
📦 *New Order from Abu Al-Saud*

👤 *Name:* ${orderData.name}
📱 *Phone:* ${orderData.phone}
🗺️ *Address:* ${orderData.address}

📝 *Items:*
${orderData.items.map(item => `• ${item.name}: ${item.price} EGP`).join('\n')}

💰 *Total:* ${orderData.total} EGP

📌 *Notes:* ${orderData.notes || 'No notes'}
    `.trim();
  }
  
  return encodeURIComponent(message);
}

// ============================================
// Handle Form Submission
// ============================================
safeAddEvent(orderForm, 'submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(orderForm);
  const orderData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    notes: formData.get('notes'),
    items: cart.map(item => ({ name: item.name, price: item.price })),
    total: cart.reduce((sum, item) => sum + item.price, 0),
    date: new Date().toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US')
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  const whatsappMessage = generateWhatsAppMessage(orderData);
  const whatsappLink = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${whatsappMessage}`;

  window.open(whatsappLink, '_blank');

  alert(currentLang === 'en' 
    ? `Thank you ${orderData.name}! Opening WhatsApp to confirm your order.` 
    : `شكراً ${orderData.name}! جاري فتح الواتس لتأكيد طلبك.`);

  cart.length = 0;
  updateCartUI();
  orderForm.reset();
  closeCheckoutModal();

  console.log('Order Data:', orderData);
});

// ============================================
// Category Data
// ============================================
const categoryImages = {
  cakes: '14.JPG',
  GATO: '14.1.JPG',
  dates: 'category-dates.jpg',
  tarts: 'category-tarts.jpg'
};

const categories = {
  cakes: {
    titleEn: 'Cakes Menu',
    titleAr: 'منيو التورت',
    textEn: 'Click on any product to add to cart:',
    textAr: 'اضغط على المنتج لإضافته للسلة:',
    items: [
      
      {id:2 , nameEn: 'Vanilla Nutella Cake', nameAr: 'كيك فانيليا بالنوتيلا', price: 210, image: '2.JPG',available: true },
      {id:3 , nameEn: 'Creamy Strawberry Cake', nameAr: 'كيك الفراولة الكريمي', price: 235, image: '3.JPG',available: true },
      {id:4 , nameEn: 'Red Berry Cake', nameAr: 'كيك التوت الأحمر', price: 240, image: '4.JPG' ,available: true},
      {id:5 , nameEn: 'Chocolate Ball Cake', nameAr: 'كيك كرة الشوكولاتة', price: 255, image: '5.JPG' ,available: true},
      {id:6 , nameEn: 'Vanilla Fruit Cake', nameAr: 'كيك الفانيليا مع الفواكه', price: 225, image: '6.JPG' ,available: true},
      {id:7 , nameEn: 'Cream Caramel Cake', nameAr: 'كيك الكريم كراميل', price: 230, image: '7.JPG',available: true },
      {id:8 , nameEn: 'Mille-feuille Cake', nameAr: 'كيك الميلفوي', price: 245, image: '8.JPG' ,available: true},
      {id:10 , nameEn: 'Tiramisu Cake', nameAr: 'كيك التيراميسو', price: 250, image: '10.JPG' ,available: true},
      {id:11 , nameEn: 'Tiramisu Cake', nameAr: 'كيك التيراميسو', price: 250, image: '14.JPG' ,available: true},
      {id:12 , nameEn: 'Tiramisu Cake', nameAr: 'كيك التيراميسو', price: 250, image: '11.JPG' ,available: true},
      {id:13 , nameEn: 'Tiramisu Cake', nameAr: 'كيك التيراميسو', price: 250, image: '12.JPG' ,available: true},
      {id:13 , nameEn: 'Tiramisu Cake', nameAr: 'كيك التيراميسو', price: 250, image: '13.JPG' ,available: true},
      {id:9 , nameEn: 'Hazelnut Cake', nameAr: 'كيك البندق', price: 260, image: '9.JPG',available: true },
      {id:1 , nameEn: 'Luxury Chocolate Cake', nameAr: 'كيك شوكولاتة فاخرة', price: 220, image: '1.JPG' ,available: true}

    ]
  },
  GATO: {
    titleEn: 'GATO Sweets Menu',
    titleAr: 'منيو الحلويات الشرقية',
    textEn: 'Our most famous GATO varieties:',
    textAr: 'أشهر أصنافنا الشرقية:',
    items: [
      {id:11 , nameEn: 'Nablusi Kunafa', nameAr: 'كنافة نابلسية', price: 95, image: '14.1.JPG' ,available: true},
      {id:13 , nameEn: 'Pistachio Klaj', nameAr: 'كلاج بالفستق', price: 120, image: '15.JPG',available: true },
      {id:14 , nameEn: 'Pistachio Ghraybeh', nameAr: 'غريبة الفستق', price: 90, image: '16.JPG' ,available: true},
      {id:15 , nameEn: 'Eid Cake', nameAr: 'كعك العيد', price: 85, image: '17.JPG' ,available: true},
      {id:16 , nameEn: 'Date Jam', nameAr: 'مربى التمر', price: 105, image: '18.JPG' ,available: true},
      {id:17 , nameEn: 'Salty Soup', nameAr: 'شوربة موالح', price: 80, image: '19.JPG' ,available: true},
      {id:18 , nameEn: 'Cheese Qatayef', nameAr: 'قطايف بالجبنة', price: 115, image: '20.JPG',available: true },
      {id:19 , nameEn: 'Pistachio Muhhallabia', nameAr: 'مهلبية بالفستق', price: 70, image: '21.JPG' ,available: true},
      {id:20 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'22.JPG' ,available:true},
      {id:21 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'23.JPG' ,available:true},
      {id:41 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'24.JPG' ,available:true},
      {id:42 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'25.JPG' ,available:true},
      {id:43 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'26.JPG' ,available:true},
      {id:45 , nameEn:'Plain Rami', nameAr: 'رامي السادة', price:75, image:'27.JPG' ,available:true}
    ]
  },
  dates: {
    titleEn: 'Date Boxes Menu',
    titleAr: 'منيو صناديق التمر',
    textEn: 'Best date boxes for gifts and occasions:',
    textAr: 'أفضل صناديق التمر للهدايا والمناسبات:',
    items: [
      {id:21 , nameEn: 'Almond Date Box', nameAr: 'صندوق تمر لوز', price: 180, image: 'dates-1.jpg',available: true },
      {id:22 , nameEn: 'Pistachio Date Box', nameAr: 'صندوق تمر فستق', price: 190, image: 'dates-2.jpg',available: true },
      {id:23 , nameEn: 'Honey Date Box', nameAr: 'صندوق تمر بالعسل', price: 185, image: 'dates-3.jpg' ,available: true},
      {id:24 , nameEn: 'Premium Box', nameAr: 'صندوق بريميوم', price: 220, image: 'dates-4.jpg',available: true },
      {id:25 , nameEn: 'Date with Nuts Box', nameAr: 'صندوق تمر مع مكسرات', price: 200, image: 'dates-5.jpg' ,available: true},
      {id:26 , nameEn: 'Elegant Gift Box', nameAr: 'صندوق هدية أنيق', price: 210, image: 'dates-6.jpg' ,available: true},
      {id:27 , nameEn: 'Tamriah Date Box', nameAr: 'صندوق تمر تمرية', price: 170, image: 'dates-7.jpg' ,available: true},
      {id:28 , nameEn: 'Lace Date Box', nameAr: 'صندوق دانتيل تمر', price: 225, image: 'dates-8.jpg' ,available: true},
      {id:29 , nameEn: 'Luxury Plain Box', nameAr: 'صندوق سادة فاخر', price: 160, image: 'dates-9.jpg' ,available: true},
      {id:30 , nameEn: 'Cinnamon Date Box', nameAr: 'صندوق تمر بالقرفة', price: 175, image: 'dates-10.jpg' ,available: true}
    ]
  },
  tarts: {
    titleEn: 'Tarts Menu',
    titleAr: 'منيو التارت',
    textEn: 'Available tart varieties:',
    textAr: 'أنواع التارت المتاحة:',
    items: [
      {id:31 , nameEn: 'Strawberry Tart', nameAr: 'تارت الفراولة', price: 145, image: 'tart-1.jpg' ,available: true},
      {id:32 , nameEn: 'Lemon Tart', nameAr: 'تارت الليمون', price: 140, image: 'tart-2.jpg',available: true },
      {id:33 , nameEn: 'Berry Tart', nameAr: 'تارت التوت', price: 150, image: 'tart-3.jpg' ,available: true},
      {id:34 , nameEn: 'Salted Caramel Tart', nameAr: 'تارت الكراميل المالح', price: 155, image: 'tart-4.jpg',available: true },
      {id:35 , nameEn: 'Apple Tart', nameAr: 'تارت التفاح', price: 135, image: 'tart-5.jpg' ,available: true},
      {id:36 , nameEn: 'Dark Chocolate Tart', nameAr: 'تارت الشوكولاتة الداكنة', price: 160, image: 'tart-6.jpg',available: true },
      {id:37 , nameEn: 'Hazelnut Tart', nameAr: 'تارت البندق', price: 165, image: 'tart-7.jpg' ,available: true},
      {id:38 , nameEn: 'Mixed Fruit Tart', nameAr: 'تارت الفواكه المشكلة', price: 170, image: 'tart-8.jpg' ,available: true},
      {id:39 , nameEn: 'Walnut Honey Tart', nameAr: 'تارت الجوز والعسل', price: 150, image: 'tart-9.jpg' ,available: true},
      {id:40 , nameEn: 'White Chocolate Tart', nameAr: 'تارت الشوكولاتة البيضاء', price: 155, image: 'tart-10.jpg',available: true}
    ]
  }
};

// ============================================
// Category Display
// ============================================
function updateCategoryDetails() {
  if (!detailsSection.hidden) {
    const categoryName = Object.keys(categories).find(cat =>
      categories[cat].titleEn === detailsTitle.textContent ||
      categories[cat].titleAr === detailsTitle.textContent
    );

    if (categoryName) {
      showCategory(categoryName);
    }
  }
}

function showCategory(category) {
    
  const data = categories[category];
  if (!data) return;

  // 🔴 فحص إذا كان القسم مقفول
  if (!categoriesStatus[category]) {
    const closedMsg = currentLang === 'en' 
      ? `${category.toUpperCase()} section is currently closed!` 
      : `قسم ${data.titleAr} مقفول حالياً!`;
    alert(closedMsg);
    detailsSection.hidden = true;
    return;
  }

  detailsTitle.textContent = currentLang === 'en' ? data.titleEn : data.titleAr;
  detailsText.textContent = currentLang === 'en' ? data.textEn : data.textAr;
  
  detailsGrid.innerHTML = data.items
    .map(item => {
      const itemName = currentLang === 'en' ? item.nameEn : item.nameAr;
      const buttonText = currentLang === 'en' ? 'Add to Cart' : 'أضف للسلة';
      const isAvailable = item.available !== false;

      return `
        <div class="product-card ${!isAvailable ? 'unavailable' : ''}">
          <img src="${item.image}" alt="${itemName}" loading="lazy">

          <h4>${itemName}</h4>

          <p class="price">${item.price} جنيه</p>

          ${isAvailable 
            ? `<button class="add-to-cart-btn" onclick="addToCart('${itemName.replace(/'/g, "\\'")}', ${item.price})">
                ${buttonText}
              </button>`
            : `<button class="add-to-cart-btn disabled" disabled>
                ${currentLang === 'en' ? 'Not Available' : 'غير متوفر'}
              </button>`
          }
        </div>
      `;
    })
    .join('');
  
  detailsSection.hidden = false;
}

categoryButtons.forEach(button => {
  safeAddEvent(button, 'click', () => showCategory(button.dataset.category));  
  const category = button.dataset.category;
  if (categoryImages[category]) {
    const gradient = 'linear-gradient(180deg, rgba(34, 20, 9, 0.08), rgba(34, 20, 9, 0.35))';
    button.style.backgroundImage = `${gradient}, url('${categoryImages[category]}')`;
  }
});

safeAddEvent(detailsClose, 'click', () => {
  detailsSection.hidden = true;
});

// ============================================
// Utility Functions
// ============================================
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}

// ============================================
// Initialize on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  updateLanguage();
  
  // 🔴 تحميل الأقسام من Firebase
  loadCategoriesFromFirebase();
  loadCategoriesData();
  
  // 🎬 إعداد الفيديو
  setupVideoHandling();
});

// 🔴 تحميل حالات الأقسام من Firebase عند البداية
function loadCategoriesFromFirebase() {
  database.ref('categoriesStatus').on('value', (snapshot) => {
    const data = snapshot.val();

    if (typeof data !== "undefined" && data) {
      categoriesStatus = {
        ...categoriesStatus,
        ...data
      };
    }

    console.log('Categories:', categoriesStatus);

    if (adminPanelVisible) {
      renderAdminCategories();
    }
  });
}

// ========== Admin Panel ==========
const adminTriggerElement = document.querySelector("#abu-al-saud-title");
let clickCount = 0;
let clickTimer;
let adminPanelVisible = false;

if (adminTriggerElement) {
  adminTriggerElement.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount === 3) {
      clickCount = 0;
      showAdminLogin();
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
    }
  });
}

function showAdminLogin() {
  const password = prompt("ادخل كلمة السر:");
  if (password === "123456") {
    openAdminPanel();
  } else if (password !== null) {
    alert("كلمة سر خاطئة.");
  }
}

function openAdminPanel() {
  document.getElementById('adminPanel').style.display = 'block';
  adminPanelVisible = true;
  renderAdminCategories();
}

function closeAdminPanel() {
  document.getElementById('adminPanel').style.display = 'none';
  adminPanelVisible = false;
}
window.closeAdminPanel = closeAdminPanel;

// =========== Admin Categories Control ==========
function renderAdminCategories() {
  const container = document.getElementById('adminCategories');
  container.innerHTML = "<h3>تحكم بالأقسام:</h3>";

  Object.keys(categories).forEach(category => {
    const cat = categories[category];

    const status = categoriesStatus[category] !== undefined 
      ? categoriesStatus[category] 
      : true;

    const statusText = status ? "مفتوح ✅" : "مغلق ❌";
    const btnText = status ? "قفل القسم" : "فتح القسم";
    const btnStyle = status 
      ? "background:red; color:white;" 
      : "background:green; color:white;";

    const categoryDiv = document.createElement('div');
    categoryDiv.style.cssText = 'margin:10px 0; padding:10px; border:1px solid #ccc; border-radius:5px;';

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-weight:bold;">${category}</span>
          <span style="margin-left:10px; color:${status ? 'green' : 'red'}; font-weight:bold;">
            ${statusText}
          </span>
        </div>

        <button class="toggle-category-btn" data-category="${category}" data-status="${!status}"
          style="${btnStyle} padding:6px 12px; border:none; border-radius:5px; cursor:pointer;">
          ${btnText}
        </button>
      </div>

      <hr>
    `;

    // 👇 ده الجزء الصح بتاع المنتجات
    (cat.items || []).forEach(item => {
      const isAvailable = item.available !== false;

      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin:5px 0;">
          <span>
            ${currentLang === 'en' ? item.nameEn : item.nameAr}
          </span>

          <button class="toggle-availability-btn" data-category="${category}" data-item-id="${item.id}"
            style="padding:5px 10px; border:none; border-radius:5px;
            background:${isAvailable ? 'red' : 'green'}; color:white; cursor:pointer;">
            ${isAvailable ? 'إخفاء' : 'إظهار'}
          </button>
        </div>
      `;
    });

    categoryDiv.innerHTML = html;
    container.appendChild(categoryDiv);
  });

  // ✅ أضف event listeners بعد ما تنشئ العناصر
  attachAdminEventListeners();
}

// ✅ دالة جديدة لتوصيل الـ events
function attachAdminEventListeners() {
  // زراير قفل/فتح الأقسام
  document.querySelectorAll('.toggle-category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      const newStatus = e.target.dataset.status === 'true';
      toggleCategoryStatus(category, newStatus);
    });
  });

  // زراير إظهار/إخفاء المنتجات
  document.querySelectorAll('.toggle-availability-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      const itemId = parseInt(e.target.dataset.itemId);
      toggleAvailability(category, itemId);
    });
  });
}
window.attachAdminEventListeners = attachAdminEventListeners;

function toggleCategoryStatus(category, newStatus) {
  // ✅ حدّث محليًا أولاً
  categoriesStatus[category] = newStatus;
  renderAdminCategories();

  // إذا تم قفل القسم وهو مفتوح، اغلقه
  if (!newStatus && !detailsSection.hidden) {
    const currentCategory = Object.keys(categories).find(c =>
      categories[c].titleEn === detailsTitle.textContent ||
      categories[c].titleAr === detailsTitle.textContent
    );
    if (currentCategory === category) {
      detailsSection.hidden = true;
    }
  }

  // حفظ في Firebase
  database.ref(`categoriesStatus/${category}`).set(newStatus)
    .then(() => {
      showNotification(newStatus ? "✅ تم فتح القسم" : "✅ تم قفل القسم");
    })
    .catch(err => {
      console.error(err);
      showNotification("❌ خطأ في تحديث القسم");
      // أرجع للحالة السابقة
      categoriesStatus[category] = !newStatus;
      renderAdminCategories();
    });
}
window.toggleCategoryStatus = toggleCategoryStatus;

function toggleAvailability(category, itemId) {
  // ✅ حدّث محليًا أولاً
  const itemIndex = categories[category].items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    showNotification("الصنف غير موجود");
    return;
  }

  // عكس حالة التوفر
  categories[category].items[itemIndex].available = !categories[category].items[itemIndex].available;

  // ✅ أعد الرسم فوراً
  renderAdminCategories();
  if (!detailsSection.hidden) {
    showCategory(category);
  }

  // حفظ في Firebase في الخلفية
  const updatedArray = categories[category].items;
  database.ref(`categories/${category}/items`).set(updatedArray)
    .then(() => {
      const isAvailable = categories[category].items[itemIndex].available;
      showNotification(isAvailable ? "✅ تم إظهار الصنف" : "✅ تم إخفاء الصنف");
    })
    .catch(err => {
      console.error(err);
      showNotification("❌ خطأ في حفظ البيانات");
      // أرجع للحالة السابقة إذا فشل الحفظ
      categories[category].items[itemIndex].available = !categories[category].items[itemIndex].available;
      renderAdminCategories();
    });
}
window.toggleAvailability = toggleAvailability;

function loadCategoriesData() {
  database.ref('categories').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    Object.keys(categories).forEach(cat => {
      if (data[cat] && Array.isArray(data[cat].items)) {
        categories[cat].items = data[cat].items;
      }
    });

    if (!detailsSection.hidden) {
      const current = Object.keys(categories).find(c =>
        categories[c].titleEn === detailsTitle.textContent ||
        categories[c].titleAr === detailsTitle.textContent
      );

      if (current) showCategory(current);
    }

    if (adminPanelVisible) {
      renderAdminCategories();
    }
  });
}
window.loadCategoriesData = loadCategoriesData;
