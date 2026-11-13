from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# OpenAI Client (uses your API key)
client = OpenAI(
    api_key="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"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RTIRequest(BaseModel):
    category: str
    location: str
    problem: str
    language: str


@app.post("/generate-rti")
def generate_rti(data: RTIRequest):

    authority_map = {
        "Road & Infrastructure": {
            "en": "Public Works Department (PWD)",
            "ta": "பொது பணித்துறை (PWD)"
        },
        "Water Supply": {
            "en": "Municipal Water Supply Department",
            "ta": "நகராட்சி குடிநீர் வழங்கல் துறை"
        },
        "Electricity": {
            "en": "Tamil Nadu Electricity Board",
            "ta": "தமிழ்நாடு மின்சார வாரியம்"
        },
        "Education": {
            "en": "District Education Officer",
            "ta": "மாவட்ட கல்வி அலுவலர்"
        },
        "Health": {
            "en": "District Health Department",
            "ta": "மாவட்ட சுகாதார துறை"
        }
    }

    category_tamil = {
        "Road & Infrastructure": "சாலை மற்றும் கட்டமைப்பு",
        "Water Supply": "குடிநீர் வழங்கல்",
        "Electricity": "மின்சாரம்",
        "Education": "கல்வி",
        "Health": "சுகாதாரம்"
    }

    district_authority = {
        "Chennai": {
            "en": "Greater Chennai Corporation",
            "ta": "பெருநகர சென்னை மாநகராட்சி"
        }
    }

    dept = authority_map.get(data.category)
    district_dept = district_authority.get(data.location)

    if data.language == "Tamil":

        if district_dept:
            department = district_dept["ta"]
        else:
            department = dept["ta"] if dept else "சம்பந்தப்பட்ட அரசு துறை"

        category = category_tamil.get(data.category, data.category)

        mock_rti = f"""
அனுப்புவது:
பொது தகவல் அலுவலர்
{department}
{data.location}

பொருள்: தகவல் அறியும் உரிமை சட்டம், 2005 - {category} குறித்து தகவல் கோருதல்

அன்புள்ள ஐயா / அம்மா,

நான் {data.location} பகுதியில் வசிக்கும் இந்திய குடிமகன்.
தகவல் அறியும் உரிமை சட்டம், 2005 இன் கீழ் கீழ்க்கண்ட தகவல்களை வழங்குமாறு கேட்டுக்கொள்கிறேன்:

{data.problem}

சட்டப்படி குறிப்பிடப்பட்ட காலக்கொளவில் தகவலை வழங்குமாறு கேட்டுக்கொள்கிறேன்.

நன்றி,

இந்திய குடிமகன்
"""

    else:

        if district_dept:
            department = district_dept["en"]
        else:
            department = dept["en"] if dept else "Concerned Government Department"

        mock_rti = f"""
To
The Public Information Officer
{department}
{data.location}

Subject: Application under RTI Act, 2005 regarding {data.category}

Respected Sir/Madam,

I am a citizen of India residing in {data.location}.
Under the provisions of the Right to Information Act, 2005, I request the following information:

{data.problem}

Kindly provide the requested information within the stipulated time period as per the RTI Act.

Thanking you.

Yours faithfully,
Citizen of India
"""

    return {"rti": mock_rti}


# Chatbot Request Model
class ChatRequest(BaseModel):
    message: str
    language: str


SYSTEM_PROMPT = """
You are an RTI (Right to Information Act, India) expert assistant.

Guide citizens step-by-step on:
• what RTI is
• how to file RTI
• how to write RTI questions
• first appeal and second appeal
• RTI deadlines
• government departments

Rules:
Respond in the user's language (Tamil or English).
Keep explanations clear and practical.
"""


@app.post("/chatbot")
def rti_chatbot(data: ChatRequest):

    msg = data.message.lower()

    # Tamil detection
    tamil_mode = data.language == "Tamil"

    # FAQ Knowledge Base
    faq = {
        "what is rti": {
            "en": "RTI (Right to Information Act 2005) allows Indian citizens to request information from government departments.",
            "ta": "RTI (தகவல் அறியும் உரிமை சட்டம் 2005) மூலம் இந்திய குடிமக்கள் அரசு துறைகளிடமிருந்து தகவல்களை கேட்கலாம்."
        },

        "how to apply rti": {
            "en": "Step 1: Identify the department. Step 2: Write your RTI question clearly. Step 3: Submit it to the Public Information Officer. Step 4: Wait for response within 30 days.",
            "ta": "படி 1: சம்பந்தப்பட்ட துறையை கண்டறியவும். படி 2: உங்கள் RTI கேள்வியை தெளிவாக எழுதவும். படி 3: பொது தகவல் அலுவலரிடம் சமர்ப்பிக்கவும். படி 4: 30 நாட்களில் பதில் கிடைக்கும்."
        },

        "procedure": {
            "en": "RTI procedure: 1. Identify department 2. Draft RTI application 3. Submit to Public Information Officer 4. Wait 30 days for reply.",
            "ta": "RTI நடைமுறை: 1. துறையை கண்டறிதல் 2. RTI விண்ணப்பம் தயாரித்தல் 3. பொது தகவல் அலுவலரிடம் சமர்ப்பித்தல் 4. 30 நாட்கள் காத்திருக்க வேண்டும்."
        },

        "appeal": {
            "en": "If you do not receive a response within 30 days, you can file a First Appeal under Section 19(1) of the RTI Act.",
            "ta": "30 நாட்களில் பதில் கிடைக்காவிட்டால் RTI சட்டம் பிரிவு 19(1) கீழ் முதல் மேல்முறையீடு செய்யலாம்."
        },

        "fees": {
            "en": "The standard RTI application fee is ₹10. Additional charges may apply for copies of documents.",
            "ta": "RTI விண்ணப்ப கட்டணம் பொதுவாக ₹10 ஆகும். ஆவண நகல்களுக்கு கூடுதல் கட்டணம் இருக்கலாம்."
        }
    }

    # Search for matching FAQ
    for key in faq:
        if key in msg:
            return {"reply": faq[key]["ta"] if tamil_mode else faq[key]["en"]}

    # Default reply
    if tamil_mode:
        return {"reply": "RTI பற்றி கேள்வி கேளுங்கள். உதாரணம்: RTI என்ன? RTI எப்படி விண்ணப்பிப்பது?"}
    else:
        return {"reply": "Ask about RTI topics like: What is RTI? How to apply RTI? RTI appeal procedure."}
    