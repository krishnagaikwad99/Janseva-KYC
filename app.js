const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletStatusEl = document.getElementById("walletStatus");
const submitKycBtn = document.getElementById("submitKycBtn");
const kycStatusEl = document.getElementById("kycStatus");
const generateTokenBtn = document.getElementById("generateTokenBtn");
const tokenBox = document.getElementById("tokenBox");
const tokenIDEl = document.getElementById("tokenID");
const tokenOwnerEl = document.getElementById("tokenOwner");
const tokenIssuedEl = document.getElementById("tokenIssued");
const tokenStatusEl = document.getElementById("tokenStatus");
const consentStatusEl = document.getElementById("consentStatus");
const verifyBtn = document.getElementById("verifyBtn");
const verifyStatusEl = document.getElementById("verifyStatus");

const bankA = document.getElementById("bankA");
const appB = document.getElementById("appB");
const insuranceC = document.getElementById("insuranceC");

const nameInput = document.getElementById("name");
const idInput = document.getElementById("idNumber");
const fileInput = document.getElementById("kycFile");
const verifyInput = document.getElementById("verifyInput");

let walletConnected = false;
let currentUser = null;
let currentToken = null;
let consent = [];

// Load saved state
function loadState() {
    try {
        currentUser = JSON.parse(localStorage.getItem("tk_user")) || null;
        currentToken = JSON.parse(localStorage.getItem("tk_token")) || null;
        consent = JSON.parse(localStorage.getItem("tk_consent")) || [];
    } catch (e) {
        console.warn("Error loading state:", e);
    }
    refreshUI();
}

function saveState() {
    localStorage.setItem("tk_user", JSON.stringify(currentUser));
    localStorage.setItem("tk_token", JSON.stringify(currentToken));
    localStorage.setItem("tk_consent", JSON.stringify(consent));
}

function refreshUI() {
    walletStatusEl.textContent = walletConnected ? "Status: ✅ Wallet connected" : "Status: ❌ Not connected";
    kycStatusEl.textContent = currentUser ? "Status: ✅ KYC submitted" : "Status: 🕒 Waiting";

    if (currentToken) {
        tokenBox.classList.remove("hidden");
        tokenIDEl.textContent = currentToken.id;
        tokenOwnerEl.textContent = currentToken.owner;
        tokenIssuedEl.textContent = currentToken.issued;
        tokenStatusEl.textContent = currentToken.status;
    } else {
        tokenBox.classList.add("hidden");
    }

    updateConsentText();
}

function updateConsentText() {
    consentStatusEl.textContent = consent.length 
        ? `Allowed Access: ${consent.join(", ")}` 
        : "Allowed Access: None";
}

// Wallet connect
connectWalletBtn.addEventListener("click", () => {
    walletConnected = true;
    refreshUI();
});

// Submit KYC
submitKycBtn.addEventListener("click", () => {
    if (!walletConnected) return alert("Connect wallet first.");

    const name = nameInput.value.trim();
    const idNumber = idInput.value.trim();
    const fileChosen = fileInput.files.length > 0;

    if (!name || !idNumber || !fileChosen)
        return alert("Fill all fields and upload ID proof.");

    kycStatusEl.textContent = "Status: 🔄 Submitting...";

    setTimeout(() => {
        currentUser = { name, idNumber };
        saveState();
        refreshUI();
        kycStatusEl.textContent = "Status: ✅ KYC submitted";
    }, 900);
});

// Generate token
generateTokenBtn.addEventListener("click", () => {
    if (!walletConnected || !currentUser) return alert("Complete previous steps!");

    const tokenId = "KYC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const issuedAt = new Date().toLocaleString();

    currentToken = {
        id: tokenId,
        owner: currentUser.name,
        issued: issuedAt,
        status: "Active"
    };

    saveState();
    refreshUI();
});

// Consent Checkboxes
[bankA, appB, insuranceC].forEach(cb => {
    cb.addEventListener("change", () => {
        consent = [
            bankA.checked && "ICICI Bank",
            appB.checked && "SBI",
            insuranceC.checked && "HDFC Bank"
        ].filter(Boolean);

        saveState();
        updateConsentText();
    });
});

// Verify Token
verifyBtn.addEventListener("click", () => {
    const input = verifyInput.value.trim();

    if (!input) {
        verifyStatusEl.textContent = "❌ Enter token to verify";
        verifyStatusEl.style.color = "red";
        return;
    }

    if (currentToken && input === currentToken.id) {
        verifyStatusEl.textContent = `✔ Valid token. Owner: ${currentToken.owner}. Access: ${consent.join(", ") || "None"}`;
        verifyStatusEl.style.color = "green";
    } else {
        verifyStatusEl.textContent = "❌ Invalid or unknown token";
        verifyStatusEl.style.color = "red";
    }
});

// Initialize
loadState();
