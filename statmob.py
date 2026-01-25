import streamlit as st
import google.generativeai as genai
import requests
import pandas as pd
import time

import streamlit as st
import google.generativeai as genai
import requests
import pandas as pd

# --- 1. CONFIGURATION (Cloud-Ready) ---
# This tells Streamlit to look for keys in the secure hidden file
try:
    GOOGLE_API_KEY = st.secrets["GOOGLE_API_KEY"]
    FOOTBALL_API_KEY = st.secrets["FOOTBALL_API_KEY"]
except FileNotFoundError:
    st.error("🚨 Secrets not found! If running locally, you need a .streamlit/secrets.toml file.")
    st.stop()

# Setup
st.set_page_config(page_title="StatMob Pro", page_icon="🦁", layout="wide")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

# --- 2. SESSION STATE (Memory) ---
# This allows the app to remember the conversation
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- 3. THE DATA ENGINE (With Caching) ---
# We cache this data for 300 seconds (5 mins) so we don't get banned by the API
@st.cache_data(ttl=300)
def get_epl_data():
    headers = {"X-Auth-Token": FOOTBALL_API_KEY}
    
    try:
        # 1. Get Standings
        url_standings = "https://api.football-data.org/v4/competitions/PL/standings"
        r_standings = requests.get(url_standings, headers=headers)
        data_standings = r_standings.json()['standings'][0]['table']
        
        # 2. Get Top Scorers
        url_scorers = "https://api.football-data.org/v4/competitions/PL/scorers"
        r_scorers = requests.get(url_scorers, headers=headers)
        data_scorers = r_scorers.json()['scorers']
        
        return data_standings, data_scorers
    except Exception as e:
        st.error(f"API Error: {e}")
        return [], []

# --- 4. DATA PROCESSING ---
def process_data_for_display(standings, scorers):
    # Convert Standings to DataFrame for Charts
    df_standings = pd.DataFrame(standings)
    df_standings['Team'] = df_standings['team'].apply(lambda x: x['name'])
    df_standings = df_standings[['position', 'Team', 'playedGames', 'won', 'draw', 'lost', 'points', 'goalDifference']]
    
    # Format Scorers Text for LLM
    text_scorers = "TOP SCORERS:\n"
    for s in scorers:
        text_scorers += f"{s['player']['name']} ({s['team']['name']}): {s['goals']} goals\n"
        
    return df_standings, text_scorers

# --- 5. THE UI LAYER (Mobile Optimized) ---
st.title("🦁 StatMob Pro")

# Fetch Data
raw_standings, raw_scorers = get_epl_data()

if raw_standings:
    df, scorer_text = process_data_for_display(raw_standings, raw_scorers)

    # TABS: Better for mobile than columns
    tab1, tab2, tab3 = st.tabs(["📊 Table", "📈 Charts", "💬 Chat"])
    
    with tab1:
        st.dataframe(df.set_index('position'), use_container_width=True)

    with tab2:
        st.subheader("Title Race")
        st.bar_chart(df.head(6)[['Team', 'points']].set_index('Team'))
        
        st.subheader("Top Scorers")
        # Quick parsing of scorer text for a mini-table
        st.text(scorer_text)

    with tab3:
        # Chat Interface stays here
        st.caption("Ask StatMob about the stats...")
        
        # Display History
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        # Input
        if prompt := st.chat_input("Ex: Is Arsenal bottling it?"):
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    context = f"Data: {df.to_string()}\n{scorer_text}\nHistory: {st.session_state.messages}\nUser: {prompt}"
                    response = model.generate_content(context)
                    st.markdown(response.text)
                    st.session_state.messages.append({"role": "assistant", "content": response.text})

else:
    st.error("⚠️ Data Error. Check API Quota.")