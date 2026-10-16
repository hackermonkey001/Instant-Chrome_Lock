// STEP 1: IMMEDIATELY HIDE THE PAGE (no flicker)
const hideStyle = document.createElement('style');
hideStyle.id = "instant_hide_style";
hideStyle.textContent = 'html { display: none !important; background: #000 !important; }';
document.documentElement.appendChild(hideStyle);

function createLock() {
  // Host element + shadow DOM so the website's CSS can't affect the lock screen
  const host = document.createElement('div');
  host.id = "global_privacy_lock";
  host.style.cssText = "position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; display: block !important;";
  const shadow = host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .screen {
        position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 30%, #1a1a1f 0%, #000 65%);
        color: #fff;
        animation: fadeIn .25s ease-out;
      }
      .card {
        width: 340px; padding: 36px 30px 30px; text-align: center;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 22px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.7);
        backdrop-filter: blur(12px);
      }
      .card.shake { animation: shake .4s; }
      .icon {
        width: 64px; height: 64px; margin: 0 auto 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
      }
      .icon svg { width: 28px; height: 28px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
      h2 { margin: 0 0 6px; font-size: 22px; font-weight: 600; letter-spacing: .3px; }
      .sub { margin: 0 0 22px; font-size: 13px; color: #8d8d96; }
      input {
        width: 100%; padding: 14px; font-size: 18px; letter-spacing: 6px; text-align: center;
        color: #fff; background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.14); border-radius: 12px; outline: none;
        transition: border-color .2s, box-shadow .2s;
      }
      input::placeholder { letter-spacing: normal; font-size: 14px; color: #6b6b74; }
      input:focus { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.12); }
      input.bad { border-color: #ff4d4f; box-shadow: 0 0 0 3px rgba(255,77,79,0.18); }
      button {
        margin-top: 16px; width: 100%; padding: 14px; font-size: 15px; font-weight: 600;
        color: #000; background: #fff; border: none; border-radius: 12px; cursor: pointer;
        transition: transform .1s, opacity .2s;
      }
      button:hover { opacity: .9; }
      button:active { transform: scale(.97); }
      button:disabled { opacity: .5; cursor: default; }
      .err { height: 16px; margin-top: 12px; font-size: 12px; color: #ff6b6d; opacity: 0; transition: opacity .2s; }
      .err.show { opacity: 1; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes shake {
        0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); }
      }
    </style>
    <div class="screen">
      <div class="card" id="card">
        <div class="icon">
          <svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <h2>Locked</h2>
        <p class="sub">Enter your password to continue</p>
        <input type="password" id="pass_input" placeholder="Password" autocomplete="off" />
        <button id="submit_pass">Unlock</button>
        <div class="err" id="err_msg">Incorrect password</div>
      </div>
    </div>
  `;

  document.documentElement.appendChild(host);

  // Lock screen is ready, so the page layer can be un-hidden (it stays covered by the lock)
  hideStyle.remove();

  const input = shadow.getElementById('pass_input');
  const btn = shadow.getElementById('submit_pass');
  const err = shadow.getElementById('err_msg');
  const card = shadow.getElementById('card');

  // Stop the website from stealing keystrokes while locked
  ['keydown', 'keypress', 'keyup'].forEach(evt =>
    host.addEventListener(evt, e => e.stopPropagation(), true)
  );

  function showError() {
    err.classList.add('show');
    input.classList.add('bad');
    card.classList.remove('shake');
    void card.offsetWidth; // restart animation
    card.classList.add('shake');
    input.value = "";
    input.focus();
  }

  function submit() {
    const val = input.value;
    if (!val) return;
    btn.disabled = true;
    chrome.runtime.sendMessage({ action: "verify_password", password: val }, (res) => {
      btn.disabled = false;
      if (res && res.status && res.status.startsWith("unlocked")) {
        host.remove();
      } else {
        showError();
      }
    });
  }

  btn.onclick = submit;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  input.addEventListener('input', () => {
    err.classList.remove('show');
    input.classList.remove('bad');
  });

  input.focus();

  // If the page tries to remove the lock, put it back (only while still locked)
  const observer = new MutationObserver(() => {
    if (!document.documentElement.contains(host) && host.dataset.done !== "1") {
      document.documentElement.appendChild(host);
    }
  });
  observer.observe(document.documentElement, { childList: true });

  // Stop re-adding once unlocked
  const origRemove = host.remove.bind(host);
  host.remove = () => {
    host.dataset.done = "1";
    observer.disconnect();
    origRemove();
  };
}

// Execute logic
chrome.storage.local.get(['isLocked'], (data) => {
  // Lock by default unless explicitly unlocked
  if (data.isLocked !== false) {
    createLock();
  } else {
    hideStyle.remove();
  }
});