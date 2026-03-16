(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  $$("#year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

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
      if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && callbackModal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  // Simple validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function cleanPhone(s) {
    return String(s).replace(/[^\d+]/g, "").trim();
  }

  // Worker URL
  const WORKER_URL = "https://api.tegeka.ru";

  async function sendToTelegram(payload) {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = {};
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Ошибка отправки");
    }

    return result;
  }

  async function handleSubmit(form) {
    const data = new FormData(form);
    const cargo = (data.get("cargo") || "").toString().trim();
    const from = (data.get("from") || "").toString().trim();
    const to = (data.get("to") || "").toString().trim();
    const name = (data.get("name") || "").toString().trim();
    const phone = cleanPhone(data.get("phone") || "");
    const email = (data.get("email") || "").toString().trim();
    const mode = (data.get("mode") || "").toString().trim();

    const errors = [];
    if (!mode && cargo.length < 2) errors.push("Укажите груз.");
    if (from.length < 3) errors.push("Укажите адрес отправления.");
    if (to.length < 3) errors.push("Укажите адрес доставки.");
    if (name.length < 2) errors.push("Укажите имя.");
    if (phone.length < 7) errors.push("Укажите корректный телефон.");
    if (!isValidEmail(email)) errors.push("Укажите корректный email.");

    if (errors.length) {
      showToast(errors[0]);
      return;
    }

    try {
      await sendToTelegram({
        cargo,
        from,
        to,
        name,
        phone,
        email,
        mode: mode || "Основная"
      });

      form.reset();
      window.location.href = "/thank-you.html";
    } catch (error) {
      console.error(error);
      showToast("Не удалось отправить заявку. Попробуйте позже.");
    }
  }

  // Main order form
  const orderForm = $("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleSubmit(orderForm);
    });
  }

  // Quick forms on transport pages
  $$(".js-quickForm").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleSubmit(form);
    });
  });

  // Callback form
  const callbackForm = $("#callbackForm");
  if (callbackForm) {
    callbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = new FormData(callbackForm);
      const name = (data.get("name") || "").toString().trim();
      const phone = cleanPhone(data.get("phone") || "");

      if (name.length < 2) {
        showToast("Укажите имя.");
        return;
      }

      if (phone.length < 7) {
        showToast("Укажите корректный телефон.");
        return;
      }

      try {
        await sendToTelegram({
          cargo: "-",
          from: "-",
          to: "-",
          name,
          phone,
          email: "-",
          mode: "Обратный звонок"
        });

        callbackForm.reset();
        closeModal();
        window.location.href = "/thank-you.html";
      } catch (error) {
        console.error(error);
        showToast("Не удалось отправить заявку. Попробуйте позже.");
      }
    });
  }
})();

function openReview() {
  const modal = document.getElementById("reviewModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeReview() {
  const modal = document.getElementById("reviewModal");
  if (modal) {
    modal.style.display = "none";
  }
}
