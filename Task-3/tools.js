// ===== QUOTE GENERATOR =====

const quoteCategory = document.getElementById("quoteCategory");
const quoteError = document.getElementById("quoteError");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const copyQuoteBtn = document.getElementById("copyQuoteBtn");
const tweetQuoteBtn = document.getElementById("tweetQuoteBtn");
const quoteCopiedMsg = document.getElementById("quoteCopiedMsg");

if (newQuoteBtn) {

    async function fetchQuote() {
        quoteError.textContent = "";
        quoteText.textContent = "Loading...";
        quoteAuthor.textContent = "";

        try {
            // Agar category select ki hai, tags parameter add karo URL mein
            const tag = quoteCategory.value;
            const url = tag
                ? `https://api.quotable.io/random?tags=${tag}`
                : `https://api.quotable.io/random`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Could not fetch a quote. Try again!");
            }

            const data = await response.json();

            quoteText.textContent = `"${data.content}"`;
            quoteAuthor.textContent = `— ${data.author}`;

        } catch (error) {
            quoteError.textContent = "⚠️ " + error.message;
            quoteText.textContent = "Something went wrong!";
        }
    }

    newQuoteBtn.addEventListener("click", fetchQuote);
    quoteCategory.addEventListener("change", fetchQuote);

    // ===== COPY TO CLIPBOARD =====
    copyQuoteBtn.addEventListener("click", () => {
        const fullQuote = `${quoteText.textContent} ${quoteAuthor.textContent}`;

        // navigator.clipboard.writeText browser ka built-in clipboard API hai
        navigator.clipboard.writeText(fullQuote).then(() => {
            quoteCopiedMsg.textContent = "✅ Copied to clipboard!";
            // 2 second baad message hata do
            setTimeout(() => {
                quoteCopiedMsg.textContent = "";
            }, 2000);
        });
    });

    // ===== TWEET QUOTE =====
    tweetQuoteBtn.addEventListener("click", () => {
        const fullQuote = `${quoteText.textContent} ${quoteAuthor.textContent}`;

        // Twitter/X ka "intent" URL - isme text pass karke naya tweet compose box khulta hai
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullQuote)}`;

        // Naye tab mein kholte hain, taaki user ka page navigate na ho
        window.open(tweetUrl, "_blank");
    });

    // Page load hote hi ek quote dikha do
    fetchQuote();
}


// ===== RANDOM USER GENERATOR =====

const generateUserBtn = document.getElementById("generateUserBtn");
const userCard = document.getElementById("userCard");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userLocation = document.getElementById("userLocation");
const downloadVcardBtn = document.getElementById("downloadVcardBtn");
const saveContactBtn = document.getElementById("saveContactBtn");
const contactsList = document.getElementById("contactsList");
const contactsGrid = document.getElementById("contactsGrid");

if (generateUserBtn) {

    // Currently generate hui profile yaha store rahegi (download/save ke liye)
    let currentUser = null;

    async function generateUser() {
        try {
            const response = await fetch("https://randomuser.me/api/");
            const data = await response.json();

            // API ek array mein 1 user bhejta hai (results[0])
            const user = data.results[0];
            currentUser = user;

            userAvatar.src = user.picture.large;
            userName.textContent = `${user.name.first} ${user.name.last}`;
            userEmail.textContent = `📧 ${user.email}`;
            userPhone.textContent = `📞 ${user.phone}`;
            userLocation.textContent = `📍 ${user.location.city}, ${user.location.country}`;

            userCard.style.display = "block";

        } catch (error) {
            alert("Could not generate profile. Try again!");
        }
    }

    generateUserBtn.addEventListener("click", generateUser);

    // ===== DOWNLOAD AS VCARD =====
    downloadVcardBtn.addEventListener("click", () => {
        if (!currentUser) return;

        // vCard ek standard text format hai contacts save karne ke liye
        // (phone/email apps isko import kar sakte hain)
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${currentUser.name.first} ${currentUser.name.last}
EMAIL:${currentUser.email}
TEL:${currentUser.phone}
ADR:;;${currentUser.location.city};${currentUser.location.country}
END:VCARD`;

        // Blob ek "file jaisa" object banata hai memory mein
        const blob = new Blob([vcard], { type: "text/vcard" });

        // URL.createObjectURL blob ka temporary downloadable URL banata hai
        const url = URL.createObjectURL(blob);

        // Ek invisible <a> tag banake usko click karwate hain - ye download trigger karta hai
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentUser.name.first}_${currentUser.name.last}.vcf`;
        link.click();

        // Memory clean karne ke liye URL revoke karo
        URL.revokeObjectURL(url);
    });

    // ===== SAVE TO CONTACTS (localStorage) =====
    function getSavedContacts() {
        const data = localStorage.getItem("savedContacts");
        return data ? JSON.parse(data) : [];
    }

    function renderContacts() {
        const contacts = getSavedContacts();

        if (contacts.length === 0) {
            contactsList.style.display = "none";
            return;
        }

        contactsList.style.display = "block";
        contactsGrid.innerHTML = "";

        contacts.forEach((contact, index) => {
            const item = document.createElement("div");
            item.className = "contact-item";
            item.innerHTML = `
                <button class="contact-remove-btn" data-index="${index}">✕</button>
                <img src="${contact.picture.thumbnail}" alt="${contact.name.first}">
                <h4>${contact.name.first} ${contact.name.last}</h4>
                <p>${contact.email}</p>
            `;
            contactsGrid.appendChild(item);
        });

        // Har remove button pe listener lagao
        document.querySelectorAll(".contact-remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                removeContact(index);
            });
        });
    }

    function removeContact(index) {
        let contacts = getSavedContacts();
        contacts.splice(index, 1); // index pe se 1 item hata do
        localStorage.setItem("savedContacts", JSON.stringify(contacts));
        renderContacts();
    }

    saveContactBtn.addEventListener("click", () => {
        if (!currentUser) return;

        let contacts = getSavedContacts();
        contacts.push(currentUser);
        localStorage.setItem("savedContacts", JSON.stringify(contacts));
        renderContacts();
    });

    // Page load hote hi saved contacts dikha do
    renderContacts();
}
