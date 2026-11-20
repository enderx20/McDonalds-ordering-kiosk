function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

document.querySelectorAll(".open-code-btn").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    setCookie("returnUrl", window.location.href, 1);
    window.location.href = "code.html";
  };
});