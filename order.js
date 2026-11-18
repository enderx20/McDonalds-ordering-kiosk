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

const cart = [];
let current = null, qty = 1;
const $ = id => document.getElementById(id);

const money = n => n.toFixed(2).replace(".", ",") + " €";

function updateCartTotal(){
  const sum = cart.reduce((acc, item) => acc + item.total, 0);
  document.querySelectorAll(".cart-total").forEach(el => {
    el.textContent = money(sum);
  });
}

function updateQtyUI(){
  $("qtyVal").textContent = qty;
  $("pPrice").textContent = money(current.price * qty);
  $("minusBtn").disabled = qty <= 1;
}

function openProduct(item){
  current = item;
  qty = 1;
  $("pImg").innerHTML = `<img src="${item.img}" alt="">`;
  $("pName").textContent = item.name;
  updateQtyUI();
  $("product").classList.add("open");
}

function closeProduct(){ $("product").classList.remove("open"); }

$("minusBtn").onclick = () => {
  if(qty > 1){
    qty--;
    updateQtyUI();
  }
};

$("plusBtn").onclick = () => {
  qty++;
  updateQtyUI();
};

// każdy przycisk .orderBtn otwiera ekran SWOJEGO dania
document.querySelectorAll(".orderBtn").forEach(btn => {
  btn.onclick = () => openProduct({
    name:  btn.dataset.name,
    price: parseFloat(btn.dataset.price),
    img:   btn.dataset.img
  });
});

$("cancelBtn").onclick = closeProduct;

$("addBtn").onclick = () => {
  cart.push({...current, qty, total: current.price * qty});
  updateCartTotal();                                // aktualizuje sumę we wszystkich .cart-total
  closeProduct();                                   // ekran produktu znika
  $("added").classList.add("open");                 // biały ekran "Added to order"
  setTimeout(() => $("added").classList.remove("open"), 1200); // po 1,2 s znika i wracasz na stronę
};