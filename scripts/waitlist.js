/* ── Config ────────────────────────────────────────────────────── */
const API_BASE = 'https://findyourshoot.onrender.com'; // ← change to your deployed URL

/* ── Elements ──────────────────────────────────────────────────── */
const emailInput = document.getElementById('email-input');
const joinBtn = document.getElementById('join-btn');
const subText = document.getElementById('sub-text');
const toast = document.getElementById('toast');

/* ── Toast helper ──────────────────────────────────────────────── */
let toastTimer;
function showToast(message, type = 'info', duration = 3500) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `show ${type}`;
    toastTimer = setTimeout(() => { toast.className = ''; }, duration);
}

/* ── Client-side email validation ──────────────────────────────── */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ── Fetch current waitlist count & update subtitle (with retry) ── */
async function refreshCount({ attempt = 1, maxAttempts = 4, baseDelay = 1000 } = {}) {
    try {
        const res = await fetch(`${API_BASE}/waitlist`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (typeof data.count === 'number') {
            subText.textContent =
                `Join ${data.count}+ ${data.count === 1 ? 'person' : 'persons'} waiting to find their next perfect shoot`;
        }
    } catch {
        if (attempt < maxAttempts) {
            const delay = baseDelay * 2 ** (attempt - 1); // 1s → 2s → 4s
            setTimeout(() => refreshCount({ attempt: attempt + 1, maxAttempts, baseDelay }), delay);
        }
        /* all retries exhausted — subtitle keeps its default text */
    }
}

/* ── Submit handler ────────────────────────────────────────────── */
async function handleJoin() {
    const email = emailInput.value.trim();

    /* Client-side validation */
    if (!email) {
        emailInput.classList.add('invalid');
        showToast('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }
    if (!isValidEmail(email)) {
        emailInput.classList.add('invalid');
        showToast('That doesn\'t look like a valid email.', 'error');
        emailInput.focus();
        return;
    }

    emailInput.classList.remove('invalid');

    /* Loading state */
    joinBtn.dataset.loading = 'true';
    joinBtn.textContent = 'Joining';

    try {
        const res = await fetch(`${API_BASE}/waitlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (res.status === 201) {
            showToast('🎉 You\'re on the list! We\'ll be in touch.', 'success', 4000);
            emailInput.value = '';
            joinBtn.textContent = 'You\'re in!';
            joinBtn.disabled = true;
            refreshCount();
        } else if (res.status === 409) {
            showToast('This email is already on the waitlist.', 'info');
            joinBtn.textContent = 'Join waitlist';
        } else if (res.status === 422) {
            emailInput.classList.add('invalid');
            showToast(data.error || 'Invalid email address.', 'error');
            joinBtn.textContent = 'Join waitlist';
        } else {
            showToast(data.error || 'Something went wrong. Try again.', 'error');
            joinBtn.textContent = 'Join waitlist';
        }
    } catch {
        showToast('Network error — please check your connection.', 'error');
        joinBtn.textContent = 'Join waitlist';
    } finally {
        joinBtn.dataset.loading = 'false';
    }
}

/* ── Event listeners ───────────────────────────────────────────── */
joinBtn.addEventListener('click', handleJoin);

emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleJoin();
});

emailInput.addEventListener('input', () => {
    emailInput.classList.remove('invalid');
});

/* ── Init: load live count ─────────────────────────────────────── */
refreshCount();