/* =========================================================
   INTELLIPREP - INTERVIEW PRACTICE PLATFORM
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const state = {
  resumes: [],
  activeId: null,
  lastResponse: "",
  recognition: null,
  listening: false,
  muted: false,
  speaking: false
};

const allowed = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

/* =========================================================
   LOCAL RESUME DATABASE
   ========================================================= */

const db = {
  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("intelliprep-library", 1);

      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("resumes")) {
          request.result.createObjectStore("resumes", {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async all() {
    const database = await this.open();

    return new Promise((resolve, reject) => {
      const request = database
        .transaction("resumes")
        .objectStore("resumes")
        .getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async get(id) {
    const database = await this.open();

    return new Promise((resolve, reject) => {
      const request = database
        .transaction("resumes")
        .objectStore("resumes")
        .get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(value) {
    const database = await this.open();

    return new Promise((resolve, reject) => {
      const request = database
        .transaction("resumes", "readwrite")
        .objectStore("resumes")
        .put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async del(id) {
    const database = await this.open();

    return new Promise((resolve, reject) => {
      const request = database
        .transaction("resumes", "readwrite")
        .objectStore("resumes")
        .delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

/* =========================================================
   HELPERS
   ========================================================= */

function format(bytes) {
  return new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: "megabyte",
    maximumFractionDigits: 1
  }).format(bytes / 1048576);
}

function saveSettings() {
  localStorage.setItem(
    "intelliprep-context",
    JSON.stringify({
      role: $("#role-title")?.value || "",
      jd: $("#job-description")?.value || "",
      activeId: state.activeId
    })
  );
}

function showError(message) {
  const error = $("#studio-error");

  if (!error) return;

  error.hidden = !message;
  error.textContent = message || "";
}

function uiStatus(status, kind = "idle") {
  const element = $("#session-status");

  if (!element) return;

  element.textContent = status;
  element.className = `status-pill ${kind}`;
}

function setRobot(who, status) {
  ["interviewer", "evaluator"].forEach((key) => {
    const card = $(`#${key}-card`);

    if (!card) return;

    card.classList.toggle(
      "active",
      key === who
    );

    const robotState =
      card.querySelector(".robot-state");

    if (robotState) {
      robotState.textContent =
        key === who
          ? status
          : key === "interviewer"
            ? "Listening"
            : "Observing";
    }
  });
}

function addTranscript(speaker, text, type) {
  const transcript = $("#transcript");

  if (!transcript) return;

  const empty =
    transcript.querySelector(
      ".empty-transcript"
    );

  if (empty) {
    transcript.innerHTML = "";
  }

  const line =
    document.createElement("div");

  line.className =
    `transcript-line ${type}`;

  const strong =
    document.createElement("strong");

  strong.textContent = speaker;

  line.appendChild(strong);

  line.appendChild(
    document.createTextNode(text)
  );

  transcript.appendChild(line);

  transcript.scrollTop =
    transcript.scrollHeight;
}

/* =========================================================
   RESUMES
   ========================================================= */

function renderResumes() {
  const search = $("#resume-search");

  const query = search
    ? search.value.toLowerCase()
    : "";

  const list = $("#resume-list");

  if (!list) return;

  const shown =
    state.resumes.filter((resume) =>
      resume.name
        .toLowerCase()
        .includes(query)
    );

  const count =
    $("#resume-count");

  if (count) {
    count.textContent =
      `${state.resumes.length} saved`;
  }

  list.innerHTML = "";

  if (!shown.length) {
    list.innerHTML =
      `<div class="resume-meta">
        No resumes in your library yet.
      </div>`;

    return;
  }

  shown.forEach((resume) => {
    const article =
      document.createElement("article");

    article.className =
      "resume-item " +
      (resume.id === state.activeId
        ? "active-resume"
        : "");

    const extension =
      resume.name
        .split(".")
        .pop()
        .toUpperCase();

    article.innerHTML = `
      <span class="file-tag">
        ${extension}
      </span>

      <div class="resume-info">
        <div class="resume-name"></div>

        <div class="resume-meta">
          ${format(resume.size)}
          · ${new Date(resume.createdAt).toLocaleDateString()}
          · Saved locally
        </div>
      </div>

      <button
        data-action="active"
        data-id="${resume.id}">
        ${
          resume.id === state.activeId
            ? "Active"
            : "Set active"
        }
      </button>

      <button
        data-action="rename"
        data-id="${resume.id}">
        Rename
      </button>

      <button
        data-action="remove"
        data-id="${resume.id}"
        aria-label="Remove ${resume.name}">
        ×
      </button>
    `;

    article.querySelector(
      ".resume-name"
    ).textContent = resume.name;

    list.appendChild(article);
  });
}

async function loadResumes() {
  try {
    state.resumes =
      await db.all();

    const context =
      JSON.parse(
        localStorage.getItem(
          "intelliprep-context"
        ) || "{}"
      );

    state.activeId =
      context.activeId ||
      state.resumes[0]?.id ||
      null;

    renderResumes();
  } catch (error) {
    console.error(
      "Resume database error:",
      error
    );

    const feedback =
      $("#upload-feedback");

    if (feedback) {
      feedback.textContent =
        "Resume library is unavailable in this browser.";
    }
  }
}

async function addFiles(files) {
  const fileArray = [...files];

  if (!fileArray.length) {
    return;
  }

  const valid =
    fileArray.filter(
      (file) =>
        allowed.includes(file.type) ||
        /\.(pdf|docx?)$/i.test(
          file.name
        )
    );

  const feedback =
    $("#upload-feedback");

  if (
    valid.length !==
    fileArray.length
  ) {
    if (feedback) {
      feedback.textContent =
        "Only PDF, DOC, and DOCX files are supported.";
    }
  }

  if (!valid.length) {
    return;
  }

  if (feedback) {
    feedback.textContent =
      "Saving resume...";
  }

  for (const file of valid) {
    const item = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      createdAt: Date.now(),
      file
    };

    try {
      await db.put(item);

      state.resumes.unshift(item);

      if (!state.activeId) {
        state.activeId =
          item.id;
      }

      if (feedback) {
        feedback.textContent =
          `${file.name} added successfully.`;
      }
    } catch (error) {
      console.error(
        "Could not save resume:",
        error
      );

      if (feedback) {
        feedback.textContent =
          `Could not save ${file.name}.`;
      }
    }
  }

  saveSettings();
  renderResumes();
}

/* =========================================================
   AI VOICE
   ========================================================= */

function stopSpeech() {
  if (
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }

  state.speaking = false;

  setRobot(null, "");

  const stopButton =
    $("#stop-button");

  if (stopButton) {
    stopButton.disabled = true;
  }
}

function getBestVoice() {
  if (
    !("speechSynthesis" in window)
  ) {
    return null;
  }

  const voices =
    window.speechSynthesis.getVoices();

  if (!voices.length) {
    console.warn(
      "No voices loaded yet, retrying..."
    );
    
    // Retry getting voices after a delay
    return null;
  }

  console.log(
    "getBestVoice: Found",
    voices.length,
    "voices"
  );

  const preferredNames = [
    "Google US English",
    "Microsoft Jenny",
    "Microsoft Aria",
    "Samantha",
    "Karen",
    "Daniel"
  ];

  for (
    const preferred
    of preferredNames
  ) {
    const found =
      voices.find((voice) =>
        voice.name
          .toLowerCase()
          .includes(
            preferred.toLowerCase()
          )
      );

    if (found) {
      console.log(
        "Using preferred voice:",
        found.name
      );
      return found;
    }
  }

  const englishVoice = voices.find(
    (voice) =>
      /^en(-|_)/i.test(
        voice.lang
      )
  );

  if (englishVoice) {
    console.log(
      "Using English voice:",
      englishVoice.name
    );
    return englishVoice;
  }

  console.log(
    "Using default voice:",
    voices[0].name
  );

  return voices[0];
}

function speak(
  text,
  who = "interviewer"
) {
  if (!text || state.muted) {
    return;
  }

  if (
    !("speechSynthesis" in window)
  ) {
    showError(
      "Your browser does not support voice playback."
    );

    return;
  }

  stopSpeech();

  state.speaking = true;
  state.lastResponse = text;

  setRobot(
    who,
    "Speaking"
  );

  uiStatus(
    who === "interviewer"
      ? "Interviewer is speaking"
      : "Evaluator is speaking",
    "speaking"
  );

  const stopButton =
    $("#stop-button");

  if (stopButton) {
    stopButton.disabled = false;
  }

  const replayButton =
    $("#replay-button");

  if (replayButton) {
    replayButton.disabled = false;
  }

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.rate = 0.92;
  utterance.pitch = 0.95;
  utterance.volume = 1;

  const voice =
    getBestVoice();

  // If no voice available, it might be loading
  if (!voice) {
    console.warn(
      "No voice available, waiting for voices to load..."
    );

    // Retry after voices load
    const retrySpeak = () => {
      if (
        !("speechSynthesis" in window)
      ) {
        return;
      }

      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        retrySpeak
      );

      const retryVoice =
        getBestVoice();

      if (retryVoice) {
        console.log(
          "Voices loaded, retrying speech..."
        );

        utterance.voice =
          retryVoice;

        window.speechSynthesis.speak(
          utterance
        );
      } else {
        console.error(
          "Still no voices available"
        );

        showError(
          "Audio voices not available on your system"
        );

        state.speaking = false;

        setRobot(null, "");
      }
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      retrySpeak
    );

    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis?.removeEventListener?.(
        "voiceschanged",
        retrySpeak
      );
    }, 5000);

    return;
  }

  console.log(
    "Available voices:",
    window.speechSynthesis.getVoices().length
  );

  if (voice) {
    utterance.voice =
      voice;
    console.log(
      "Using voice:",
      voice.name
    );
  } else {
    console.warn(
      "No voice found, using default"
    );
  }

  utterance.onend = () => {
    console.log(
      "Speech ended"
    );

    state.speaking = false;

    setRobot(null, "");

    if (stopButton) {
      stopButton.disabled = true;
    }

    beginListening();
  };

  utterance.onerror = (event) => {
    console.error(
      "Speech error:",
      event.error
    );

    state.speaking = false;

    setRobot(null, "");

    if (stopButton) {
      stopButton.disabled = true;
    }

    showError(
      "Voice playback failed: " +
      event.error
    );
  };

  console.log(
    "Starting speech synthesis with text:",
    text.substring(0, 50) +
    "..."
  );

  window.speechSynthesis.speak(
    utterance
  );
}

/* =========================================================
   MICROPHONE
   ========================================================= */

function beginListening() {
  if (!state.recognition) {
    uiStatus(
      "Voice recognition unavailable",
      "idle"
    );

    return;
  }

  try {
    state.recognition.start();
  } catch {
    // Already listening.
  }
}

function setupRecognition() {
  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Recognition) {
    return;
  }

  state.recognition =
    new Recognition();

  state.recognition.continuous =
    false;

  state.recognition.interimResults =
    true;

  state.recognition.lang =
    "en-US";

  let interim = "";

  state.recognition.onstart =
    () => {
      state.listening = true;

      uiStatus(
        "Listening",
        "listening"
      );

      const label =
        $("#mic-label");

      const detail =
        $("#mic-detail");

      const dot =
        $("#recording-dot");

      if (label) {
        label.textContent =
          "Listening";
      }

      if (detail) {
        detail.textContent =
          "Speak when ready";
      }

      if (dot) {
        dot.classList.add("on");
      }
    };

  state.recognition.onresult =
    (event) => {
      interim = "";

      for (
        let i =
          event.resultIndex;
        i <
        event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]
            .transcript;

        if (
          event.results[i]
            .isFinal
        ) {
          addTranscript(
            "YOU",
            transcript,
            "user"
          );

          interim = "";
        } else {
          interim +=
            transcript;
        }
      }
    };

  state.recognition.onend =
    () => {
      state.listening = false;

      const dot =
        $("#recording-dot");

      const label =
        $("#mic-label");

      if (dot) {
        dot.classList.remove(
          "on"
        );
      }

      if (label) {
        label.textContent =
          "Microphone off";
      }

      if (interim.trim()) {
        addTranscript(
          "YOU",
          interim.trim(),
          "user"
        );
      }

      interim = "";
    };

  state.recognition.onerror =
    (event) => {
      state.listening = false;

      const dot =
        $("#recording-dot");

      if (dot) {
        dot.classList.remove(
          "on"
        );
      }

      showError(
        `Speech recognition ${event.error}.`
      );
    };
}

/* =========================================================
   START INTERVIEW
   ========================================================= */

async function startInterview() {
  showError("");

  const role =
    $("#role-title")
      ?.value
      .trim() || "";

  const jobDescription =
    $("#job-description")
      ?.value
      .trim() || "";

  if (
    !role ||
    !jobDescription
  ) {
    showError(
      "Add a target role and job description before starting."
    );
    return;
  }

  const startButton =
    $("#start-button");

  if (startButton) {
    startButton.disabled =
      true;
  }

  uiStatus(
    "Preparing your interview",
    "speaking"
  );

  try {
    const response =
      await fetch(
        "/api/ai/interview",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action:
              "startInterview",

            role,

            jobDescription,

            resumeId:
              state.activeId
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Server returned ${response.status}`
      );
    }

    const aiQuestion =
      data.question;

    if (!aiQuestion) {
      throw new Error(
        "The AI did not return a question."
      );
    }

    const questionCount =
      $("#question-count");

    if (questionCount) {
      questionCount.textContent =
        `Question 1 / ${
          data.totalQuestions ||
          "—"
        }`;
    }

    addTranscript(
      "INTERVIEWER",
      aiQuestion,
      "ai"
    );

    const muteButton =
      $("#mute-button");

    const micButton =
      $("#mic-button");

    if (muteButton) {
      muteButton.disabled =
        false;
    }

    if (micButton) {
      micButton.disabled =
        false;
    }

    speak(
      aiQuestion,
      "interviewer"
    );
  } catch (error) {
    console.error(
      "Interview error:",
      error
    );

    showError(
      `Couldn't start the interview: ${error.message}`
    );

    uiStatus(
      "Could not start",
      "idle"
    );

    if (startButton) {
      startButton.disabled =
        false;
    }
  }
}

/* =========================================================
   BUTTONS / EVENTS
   ========================================================= */

/* RESUME UPLOAD */

const resumeInput =
  $("#resume-input");

if (resumeInput) {
  resumeInput.addEventListener(
    "change",
    (event) => {
      addFiles(
        event.target.files
      );

      // Allows selecting the same file again.
      event.target.value = "";
    }
  );
}

/* DRAG AND DROP */

const drop =
  $("#drop-zone");

if (drop) {
  ["dragenter", "dragover"].forEach(
    (type) => {
      drop.addEventListener(
        type,
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          drop.classList.add(
            "dragging"
          );
        }
      );
    }
  );

  ["dragleave", "drop"].forEach(
    (type) => {
      drop.addEventListener(
        type,
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          drop.classList.remove(
            "dragging"
          );
        }
      );
    }
  );

  drop.addEventListener(
    "drop",
    (event) => {
      addFiles(
        event.dataTransfer.files
      );
    }
  );

  /* Keyboard accessibility */

  drop.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        resumeInput?.click();
      }
    }
  );
}

/* RESUME SEARCH */

const resumeSearch =
  $("#resume-search");

if (resumeSearch) {
  resumeSearch.addEventListener(
    "input",
    renderResumes
  );
}

/* RESUME LIST */

const resumeList =
  $("#resume-list");

if (resumeList) {
  resumeList.addEventListener(
    "click",
    async (event) => {
      const button =
        event.target.closest(
          "button"
        );

      if (!button) return;

      const resume =
        state.resumes.find(
          (item) =>
            item.id ===
            button.dataset.id
        );

      if (!resume) return;

      if (
        button.dataset.action ===
        "active"
      ) {
        state.activeId =
          resume.id;

        saveSettings();
        renderResumes();
      }

      if (
        button.dataset.action ===
        "remove"
      ) {
        await db.del(
          resume.id
        );

        state.resumes =
          state.resumes.filter(
            (item) =>
              item.id !==
              resume.id
          );

        if (
          state.activeId ===
          resume.id
        ) {
          state.activeId =
            state.resumes[0]
              ?.id ||
            null;
        }

        saveSettings();
        renderResumes();
      }

      if (
        button.dataset.action ===
        "rename"
      ) {
        const name =
          prompt(
            "Resume name",
            resume.name
          );

        if (name?.trim()) {
          resume.name =
            name.trim();

          await db.put(
            resume
          );

          renderResumes();
        }
      }
    }
  );
}

/* SAVE CONTEXT */

const saveContext =
  $("#save-context");

if (saveContext) {
  saveContext.addEventListener(
    "click",
    () => {
      saveSettings();

      const status =
        $("#context-state");

      if (status) {
        status.textContent =
          "Role context saved locally";
      }
    }
  );
}

/* START */

const startButton =
  $("#start-button");

if (startButton) {
  startButton.addEventListener(
    "click",
    startInterview
  );
}

/* STOP */

const stopButton =
  $("#stop-button");

if (stopButton) {
  stopButton.addEventListener(
    "click",
    stopSpeech
  );
}

/* REPLAY */

const replayButton =
  $("#replay-button");

if (replayButton) {
  replayButton.addEventListener(
    "click",
    () => {
      if (state.lastResponse) {
        speak(
          state.lastResponse
        );
      }
    }
  );
}

/* MUTE */

const muteButton =
  $("#mute-button");

if (muteButton) {
  muteButton.disabled =
    true;

  muteButton.textContent =
    "🔊 Voice ON";

  muteButton.setAttribute(
    "aria-pressed",
    "false"
  );

  muteButton.addEventListener(
    "click",
    () => {
      state.muted =
        !state.muted;

      muteButton.setAttribute(
        "aria-pressed",
        String(
          state.muted
        )
      );

      if (state.muted) {
        muteButton.textContent =
          "🔇 Voice OFF";

        stopSpeech();
      } else {
        muteButton.textContent =
          "🔊 Voice ON";

        if (
          state.lastResponse
        ) {
          speak(
            state.lastResponse
          );
        }
      }
    }
  );
}

/* MICROPHONE */

const micButton =
  $("#mic-button");

if (micButton) {
  micButton.addEventListener(
    "click",
    () => {
      if (
        state.listening
      ) {
        state.recognition?.stop();
      } else {
        beginListening();
      }
    }
  );
}

/* CLEAR TRANSCRIPT */

const clearTranscript =
  $("#clear-transcript");

if (clearTranscript) {
  clearTranscript.addEventListener(
    "click",
    () => {
      const transcript =
        $("#transcript");

      if (!transcript) return;

      transcript.innerHTML = `
        <div class="empty-transcript">
          <span>✦</span>
          <p>
            Transcript cleared.
          </p>
        </div>
      `;
    }
  );
}

/* REDUCE MOTION */

const reduceMotion =
  $("#reduce-motion");

if (reduceMotion) {
  reduceMotion.addEventListener(
    "click",
    (event) => {
      document.body.classList.toggle(
        "reduce-motion"
      );

      event.currentTarget.setAttribute(
        "aria-pressed",
        String(
          document.body.classList.contains(
            "reduce-motion"
          )
        )
      );
    }
  );
}

/* =========================================================
   INITIALIZE
   ========================================================= */

window.speechSynthesis?.addEventListener?.(
  "voiceschanged",
  () => {
    const voices =
      window.speechSynthesis.getVoices();
    console.log(
      "voiceschanged event:",
      voices.length,
      "voices available"
    );
  }
);

// Proactively load voices
let voicesLoaded = false;

function ensureVoicesLoaded() {
  if (voicesLoaded) {
    return;
  }

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }

  const voices =
    window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    voicesLoaded = true;
    console.log(
      "Voices loaded:",
      voices.length,
      "voices"
    );

    if (voices.length > 0) {
      console.log(
        "Available voices:",
        voices
          .map(
            (v) => v.name
          )
          .join(", ")
      );
    }

    return;
  }

  // If not loaded, listen for voiceschanged
  const attemptLoad = () => {
    const retryVoices =
      window.speechSynthesis.getVoices();

    if (
      retryVoices.length > 0
    ) {
      voicesLoaded = true;
      console.log(
        "Voices loaded after event:",
        retryVoices.length
      );

      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        attemptLoad
      );
    }
  };

  window.speechSynthesis.addEventListener(
    "voiceschanged",
    attemptLoad
  );
}

(() => {
  try {
    // Check voice synthesis availability
    if (
      "speechSynthesis" in window
    ) {
      const voices =
        window.speechSynthesis.getVoices();

      console.log(
        "Voices on load:",
        voices.length,
        "voices available"
      );

      if (voices.length === 0) {
        console.warn(
          "No voices available - speech synthesis may not work"
        );
      } else {
        console.log(
          "First voice:",
          voices[0].name
        );
      }
    } else {
      console.error(
        "Speech Synthesis API not supported"
      );
    }
  } catch (error) {
    console.error(
      "Error checking voices:",
      error
    );
  }

  try {
    const context =
      JSON.parse(
        localStorage.getItem(
          "intelliprep-context"
        ) || "{}"
      );

    if ($("#role-title")) {
      $("#role-title").value =
        context.role || "";
    }

    if (
      $("#job-description")
    ) {
      $("#job-description").value =
        context.jd || "";
    }

    if (
      context.role ||
      context.jd
    ) {
      const status =
        $("#context-state");

      if (status) {
        status.textContent =
          "Role context restored";
      }
    }
  } catch {
    // Ignore invalid local storage.
  }

  ensureVoicesLoaded();

  setupRecognition();
  loadResumes();
})();