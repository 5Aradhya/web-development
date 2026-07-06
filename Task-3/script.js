const themeBtn = document.getElementById("themeBtn");
const topBtn = document.getElementById("topBtn");
const menuBtn = document.querySelector(".menu-btn");
const navUl = document.querySelector("nav ul");

// ===== DARK MODE =====
if (themeBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        themeBtn.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

// ===== BACK TO TOP =====
if (topBtn) {
    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 200 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ===== HAMBURGER MENU =====
if (menuBtn && navUl) {
    menuBtn.addEventListener("click", () => {
        navUl.classList.toggle("open");
    });

    navUl.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navUl.classList.remove("open");
        });
    });
}
// ===== IMAGE SLIDER =====
const sliderTrack = document.getElementById("sliderTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const sliderDots = document.getElementById("sliderDots");

if (sliderTrack) {
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;
    let autoSlide;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
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

    // Auto slide
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
// ===== MODAL POPUP =====
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");

if (modalOverlay) {
    // 2 second baad automatically open ho
    setTimeout(() => {
        modalOverlay.classList.add("active");
    }, 2000);

    // Close button
    modalClose.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
    });

    // Overlay click se close
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove("active");
        }
    });

    // ESC key se close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modalOverlay.classList.remove("active");
        }
    });
}
// ===== ACCORDION FAQ =====
const faqQuestions = document.querySelectorAll(".faq-question");

if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains("active");

            // Sabhi band karo pehle
            faqQuestions.forEach(q => {
                q.classList.remove("active");
                q.nextElementSibling.classList.remove("open");
            });

            // Agar pehle se active nahi tha toh open karo
            if (!isActive) {
                question.classList.add("active");
                answer.classList.add("open");
            }
        });
    });
}
// ===== FORM VALIDATION =====
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

    // Real-time validation
    nameInput.addEventListener("input", () => {
        const error = document.getElementById("nameError");
        if (nameInput.value.trim().length < 3) {
            error.textContent = "Name must be at least 3 characters!";
            nameInput.classList.add("error");
            nameInput.classList.remove("success");
        } else {
            error.textContent = "";
            nameInput.classList.remove("error");
            nameInput.classList.add("success");
        }
    });

    emailInput.addEventListener("input", () => {
        const error = document.getElementById("emailError");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            error.textContent = "Please enter a valid email!";
            emailInput.classList.add("error");
            emailInput.classList.remove("success");
        } else {
            error.textContent = "";
            emailInput.classList.remove("error");
            emailInput.classList.add("success");
        }
    });

    phoneInput.addEventListener("input", () => {
        const error = document.getElementById("phoneError");
        const phoneRegex = /^[0-9]{10}$/;
        if (phoneInput.value && !phoneRegex.test(phoneInput.value)) {
            error.textContent = "Please enter a valid 10 digit number!";
            phoneInput.classList.add("error");
            phoneInput.classList.remove("success");
        } else {
            error.textContent = "";
            phoneInput.classList.remove("error");
            phoneInput.classList.add("success");
        }
    });

    messageInput.addEventListener("input", () => {
        const error = document.getElementById("messageError");
        if (messageInput.value.trim().length < 10) {
            error.textContent = "Message must be at least 10 characters!";
            messageInput.classList.add("error");
            messageInput.classList.remove("success");
        } else {
            error.textContent = "";
            messageInput.classList.remove("error");
            messageInput.classList.add("success");
        }
    });

    // Password strength
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

    // Form submit
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
// ===== ANIMATED COUNTERS =====
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

    // Jab counter screen pe aaye tab start ho
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
// ===== TABBED CONTENT =====
const tabBtns = document.querySelectorAll(".tab-btn");

if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Sabhi buttons se active hata do
            tabBtns.forEach(b => b.classList.remove("active"));

            // Sabhi content hide karo
            document.querySelectorAll(".tab-content").forEach(content => {
                content.classList.remove("active");
            });

            // Clicked button active karo
            btn.classList.add("active");

            // Uska content show karo
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });
}
// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById("progressBar");

if (progressBar) {
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + "%";
    });
}
// ===== DRAG AND DROP =====
const dragList = document.getElementById("dragList");

if (dragList) {
    let draggedItem = null;

    dragList.querySelectorAll(".drag-item").forEach(item => {
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
    });
}
