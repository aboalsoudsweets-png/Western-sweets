// ========== DATA ==========
const defaultDrinks = [
{
id: "a1",
nameAr: "تورته",
nameEn: "",
price: 0,
category: "tart",
image: "tar.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a2",
nameAr: "جاتو",
nameEn: "",
price: 0,
category: "gato",
image: "1.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a3",
nameAr: "مولتن",
nameEn: "",
price: 0,
category: "molten",
image: "1.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a4",
nameAr: "كعكة",
nameEn: "",
price: 0,
category: "torat",
image: "1.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a5",
nameAr: "تشيز كيك",
nameEn: "",
price: 0,
category: "cheesecake",
image: "1.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a6",
nameAr: "بسكويت",
nameEn: "",
price: 0,
category: "mille",
image: "1.png",
available: true,
desc: "",
ingredients: []
},
{
id: "a7",
nameAr: "ميلفيه",
nameEn: "",
price: 0,
category: "eclair",
image: "1.png",
available: true,
desc: "",
ingredients: []
}

];



const firebaseConfig = {
  apiKey: "AIzaSyBFBnaSspqZZ32YPQOlVFxLC23Ik5LalEM",
  authDomain: "abo-alsoude.firebaseapp.com",
  projectId: "abo-alsoude",
  storageBucket: "abo-alsoude.firebasestorage.app",
  messagingSenderId: "207897769616",
  appId: "1:207897769616:web:28a481314624f92ea50a15",
  measurementId: "G-C39993QJZF"
};

let db = null;
let firebaseAvailable = false;

if (typeof firebase !== 'undefined' && firebase.initializeApp && firebase.firestore) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseAvailable = true;
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    firebaseAvailable = false;
  }
} else {
  console.warn('Firebase is not available. Working in offline fallback mode.');
}




let drinks = [];
//=============clicl============
let isAdmin = false;




 // ========== STATE MANAGEMENT ==========
const state = {
cart: JSON.parse(localStorage.getItem("cart")) || [],
currentFilter: "null",
selectedDrink: null,
selectedWeight: 1 // Default weight
};

// ========== DOM ELEMENTS ==========
const DOM = {
loadingScreen: document.getElementById("loading-screen"),
navbar: document.getElementById("navbar"),
drinksGrid: document.getElementById("drinks-grid"),
filterBtns: document.querySelectorAll(".filter-btn"),
modalOverlay: document.getElementById("modal-overlay"),
cartModalOverlay: document.getElementById("cart-modal-overlay"),
cartIconWrap: document.getElementById("cart-icon-wrap"),
cartCount: document.getElementById("cart-count"),
toast: document.getElementById("toast"),
modalClose: document.getElementById("modal-close"),
cartModalClose: document.getElementById("cart-modal-close"),
orderBtn: document.getElementById("order-btn"),
cartItemsList: document.getElementById("cart-items-list"),
cartTotalPrice: document.getElementById("cart-total-price"),
checkoutWhatsapp: document.getElementById("checkout-whatsapp"),
weightModalOverlay: document.getElementById("weight-modal-overlay"),
weightModalClose: document.getElementById("weight-modal-close")
};

window.addEventListener("error", (event) => {
  console.error("Global error:", event.error || event.message);
  const loading = document.getElementById("loading-screen");
  if (loading) {
    loading.style.display = "none";
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  const loading = document.getElementById("loading-screen");
  if (loading) {
    loading.style.display = "none";
  }
});

// ========== INITIALIZATION ==========


  // ✅ Firebase لوحده
document.addEventListener("DOMContentLoaded", () => {
  DOM.drinksGrid.style.display = "grid";

  // ✅ كود الأدمن
  let clickCount = 0;
  let clickTimer = null;

  const adminTrigger = document.getElementById("admin-trigger");

  if (adminTrigger) {
    adminTrigger.addEventListener("click", () => {
      clickCount++;

      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1500);

      if (clickCount === 3) {
        clickCount = 0;

        const code = prompt("ادخل كود الادمن");

        if (code === "8800") {
          isAdmin = true;
          showToast("تم تفعيل الأدمن ✓");
          openAdminPanel();
        } else {
          showToast("كود غلط ❌");
        }
      }
    });
  }

  // ✅ تحميل سريع (بدون انتظار Firebase)
  drinks = defaultDrinks.map(d => ({
    ...d,
    available: true
  }));

  setupEventListeners();
  renderDrinks();
  updateCartUI();
  setTimeout(() => {
  hideLoadingScreen();
}, 2000); // 2 ثانية

  // 🔥 تحميل Firebase في الخلفية
  loadFirebaseData();
});
// 👇 كود الأدمن
// 👇 كود الأدمن
// 👇 كود الأدمن هنا


// ========== LOADING SCREEN ==========
function hideLoadingScreen() {
DOM.loadingScreen.classList.add("fade-out");
setTimeout(() => {
  DOM.loadingScreen.style.display = "none";
}, 400);
}

// ========== NAVBAR SCROLL EFFECT ==========
window.addEventListener("scroll", () => {
if (window.scrollY > 50) {
DOM.navbar.classList.add("scrolled");
} else {
DOM.navbar.classList.remove("scrolled");
}
});

// ========== CHECK IF ITEM IS PLATE ==========
function isPlateItem(drink) {
return drink.nameAr.includes("صحن");
}

// ========== FILTER FUNCTIONALITY ==========




const gatoTypes = [
  { id: '4', name: 'فراشات', keys: ['جاتو'] },
  { id: '5', name: 'امواس', keys: ['جاتو'] },
  { id: '6', name: ' نواشف', keys: ['جاتو'] },
  { id: '13', name: ' كافيهات', keys: ['جاتو'] }
];

const tartTypes = [
  { id: '7', name: 'فراشات', keys: ['تورته'] },
  { id: '8', name: 'امواس', keys: ['تورته'] },
  { id: '9', name: 'اميركان ', keys: ['تورته'] },
  { id: '14', name: 'ميني اميركان ', keys: ['تورته'] }
];

const swareTypes = [
  { id: '10', name: '', keys: [] },
  { id: '11', name: 'كريمه', keys: [] },
  { id: '12', name: 'أصناف متنوعة', keys: [] }
];

function filterDrinks(category) {
  state.currentFilter = category;
  const subContainer = document.getElementById("sub-filters-container");

  DOM.drinksGrid.style.display = "grid";

  DOM.filterBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === category);
  });

  const isSubCategory = category === "gato" || category === "sware" || category === "tart";
  if (isSubCategory) {
    const types = category === "gato"
      ? gatoTypes
      : category === "sware"
        ? swareTypes
        : tartTypes;
    subContainer.style.display = "flex";
    subContainer.innerHTML = types.map(type => `
      <button class="filter-btn sub-btn" onclick="filterSubCategory('${type.id}', '${category}')"
        style="background: #1a1a1a; border: 1px solid #d4af37; font-size: 0.9rem; padding: 5px 15px;">
        ${type.name}
      </button>
    `).join("");

    const titleText = category === "gato"
      ? "اختر نوع البقلاوة المفضل لديك"
      : category === "sware"
        ? "اختر نوع السواريه المفضل لديك"
        : "اختر نوع التورت المفضل لديك";

    DOM.drinksGrid.innerHTML = `
      <p style="color:#aaa; width:100%; text-align:center;">
        ${titleText}
      </p>
    `;
  } else {
    subContainer.style.display = "none";
    renderDrinks();
  }
}

function filterSubCategory(subId, category) {
  const types = category === "gato"
    ? gatoTypes
    : category === "sware"
      ? swareTypes
      : tartTypes;
  const typeData = types.find(t => t.id === subId);
  if (!typeData) return;

  const filtered = drinks.filter(d =>
    d.category === category &&
    typeData.keys.some(key => d.nameAr.includes(key))
  );

  document.querySelectorAll('.sub-btn').forEach(btn => {
    btn.style.background = (btn.innerText === typeData.name) ? "#d4af37" : "#1a1a1a";
    btn.style.color = (btn.innerText === typeData.name) ? "#000" : "#fff";
  });

  displayFilteredDrinks(filtered);
}

function displayFilteredDrinks(data) {
  DOM.drinksGrid.innerHTML = "";

  if (data.length === 0) {
    DOM.drinksGrid.innerHTML = `
      <p style="color:#aaa; width:100%; text-align:center;">قريباً...</p>
    `;
    return;
  }

  data.forEach((drink) => {
    const card = createDrinkCard(drink);
    DOM.drinksGrid.appendChild(card);
    card.classList.add("visible");
  });
}

// ملاحظة: إذا لم تعمل الفلاتر، تأكد أن كل عنصر في drinks لديه category صحيح و أن keys في النوع تحتوي على كلمات مطابقة لـ nameAr.

// ========== RENDER DRINKS ==========
// دالة لعرض المنتجات من Firebase
function renderDrinks() {
  const filtered = state.currentFilter === "all"
    ? drinks
    : drinks.filter(d => d.category === state.currentFilter);

  DOM.drinksGrid.innerHTML = "";

  filtered.forEach((drink) => {
    const card = createDrinkCard(drink);
    DOM.drinksGrid.appendChild(card);
    card.classList.add("visible");
  });
}

 

async function uploadDefaultProducts() {
  const snapshot = await db.collection("products").get();

  if (!snapshot.empty) return; // لو فيه بيانات بلاش

  for (let drink of defaultDrinks) {
    await db.collection("products").doc(drink.id).set({
      ...drink,
      available: true // تأكد من إضافة هذا المفتاح لكل منتج
    });
  }

  console.log("تم رفع المنتجات لأول مرة ✅");
}

async function ensureStableFirebaseDoc(localItem, firebaseData) {
  const stableRef = db.collection("products").doc(localItem.id);
  const stableSnapshot = await stableRef.get();

  if (stableSnapshot.exists) {
    const data = stableSnapshot.data();
    if (!data.id) {
      await stableRef.update({ id: localItem.id });
    }
    return {
      firebaseId: localItem.id,
      ...data
    };
  }

  let firebaseItem = firebaseData.find(f => f.id === localItem.id || f.firebaseId === localItem.id);

  if (!firebaseItem) {
    firebaseItem = firebaseData.find(f =>
      f.nameAr === localItem.nameAr &&
      f.price === localItem.price &&
      f.category === localItem.category
    );
  }

  if (firebaseItem) {
    const copy = {
      ...firebaseItem,
      id: localItem.id,
      available: firebaseItem.available ?? true
    };
    await stableRef.set(copy);
    return {
      ...copy,
      firebaseId: localItem.id
    };
  }

  return null;
}

async function reloadDrinksFromFirebase() {
  const snapshot = await db.collection("products").get();
  const firebaseData = snapshot.docs.map(doc => ({
    firebaseId: doc.id,
    ...doc.data()
  }));

  drinks = await Promise.all(defaultDrinks.map(async localItem => {
    const stableItem = await ensureStableFirebaseDoc(localItem, firebaseData);

    return {
      ...localItem,
      firebaseId: stableItem?.firebaseId,
      available: stableItem?.available ?? true
    };
  }));
}

// ========== CREATE CARD ==========
function createDrinkCard(drink) {
  const card = document.createElement("div");
 if (drink.available === false && !isAdmin) {
  card.style.opacity = "0.5";
}
  card.className = "drink-card";

  const qty = state.cart
    .filter(item => item.id === drink.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const hasMultipleImages = drink.images && drink.images.length > 1;

  card.innerHTML = `
  <div class="card-img-wrap">

    ${hasMultipleImages ? `
      <div class="card-img-scroll">
        ${drink.images.map(img => `
          <img src="${img}" class="card-img-slide" />
        `).join('')}
      </div>

      <div class="card-dots">
        ${drink.images.map((_, i) => `
          <span class="dot ${i === 0 ? 'active' : ''}"></span>
        `).join('')}
      </div>
    ` : `
      <img src="${drink.image || 'logo.png'}" class="card-img-slide" />
    `}

    <div class="card-overlay"></div>

    ${qty > 0 ? `<div class="card-qty-badge">${qty}</div>` : ''}

  </div>

  <div class="card-body" style="padding: 12px;">

    <div style="text-align: right;">
      <div style="font-weight: bold; color: #fff; font-size: 1.1rem;">
      
        ${drink.nameAr}
      </div>

      <div style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">
        ${drink.desc || ''}
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
      
     <div style="display:flex; flex-direction:column; align-items:flex-start; gap:5px;">
  
  <div style="color: #d4af37;">
    <strong>${drink.price}</strong> ج.م
  </div>

  ${isAdmin ? `
    <button onclick="toggleAvailability('${drink.id}')"
    style="
      background: #444;
      color: white;
      border: none;
      padding: 4px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    ">
      ${drink.available === false ? 'اظهار' : 'اخفاء'}
    </button>
  ` : ''}

</div>

     
<button
  ${drink.available === false ? 'disabled' : ''}
  onclick="handleQuickAdd(event, '${drink.id}')"
  style="
    background: ${drink.available === false ? '#555' : '#d4af37'};
    color: ${drink.available === false ? '#aaa' : '#000'};
    border: none;
    padding: 6px 15px;
    border-radius: 6px;
    cursor: ${drink.available === false ? 'not-allowed' : 'pointer'};
  "
>
  ${drink.available === false ? '❌ غير متوفر' : (qty > 0 ? '➕ المزيد' : '🛍 اضف للسلة')}
</button>


    </div>

  </div>
  `;

  return card;
}

// ========== WEIGHT MODAL ==========
function openWeightModal(drink) {
state.selectedDrink = drink;
state.selectedWeight = 1; // Reset to default

const weightModalOverlay = document.getElementById("weight-modal-overlay");
const weightButtons = document.querySelectorAll(".weight-btn");

// Reset button styles
weightButtons.forEach(btn => {
btn.style.background = "#444";
btn.style.color = "white";
});

// Set first button as selected
weightButtons.forEach(btn => {
  if (parseFloat(btn.dataset.multiplier) === 1) {
    btn.style.background = "#d4af37";
    btn.style.color = "#000";
  }
});
weightButtons[0].style.color = "#000";

weightModalOverlay.classList.remove("hidden");
weightModalOverlay.classList.add("open");

// Update price display
updateWeightPrice(drink, 1);
}

function closeWeightModal() {
const weightModalOverlay = document.getElementById("weight-modal-overlay");
weightModalOverlay.classList.remove("open");
weightModalOverlay.classList.add("closing");

setTimeout(() => {
weightModalOverlay.classList.add("hidden");
weightModalOverlay.classList.remove("closing");
}, 300);
}

function updateWeightPrice(drink, multiplier) {
const priceDisplay = document.getElementById("weight-price");
const newPrice = Math.round(drink.price * multiplier);
priceDisplay.textContent = newPrice;

// Update button styles
const weightButtons = document.querySelectorAll(".weight-btn");
weightButtons.forEach(btn => {
if (parseFloat(btn.dataset.multiplier) === multiplier) {
btn.style.background = "#d4af37";
btn.style.color = "#000";
} else {
btn.style.background = "#444";
btn.style.color = "white";
}
});
}

function selectWeight(multiplier) {
state.selectedWeight = multiplier;
if (state.selectedDrink) {
updateWeightPrice(state.selectedDrink, multiplier);
}
}

// ========== HANDLE QUICK ADD ==========
function handleQuickAdd(event, drinkId) {
  event.stopPropagation();
  const drink = drinks.find(d => d.id === drinkId);

  if (drink) {
    addToCartSimple(drink); // 🔥 إضافة مباشرة بدون أوزان
  }
}

function addToCartWithWeight() {
if (!state.selectedDrink) return;

const drink = state.selectedDrink;
const weight = state.selectedWeight;
const finalPrice = Math.round(drink.price * weight);

const uniqueId = drink.id + "_" + weight;

const existingItem = state.cart.find(item => item.uniqueId === uniqueId);

if (existingItem) {
existingItem.quantity += 1;
} else {
state.cart.push({
uniqueId: uniqueId,
id: drink.id,
nameAr: drink.nameAr,
price: finalPrice,
quantity: 1,
image: drink.image,
weight: weight,
originalPrice: drink.price
});
}

saveCart();
updateCartUI();

const weightLabel = getWeightLabel(weight);
showToast(`تم إضافة ${drink.nameAr} (${weightLabel}) ✓`);

closeWeightModal();

}

// ========== MODAL MANAGEMENT ==========
function openModal(drink) {
state.selectedDrink = drink;

document.getElementById("modal-img").src = drink.image;
document.getElementById("modal-name-ar").textContent = drink.nameAr;
document.getElementById("modal-name-en").textContent = drink.nameEn;
document.getElementById("modal-price").textContent = drink.price;
document.getElementById("modal-desc").textContent = drink.desc;

const ingList = document.getElementById("modal-ing-list");
ingList.innerHTML = drink.ingredients.map(ing => `<li>${ing}</li>`).join("");

DOM.modalOverlay.classList.remove("hidden");
DOM.modalOverlay.classList.add("open");
}

function closeModal() {
DOM.modalOverlay.classList.remove("open");
DOM.modalOverlay.classList.add("closing");

setTimeout(() => {
DOM.modalOverlay.classList.add("hidden");
DOM.modalOverlay.classList.remove("closing");
}, 300);
}

// ========== CART MANAGEMENT ==========
function addToCartSimple(drink) {
const uniqueId = drink.id + "_plate";

const existingItem = state.cart.find(item => item.uniqueId === uniqueId);

if (existingItem) {
existingItem.quantity += 1;
} else {
state.cart.push({
uniqueId: uniqueId,
id: drink.id,
nameAr: drink.nameAr,
price: drink.price,
quantity: 1,
image: drink.image,
weight: 1
});
}

saveCart();
updateCartUI();
showToast(`تم إضافة ${drink.nameAr} ✓`);

}

function removeFromCart(uniqueId) {
state.cart = state.cart.filter(item => item.uniqueId !== uniqueId);
saveCart();
updateCartUI();
renderCartItems();
}

function updateCartQuantity(uniqueId, quantity) {
const item = state.cart.find(item => item.uniqueId === uniqueId);

if (item) {
if (quantity <= 0) {
removeFromCart(uniqueId);
} else {
item.quantity = quantity;
saveCart();
updateCartUI();
renderCartItems();
}
}
}

function saveCart() {
localStorage.setItem("cart", JSON.stringify(state.cart));
}

function updateCartUI() {
const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
DOM.cartCount.textContent = totalItems;

const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
DOM.cartTotalPrice.textContent = totalPrice;
}

function openCartModal() {
if (state.cart.length === 0) {
showToast("السلة فارغة");
return;
}

renderCartItems();
DOM.cartModalOverlay.classList.remove("hidden");
DOM.cartModalOverlay.classList.add("open");
}

function closeCartModal() {
DOM.cartModalOverlay.classList.remove("open");
DOM.cartModalOverlay.classList.add("closing");

setTimeout(() => {
DOM.cartModalOverlay.classList.add("hidden");
DOM.cartModalOverlay.classList.remove("closing");
}, 300);
}

function getWeightLabel(weight) {
if (!weight) return ""; // 🔥 الحل هنا

switch(weight) {
case 1: return "كيلو";
case 0.5: return "نصف كيلو";
case 0.25: return "ربع كيلو";
case 1.25: return "كيلو وربع";
case 1.5: return "كيلو ونص";
default: return weight + " كيلو";
}
}

function renderCartItems() {
if (state.cart.length === 0) {
DOM.cartItemsList.innerHTML = "<p style='text-align:center; color: #aaa; padding: 2rem;'>لا توجد عناصر في السلة</p>";
return;
}

let itemsHtml = state.cart.map(item => {

const drinkData = drinks.find(d => d.id === item.id);

const isPlate = drinkData ? isPlateItem(drinkData) : false;
const weightLabel = getWeightLabel(item.weight);
return `

  <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center;">  <div class="cart-item-info" style="flex: 1; text-align: right;">  
    
  <div class="cart-item-name" style="font-weight: bold; color: white;">  
    ${item.nameAr}  
  </div>  

  ${!isPlate ? `  
    <div style="color: #aaa; font-size: 0.85rem;">  
      ${weightLabel}  
    </div>  
  ` : ''}  

  <div style="color: #d4af37; font-size: 0.9rem;">  
    ${item.price * item.quantity} ج.م  
  </div>  

</div>  
  <div class="cart-qty-control" style="display: flex; align-items: center; gap: 10px; margin: 0 15px;">  
    <button class="qty-btn" onclick="updateCartQuantity('${item.uniqueId}', ${item.quantity - 1})" style="background:#444; border:none; color:white; width:25px; height:25px; border-radius:4px; cursor:pointer;">−</button>  
    <div class="qty-display" style="color: white;">${item.quantity}</div>  
    <button class="qty-btn" onclick="updateCartQuantity('${item.uniqueId}', ${item.quantity + 1})" style="background:#444; border:none; color:white; width:25px; height:25px; border-radius:4px; cursor:pointer;">+</button>  
  </div>  
  <button class="cart-item-remove" onclick="removeFromCart('${item.uniqueId}')" style="background:transparent; border:none; color:#ff4444; cursor:pointer; font-size: 1.2rem;">✕</button>  
</div>

`;
}).join("");

const formHtml = `
<div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px; direction: rtl; text-align: right;" id="customer-form">

  <input 
    id="cust-name" 
    type="text" 
    placeholder="الاسم"
    style="padding:10px; border-radius:6px; border:none; background:#222; color:#fff;"
  />

  <input 
    id="cust-phone" 
    type="tel" 
    placeholder="رقم الهاتف"
    style="padding:10px; border-radius:6px; border:none; background:#222; color:#fff;"
  />

  <input 
    id="cust-address" 
    type="text" 
    placeholder=" العنوان ( مدينة نصر و مصر الجديدة فقط)"
    style="padding:10px; border-radius:6px; border:none; background:#222; color:#fff;"
  />

  <textarea 
    id="cust-notes" 
    placeholder="ملاحظات (اختياري)"
    style="padding:10px; border-radius:6px; border:none; background:#222; color:#fff;"
  ></textarea>

</div>
`;

DOM.cartItemsList.innerHTML = itemsHtml + formHtml;
}

// ========== WHATSAPP CHECKOUT ==========
function sendToWhatsapp() {
if (state.cart.length === 0) {
showToast("السلة فارغة");
return;
}

const name = document.getElementById('cust-name').value.trim();
const phone = document.getElementById('cust-phone').value.trim();
const address = document.getElementById('cust-address').value.trim();
const notes = document.getElementById('cust-notes').value.trim();

if (!name || !phone || !address) {
showToast("⚠️ يرجى إكمال بيانات التوصيل");
document.getElementById('customer-form').scrollIntoView({ behavior: 'smooth' });
return;
}

const cartSummary = state.cart.map(item => {
const drinkData = drinks.find(d => d.id === item.id);
const isPlate = drinkData ? isPlateItem(drinkData) : false;

const weightLabel = getWeightLabel(item.weight);

const weight = (!isPlate && weightLabel) ? `(${weightLabel})` : "";

return `• ${item.nameAr}${weight} [الكمية: ${item.quantity}]`;
}).join('\n');

const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const message = `
طلب جديد من حلويات أبو السعود 🍰

البيانات الشخصية:
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📍 العنوان: ${address}
${notes ? `📝 ملاحظات: ${notes}` : ''}

الطلبات:
${cartSummary}

ــــــــــــــــــــــــــــــــــــــــــــــــــ
💰 الإجمالي: ${totalPrice} ج.م
ــــــــــــــــــــــــــــــــــــــــــــــــــ
`.trim();

const whatsappURL = `https://wa.me/201070100122?text=${encodeURIComponent(message)}`;
window.open(whatsappURL, "_blank");

state.cart = [];
saveCart();
updateCartUI();
closeCartModal();
showToast("تم إرسال الطلب بنجاح ✓");
}

// ========== TOAST NOTIFICATIONS ==========













  

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
DOM.filterBtns.forEach(btn => {
btn.addEventListener("click", () => filterDrinks(btn.dataset.filter));
});

DOM.modalClose.addEventListener("click", closeModal);
DOM.modalOverlay.addEventListener("click", (e) => {
if (e.target === DOM.modalOverlay) closeModal();
});

DOM.orderBtn.addEventListener("click", () => {
if (state.selectedDrink) {
if (isPlateItem(state.selectedDrink)) {
addToCartSimple(state.selectedDrink);
} else {
closeModal();
openWeightModal(state.selectedDrink);
}
}
});

// Weight modal close buttons
const weightModalClose = document.getElementById("weight-modal-close");
if (weightModalClose) {
weightModalClose.addEventListener("click", closeWeightModal);
}

const weightModalOverlay = document.getElementById("weight-modal-overlay");
if (weightModalOverlay) {
weightModalOverlay.addEventListener("click", (e) => {
if (e.target === weightModalOverlay) closeWeightModal();
});
}

// Weight selection buttons
const weightBtns = document.querySelectorAll(".weight-btn");
weightBtns.forEach(btn => {
btn.addEventListener("click", () => {
const multiplier = parseFloat(btn.dataset.multiplier);
selectWeight(multiplier);
});
});

DOM.cartModalClose.addEventListener("click", closeCartModal);
DOM.cartModalOverlay.addEventListener("click", (e) => {
if (e.target === DOM.cartModalOverlay) closeCartModal();
});

DOM.checkoutWhatsapp.addEventListener("click", sendToWhatsapp);
DOM.cartIconWrap.addEventListener("click", openCartModal);

document.addEventListener("keydown", (e) => {
if (e.key === "Escape") {
closeModal();
closeCartModal();
closeWeightModal();
}
});
}

// Add function to confirm weight selection
function confirmWeightSelection() {
addToCartWithWeight();
}




// دالة لتغيير التوفر (إخفاء أو إظهار)
async function toggleAvailability(id) {
  const product = drinks.find(d => d.id === id);

  if (!product) {
    showToast("خطأ في المنتج ❌");
    return;
  }

  const stableRef = db.collection("products").doc(id);
  const stableSnap = await stableRef.get();
  const newStatus = !(product.available ?? true);

  if (stableSnap.exists) {
    try {
      await stableRef.update({ available: newStatus });
    } catch (error) {
      console.error("Firebase update failed:", error);
      showToast(`خطأ في التحديث: ${error.message || 'غير معروف'}`);
      return;
    }
  } else {
    const snapshot = await db.collection("products").get();
    const firebaseData = snapshot.docs.map(doc => ({
      firebaseId: doc.id,
      ...doc.data()
    }));
    const stableItem = await ensureStableFirebaseDoc(product, firebaseData);

    try {
      await stableRef.set({
        ...product,
        id,
        available: newStatus
      });
    } catch (error) {
      console.error("Firebase create fallback failed:", error);
      showToast(`خطأ في التحديث: ${error.message || 'غير معروف'}`);
      return;
    }
  }

  showToast("تم التحديث ✅");

  await reloadDrinksFromFirebase();

  renderAdminPanel();
  renderDrinks();
}





function renderAdminPanel() {
  const container = document.getElementById("admin-products");

  container.innerHTML = drinks.map(drink => `
    <div style="border-bottom:1px solid #444; padding:10px 0; text-align:right;">
      
      <div>${drink.nameAr}</div>

      <button onclick="toggleAvailability('${drink.id}')"
      style="margin-top:5px; padding:5px 10px; cursor:pointer;">
        ${drink.available === false ? '❌ غير متوفر' : '✅ متوفر'}
      </button>

    </div>
  `).join("");
}


function openAdminPanel() {
  document.getElementById("admin-panel").style.right = "0";
  renderAdminPanel();
}

function closeAdminPanel() {
  document.getElementById("admin-panel").style.right = "-100%";
}





function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#d4af37";
    toast.style.color = "#000";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "99999";
    toast.style.opacity = "0";
    toast.style.transition = "0.3s";

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
}   


async function loadFirebaseData() {
  if (!firebaseAvailable || !db) return;

  try {
    let snapshot = await db.collection("products").get();

    if (snapshot.empty) {
      await uploadDefaultProducts();
      snapshot = await db.collection("products").get();
    }

    const firebaseData = snapshot.docs.map(doc => ({
      firebaseId: doc.id,
      ...doc.data()
    }));

    drinks = await Promise.all(defaultDrinks.map(async localItem => {
      const stableItem = await ensureStableFirebaseDoc(localItem, firebaseData);

      return {
        ...localItem,
        firebaseId: stableItem?.firebaseId,
        available: stableItem?.available ?? true
      };
    }));

    // 🔥 تحديث المنتجات بعد ما Firebase يخلص
    renderDrinks();

  } catch (error) {
    console.error("Firebase error:", error);
  }
}
