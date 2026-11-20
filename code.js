const PROMO_CODES = {
      "EVERYTHING": { discount: 1.0, items: "all" }, 
      "BURGER50": { discount: 0.50, items: ["Big Mac®","Quarter Pounder®","Cheeseburger","Hamburger","Filet-O-Fish®","McCrispy®"] }, 
      "GOODLOOD": { discount: 1.0, items: ["Vanilla Cone","OREO® McFlurry®"] },
      "HAPPY":{discount:0.8, items:["Hamburger Happy Meal®","4 piece Chicken McNuggets® Happy Meal®","6 piece Chicken McNuggets® Happy Meal®"]} 
    };

    // Funkcje pomocnicze do obsługi Cookie
    function setCookie(name, value, days = 1) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    
    function goBack() {
      const returnUrl = getCookie("returnUrl");
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        window.history.back(); 
      }
    }

    document.getElementById("backBtn").onclick = goBack;

   
    document.getElementById("confirmCodeBtn").onclick = () => {
      const inputVal = document.getElementById("promoCodeInput").value.trim().toUpperCase();
      const msg = document.getElementById("codeMessage");

      if (!PROMO_CODES[inputVal]) {
        msg.style.color = "red";
        msg.textContent = "This is not valid code";
        return;
      }

      
      let activeCodes = [];
      try {
        activeCodes = JSON.parse(getCookie("activePromoCodes")) || [];
      } catch (e) {
        activeCodes = [];
      }

      
      if (!activeCodes.includes(inputVal)) {
        activeCodes.push(inputVal);
        setCookie("activePromoCodes", JSON.stringify(activeCodes), 1);
      }

      msg.style.color = "green";
      msg.textContent = `Code ${inputVal} has been activated!`;

     
      setTimeout(goBack, 800);
    };