(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  $$("#year").forEach(el => el.textContent = new Date().getFullYear());

  // Mobile nav
  const navToggle = $("#navToggle");
  const navList = $("#navList");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navList.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Toast helper
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  // Modal
  const callbackBtn = $("#callbackBtn");
  const callbackModal = $("#callbackModal");
  function openModal() {
    if (!callbackModal) return;
    callbackModal.classList.add("is-open");
    callbackModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!callbackModal) return;
    callbackModal.classList.remove("is-open");
    callbackModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (callbackBtn && callbackModal) {
    callbackBtn.addEventListener("click", openModal);
    callbackModal.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && callbackModal.classList.contains("is-open")) closeModal();
    });
  }

  // Simple validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }
  function cleanPhone(s) {
    return String(s).replace(/[^\d+]/g, "").trim();
  }

  function handleSubmit(form) {
    const data = new FormData(form);
    const cargo = (data.get("cargo") || "").toString().trim();
    const from = (data.get("from") || "").toString().trim();
    const to = (data.get("to") || "").toString().trim();
    const name = (data.get("name") || "").toString().trim();
    const phone = cleanPhone(data.get("phone") || "");
    const email = (data.get("email") || "").toString().trim();

    const errors = [];
    if (cargo.length < 2) errors.push("Укажите груз.");
    if (from.length < 3) errors.push("Укажите адрес отправления.");
    if (to.length < 3) errors.push("Укажите адрес доставки.");
    if (name.length < 2) errors.push("Укажите имя.");
    if (phone.length < 7) errors.push("Укажите корректный телефон.");
    if (!isValidEmail(email)) errors.push("Укажите корректный email.");

    if (errors.length) {
      showToast(errors[0]);
      return;
    }

    // Статический сайт: просто показываем успех.
    // Если нужен сервер — замените на fetch() к вашему endpoint.
    form.reset();
    showToast("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
  }

  // Main order form
  const orderForm = $("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit(orderForm);
    });
  }

  // Quick forms on transport pages
  $$(".js-quickForm").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit(form);
    });
  });

  // Callback form
  const callbackForm = $("#callbackForm");
  if (callbackForm) {
    callbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(callbackForm);
      const name = (data.get("name") || "").toString().trim();
      const phone = cleanPhone(data.get("phone") || "");
      if (name.length < 2) return showToast("Укажите имя.");
      if (phone.length < 7) return showToast("Укажите корректный телефон.");
      callbackForm.reset();
      showToast("Принято! Мы перезвоним вам.");
      if (callbackModal) closeModal();
    });
  }

})();
