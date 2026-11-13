// Sidebar menu code

const buttons = document.querySelectorAll('.sidebar button');
  const tabs = document.querySelectorAll('.tab');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // usuń klasę active ze wszystkich
      buttons.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));

      // dodaj do klikniętego przycisku i odpowiadającej mu sekcji
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
});