window.addEventListener('load', () => {
  let opacity = 0;
  const speed = 10; // lower = slower fade (ms between frames)
  
  // This function will increment opacity and apply it to the document body.
  const fade = () => {
    opacity += 0.03;  // Increment opacity
    document.body.style.opacity = opacity; // Apply to body
    
    // If opacity is less than 1, call fade again after `speed` ms
    if (opacity < 1) {
      requestAnimationFrame(fade); // Use requestAnimationFrame for smoothness
    }
  };
  
  document.body.style.opacity = 0;  // Set initial opacity to 0
  fade();  // Start fade immediately
});
