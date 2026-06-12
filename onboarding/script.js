/**
 * Scrap Onboarding – Slide navigation
 */

let currentSlide = 0;
const totalSlides = 5;

function showSlide(index) {
  // Clamp index
  if (index < 0) index = 0;
  if (index >= totalSlides) index = totalSlides - 1;

  currentSlide = index;

  // Update slides visibility
  document.querySelectorAll(".slide").forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });

  // Update dots
  document.querySelectorAll(".dots .dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1);
  }
}

/**
 * Close the onboarding.
 * If running inside Electron/webview, send a message to the host.
 * Otherwise just alert.
 */
function closeOnboarding() {
  // For a desktop app frame: try to send close message
  try {
    if (window.__SCRAP_HOST__) {
      window.__SCRAP_HOST__.closeOnboarding();
      return;
    }
  } catch (_) {
    // ignore
  }

  // Fallback: if in a browser, redirect or just show a message
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;
                font-family:sans-serif;color:#e0e0e0;text-align:center;padding:2rem;">
      <div>
        <div style="font-size:64px;margin-bottom:16px;">🎉</div>
        <h2>You're all set!</h2>
        <p style="color:#a0a0b0;margin-top:8px;">
          Scrap is ready. You can close this window.
        </p>
      </div>
    </div>
  `;
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    nextSlide();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevSlide();
  }
});

// Initialize
showSlide(0);