document.addEventListener('DOMContentLoaded', () => {
  const cookiePopup = document.getElementById('cookie-consent-popup');
  const acceptButtons = document.querySelectorAll('#accept-cookies');

  // Verificar si el usuario ya ha aceptado las cookies
  if (!localStorage.getItem('cookiesAccepted')) {
    cookiePopup.style.display = 'flex';
  } else {
    cookiePopup.style.display = 'none';
  }

  // Añadir evento de clic a todos los botones de aceptar cookies
  acceptButtons.forEach(button => {
    button.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookiePopup.style.display = 'none';
    });
  });
});
