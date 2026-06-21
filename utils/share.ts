import confetti from 'canvas-confetti';

interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

/**
 * Universal helper to share content via Web Share API or fallback to clipboard copying
 * with a cute soft pastel Toast notification.
 */
export const handleShare = async ({ title, text, url }: ShareOptions): Promise<void> => {
  let updatedText = text;
  try {
    const officialURL = '[PUNE_AICI_LINKUL_NOU_DE_LA_VERCEL_INCLUSIV_HTTPS://]';
    if (!updatedText.includes(officialURL)) {
      const isRo = /Trimis din|Notiță|Inspirație|indiciu|programul meu/i.test(updatedText);
      const appLinkMessage = isRo
        ? `\n\nVezi aplicația aici: ${officialURL} ✨`
        : `\n\nSee the app here: ${officialURL} ✨`;
      
      updatedText = `${updatedText}${appLinkMessage}`;
    }
  } catch (e) {
    console.error("Error formatting sharing text with official URL", e);
  }

  const shareData: ShareData = {
    title,
    text: updatedText,
    ...(url ? { url } : {})
  };

  // Check if native sharing is fully supported and allowed
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // User cancelled or share dismissed; fall back to copy-to-clipboard gracefully
      console.warn("Native share failed or dismissed, falling back to clipboard copy", err);
    }
  }

  // Fallback to Clipboard API with multi-tiered backup
  const textToCopy = url ? `${updatedText}\n\n${url}` : updatedText;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(textToCopy);
      showToast("Copiat în clipboard! 📤✨");
    } else {
      throw new Error("Clipboard API not available or incomplete");
    }
  } catch (err) {
    console.warn("Modern navigator.clipboard.writeText failed, using textarea fallback:", err);
    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showToast("Copiat în clipboard! 📤✨");
      } else {
        throw new Error("execCommand('copy') returned false");
      }
    } catch (fallbackErr) {
      console.error("Document execCommand copy also failed:", fallbackErr);
      // Let the user know and offer a prompt to copy manually if all automated methods failed
      showToast("Nu s-a putut copia automat. ✨");
      // As an ultimate custom dialog, we can prompt with the text inside a standard prompt so the user can copy it manually
      try {
        window.prompt("Copiază textul de mai jos manual pentru distribuire:", textToCopy);
      } catch (promptErr) {
        console.error("Window prompt failed:", promptErr);
      }
    }
  }
};

const showToast = (message: string) => {
  // Check if a toast container already exists, if not, create one
  let container = document.getElementById('cute-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cute-toast-container';
    container.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'px-5 py-3.5 bg-pink-50/95 dark:bg-slate-900/95 border border-pink-100 dark:border-rose-950/50 backdrop-blur-md text-pink-600 dark:text-rose-400 font-extrabold text-sm rounded-full shadow-[0_10px_25px_-5px_rgba(244,114,182,0.3)] flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto transition-all transition-transform duration-300 transform';
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger a soft confetti pop on copy to make it super cute!
  try {
    confetti({
      particleCount: 25,
      spread: 35,
      origin: { y: 0.1 },
      colors: ['#fbcfe8', '#fce7f3', '#fef4f8', '#fde047']
    });
  } catch (e) {
    console.warn("Confetti failed in share toast:", e);
  }

  // Animate out and remove after some delay or duration
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2', 'scale-95');
    setTimeout(() => {
      toast.remove();
      if (container && container.childNodes.length === 0) {
        container.remove();
      }
    }, 300);
  }, 2500);
};
