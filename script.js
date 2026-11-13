document.getElementById("generateBtn").addEventListener("click", async function () {

    const category = document.getElementById("issueCategory").value;
    const location = document.getElementById("location").value;
    const problem = document.getElementById("problemText").value;
    const language = document.getElementById("languageSelect").value;

    if (problem.trim() === "") {
        alert("Please describe your problem.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/generate-rti", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: category,
                location: location,
                problem: problem,
                language: language
            })
        });

        const data = await response.json();
        document.getElementById("outputRTI").value = data.rti;

        // Deadline Calculation (30 days)
        const today = new Date();
        const deadline = new Date();
        deadline.setDate(today.getDate() + 30);

        const formattedDeadline = deadline.toLocaleDateString();

        const lang = document.getElementById("languageSelect").value;

        if (lang === "Tamil") {
            document.getElementById("deadlineInfo").innerText =
                "மறுஉத்தரவு " + formattedDeadline +
                "க்குள் பெறப்படாவிட்டால், RTI சட்டம் 19(1) பிரிவின் கீழ் முதல் மேல்முறையீட்டை தாக்கல் செய்யலாம்.";
            document.getElementById("appealBtn").innerText = "முதல் மேல்முறையீடு உருவாக்கவும்";
        } else {
            document.getElementById("deadlineInfo").innerText =
                "If no response is received by " + formattedDeadline +
                ", you may file a First Appeal under Section 19(1) of the RTI Act.";
            document.getElementById("appealBtn").innerText = "Generate First Appeal";
        }

        document.getElementById("appealBtn").style.display = "inline-block";

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
    }
});

document.getElementById("appealBtn").addEventListener("click", function () {

    const location = document.getElementById("location").value;
    const category = document.getElementById("issueCategory").value;
    const language = document.getElementById("languageSelect").value;

    let appealText;

    if (language === "Tamil") {
        appealText = `
அனுப்புவது:
முதல் மேல் முறையீட்டு அலுவலர்
${location}

பொருள்: தகவல் அறியும் உரிமை சட்டம், 2005 - ${category} தொடர்பான முதல் மேல் முறையீடு

அன்புள்ள ஐயா / அம்மா,

மேற்கண்ட விஷயத்தில் நான் தாக்கல் செய்த தகவல் அறியும் உரிமை விண்ணப்பத்திற்கு 30 நாட்களுக்குள் பதில் கிடைக்கவில்லை.

எனவே தகவல் அறியும் உரிமை சட்டம், 2005 இன் பிரிவு 19(1) கீழ் இந்த முதல் மேல் முறையீட்டை சமர்ப்பிக்கிறேன்.

தகுந்த நடவடிக்கை எடுக்க வேண்டுகிறேன்.

நன்றி,
இந்திய குடிமகன்
`;
    } else {
        appealText = `
To
The First Appellate Authority
${location}

Subject: First Appeal under RTI Act, 2005 regarding ${category}

Respected Sir/Madam,

I filed an RTI application regarding the above matter.
However, I have not received a response within the stipulated 30 days.

I hereby file this First Appeal under Section 19(1) of the RTI Act, 2005.

Kindly take necessary action.

Yours faithfully,
Citizen of India
`;
    }

    document.getElementById("outputRTI").value = appealText;
});

// 🎤 Voice Recognition
const voiceBtn = document.getElementById("voiceBtn");

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", function () {

        const selectedLanguage = document.getElementById("languageSelect").value;

        if (selectedLanguage === "Tamil") {
            recognition.lang = "ta-IN";
            voiceBtn.innerText = "கேட்கப்படுகிறது...";
        } else {
            recognition.lang = "en-IN";
            voiceBtn.innerText = "Listening...";
        }

        recognition.start();
    });

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("problemText").value = transcript;

        const selectedLanguage = document.getElementById("languageSelect").value;

        if (selectedLanguage === "Tamil") {
            voiceBtn.innerText = "🎤 பேசவும்";
        } else {
            voiceBtn.innerText = "🎤 Speak Your Problem";
        }
    };

    recognition.onerror = function (event) {
        console.error("Voice error:", event.error);
        alert("Voice recognition error. Try again.");
        voiceBtn.innerText = "🎤 Speak Your Problem";
    };

} else {
    voiceBtn.disabled = true;
    voiceBtn.innerText = "Voice not supported in this browser";
}

// 📋 Copy RTI text
document.getElementById("copyBtn").addEventListener("click", async function () {
    const content = document.getElementById("outputRTI").value;

    if (!content.trim()) {
        alert("No RTI content to copy.");
        return;
    }

    const copyButton = document.getElementById("copyBtn");
    const originalText = copyButton.innerText;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(content);
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        copyButton.innerText = "Copied";
        setTimeout(() => {
            copyButton.innerText = originalText;
        }, 1500);
    } catch (error) {
        console.error("Copy failed:", error);
        alert("Unable to copy text in this browser.");
    }
});

// 📄 Download as PDF
document.getElementById("downloadBtn").addEventListener("click", function () {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const content = document.getElementById("outputRTI").value;

    if (!content.trim()) {
        alert("No RTI content to download.");
        return;
    }

    const lines = doc.splitTextToSize(content, 180);

    doc.text(lines, 10, 10);
    doc.save("RTI_Application.pdf");
});

document.getElementById("languageSelect").addEventListener("change", function () {

    const selectedLanguage = this.value;
    const langSelect = document.getElementById("languageSelect");

    if (selectedLanguage === "Tamil") {

        langSelect.options[0].text = "ஆங்கிலம்";
        langSelect.options[1].text = "தமிழ்";

        document.getElementById("issueTitle").innerText = "உங்கள் பிரச்சினையை விவரிக்கவும்";
        document.getElementById("categoryLabel").innerText = "பிரிவு:";
        document.getElementById("locationLabel").innerText = "உங்கள் மாவட்டம்:";
        document.getElementById("problemLabel").innerText = "உங்கள் பிரச்சினையை எழுதவும்:";
        document.getElementById("generateBtn").innerText = "RTI உருவாக்கவும்";
        document.getElementById("voiceBtn").innerText = "🎤 பேசவும்";

        document.getElementById("problemText").placeholder = "உங்கள் பிரச்சினையை எளிய தமிழில் எழுதவும்";
        document.getElementById("outputRTI").placeholder = "AI உருவாக்கிய RTI இங்கு தோன்றும்";

        loadDistricts("Tamil");
        loadCategories("Tamil");

        document.getElementById("draftTitle").innerText = "உருவாக்கப்பட்ட RTI வரைவு";
        document.getElementById("deadlineTitle").innerText = "RTI காலக்கெடு கண்காணிப்பு";

        document.getElementById("copyBtn").innerText = "நகலெடுக்கவும்";
        document.getElementById("downloadBtn").innerText = "PDF பதிவிறக்கவும்";
        const faqButtons = document.querySelectorAll(".faqBtn");

    faqButtons[0].innerText="RTI என்றால் என்ன?";
    faqButtons[1].innerText="RTI எப்படி விண்ணப்பிப்பது?";
    faqButtons[2].innerText="RTI மேல்முறையீடு நடைமுறை";
    faqButtons[3].innerText="RTI கட்டணம்";

    } else {

        langSelect.options[0].text = "English";
        langSelect.options[1].text = "Tamil";

        document.getElementById("issueTitle").innerText = "Describe Your Issue";
        document.getElementById("categoryLabel").innerText = "Issue Category:";
        document.getElementById("locationLabel").innerText = "Your Location:";
        document.getElementById("problemLabel").innerText = "Describe your problem:";
        document.getElementById("generateBtn").innerText = "Generate RTI using AI";
        document.getElementById("voiceBtn").innerText = "🎤 Speak Your Problem";

        document.getElementById("problemText").placeholder = "Explain your issue in simple words";
        document.getElementById("outputRTI").placeholder = "AI-generated RTI will appear here";

        loadDistricts("English");
        loadCategories("English");

        document.getElementById("draftTitle").innerText = "Generated RTI Draft";
        document.getElementById("deadlineTitle").innerText = "RTI Deadline Tracker";

        document.getElementById("copyBtn").innerText = "Copy RTI";
        document.getElementById("downloadBtn").innerText = "Download RTI";
        const faqButtons = document.querySelectorAll(".faqBtn");

    faqButtons[0].innerText="What is RTI?";
    faqButtons[1].innerText="How to file RTI?";
    faqButtons[2].innerText="RTI Appeal Process";
    faqButtons[3].innerText="RTI Fees";
    }
    

});

// 📂 Issue Categories (English + Tamil)
const categories = [
    { en: "Road & Infrastructure", ta: "சாலை & கட்டமைப்பு" },
    { en: "Water Supply", ta: "குடிநீர் வழங்கல்" },
    { en: "Electricity", ta: "மின்சாரம்" },
    { en: "Education", ta: "கல்வி" },
    { en: "Health", ta: "சுகாதாரம்" }
];

function loadCategories(language) {

    const categorySelect = document.getElementById("issueCategory");
    categorySelect.innerHTML = "";

    categories.forEach(function(cat) {

        const option = document.createElement("option");

        if (language === "Tamil") {
            option.value = cat.en;
            option.text = cat.ta;
        } else {
            option.value = cat.en;
            option.text = cat.en;
        }

        categorySelect.appendChild(option);
    });
    
}

// 📍 All Tamil Nadu Districts
const districts = [
    { en: "Ariyalur", ta: "அரியலூர்" },
    { en: "Chengalpattu", ta: "செங்கல்பட்டு" },
    { en: "Chennai", ta: "சென்னை" },
    { en: "Coimbatore", ta: "கோயம்புத்தூர்" },
    { en: "Cuddalore", ta: "கடலூர்" },
    { en: "Dharmapuri", ta: "தர்மபுரி" },
    { en: "Dindigul", ta: "திண்டுக்கல்" },
    { en: "Erode", ta: "ஈரோடு" },
    { en: "Kallakurichi", ta: "கள்ளக்குறிச்சி" },
    { en: "Kancheepuram", ta: "காஞ்சிபுரம்" },
    { en: "Karur", ta: "கரூர்" },
    { en: "Krishnagiri", ta: "கிருஷ்ணகிரி" },
    { en: "Madurai", ta: "மதுரை" },
    { en: "Mayiladuthurai", ta: "மயிலாடுதுறை" },
    { en: "Nagapattinam", ta: "நாகப்பட்டினம்" },
    { en: "Namakkal", ta: "நாமக்கல்" },
    { en: "Nilgiris", ta: "நீலகிரி" },
    { en: "Perambalur", ta: "பெரம்பலூர்" },
    { en: "Pudukkottai", ta: "புதுக்கோட்டை" },
    { en: "Ramanathapuram", ta: "ராமநாதபுரம்" },
    { en: "Ranipet", ta: "ராணிப்பேட்டை" },
    { en: "Salem", ta: "சேலம்" },
    { en: "Sivaganga", ta: "சிவகங்கை" },
    { en: "Tenkasi", ta: "தேன்காசி" },
    { en: "Thanjavur", ta: "தஞ்சாவூர்" },
    { en: "Theni", ta: "தேனி" },
    { en: "Thoothukudi", ta: "தூத்துக்குடி" },
    { en: "Tiruchirappalli", ta: "திருச்சிராப்பள்ளி" },
    { en: "Tirunelveli", ta: "திருநெல்வேலி" },
    { en: "Tirupathur", ta: "திருப்பத்தூர்" },
    { en: "Tiruppur", ta: "திருப்பூர்" },
    { en: "Tiruvallur", ta: "திருவள்ளூர்" },
    { en: "Tiruvannamalai", ta: "திருவண்ணாமலை" },
    { en: "Tiruvarur", ta: "திருவாரூர்" },
    { en: "Vellore", ta: "வேலூர்" },
    { en: "Viluppuram", ta: "விழுப்புரம்" },
    { en: "Virudhunagar", ta: "விருதுநகர்" }
];

function loadDistricts(language) {

    const locationSelect = document.getElementById("location");
    locationSelect.innerHTML = "";

    districts.forEach(function(district) {

        const option = document.createElement("option");

        if (language === "Tamil") {
            option.value = district.ta;
            option.text = district.ta;
        } else {
            option.value = district.en;
            option.text = district.en;
        }

        locationSelect.appendChild(option);
    });
}

// Load English defaults
loadDistricts("English");
loadCategories("English");

document.addEventListener("DOMContentLoaded", function () {

  const assistantToggle = document.getElementById("assistantToggle");
  const assistantPanel = document.getElementById("assistantPanel");
  const assistantMessages = document.getElementById("assistantMessages");
  const assistantSend = document.getElementById("assistantSend");
  const assistantInput = document.getElementById("assistantInput");
  const assistantVoice = document.getElementById("assistantVoice");

  if (!assistantToggle || !assistantPanel) {
    console.error("Chatbot elements not found in HTML.");
    return;
  }

  assistantToggle.addEventListener("click", function () {
    if (assistantPanel.style.display === "none" || assistantPanel.style.display === "") {
      assistantPanel.style.display = "flex";
    } else {
      assistantPanel.style.display = "none";
    }
  });

  function addAssistantMessage(sender, text) {
    const msg = document.createElement("div");
    msg.innerHTML = "<b>" + sender + ":</b> " + text;
    assistantMessages.appendChild(msg);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
  }

  assistantSend.addEventListener("click", async function () {

    const message = assistantInput.value;
    if (!message) return;

    addAssistantMessage("You", message);

    const language = document.getElementById("languageSelect").value;

    try {
      const response = await fetch("http://127.0.0.1:8000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          language: language
        })
      });

      const data = await response.json();
      addAssistantMessage("RTI Guide", data.reply);

    } catch (err) {
      console.error(err);
      addAssistantMessage("RTI Guide", "Server connection error.");
    }

    assistantInput.value = "";

  });

  if (assistantVoice && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceRecognition = new SpeechRecognition();

    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;

    assistantVoice.addEventListener("click", function () {
      const selectedLanguage = document.getElementById("languageSelect").value;
      voiceRecognition.lang = selectedLanguage === "Tamil" ? "ta-IN" : "en-IN";
      voiceRecognition.start();
    });

    voiceRecognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      assistantInput.value = transcript;
    };

    voiceRecognition.onerror = function () {
      addAssistantMessage("RTI Guide", "Voice input is unavailable right now.");
    };
  } else if (assistantVoice) {
    assistantVoice.disabled = true;
    assistantVoice.title = "Voice input not supported in this browser";
  }

  assistantInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      assistantSend.click();
    }
  });

  // FAQ Answers
  const faqAnswers = {
    what_rti:{
      en:"RTI (Right to Information Act 2005) allows Indian citizens to request information from government departments.",
      ta:"RTI (தகவல் அறியும் உரிமை சட்டம் 2005) மூலம் இந்திய குடிமக்கள் அரசு துறைகளிடமிருந்து தகவல்களை கேட்கலாம்."
    },
    how_apply:{
      en:"Step 1: Identify department. Step 2: Write RTI question clearly. Step 3: Submit to Public Information Officer. Step 4: Wait 30 days for response.",
      ta:"படி 1: சம்பந்தப்பட்ட துறையை கண்டறியவும். படி 2: RTI கேள்வியை தெளிவாக எழுதவும். படி 3: பொது தகவல் அலுவலரிடம் சமர்ப்பிக்கவும். படி 4: 30 நாட்களில் பதில் கிடைக்கும்."
    },
    appeal:{
      en:"If no response is received within 30 days, you can file a First Appeal under Section 19(1) of the RTI Act.",
      ta:"30 நாட்களில் பதில் கிடைக்காவிட்டால் RTI சட்டம் பிரிவு 19(1) கீழ் முதல் மேல்முறையீடு செய்யலாம்."
    },
    fees:{
      en:"The standard RTI application fee is ₹10. Additional charges may apply for document copies.",
      ta:"RTI விண்ணப்ப கட்டணம் பொதுவாக ₹10 ஆகும். ஆவண நகல்களுக்கு கூடுதல் கட்டணம் இருக்கலாம்."
    }
  };

  document.querySelectorAll(".faqBtn").forEach(btn=>{
    btn.addEventListener("click",function(){

      const key=this.dataset.key;
      const lang=document.getElementById("languageSelect").value;

      addAssistantMessage("You",this.innerText);

      const reply = lang==="Tamil" ? faqAnswers[key].ta : faqAnswers[key].en;

      addAssistantMessage("RTI Guide",reply);

    });
  });

});
