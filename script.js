// DOM References
const particleCanvas = document.getElementById('particleCanvas');
const scrollIndicator = document.getElementById('scrollIndicator');
const scrollFairy = document.getElementById('scrollFairy');
const musicToggle = document.getElementById('musicToggle');
const musicOnIcon = document.getElementById('musicOnIcon');
const musicOffIcon = document.getElementById('musicOffIcon');
const backgroundMusic = document.getElementById('backgroundMusic');
const successSound = document.getElementById('successSound');
const hitSound = document.getElementById('hitSound');
const rsvpForm = document.getElementById('rsvpForm');
const letterAnimations = document.querySelectorAll('.letter-animation');

// Global variables
let isMusicPlaying = false;
let isMusicMuted = true;
let currentSlide = 0;
let particles = [];
let fairyDustParticles = [];

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
  initLetterAnimations();
  setupScrollHandler();
  setupParticleBackground();
  setupMusicToggle();
  setupRSVPForm();
  setupCarousel();
  create3DCardEffects();
  createDustTrail();
  
  // Setup countdown timer
  setupCountdownTimer();
  
  // Setup guest messages form
  setupGuestMessages();
  
  // Setup gift opening animation
  setupGiftOpening();
  
  // Add fairy dust cursor effect
  setupFairyDustCursor();
  
  // Add visibility animations to elements when they come into view
  setupFadeInAnimations();
  
  // Initialize GSAP animations
  console.log("GSAP animations initialized");
  
  // Log that the app is initialized
  console.log("App initialized, music ready");
});

// Initialize letter animations for main title
function initLetterAnimations() {
  letterAnimations.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.setProperty('--char-index', i);
      element.appendChild(span);
    }
  });
}

// Update scroll progress indicator
function setupScrollHandler() {
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    // Update scroll indicator height
    scrollIndicator.style.height = scrolled + '%';
    
    // Update fairy position
    scrollFairy.style.bottom = scrolled + '%';
    scrollFairy.style.transform = `translateX(-50%) scale(${0.7 + (scrolled / 100) * 0.6})`;
    scrollFairy.style.opacity = Math.min(1, 0.5 + scrolled / 100);
    
    // Add parallax effect to elements with data-direction
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(el => {
      const direction = el.dataset.direction || '1';
      const speed = parseFloat(direction);
      const yValue = winScroll * speed * 0.1;
      el.style.transform = `translateY(${yValue}px)`;
    });
  });
}

// Setup particle background
function setupParticleBackground() {
  const ctx = particleCanvas.getContext('2d');
  
  // Set canvas size to match window
  function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Particle class
  class Particle {
    constructor(x, y, forced = false) {
      this.x = x;
      this.y = y;
      this.size = forced ? 2 + Math.random() * 4 : 1 + Math.random() * 3;
      
      // Generate random colors in the theme palette
      const colors = [
        `rgba(255, 173, 210, OPACITY)`, // Pink
        `rgba(179, 127, 235, OPACITY)`, // Lavender
        `rgba(105, 192, 255, OPACITY)`, // Blue
        `rgba(255, 213, 102, OPACITY)`, // Gold
      ];
      
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = forced ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 1;
      this.speedY = forced ? -1 - Math.random() * 2 : -0.5 - Math.random() * 1;
      this.life = forced ? 30 + Math.random() * 20 : 100 + Math.random() * 200;
      this.maxLife = forced ? 50 : 300;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life--;
    }
    
    draw() {
      const opacity = this.life / this.maxLife;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('OPACITY', opacity.toString());
      ctx.fill();
    }
    
    isDead() {
      return this.life <= 0;
    }
  }
  
  // Create initial background particles
  function createBackgroundParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(
        Math.random() * particleCanvas.width,
        Math.random() * particleCanvas.height
      ));
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      } else {
        particles[i].draw();
      }
    }
    
    // Add background particles if needed
    if (particles.length < 50) {
      particles.push(new Particle(
        Math.random() * particleCanvas.width,
        particleCanvas.height + 10
      ));
    }
    
    requestAnimationFrame(animate);
  }
  
  createBackgroundParticles();
  animate();
}

// Setup music toggle functionality
function setupMusicToggle() {
  // Set volume to appropriate level
  if (backgroundMusic) {
    backgroundMusic.volume = 0.5; // Set volume to 50%
    
    // Add event listener to handle when audio is loaded
    backgroundMusic.addEventListener('canplaythrough', () => {
      console.log('Background music loaded and ready to play');
    });
    
    // Add ended event to loop the music if loop attribute doesn't work
    backgroundMusic.addEventListener('ended', () => {
      if (isMusicPlaying) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
          console.error('Error replaying background music:', error);
        });
      }
    });
  }
  
  // Setup toggle button click event
  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      // Pause music with fade out
      fadeOutAudio(backgroundMusic, 800).then(() => {
        backgroundMusic.pause();
      });
      isMusicPlaying = false;
      musicOnIcon.style.display = 'none';
      musicOffIcon.style.display = 'inline-block';
      
      // Add sparkle animation to button when turning off
      addSparkleEffect(musicToggle);
    } else {
      // Reset volume and play with fade in
      backgroundMusic.currentTime = 0;
      backgroundMusic.volume = 0; 
      
      backgroundMusic.play().then(() => {
        fadeInAudio(backgroundMusic, 1500);
        isMusicPlaying = true;
        musicOnIcon.style.display = 'inline-block';
        musicOffIcon.style.display = 'none';
        
        // Add sparkle animation to button when turning on
        addSparkleEffect(musicToggle);
      }).catch(error => {
        console.error('Error playing background music:', error);
      });
    }
  });
  
  // Show notification to user about music
  showMusicNotification();
  
  // Enable audio on first user interaction with the page (needed for browsers that block autoplay)
  document.addEventListener('click', () => {
    if (!isMusicPlaying && !isMusicMuted) {
      // Play with delay to make sure it's user initiated
      setTimeout(() => {
        backgroundMusic.volume = 0;
        backgroundMusic.play().then(() => {
          fadeInAudio(backgroundMusic, 2000);
          isMusicPlaying = true;
          musicOnIcon.style.display = 'inline-block';
          musicOffIcon.style.display = 'none';
        }).catch(error => {
          console.error('Error playing background music:', error);
        });
      }, 1000);
    }
  }, { once: true });
}

// Fade audio volume in 
function fadeInAudio(audioElement, duration = 1000) {
  const initialVolume = 0;
  const targetVolume = 0.5; // 50% volume
  const startTime = performance.now();
  
  return new Promise(resolve => {
    function updateVolume() {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audioElement.volume = initialVolume + (targetVolume - initialVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(updateVolume);
  });
}

// Fade audio volume out
function fadeOutAudio(audioElement, duration = 1000) {
  const initialVolume = audioElement.volume;
  const targetVolume = 0;
  const startTime = performance.now();
  
  return new Promise(resolve => {
    function updateVolume() {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audioElement.volume = initialVolume + (targetVolume - initialVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(updateVolume);
  });
}

// Show notification about music
function showMusicNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'music-notification fixed z-50 bottom-20 right-6 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs transform translate-y-10 opacity-0 transition-all duration-500';
  notification.innerHTML = `
    <div class="flex items-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary mr-2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
      <p class="text-sm">Click the music button for a magical soundtrack! 🎵</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
    
    // Animate out after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(10px)';
      notification.style.opacity = '0';
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }, 2000);
}

// Setup RSVP form submission
function setupRSVPForm() {
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(rsvpForm);
      const formValues = Object.fromEntries(formData.entries());
      
      // Display thank you message
      rsvpForm.innerHTML = `
        <div class="text-center">
          <h3 class="text-primary">Thank You!</h3>
          <p>We've received your RSVP and can't wait to celebrate with you!</p>
          <div class="sparkle" style="left: 30%; top: 20%"></div>
          <div class="sparkle" style="right: 30%; top: 40%"></div>
          <div class="sparkle" style="left: 50%; top: 60%"></div>
        </div>
      `;
      
      // Log form data - in a real implementation, this would be sent to a server
      console.log('RSVP Submitted:', formValues);
    });
  }
}

// Replace the existing setupCarousel function with this:

function setupCarousel() {
  const memoriesGrid = document.querySelector('.memories-grid');
  const slides = document.querySelectorAll('.memories-slide');
  const indicators = document.querySelectorAll('.carousel-indicators button');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  
  if (!memoriesGrid || slides.length === 0) return;
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  // Show initial slide
  showSlide(0);
  
  function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Update transform to slide
    memoriesGrid.style.transform = `translateX(-${index * (100 / totalSlides)}%)`;
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('active');
        indicator.style.width = '2rem';
        indicator.style.opacity = '1';
      } else {
        indicator.classList.remove('active');
        indicator.style.width = '0.5rem';
        indicator.style.opacity = '0.3';
      }
    });
    
    // Update current slide
    currentSlide = index;
    
    // Update button states
    prevButton.style.opacity = currentSlide === 0 ? '0.5' : '1';
    nextButton.style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === totalSlides - 1;
  }
  
  // Navigation functions
  window.goToSlide = function(index) {
    showSlide(index);
  };
  
  window.moveSlide = function(step) {
    showSlide(currentSlide + step);
  };
  
  // Add click event listeners to indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
    });
  });
}

// Create 3D card effects for highlight cards
function create3DCardEffects() {
  const cards = document.querySelectorAll('.highlight-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      // Calculate rotation based on mouse position
      const rotateY = ((e.clientX - cardCenterX) / (cardRect.width / 2)) * 15;
      const rotateX = -((e.clientY - cardCenterY) / (cardRect.height / 2)) * 15;
      
      // Apply the rotation
      card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      
      // Update the shine effect
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${e.clientX - cardRect.left}px ${e.clientY - cardRect.top}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset the rotation when mouse leaves
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      
      // Reset the shine effect
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)';
      }
    });
  });
}

// Create fairy dust trail that follows the cursor
function createDustTrail() {
  document.addEventListener('mousemove', (e) => {
    createDustParticle(e.clientX, e.clientY);
  });
}

// Create a single dust particle
function createDustParticle(x, y) {
  const colors = [
    'rgba(255, 215, 0, 0.7)',  // Gold
    'rgba(247, 89, 171, 0.6)', // Pink
    'rgba(179, 126, 235, 0.5)' // Lavender
  ];
  
  const particle = document.createElement('div');
  particle.className = 'dust-particle';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  
  // Random properties
  const size = 4 + Math.random() * 10;
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.background = color;
  
  document.body.appendChild(particle);
  
  // Animate and remove
  setTimeout(() => {
    particle.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${-20 - Math.random() * 50}px) scale(0)`;
    particle.style.opacity = '0';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }, 10);
}

// Setup countdown timer
function setupCountdownTimer() {
  const daysElement = document.getElementById('countdown-days');
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');
  
  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;
  
  // Set the birthday date - May 17, 2025 at 4:00 PM
  const birthdayDate = new Date('May 17, 2025 16:00:00').getTime();
  
  // Update the countdown every second
  const countdownTimer = setInterval(() => {
    // Get current date and time
    const now = new Date().getTime();
    
    // Calculate the time remaining
    const timeRemaining = birthdayDate - now;
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Display the countdown
    daysElement.textContent = days;
    hoursElement.textContent = hours;
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds;
    
    // If countdown is finished
    if (timeRemaining < 0) {
      clearInterval(countdownTimer);
      daysElement.textContent = '0';
      hoursElement.textContent = '0';
      minutesElement.textContent = '0';
      secondsElement.textContent = '0';
      
      // Add celebration animation or message
      const countdownContainer = document.querySelector('.countdown-container');
      if (countdownContainer) {
        countdownContainer.innerHTML = `
          <h3 class="text-secondary mb-4">It's Party Time!</h3>
          <p class="text-lg">The celebration has begun! 🎉</p>
        `;
      }
    }
  }, 1000);
}

// Setup guest messages functionality
function setupGuestMessages() {
  const messageForm = document.getElementById('messageForm');
  const messagesContainer = document.getElementById('messagesContainer');
  
  if (!messageForm || !messagesContainer) return;
  
  // Sample messages that will be shown first (these are in addition to the HTML ones)
  const sampleMessages = [
    {
      text: "Wishing our sweet princess a magical first birthday filled with wonders and joy!",
      author: "Uncle Rahul & Family"
    },
    {
      text: "May your special day be as bright and beautiful as your smile, little one!",
      author: "The Patel Family"
    }
  ];
  
  // Load messages from local storage or use sample ones
  const savedMessages = localStorage.getItem('birthdayMessages');
  let messages = savedMessages ? JSON.parse(savedMessages) : [];
  
  // Add sample messages if there are no saved messages yet
  if (messages.length === 0) {
    messages = sampleMessages;
    // Save to local storage
    localStorage.setItem('birthdayMessages', JSON.stringify(messages));
  }
  
  // Render all messages
  renderMessages(messages);
  
  // Handle form submission
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const guestName = document.getElementById('guestName').value.trim();
    const guestMessage = document.getElementById('guestMessage').value.trim();
    
    if (guestName && guestMessage) {
      // Create new message object
      const newMessage = {
        text: guestMessage,
        author: guestName
      };
      
      // Add to messages array
      messages.push(newMessage);
      
      // Save to local storage
      localStorage.setItem('birthdayMessages', JSON.stringify(messages));
      
      // Render the new message
      renderMessage(newMessage, true);
      
      // Reset form
      messageForm.reset();
      
      // Show success message
      showMessageSuccess();
    }
  });
  
  // Function to render all messages
  function renderMessages(messagesList) {
    // Clear existing sample messages
    const existingSampleMessages = messagesContainer.querySelectorAll('.message-card');
    existingSampleMessages.forEach(sample => {
      if (!sample.classList.contains('user-message')) {
        sample.remove();
      }
    });
    
    // Render each message
    messagesList.forEach((message, index) => {
      renderMessage(message, false, 100 * index);
    });
  }
  
  // Function to render a single message
  function renderMessage(message, isNew = false, delay = 0) {
    const messageCard = document.createElement('div');
    messageCard.className = `message-card card${isNew ? ' message-animation' : ''}`;
    if (isNew) messageCard.classList.add('user-message');
    
    messageCard.innerHTML = `
      <div class="message-content">
        <p class="message-text">"${message.text}"</p>
        <p class="message-author">- ${message.author}</p>
      </div>
    `;
    
    // Add with delay for animation
    setTimeout(() => {
      // Add to container
      messagesContainer.prepend(messageCard);
      
      // Add sparkle effect if new
      if (isNew) {
        addSparkleEffectToMessage(messageCard);
      }
    }, delay);
  }
  
  // Add sparkle effect to a new message
  function addSparkleEffectToMessage(element) {
    // Create sparkles around the message
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      
      // Set position
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      
      sparkle.style.position = 'absolute';
      sparkle.style.left = `${left}%`;
      sparkle.style.top = `${top}%`;
      sparkle.style.width = `${8 + Math.random() * 10}px`;
      sparkle.style.height = `${8 + Math.random() * 10}px`;
      sparkle.style.opacity = '0';
      sparkle.style.zIndex = '5';
      
      element.appendChild(sparkle);
      
      // Animate sparkle
      setTimeout(() => {
        sparkle.style.opacity = '0.8';
        sparkle.style.transform = 'scale(1.2)';
        sparkle.style.transition = 'all 0.5s ease-out';
        
        // Remove sparkle after animation
        setTimeout(() => {
          sparkle.style.opacity = '0';
          sparkle.style.transform = 'scale(0)';
          
          setTimeout(() => {
            if (sparkle.parentNode) {
              sparkle.parentNode.removeChild(sparkle);
            }
          }, 500);
        }, 800 + Math.random() * 400);
      }, 100 + Math.random() * 300);
    }
  }
  
  // Show success message after form submission
  function showMessageSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed z-50 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl max-w-sm text-center';
    successMessage.innerHTML = `
      <h3 class="text-primary mb-2">Message Sent!</h3>
      <p>Your birthday wish for Madiha has been added! 🎉</p>
    `;
    
    document.body.appendChild(successMessage);
    
    // Add sparkle effect
    addSparkleEffect(successMessage);
    
    // Remove after 3 seconds
    setTimeout(() => {
      successMessage.style.opacity = '0';
      successMessage.style.transform = 'translate(-50%, -100%)';
      successMessage.style.transition = 'all 0.5s ease-out';
      
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 500);
    }, 3000);
  }
}

// Add sparkle effect to an element
function addSparkleEffect(element) {
  // Create multiple sparkles around the element
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Set position around the element
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 30;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    
    // Position sparkle
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${centerX + offsetX}px`;
    sparkle.style.top = `${centerY + offsetY}px`;
    sparkle.style.width = `${6 + Math.random() * 12}px`;
    sparkle.style.height = `${6 + Math.random() * 12}px`;
    sparkle.style.opacity = '0';
    sparkle.style.zIndex = '100';
    
    document.body.appendChild(sparkle);
    
    // Animate sparkle
    setTimeout(() => {
      sparkle.style.opacity = '0.8';
      sparkle.style.transform = 'scale(1.2)';
      sparkle.style.transition = 'all 0.5s ease-out';
      
      // Remove sparkle after animation
      setTimeout(() => {
        sparkle.style.opacity = '0';
        sparkle.style.transform = 'scale(0)';
        
        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
          }
        }, 500);
      }, 500 + Math.random() * 300);
    }, Math.random() * 300);
  }
}

// Setup gift opening animation
function setupGiftOpening() {
  const giftBox = document.getElementById('giftBox');
  const giftConfetti = document.getElementById('giftConfetti');
  const giftMessage = document.getElementById('giftMessage');
  const resetGiftBtn = document.getElementById('resetGift');
  const giftOptions = document.querySelectorAll('.gift-option');
  const updateGiftBtn = document.getElementById('updateGift');
  
  if (!giftBox || !giftConfetti || !giftMessage) return;
  
  // Gift data
  let currentGift = {
    type: 'teddy',
    message: 'Happy Birthday, Princess Madiha!',
    from: 'Your Loving Family'
  };
  
  // Gift images
  const giftImages = {
    teddy: 'https://res.cloudinary.com/dj5iihhqv/image/upload/v1714392719/teddy-bear_bozazn.png',
    crown: 'https://res.cloudinary.com/dj5iihhqv/image/upload/v1714392719/crown_pnw3b9.png',
    wand: 'https://res.cloudinary.com/dj5iihhqv/image/upload/v1714392719/magic-wand_ojqpzh.png'
  };
  
  // Handle gift box click
  giftBox.addEventListener('click', () => {
    // Play sound effect if available
    if (window.successSound) {
      successSound.play().catch(err => console.log('Could not play sound', err));
    }
    
    // Add animation class to gift box
    giftBox.classList.add('gift-opening-animation');
    
    // Show confetti
    showConfetti();
    
    // Hide gift box after animation
    setTimeout(() => {
      giftBox.style.display = 'none';
      
      // Show gift message
      showGiftMessage();
    }, 1500);
  });
  
  // Reset gift button click
  if (resetGiftBtn) {
    resetGiftBtn.addEventListener('click', () => {
      // Hide message
      giftMessage.classList.remove('visible');
      setTimeout(() => {
        giftMessage.style.display = 'none';
        
        // Reset and show gift box
        giftBox.classList.remove('gift-opening-animation');
        giftBox.style.display = 'block';
        
        // Clear confetti
        giftConfetti.innerHTML = '';
        giftConfetti.classList.add('hidden');
      }, 500);
    });
  }
  
  // Gift option selection
  giftOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      giftOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Update current gift type
      currentGift.type = option.dataset.gift;
    });
  });
  
  // Update gift button click
  if (updateGiftBtn) {
    updateGiftBtn.addEventListener('click', () => {
      // Get message and sender
      const messageInput = document.getElementById('giftMessageInput');
      const senderInput = document.getElementById('giftSender');
      
      if (messageInput && messageInput.value.trim()) {
        currentGift.message = messageInput.value.trim();
      }
      
      if (senderInput && senderInput.value.trim()) {
        currentGift.from = senderInput.value.trim();
      }
      
      // Show success notification
      showGiftUpdateNotification();
      
      // Update the gift image in the message
      const giftImage = document.querySelector('.gift-surprise-image img');
      if (giftImage) {
        giftImage.src = giftImages[currentGift.type];
        giftImage.alt = currentGift.type.charAt(0).toUpperCase() + currentGift.type.slice(1);
      }
      
      // Update surprise message
      const surpriseMessage = document.getElementById('surpriseMessage');
      if (surpriseMessage) {
        surpriseMessage.textContent = currentGift.message;
      }
    });
  }
  
  // Show gift message
  function showGiftMessage() {
    // Update message content
    const surpriseMessage = document.getElementById('surpriseMessage');
    if (surpriseMessage) {
      surpriseMessage.textContent = currentGift.message;
    }
    
    // Add sender to message
    const messageElement = document.getElementById('giftMessage');
    if (messageElement) {
      // Find or create sender element
      let senderElement = messageElement.querySelector('.gift-sender');
      if (!senderElement) {
        senderElement = document.createElement('p');
        senderElement.className = 'gift-sender text-secondary font-bold';
        messageElement.insertBefore(senderElement, document.getElementById('resetGift'));
      }
      senderElement.textContent = `From: ${currentGift.from}`;
    }
    
    // Update gift image
    const giftImage = document.querySelector('.gift-surprise-image img');
    if (giftImage) {
      giftImage.src = giftImages[currentGift.type];
      giftImage.alt = currentGift.type.charAt(0).toUpperCase() + currentGift.type.slice(1);
    }
    
    // Show message with animation
    giftMessage.style.display = 'block';
    setTimeout(() => {
      giftMessage.classList.add('visible');
    }, 100);
  }
  
  // Show confetti animation
  function showConfetti() {
    giftConfetti.classList.remove('hidden');
    
    // Create confetti pieces
    const colors = ['#f759ab', '#b37feb', '#ffc53d', '#69c0ff'];
    
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      
      // Random properties
      const size = 5 + Math.random() * 10;
      const posX = Math.random() * 100; // percent
      const rotation = Math.random() * 360;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Apply styles
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.left = `${posX}%`;
      piece.style.backgroundColor = color;
      piece.style.transform = `rotate(${rotation}deg)`;
      
      // Add to container
      giftConfetti.appendChild(piece);
      
      // Animate
      setTimeout(() => {
        piece.style.transition = `all ${1 + Math.random() * 2}s ease-out`;
        piece.style.opacity = '1';
        piece.style.transform = `translateY(${100 + Math.random() * 150}px) rotate(${rotation + Math.random() * 360}deg)`;
      }, Math.random() * 500);
      
      // Remove after animation
      setTimeout(() => {
        piece.style.opacity = '0';
        setTimeout(() => {
          if (piece.parentNode) {
            piece.parentNode.removeChild(piece);
          }
        }, 1000);
      }, 1500 + Math.random() * 1000);
    }
  }
  
  // Show notification after updating gift
  function showGiftUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed z-50 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl max-w-sm text-center';
    notification.innerHTML = `
      <h3 class="text-primary mb-2">Gift Updated!</h3>
      <p>Your gift for Madiha is ready to be opened!</p>
      <p class="text-sm mt-2">Click the gift box to see the magic happen!</p>
    `;
    
    document.body.appendChild(notification);
    
    // Add sparkle effect
    addSparkleEffect(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -100%)';
      notification.style.transition = 'all 0.5s ease-out';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
}

// Setup fairy dust cursor effect
function setupFairyDustCursor() {
  // Create canvas for fairy dust
  const fairyCanvas = document.createElement('canvas');
  fairyCanvas.className = 'fairy-dust-canvas fixed inset-0 pointer-events-none z-50';
  fairyCanvas.style.pointerEvents = 'none';
  document.body.appendChild(fairyCanvas);
  
  const ctx = fairyCanvas.getContext('2d');
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // Set canvas size
  function resizeCanvas() {
    fairyCanvas.width = window.innerWidth;
    fairyCanvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Fairy dust particle class
  class FairyDustParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 1 + Math.random() * 3;
      
      // Random motion
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      // Glitter colors 
      const colors = [
        '#f759ab', // Pink
        '#b37feb', // Lavender
        '#ffc53d', // Gold
        '#69c0ff'  // Blue
      ];
      
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = 1;
      this.decay = 0.01 + Math.random() * 0.05;
    }
    
    update() {
      // Move particle
      this.x += this.vx;
      this.y += this.vy;
      
      // Gravity effect
      this.vy += 0.05;
      
      // Fade out
      this.alpha -= this.decay;
      
      // Slow down
      this.vx *= 0.99;
      this.vy *= 0.99;
    }
    
    draw() {
      if (this.alpha <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      
      // Draw a star shape for sparkle
      const spikes = 5;
      const outerRadius = this.size;
      const innerRadius = this.size / 2;
      
      let rot = Math.PI / 2 * 3;
      let x = this.x;
      let y = this.y;
      let step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        x = this.x + Math.cos(rot) * outerRadius;
        y = this.y + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = this.x + Math.cos(rot) * innerRadius;
        y = this.y + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(this.x, this.y - outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add particles when mouse moves
    if (Math.abs(mouseX - lastMouseX) > 5 || Math.abs(mouseY - lastMouseY) > 5) {
      // Create fairy dust
      createFairyDust(mouseX, mouseY);
      
      // Play hit sound on some movements
      if (fairyDustParticles.length % 10 === 0 && hitSound) {
        // Randomize sound effect volume
        hitSound.volume = 0.1 + Math.random() * 0.1;
        hitSound.currentTime = 0;
        hitSound.play().catch(error => {
          console.log('Error playing hit sound', error);
        });
      }
      
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  });
  
  // Create fairy dust particles
  function createFairyDust(x, y) {
    const particleCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < particleCount; i++) {
      fairyDustParticles.push(new FairyDustParticle(
        x + (Math.random() - 0.5) * 10, 
        y + (Math.random() - 0.5) * 10
      ));
    }
  }
  
  // Animation loop
  function animateFairyDust() {
    // Clear the canvas
    ctx.clearRect(0, 0, fairyCanvas.width, fairyCanvas.height);
    
    // Update and draw particles
    for (let i = fairyDustParticles.length - 1; i >= 0; i--) {
      fairyDustParticles[i].update();
      
      // Remove faded particles
      if (fairyDustParticles[i].alpha <= 0) {
        fairyDustParticles.splice(i, 1);
      } else {
        fairyDustParticles[i].draw();
      }
    }
    
    // Continue animation
    requestAnimationFrame(animateFairyDust);
  }
  
  // Start animation
  animateFairyDust();
}

// Ensure fade-in animations work on mobile
function setupFadeInAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// Ensure touch events trigger animations
document.addEventListener('touchstart', () => {
  const floatingElements = document.querySelectorAll('.floating-element');
  floatingElements.forEach(el => {
    el.style.animationPlayState = 'running';
  });
});
function openLid() {
  const lid = document.getElementById("boxLid");
  const box = document.getElementById("boxContainer");
  const message = document.getElementById("secretMessage");

  // Flip lid open
  lid.style.transform = "rotateX(-120deg)";
  
  // Animate box back
  box.querySelector(".box-body").style.transform = "rotateY(180deg)";

  // Hide box after flip
  setTimeout(() => {
    box.style.display = "none";
    message.classList.remove("hidden");
  }, 1000);
}

// Function to handle mouse or touch movement
function handleMovement(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;

  const elements = document.querySelectorAll('.floating-element, .sparkle');
  elements.forEach((el) => {
    const speed = el.dataset.speed || 10;
    const xOffset = (window.innerWidth / 2 - x) / speed;
    const yOffset = (window.innerHeight / 2 - y) / speed;

    el.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  });
}

// Add event listeners for both mouse and touch events
document.addEventListener('mousemove', handleMovement);
document.addEventListener('touchmove', handleMovement);
