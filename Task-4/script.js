function throttle(func, limit = 200) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

const themeBtn = document.getElementById("themeBtn");
const topBtn = document.getElementById("topBtn");
const menuBtn = document.querySelector(".menu-btn");
const navUl = document.querySelector("nav ul");

if (themeBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
        themeBtn.setAttribute("aria-pressed", "true");
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        themeBtn.textContent = isDark ? "☀️" : "🌙";
        themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

if (topBtn) {
    window.addEventListener("scroll", throttle(() => {
        topBtn.style.display = window.scrollY > 200 ? "block" : "none";
    }, 200));

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (menuBtn && navUl) {
    menuBtn.setAttribute("role", "button");
    menuBtn.setAttribute("tabindex", "0");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Toggle navigation menu");

    function toggleMenu() {
        navUl.classList.toggle("open");
        const isOpen = navUl.classList.contains("open");
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMenu();
        }
    });

    navUl.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navUl.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });
}

const sliderTrack = document.getElementById("sliderTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const sliderDots = document.getElementById("sliderDots");

if (sliderTrack) {
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;
    let autoSlide;

    if (prevBtn) prevBtn.setAttribute("aria-label", "Previous slide");
    if (nextBtn) nextBtn.setAttribute("aria-label", "Next slide");

    slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        dot.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToSlide(i);
            }
        });
        sliderDots.appendChild(dot);
    });

    function goToSlide(index) {
        currentIndex = index;
        sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll(".slider-dots span").forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(currentIndex);
    }

    function startAuto() {
        autoSlide = setInterval(nextSlide, 3000);
    }

    function stopAuto() {
        clearInterval(autoSlide);
    }

    nextBtn.addEventListener("click", () => { nextSlide(); stopAuto(); startAuto(); });
    prevBtn.addEventListener("click", () => { prevSlide(); stopAuto(); startAuto(); });

    startAuto();
}

const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");

if (modalOverlay) {
    modalOverlay.setAttribute("role", "dialog");
    modalOverlay.setAttribute("aria-modal", "true");
    let lastFocusedElement = null;

    function openModal() {
        lastFocusedElement = document.activeElement;
        modalOverlay.classList.add("active");
        modalClose.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    setTimeout(openModal, 2000);

    modalClose.addEventListener("click", closeModal);

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
            closeModal();
        }

        if (e.key === "Tab" && modalOverlay.classList.contains("active")) {
            const focusable = modalOverlay.querySelectorAll("button, a[href]");
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

const faqQuestions = document.querySelectorAll(".faq-question");

if (faqQuestions.length > 0) {
    faqQuestions.forEach((question, i) => {
        const answer = question.nextElementSibling;
        const answerId = `faq-answer-${i}`;
        answer.id = answerId;
        question.setAttribute("aria-expanded", "false");
        question.setAttribute("aria-controls", answerId);

        question.addEventListener("click", () => {
            const isActive = question.classList.contains("active");

            faqQuestions.forEach(q => {
                q.classList.remove("active");
                q.setAttribute("aria-expanded", "false");
                q.nextElementSibling.classList.remove("open");
            });

            if (!isActive) {
                question.classList.add("active");
                question.setAttribute("aria-expanded", "true");
                answer.classList.add("open");
            }
        });
    });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    const messageInput = document.getElementById("messageInput");
    const passwordInput = document.getElementById("passwordInput");
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");
    const successMsg = document.getElementById("successMsg");

    successMsg.setAttribute("role", "status");
    successMsg.setAttribute("aria-live", "polite");
    document.getElementById("nameError").setAttribute("aria-live", "polite");
    document.getElementById("emailError").setAttribute("aria-live", "polite");
    document.getElementById("phoneError").setAttribute("aria-live", "polite");
    document.getElementById("messageError").setAttribute("aria-live", "polite");

    nameInput.addEventListener("input", () => {
        const error = document.getElementById("nameError");
        if (nameInput.value.trim().length < 3) {
            error.textContent = "Name must be at least 3 characters!";
            nameInput.classList.add("error");
            nameInput.classList.remove("success");
            nameInput.setAttribute("aria-invalid", "true");
        } else {
            error.textContent = "";
            nameInput.classList.remove("error");
            nameInput.classList.add("success");
            nameInput.setAttribute("aria-invalid", "false");
        }
    });

    emailInput.addEventListener("input", () => {
        const error = document.getElementById("emailError");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            error.textContent = "Please enter a valid email!";
            emailInput.classList.add("error");
            emailInput.classList.remove("success");
            emailInput.setAttribute("aria-invalid", "true");
        } else {
            error.textContent = "";
            emailInput.classList.remove("error");
            emailInput.classList.add("success");
            emailInput.setAttribute("aria-invalid", "false");
        }
    });

    phoneInput.addEventListener("input", () => {
        const error = document.getElementById("phoneError");
        const phoneRegex = /^[0-9]{10}$/;
        if (phoneInput.value && !phoneRegex.test(phoneInput.value)) {
            error.textContent = "Please enter a valid 10 digit number!";
            phoneInput.classList.add("error");
            phoneInput.classList.remove("success");
            phoneInput.setAttribute("aria-invalid", "true");
        } else {
            error.textContent = "";
            phoneInput.classList.remove("error");
            phoneInput.classList.add("success");
            phoneInput.setAttribute("aria-invalid", "false");
        }
    });

    messageInput.addEventListener("input", () => {
        const error = document.getElementById("messageError");
        if (messageInput.value.trim().length < 10) {
            error.textContent = "Message must be at least 10 characters!";
            messageInput.classList.add("error");
            messageInput.classList.remove("success");
            messageInput.setAttribute("aria-invalid", "true");
        } else {
            error.textContent = "";
            messageInput.classList.remove("error");
            messageInput.classList.add("success");
            messageInput.setAttribute("aria-invalid", "false");
        }
    });

    passwordInput.addEventListener("input", () => {
        const val = passwordInput.value;
        let strength = 0;
        if (val.length >= 8) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val)) strength++;

        const colors = ["", "red", "orange", "yellowgreen", "var(--primary-color)"];
        const texts = ["", "Weak 😟", "Fair 😐", "Good 😊", "Strong 💪"];
        const widths = ["0%", "25%", "50%", "75%", "100%"];

        strengthBar.style.width = widths[strength];
        strengthBar.style.background = colors[strength];
        strengthText.textContent = val.length > 0 ? texts[strength] : "";
        strengthText.style.color = colors[strength];
    });

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        successMsg.textContent = "✅ Message sent successfully!";
        contactForm.reset();
        strengthBar.style.width = "0%";
        strengthText.textContent = "";
        setTimeout(() => {
            successMsg.textContent = "";
        }, 3000);
    });
}

const counters = document.querySelectorAll(".counter");

if (counters.length > 0) {
    const startCounter = (counter) => {
        const target = parseInt(counter.getAttribute("data-target"));
        const speed = 2000 / target;
        let current = 0;

        const update = () => {
            if (current < target) {
                current++;
                counter.textContent = current;
                setTimeout(update, speed);
            } else {
                counter.textContent = target;
            }
        };
        update();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

const tabBtns = document.querySelectorAll(".tab-btn");

if (tabBtns.length > 0) {
    tabBtns.forEach((btn, i) => {
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", btn.classList.contains("active") ? "true" : "false");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).setAttribute("role", "tabpanel");

        btn.addEventListener("click", () => {
            tabBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            document.querySelectorAll(".tab-content").forEach(content => {
                content.classList.remove("active");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            document.getElementById(tabId).classList.add("active");
        });

        btn.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = tabBtns[(i + 1) % tabBtns.length];
                next.focus();
                next.click();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = tabBtns[(i - 1 + tabBtns.length) % tabBtns.length];
                prev.focus();
                prev.click();
            }
        });
    });
}

const progressBar = document.getElementById("progressBar");

if (progressBar) {
    window.addEventListener("scroll", throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + "%";
    }, 100));
}

const dragList = document.getElementById("dragList");

if (dragList) {
    let draggedItem = null;

    dragList.querySelectorAll(".drag-item").forEach(item => {
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "listitem");
        item.setAttribute("aria-label", `${item.textContent.trim()}, draggable item, use arrow keys to reorder`);

        item.addEventListener("dragstart", () => {
            draggedItem = item;
            setTimeout(() => item.classList.add("dragging"), 0);
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            draggedItem = null;
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            item.classList.add("drag-over");
        });

        item.addEventListener("dragleave", () => {
            item.classList.remove("drag-over");
        });

        item.addEventListener("drop", () => {
            item.classList.remove("drag-over");
            if (draggedItem !== item) {
                dragList.insertBefore(draggedItem, item);
            }
        });

        item.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp" && item.previousElementSibling) {
                e.preventDefault();
                dragList.insertBefore(item, item.previousElementSibling);
                item.focus();
            } else if (e.key === "ArrowDown" && item.nextElementSibling) {
                e.preventDefault();
                dragList.insertBefore(item.nextElementSibling, item);
                item.focus();
            }
        });
    });
}

const lazyImages = document.querySelectorAll(".lazy-img");

if (lazyImages.length > 0) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute("data-src");
                img.classList.add("loaded");
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imgObserver.observe(img));
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(() => console.log("Service Worker registered ✅"))
            .catch((err) => console.log("Service Worker failed ❌", err));
    });
}
