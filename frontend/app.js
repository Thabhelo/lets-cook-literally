/**
 * AI Cooking Mentor - Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons on page load
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- DOM Selectors ---
  const zoneInput = document.getElementById('zone-input');
  const zoneLoading = document.getElementById('zone-loading');
  const zoneError = document.getElementById('zone-error');
  const zoneRecipe = document.getElementById('zone-recipe');

  const recipeForm = document.getElementById('recipe-form');
  const dishInput = document.getElementById('dish-input');
  const btnConjure = document.getElementById('btn-conjure');
  
  const voiceCards = document.querySelectorAll('.voice-card');
  const loadingTitle = document.getElementById('loading-title');
  const loadingDesc = document.getElementById('loading-desc');
  const progressBarFill = document.getElementById('progress-bar-fill');
  
  const errorMessage = document.getElementById('error-message');
  const btnErrorReset = document.getElementById('btn-error-reset');
  const btnReset = document.getElementById('btn-reset');

  // Webcam & Capture Selectors
  const liveWebcam = document.getElementById('live-webcam');
  const btnCaptureStep = document.getElementById('btn-capture-step');
  const btnHandsFree = document.getElementById('btn-hands-free');
  const btnHandsFreeIcon = document.getElementById('btn-hands-free-icon');
  const btnHandsFreeText = document.getElementById('btn-hands-free-text');
  const btnToggleCamera = document.getElementById('btn-toggle-camera');
  const btnToggleCameraIcon = document.getElementById('btn-toggle-camera-icon');
  const btnToggleCameraText = document.getElementById('btn-toggle-camera-text');

  // Status indicators (Nav)
  const statusCam = document.getElementById('status-cam');
  const statusMic = document.getElementById('status-mic');

  // Step Log / Progress Selectors
  const dishTitleDisplay = document.getElementById('dish-title-display');
  const currentStepDisplay = document.getElementById('current-step-display');
  const coachName = document.getElementById('coach-name');
  const recipeCommentary = document.getElementById('recipe-commentary');
  const chefBubbleAvatar = document.getElementById('chef-bubble-avatar');
  const timelineContainer = document.getElementById('timeline-container');
  const timelinePlaceholder = document.getElementById('timeline-placeholder');
  const suggestionsCard = document.getElementById('suggestions-card');
  const suggestionsList = document.getElementById('suggestions-list');

  // Chef's Voice Guide Selectors
  const btnSpeakCommentary = document.getElementById('btn-speak-commentary');
  const soundwaveContainer = document.getElementById('soundwave-container');
  const speakIcon = document.getElementById('speak-icon');
  const speakText = document.getElementById('speak-text');

  // --- State Variables ---
  let selectedVoice = 'grandma'; // default
  let cookingGoal = '';
  let stepNumber = 0;
  let historyList = [];
  
  let webcamStream = null;
  let isCamActive = false;
  let speechRecognition = null;
  let isMicActive = false;
  let explicitlyStoppedMic = true;

  let activeUtterance = null;
  let isNarratingStep = false;
  let loadingInterval = null;
  let progressInterval = null;

  // --- Voice Configuration Constants ---
  const voiceAvatars = {
    grandma: '<i data-lucide="heart" class="bubble-avatar-svg text-red"></i>',
    michelin: '<i data-lucide="award" class="bubble-avatar-svg text-gold"></i>',
    budget: '<i data-lucide="wallet" class="bubble-avatar-svg text-green"></i>',
    survivalist: '<i data-lucide="shield-alert" class="bubble-avatar-svg text-orange"></i>'
  };

  const loadingSequences = {
    grandma: [
      { title: "Mentor is observing...", desc: "Grandma is putting on her glasses to see your pan." },
      { title: "Evaluating details...", desc: "Checking if everything is ready and clean." },
      { title: "Reviewing ingredients...", desc: "Grandma is checking if you have everything you need." },
      { title: "Writing down advice...", desc: "Formulating comfortable, loving instructions." }
    ],
    michelin: [
      { title: "Analyzing workspace layout...", desc: "Inspecting mise en place and board organization." },
      { title: "Reviewing temperatures...", desc: "Evaluating pan heating and fat distribution." },
      { title: "Formulating technique plan...", desc: "Structuring precision-driven culinary steps." },
      { title: "Refining feedback...", desc: "Drafting strict technical execution guidance." }
    ],
    budget: [
      { title: "Scanning portions...", desc: "Ensuring zero-waste and smart ingredient utilization." },
      { title: "Analyzing pan setup...", desc: "Checking stove burner efficiency settings." },
      { title: "Evaluating options...", desc: "Drafting cheap substitutions and frugal guidelines." },
      { title: "Formulating tips...", desc: "Writing thrifty kitchen tips." }
    ],
    survivalist: [
      { title: "Assessing perimeter safety...", desc: "Verifying stove stability and layout constraints." },
      { title: "Reviewing caloric density...", desc: "Inspecting rations for nutrition efficiency." },
      { title: "Formulating shelter instructions...", desc: "Writing emergency guidelines for the prep." },
      { title: "Evaluating resources...", desc: "Ensuring zero water or heat waste." }
    ]
  };

  // --- Webcam Activation & Management ---

  async function startCamera() {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false
      });
      liveWebcam.srcObject = webcamStream;
      isCamActive = true;
      
      statusCam.className = "nav-status-badge status-active";
      statusCam.innerHTML = '<span class="status-dot"></span><i data-lucide="video" class="nav-icon-sm"></i> Camera Active';
      
      btnToggleCamera.classList.remove('active-toggle');
      btnToggleCameraIcon.setAttribute('data-lucide', 'video');
      btnToggleCameraText.textContent = "Disable Camera";
      
      if (window.lucide) {
        lucide.createIcons();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access webcam. Please verify camera permissions in your browser.");
    }
  }

  function stopCamera() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
    liveWebcam.srcObject = null;
    isCamActive = false;
    
    statusCam.className = "nav-status-badge status-inactive";
    statusCam.innerHTML = '<span class="status-dot"></span><i data-lucide="video-off" class="nav-icon-sm"></i> Camera Off';
    
    btnToggleCamera.classList.add('active-toggle');
    btnToggleCameraIcon.setAttribute('data-lucide', 'video-off');
    btnToggleCameraText.textContent = "Enable Camera";
    
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  btnToggleCamera.addEventListener('click', () => {
    if (isCamActive) {
      stopCamera();
    } else {
      startCamera();
    }
  });

  // --- Hands-Free Speech Recognition ---

  function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.log("Web Speech Recognition is not supported in this browser.");
      btnHandsFree.classList.add('hidden');
      statusMic.classList.add('hidden');
      return;
    }

    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechClass();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => {
      isMicActive = true;
      statusMic.className = "nav-status-badge status-listening";
      statusMic.innerHTML = '<span class="status-dot"></span><i data-lucide="mic" class="nav-icon-sm"></i> Hands-Free On';
      
      btnHandsFree.classList.add('active-toggle');
      btnHandsFreeIcon.setAttribute('data-lucide', 'mic');
      btnHandsFreeText.textContent = "Hands-Free On";
      
      if (window.lucide) {
        lucide.createIcons();
      }
    };

    speechRecognition.onend = () => {
      isMicActive = false;
      statusMic.className = "nav-status-badge status-inactive";
      statusMic.innerHTML = '<span class="status-dot"></span><i data-lucide="mic-off" class="nav-icon-sm"></i> Hands-Free Off';
      
      btnHandsFree.classList.remove('active-toggle');
      btnHandsFreeIcon.setAttribute('data-lucide', 'mic-off');
      btnHandsFreeText.textContent = "Hands-Free Off";
      
      if (window.lucide) {
        lucide.createIcons();
      }

      // Auto-restart loop if not explicitly toggled off
      if (!explicitlyStoppedMic) {
        try {
          speechRecognition.start();
        } catch (e) {
          // Ignore start collisions
        }
      }
    };

    speechRecognition.onresult = (event) => {
      const lastIdx = event.results.length - 1;
      const heardText = event.results[lastIdx][0].transcript.trim().toLowerCase();
      console.log("Mentor mic heard:", heardText);

      // Check keywords: next, chef, coach, step, check
      const commands = ["next", "chef", "coach", "step", "check"];
      const matched = commands.some(cmd => heardText.includes(cmd));

      if (matched) {
        console.log("Voice trigger matched! Capturing current workspace frame...");
        
        // Visual indicator flash
        const scanLine = document.getElementById('camera-scan-line');
        if (scanLine) {
          scanLine.style.animation = 'none';
          scanLine.offsetHeight; // trigger reflow
          scanLine.style.animation = 'scanLaser 0.5s infinite alternate ease-in-out';
          setTimeout(() => {
            if (scanLine) scanLine.style.animation = 'scanLaser 4s infinite ease-in-out';
          }, 1500);
        }

        captureStepAnalysis();
      }
    };

    speechRecognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
    };
  }

  function startListening() {
    explicitlyStoppedMic = false;
    if (!speechRecognition) {
      initSpeechRecognition();
    }
    if (speechRecognition && !isMicActive) {
      try {
        speechRecognition.start();
      } catch (e) {
        console.error("Could not start SpeechRecognition:", e);
      }
    }
  }

  function stopListening() {
    explicitlyStoppedMic = true;
    if (speechRecognition && isMicActive) {
      speechRecognition.stop();
    }
  }

  btnHandsFree.addEventListener('click', () => {
    if (isMicActive) {
      stopListening();
    } else {
      startListening();
    }
  });

  // --- Snapshot Canvas Grabber ---

  function captureFrameBlob() {
    return new Promise((resolve) => {
      const canvas = document.getElementById('canvas-capture');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 640;
      canvas.height = 480;

      if (isCamActive && liveWebcam.videoWidth) {
        canvas.width = liveWebcam.videoWidth;
        canvas.height = liveWebcam.videoHeight;
        ctx.drawImage(liveWebcam, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw empty background with indicator
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '24px Outfit, sans-serif';
        ctx.fillStyle = '#fdfbf7';
        ctx.textAlign = 'center';
        ctx.fillText('Webcam feed disabled / unavailable', canvas.width / 2, canvas.height / 2);
      }

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.85);
    });
  }

  // --- Voice Grid Selection ---
  voiceCards.forEach(card => {
    card.addEventListener('click', () => {
      selectVoiceCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectVoiceCard(card);
      }
    });
  });

  function selectVoiceCard(targetCard) {
    voiceCards.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-checked', 'false');
      c.setAttribute('tabindex', '-1');
    });
    
    targetCard.classList.add('active');
    targetCard.setAttribute('aria-checked', 'true');
    targetCard.setAttribute('tabindex', '0');
    
    selectedVoice = targetCard.dataset.voice;
  }

  // --- Speech Engine Helpers ---

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    isNarratingStep = false;

    chefBubbleAvatar.classList.remove('speaking');
    soundwaveContainer.classList.remove('active');
    btnSpeakCommentary.classList.remove('speaking');
    speakIcon.setAttribute('data-lucide', 'volume-2');
    speakText.textContent = 'Listen to Coach';
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function speakTextFn(text, onStart, onEnd) {
    if (!('speechSynthesis' in window)) return;
    
    stopSpeech();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const settings = {
      grandma: { pitch: 1.15, rate: 0.85 },
      michelin: { pitch: 0.95, rate: 1.05 },
      budget: { pitch: 1.0, rate: 1.15 },
      survivalist: { pitch: 0.8, rate: 0.9 }
    };
    
    const s = settings[selectedVoice] || settings.grandma;
    utterance.pitch = s.pitch;
    utterance.rate = s.rate;
    
    utterance.onstart = () => {
      if (onStart) onStart();
    };
    
    utterance.onend = () => {
      stopSpeech();
      if (onEnd) onEnd();
    };
    
    utterance.onerror = () => {
      stopSpeech();
      if (onEnd) onEnd();
    };
    
    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  // --- Live Step analysis API Loop ---

  async function captureStepAnalysis() {
    // Prevent overlapping trigger calls while loading is active
    if (!zoneLoading.classList.contains('hidden')) return;

    stopSpeech();
    startLoadingState();

    try {
      const frameBlob = await captureFrameBlob();
      
      const formData = new FormData();
      formData.append('image', frameBlob, 'webcam_frame.jpg');
      formData.append('cooking_goal', cookingGoal);
      formData.append('voice', selectedVoice);
      formData.append('step_number', stepNumber);
      formData.append('history_json', JSON.stringify(historyList));

      const response = await fetch('/api/coach', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Mentor could not check details.');
      }

      const data = await response.json();

      // Add to completed step log history
      const completedStep = {
        step_number: stepNumber + 1,
        observation: data.observation,
        critique: data.critique,
        next_step: data.next_step,
        severity: data.severity
      };
      
      historyList.push(completedStep);
      stepNumber = data.step_number;

      renderMentorStep(data);
      transitionToState('recipe');

      // Auto play coach verbal instructions
      isNarratingStep = true;
      speakTextFn(data.next_step,
        () => {
          chefBubbleAvatar.classList.add('speaking');
          soundwaveContainer.classList.add('active');
          btnSpeakCommentary.classList.add('speaking');
          speakIcon.setAttribute('data-lucide', 'square');
          speakText.textContent = 'Mute Coach';
          if (window.lucide) lucide.createIcons();
        },
        () => {
          isNarratingStep = false;
        }
      );

    } catch (err) {
      console.error(err);
      errorMessage.textContent = err.message || "The chef mentor had an issue checking your workspace frame. Let's try again.";
      transitionToState('error');
    } finally {
      stopLoadingState();
    }
  }

  btnCaptureStep.addEventListener('click', captureStepAnalysis);

  // --- Initial Form Submit to Start Session ---
  recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const value = dishInput.value.trim();
    if (value.length < 3) {
      alert("Please enter a valid dish name (at least 3 characters).");
      return;
    }

    cookingGoal = value;
    stepNumber = 0;
    historyList = [];

    // Reset instruction layouts
    timelineContainer.innerHTML = '';
    suggestionsCard.classList.add('hidden');
    suggestionsList.innerHTML = '';
    
    // Set headers
    dishTitleDisplay.textContent = `Cooking: ${cookingGoal}`;
    currentStepDisplay.textContent = 'Step 1';
    
    // Activate webcam immediately
    await startCamera();
    
    // Auto-trigger starting step analysis to observe kitchen state
    captureStepAnalysis();
  });

  // --- Render Function ---

  function renderMentorStep(data) {
    // Update step numbers & details
    currentStepDisplay.textContent = `Step ${data.step_number}`;
    coachName.textContent = data.coach_name || selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1);
    
    // Set active speech commentary bubble
    recipeCommentary.textContent = `"${data.next_step}"`;
    chefBubbleAvatar.innerHTML = voiceAvatars[selectedVoice] || voiceAvatars.grandma;

    // Clear placeholders
    if (timelinePlaceholder) {
      timelinePlaceholder.classList.add('hidden');
    }

    // Build timeline elements
    timelineContainer.innerHTML = '';
    if (historyList.length > 0) {
      historyList.forEach((step, idx) => {
        const item = document.createElement('div');
        item.className = `timeline-item severity-${step.severity || 'info'}`;
        item.id = `timeline-item-${idx}`;

        const header = document.createElement('div');
        header.className = 'timeline-header';

        const stepBtn = document.createElement('button');
        stepBtn.className = 'timestamp-btn';
        stepBtn.innerHTML = `<i data-lucide="list-ordered"></i> Step ${step.step_number}`;
        stepBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakTextFn(step.next_step);
        });

        const badge = document.createElement('span');
        badge.className = `severity-badge badge-${step.severity || 'info'}`;
        badge.textContent = step.severity || 'info';

        header.appendChild(stepBtn);
        header.appendChild(badge);

        const obs = document.createElement('p');
        obs.className = 'timeline-observation';
        obs.innerHTML = `<strong>Observation:</strong> ${step.observation}`;

        const crit = document.createElement('p');
        crit.className = 'timeline-feedback';
        crit.innerHTML = `<strong>Critique:</strong> ${step.critique}`;

        const instr = document.createElement('p');
        instr.className = 'timeline-feedback';
        instr.innerHTML = `<strong>Instruction:</strong> ${step.next_step}`;

        item.appendChild(header);
        item.appendChild(obs);
        item.appendChild(crit);
        item.appendChild(instr);

        item.addEventListener('click', () => {
          speakTextFn(step.next_step);
        });

        timelineContainer.appendChild(item);
      });

      // Scroll newest timeline card into viewport
      const activeEl = document.getElementById(`timeline-item-${historyList.length - 1}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Handle suggestions if cooking session is completed
    suggestionsList.innerHTML = '';
    if (data.done) {
      recipeCommentary.textContent = `"${data.next_step} Congratulations, you have finished cooking!"`;
      
      const finishTip = document.createElement('li');
      finishTip.textContent = "Cooking session completed! Plate your food and enjoy your creation.";
      suggestionsList.appendChild(finishTip);
      suggestionsCard.classList.remove('hidden');
      
      // Stop continuous microphone listening
      stopListening();
    } else {
      suggestionsCard.classList.add('hidden');
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Commentary Speech Manual Button ---
  btnSpeakCommentary.addEventListener('click', () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking && isNarratingStep) {
      stopSpeech();
    } else {
      if (historyList.length === 0) return;
      
      const currentStep = historyList[historyList.length - 1];
      isNarratingStep = true;
      
      speakTextFn(
        currentStep.next_step,
        // onStart
        () => {
          chefBubbleAvatar.classList.add('speaking');
          soundwaveContainer.classList.add('active');
          btnSpeakCommentary.classList.add('speaking');
          speakIcon.setAttribute('data-lucide', 'square');
          speakText.textContent = 'Mute Coach';
          if (window.lucide) lucide.createIcons();
        },
        // onEnd
        () => {
          isNarratingStep = false;
        }
      );
    }
  });

  // --- State Transitions ---

  function transitionToState(state) {
    zoneInput.classList.add('hidden');
    zoneLoading.classList.add('hidden');
    zoneError.classList.add('hidden');
    zoneRecipe.classList.add('hidden');

    if (state === 'input') {
      zoneInput.classList.remove('hidden');
      dishInput.focus();
    } else if (state === 'loading') {
      zoneLoading.classList.remove('hidden');
    } else if (state === 'error') {
      zoneError.classList.remove('hidden');
    } else if (state === 'recipe') {
      zoneRecipe.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function startLoadingState() {
    transitionToState('loading');
    stopSpeech();
    
    progressBarFill.style.width = '0%';
    
    const sequence = loadingSequences[selectedVoice] || loadingSequences.grandma;
    let stepIndex = 0;
    
    loadingTitle.textContent = sequence[stepIndex].title;
    loadingDesc.textContent = sequence[stepIndex].desc;
    
    loadingInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % sequence.length;
      loadingTitle.textContent = sequence[stepIndex].title;
      loadingDesc.textContent = sequence[stepIndex].desc;
    }, 3000);

    let progressVal = 0;
    progressInterval = setInterval(() => {
      if (progressVal < 95) {
        const increment = Math.max(0.5, (95 - progressVal) / 15);
        progressVal = Math.min(95, progressVal + increment);
        progressBarFill.style.width = `${progressVal}%`;
      }
    }, 200);
  }

  function stopLoadingState() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function resetToInput() {
    stopSpeech();
    stopCamera();
    stopListening();
    
    dishInput.value = '';
    cookingGoal = '';
    stepNumber = 0;
    historyList = [];

    // Reset voice grid selection
    selectedVoice = 'grandma';
    voiceCards.forEach(card => {
      if (card.dataset.voice === 'grandma') {
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        card.setAttribute('tabindex', '0');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-checked', 'false');
        card.setAttribute('tabindex', '-1');
      }
    });

    transitionToState('input');
    
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  btnReset.addEventListener('click', resetToInput);
  btnErrorReset.addEventListener('click', resetToInput);
});
