// Sidebar menu code

const buttons = document.querySelectorAll('.sidebar button');
  const tabs = document.querySelectorAll('.tab');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
     
      buttons.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));

      // dodaj do klikniętego przycisku i odpowiadającej mu sekcji
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
});


// order
// TA SAMA LISTA KODÓW CO W code.html
const PROMO_CODES = {
      "EVERYTHING": { discount: 1.0, items: "all" }, 
      "BURGER50": { discount: 0.50, items: ["Big Mac®","Quarter Pounder®","Cheeseburger","Hamburger","Filet-O-Fish®","McCrispy®"] }, 
      "GOODLOOD": { discount: 1.0, items: ["Vanilla Cone","OREO® McFlurry®"] } ,
      "HAPPY":{discount:0.8, items:["Hamburger Happy Meal®","4 piece Chicken McNuggets® Happy Meal®","6 piece Chicken McNuggets® Happy Meal®"]} 
    };

// --- FUNKCJE DO OBSŁUGI COOKIE ---
function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// Pobiera aktywowane kody z plików cookie
function getActiveCodes() {
  try {
    return JSON.parse(getCookie("activePromoCodes")) || [];
  } catch (e) {
    return [];
  }
}

// Oblicza cenę pojedynczej sztuki produktu po uwzględnieniu kodów z cookie
function getDiscountedUnitPrice(item) {
  const activeCodes = getActiveCodes();
  let finalPrice = item.price;

  activeCodes.forEach(codeKey => {
    const promo = PROMO_CODES[codeKey];
    if (!promo) return;

    // Sprawdza czy kod dotyczy wszystkich produktów ("all") czy konkretnego produktu
    if (promo.items === "all" || (Array.isArray(promo.items) && promo.items.includes(item.name))) {
      finalPrice = finalPrice * (1 - promo.discount);
    }
  });

  return finalPrice;
}

// --- OBSŁUGA PRZYCISKÓW KLASY .open-code-btn ---
document.querySelectorAll(".open-code-btn").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    // Zapisujemy dokładny adres podstrony, z której wyszliśmy
    setCookie("returnUrl", window.location.href, 1);
    window.location.href = "code.html";
  };
});

// --- TWÓJ KOD KOSZYKA Z UWZGLĘDNIENIEM ZNIŻEK ---
const cart = [];
let current = null, qty = 1;
const $ = id => document.getElementById(id);

const money = n => n.toFixed(2).replace(".", ",") + " €";

function updateCartTotal() {
  // Liczy sumę z uwzględnieniem zniżek z cookie
  const sum = cart.reduce((acc, item) => acc + (getDiscountedUnitPrice(item) * item.qty), 0);
  document.querySelectorAll(".cart-total").forEach(el => {
    el.textContent = money(sum);
  });
}

function updateQtyUI() {
  $("qtyVal").textContent = qty;
  // Wyświetla cenę z ewentualną zniżką już na etapie wyboru ilości
  $("pPrice").textContent = money(getDiscountedUnitPrice(current) * qty);
  $("minusBtn").disabled = qty <= 1;
}

function openProduct(item) {
  current = item;
  qty = 1;
  $("pImg").innerHTML = `<img src="${item.img}" alt="">`;
  $("pName").textContent = item.name;
  updateQtyUI();
  $("product").classList.add("open");
}

function closeProduct() {
  $("product").classList.remove("open");
}

$("minusBtn").onclick = () => {
  if (qty > 1) {
    qty--;
    updateQtyUI();
  }
};

$("plusBtn").onclick = () => {
  qty++;
  updateQtyUI();
};

document.querySelectorAll(".orderBtn").forEach(btn => {
  btn.onclick = () => openProduct({
    name:  btn.dataset.name,
    price: parseFloat(btn.dataset.price),
    img:   btn.dataset.img
  });
});

$("cancelBtn").onclick = closeProduct;

$("addBtn").onclick = () => {
  cart.push({...current, qty});
  updateCartTotal();
  closeProduct();

  const addedScreen = $("added");
  const vid = $("addedVideo");

  addedScreen.classList.add("open");
  vid.currentTime = 0;
  vid.play();

  vid.onended = () => {
    addedScreen.classList.remove("open");
  };
};

function renderOrder() {
  const list = $("orderList");
  const tpl = $("orderItemTpl");
  list.innerHTML = "";

  cart.forEach((item, index) => {
    const clone = tpl.content.cloneNode(true);

    const minusBtn = clone.querySelector(".tpl-minus");
    const plusBtn  = clone.querySelector(".tpl-plus");

    const unitPrice = getDiscountedUnitPrice(item);

    clone.querySelector(".tpl-img").src = item.img;
    clone.querySelector(".tpl-name").textContent = item.name;
    clone.querySelector(".tpl-qty").textContent = item.qty;
    clone.querySelector(".tpl-price").textContent = money(unitPrice * item.qty);

    minusBtn.disabled = item.qty <= 1;

    minusBtn.onclick = () => {
      if (item.qty > 1) {
        item.qty--;
        updateCartTotal();
        renderOrder();
      }
    };

    plusBtn.onclick = () => {
      item.qty++;
      updateCartTotal();
      renderOrder();
    };

    clone.querySelector(".tpl-remove").onclick = () => {
      cart.splice(index, 1);
      updateCartTotal();
      renderOrder();
    };

    list.appendChild(clone);
  });
}

document.querySelectorAll(".view-order").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    renderOrder();
    updateCartTotal(); // odświeża sumę przy otwarciu
    $("orderModal").classList.add("open");
  };
});

$("closeOrderBtn").onclick = () => {
  $("orderModal").classList.remove("open");
};

// --- GENEROWANIE PARAGONU PDF (z uwzględnieniem cen po rabacie) ---
function downloadReceiptPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(18);
  doc.text("PARAGON / RECEIPT", 20, y);

  y += 10;
  doc.setFontSize(10);
  doc.text("Data: " + new Date().toLocaleString("pl-PL"), 20, y);

  const activeCodes = getActiveCodes();
  if (activeCodes.length > 0) {
    y += 6;
    doc.text("Uzyte kody rabatowe: " + activeCodes.join(", "), 20, y);
  }

  y += 10;
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  let total = 0;

  cart.forEach(item => {
    const unitPrice = getDiscountedUnitPrice(item);
    const itemSum = unitPrice * item.qty;
    total += itemSum;

    const safeName = item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const priceText = itemSum.toFixed(2).replace(".", ",") + " EUR";

    doc.text(`${item.qty}x ${safeName}`, 20, y);
    doc.text(priceText, 160, y);
    y += 8;
  });

  y += 4;
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("TOTAL:", 20, y);
  doc.text(total.toFixed(2).replace(".", ",") + " EUR", 160, y);

  doc.save("paragon.pdf");
}

// --- FINALIZACJA ZAMÓWIENIA I CZYSZCZENIE COOKIE ---
document.querySelector(".complete-order").onclick = () => {
  if (cart.length === 0) {
    alert("Twój koszyk jest pusty!");
    return;
  }

  $("orderModal").classList.remove("open");
  $("step1Screen").classList.add("open");

  setTimeout(() => {
    $("step1Screen").classList.remove("open");
    $("step2Screen").classList.add("open");

    setTimeout(() => {
      downloadReceiptPDF();

      // CZYSZCZENIE PLIKÓW COOKIE PO ZŁOŻENIU ZAMÓWIENIA
      deleteCookie("activePromoCodes");
      deleteCookie("returnUrl");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);

    }, 5000);

  }, 3000);
};

// Odświeżenie sumy od razu po załadowaniu strony (gdyby w cookie był już kod)
updateCartTotal();



function updateMenuPrices() {
  document.querySelectorAll(".orderBtn").forEach(btn => {
    const basePrice = parseFloat(btn.dataset.price);
    const name = btn.dataset.name;
    
    
    const finalPrice = getDiscountedUnitPrice({ name: name, price: basePrice });


    const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes("€")) {
        node.nodeValue = money(finalPrice);
        break;
      }
    }
  });
}


updateMenuPrices();