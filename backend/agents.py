import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from rag import retrieve_knowledge  

# Load environment variables
load_dotenv()

# Initialize Gemini Model
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.0,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# --- AGENT 1: THE STRATEGIST ---
def strategist_agent(rfp_text: str):
    """
    Analyzes the RFP text to determine if we should bid.
    Returns a JSON object with decision, probability, and reasoning.
    """
    prompt = PromptTemplate(
        template="""
        You are the Chief Strategy Officer for Asian Paints B2B Division.
        Analyze the following RFP text and provide a structured 'Bid/No-Bid' decision.
        
        RFP Text excerpt:
        "{text}"
        
        Analyze based on:
        1. Product Fit (Do we have paints/coatings?)
        2. Risk (Warranty demands, timeline tightness)
        3. Value (Is it a large commercial project?)

        Return ONLY a JSON object with this exact structure:
        {{
            "decision": "BID" or "NO-BID",
            "probability": "XX%",
            "value": "$X.X Million",
            "effort": "Low/Medium/High",
            "reasoning": "One sentence summary of why.",
            "insight": "One strategic tip for winning this deal."
        }}
        """,
        input_variables=["text"]
    )
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        response = chain.invoke({"text": rfp_text[:4000]}) # Limit text for token safety
        # Clean up JSON markdown if present
        clean_json = response.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        return {"error": str(e), "decision": "ERROR"}

# --- UPDATED AGENT 2: THE DRAFTER (Now with RAG) ---
def drafter_agent(rfp_requirement: str):
    """
    Drafts a technical response using retrieved knowledge.
    """
    # 1. Retrieve Context
    context = retrieve_knowledge(rfp_requirement)
    
    # 2. Generate Answer with Context
    prompt = PromptTemplate(
        template="""
        You are the Technical Bid Writer for Asian Paints.
        Draft a professional response to this RFP requirement using the provided context.
        
        RFP Requirement: "{requirement}"
        
        Context (Internal Knowledge):
        "{context}"
        
        Guidelines:
        - Use the context to mention specific product details (specs, codes).
        - If the context doesn't have the answer, use your general knowledge but be cautious.
        - Keep it under 150 words.
        
        Draft Response:
        """,
        input_variables=["requirement", "context"]
    )
    
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"requirement": rfp_requirement, "context": context})


# --- AGENT 3: THE COMPLIANCE AUDITOR ---
def compliance_agent(draft_text: str):
    """
    Checks the drafted text for specific risk words or policy violations.
    """
    prompt = PromptTemplate(
        template="""
        You are the Legal & Compliance Auditor. Review this draft proposal text:
        
        "{draft}"
        
        Your Rules:
        1. Warranty cannot exceed 10 years.
        2. Cannot promise "unlimited" or "forever".
        3. Must mention "Subject to standard terms" for pricing.
        
        If you find a violation, start with "RISK DETECTED" and explain why.
        If it is safe, say "CLEAN: No compliance risks found."
        """,
        input_variables=["draft"]
    )
    
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"draft": draft_text})