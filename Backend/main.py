import os
import requests
import tempfile
import traceback
import math
import time
from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
from dotenv import load_dotenv
import markdown as md_lib
from bs4 import BeautifulSoup
from pydantic import BaseModel
from pathlib import Path


# Configure matplotlib to use non-interactive backend
matplotlib.use('Agg')

# Load environment variables
load_dotenv()

# API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
API_URL = "https://api.openai.com/v1/chat/completions"

# Directory Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.join(BASE_DIR, "data")

# Create FastAPI app
app = FastAPI(title="CSV Dashboard API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class FileDeleteRequest(BaseModel):
    filename: str

# Utility Functions
def load_csv(filename: str) -> pd.DataFrame:
    """Load CSV file from data folder"""
    file_path = os.path.join(DATA_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"{filename} not found")
    return pd.read_csv(file_path)

def markdown_to_text(markdown_text: str) -> str:
    """Convert Markdown to plain text"""
    html = md_lib.markdown(markdown_text)
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(separator="\n")

def replace_nan_with_none(obj):
    """Replace NaN values with None for JSON serialization"""
    if isinstance(obj, dict):
        return {k: replace_nan_with_none(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_nan_with_none(i) for i in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        else:
            return obj
    else:
        return obj

def get_dataset_summary(df: pd.DataFrame) -> str:
    """Generate a summary of the dataset for LLM context"""
    summary = f"""
Dataset Summary:
- Shape: {df.shape[0]} rows, {df.shape[1]} columns
- Columns: {', '.join(df.columns.tolist())}
- Data types: {df.dtypes.to_dict()}
- Missing values: {df.isnull().sum().to_dict()}
"""
    
    # Add sample data (first few rows)
    if len(df) > 0:
        sample_data = df.head(3).to_string(index=False)
        summary += f"\nSample data:\n{sample_data}"
    
    # Add basic statistics for numeric columns
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        stats = df[numeric_cols].describe().to_string()
        summary += f"\nNumeric column statistics:\n{stats}"
    
    return summary

# API Endpoints

@app.get("/")
def root():
    return {"message": "Dynamic Dashboard Backend", "version": "1.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

# Dataset Management Endpoints

@app.get("/available-datasets")
def get_available_datasets():
    """Get list of available datasets"""
    try:
        if not os.path.exists(DATA_FOLDER):
            os.makedirs(DATA_FOLDER, exist_ok=True)
            return {"datasets": []}
            
        files = [
            f.replace(".csv", "").replace("_", "-")
            for f in os.listdir(DATA_FOLDER)
            if f.endswith(".csv")
        ]
        return {"datasets": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading data folder: {str(e)}")

@app.get("/list-csv")
def list_csv_files():
    """List all CSV files in the data folder"""
    print("=== LIST-CSV ENDPOINT CALLED ===")
    print(f"DATA_FOLDER path: {DATA_FOLDER}")
    print(f"DATA_FOLDER exists: {os.path.exists(DATA_FOLDER)}")
    
    try:
        if not os.path.exists(DATA_FOLDER):
            print("Creating DATA_FOLDER because it doesn't exist")
            os.makedirs(DATA_FOLDER, exist_ok=True)
            return {"files": []}
        
        all_files = os.listdir(DATA_FOLDER)
        print(f"All files in DATA_FOLDER: {all_files}")
        
        csv_files = [f for f in all_files if f.endswith(".csv")]
        print(f"CSV files found: {csv_files}")
        
        return {"files": csv_files}
        
    except Exception as e:
        print(f"Error in list_csv_files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
def list_files():
    """List CSV files for dropdown"""
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER, exist_ok=True)
    files = [f for f in os.listdir(DATA_FOLDER) if f.endswith(".csv")]
    return {"files": files}

@app.get("/{dataset_name}")
def get_dataset(dataset_name: str):
    """Get dataset data by name"""
    filename = dataset_name.replace("-", "_") + ".csv"
    df = load_csv(filename)
    data = df.to_dict(orient="records")
    data_clean = replace_nan_with_none(data)
    return {"data": data_clean}

# File Upload Endpoint

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file"""
    print(f"=== UPLOAD REQUEST START ===")
    print(f"Received file: {file.filename}")
    print(f"Content type: {file.content_type}")
    
    if not file.filename.endswith(".csv"):
        print(f"❌ Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    os.makedirs(DATA_FOLDER, exist_ok=True)
    file_path = os.path.join(DATA_FOLDER, file.filename)
    print(f"Saving file to: {file_path}")

    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        print(f"✅ File saved successfully: {file.filename}")
        print(f"File size: {len(content)} bytes")
        print(f"=== UPLOAD REQUEST END (SUCCESS) ===")
        return {"message": f"{file.filename} uploaded successfully"}
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        print(f"=== UPLOAD REQUEST END (FAILED) ===")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# File Delete Endpoint

@app.delete("/delete")
def delete_csv_file(request: FileDeleteRequest):
    """Delete a CSV file"""
    print(f"=== DELETE REQUEST START ===")
    print(f"Received delete request for filename: '{request.filename}'")
    print(f"Filename type: {type(request.filename)}")
    print(f"Filename length: {len(request.filename)}")
    print(f"Filename repr: {repr(request.filename)}")
    
    # Check DATA_FOLDER
    print(f"DATA_FOLDER: {DATA_FOLDER}")
    print(f"DATA_FOLDER exists: {os.path.exists(DATA_FOLDER)}")
    
    if os.path.exists(DATA_FOLDER):
        data_contents = os.listdir(DATA_FOLDER)
        print(f"DATA_FOLDER contents ({len(data_contents)} files):")
        for i, file in enumerate(data_contents):
            print(f"  [{i}] '{file}' (type: {type(file)}, len: {len(file)})")
        
        # Check for exact matches
        exact_match = request.filename in data_contents
        print(f"Exact filename match found: {exact_match}")
        
        # Check for case-insensitive matches
        case_insensitive_matches = [f for f in data_contents if f.lower() == request.filename.lower()]
        print(f"Case-insensitive matches: {case_insensitive_matches}")
        
        # Check for partial matches
        partial_matches = [f for f in data_contents if request.filename in f or f in request.filename]
        print(f"Partial matches: {partial_matches}")
    else:
        print("DATA_FOLDER directory does not exist!")
    
    # Construct file path
    file_path = os.path.join(DATA_FOLDER, request.filename)
    print(f"Constructed file path: '{file_path}'")
    print(f"File path exists: {os.path.exists(file_path)}")
    print(f"File path is file: {os.path.isfile(file_path) if os.path.exists(file_path) else 'N/A'}")
    
    if not os.path.exists(file_path):
        print(f"❌ FILE NOT FOUND: {file_path}")
        print(f"=== DELETE REQUEST END (FAILED) ===")
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        print(f"Attempting to delete file: {file_path}")
        os.remove(file_path)
        print(f"✅ File deleted successfully: {request.filename}")
        print(f"=== DELETE REQUEST END (SUCCESS) ===")
        return {"message": f"{request.filename} deleted successfully"}
    except PermissionError as e:
        print(f"❌ Permission error deleting file: {e}")
        print(f"=== DELETE REQUEST END (PERMISSION ERROR) ===")
        raise HTTPException(status_code=403, detail="Permission denied")
    except Exception as e:
        print(f"❌ Unexpected error deleting file: {e}")
        print(f"=== DELETE REQUEST END (ERROR) ===")
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

# Chat Endpoints

@app.post("/llm-chat")
async def llm_chat(
    prompt: str = Query(...),
    dataset: str = Query(...),
    model: str = Query("deepseek")
):
    """Generate data visualization based on prompt"""
    try:
        print(f"LLM Chat request - Prompt: {prompt[:50]}..., Dataset: {dataset}, Model: {model}")
        print(f"API Key exists: {bool(OPENAI_API_KEY)}")
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="Server missing OPENAI_API_KEY")
        
        enhanced_prompt = f"""
Given a dataset loaded as 'df' (pandas DataFrame), generate Python matplotlib code to: {prompt}

Requirements:
- Use only matplotlib.pyplot (imported as plt)
- The DataFrame 'df' is already loaded
- Don't include import statements for pandas or matplotlib
- Don't include plt.show() or plt.savefig() - these will be handled automatically
- Make the plot clear and readable with proper labels
- Handle any potential column name variations gracefully

Generate only the plotting code:
"""

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # OpenAI models
        MODEL_MAPPING = {
            "deepseek": "gpt-4o-mini",  # Default to gpt-4o-mini
            "gpt4": "gpt-4o",
            "gpt35": "gpt-3.5-turbo",
        }

        api_model = MODEL_MAPPING.get(model.lower(), "gpt-4o-mini")

        body = {
            "model": api_model,
            "messages": [
                {"role": "system", "content": "You are a helpful data visualization assistant. Generate clean, working matplotlib code."},
                {"role": "user", "content": enhanced_prompt}
            ],
            "temperature": 0.3
        }

        print(f"Sending request to {API_URL}")
        response = requests.post(API_URL, headers=headers, json=body, timeout=30)
        print(f"Got response: {response.status_code}")

        if response.status_code == 401:
            print(f"API Error: Unauthorized - {response.text}")
            raise HTTPException(status_code=401, detail="Upstream unauthorized: check OPENAI_API_KEY")
        if response.status_code != 200:
            error_detail = f"OpenAI API error: {response.status_code} - {response.text}"
            print(f"API Error: {error_detail}")
            raise HTTPException(status_code=502, detail=error_detail)

        result = response.json()
        llm_response = result["choices"][0]["message"]["content"]

        filename = dataset.replace("-", "_") + ".csv"
        df = load_csv(filename)

        plt.clf()
        plt.close('all')

        local_vars = {"pd": pd, "df": df, "plt": plt}

        timestamp = int(time.time())
        output_filename = f"plot_{dataset}_{timestamp}.png"
        output_path = os.path.join(tempfile.gettempdir(), output_filename)

        # Clean up code from markdown formatting
        code_to_execute = llm_response.strip()
        if code_to_execute.startswith("```python"):
            code_to_execute = code_to_execute[9:]
        elif code_to_execute.startswith("```"):
            code_to_execute = code_to_execute[3:]
        if code_to_execute.endswith("```"):
            code_to_execute = code_to_execute[:-3]

        safe_code = f"""
{code_to_execute}
plt.tight_layout()
plt.savefig(r'{output_path}', dpi=150, bbox_inches='tight')
plt.close()
"""

        try:
            exec(safe_code, {"__builtins__": __builtins__}, local_vars)
        except Exception as e:
            tb = traceback.format_exc()
            print(f"Generated code failed: {e}")
            # Fallback plotting if generated code fails
            fallback_code = f"""
plt.figure(figsize=(10, 6))
if len(df.columns) >= 2:
    plt.scatter(df.iloc[:, 0], df.iloc[:, 1])
    plt.xlabel(df.columns[0])
    plt.ylabel(df.columns[1])
    plt.title('Scatter Plot of {df.columns[0]} vs {df.columns[1]}')
else:
    plt.plot(df.iloc[:, 0])
    plt.xlabel('Index')
    plt.ylabel(df.columns[0])
    plt.title('Plot of {df.columns[0]}')
plt.tight_layout()
plt.savefig(r'{output_path}', dpi=150, bbox_inches='tight')
plt.close()
"""
            try:
                exec(fallback_code, {"__builtins__": __builtins__}, local_vars)
            except Exception as fallback_error:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Both generated and fallback plots failed.\n"
                        f"Original error: {str(e)}\n"
                        f"Fallback error: {str(fallback_error)}\n"
                        f"Traceback:\n{tb}"
                    )
                )

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Plot file was not generated")

        return {
            "reply": "Here is your plot!",
            "imageUrl": f"/plot/{output_filename}",
            "code_used": code_to_execute
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in llm_chat: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/text-chat")
async def text_chat(
    prompt: str = Query(...),
    dataset: str = Query(None)  # Optional dataset parameter
):
    """Text-based chat with optional dataset context"""
    try:
        print(f"Text chat request - Prompt: {prompt[:50]}..., Dataset: {dataset}")
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="Server missing OPENAI_API_KEY")
        
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # Base system message
        system_message = "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
        
        # If dataset is provided, load it and add context
        if dataset:
            try:
                filename = dataset.replace("-", "_") + ".csv"
                df = load_csv(filename)
                dataset_summary = get_dataset_summary(df)
                dataset_context = f"\n\nYou have access to a dataset with the following information:\n{dataset_summary}"
                system_message += dataset_context
                system_message += "\n\nWhen answering questions about the data, refer to this dataset information. You can provide insights, answer questions about the data structure, values, trends, and perform basic analysis based on the summary provided."
            except Exception as e:
                # If dataset loading fails, continue without it but mention the error
                dataset_context = f"\n\nNote: Could not load dataset '{dataset}': {str(e)}"
                system_message += dataset_context

        user_message = prompt
        if dataset:
            user_message = f"[Context: Analyzing dataset '{dataset}']\n\n{prompt}"

        body = {
            "model": "gpt-4o-mini",  # Using OpenAI's GPT-4 mini model
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7
        }

        response = requests.post(API_URL, headers=headers, json=body, timeout=30)
        
        if response.status_code == 401:
            print(f"Text chat API unauthorized: {response.text}")
            raise HTTPException(status_code=401, detail="Upstream unauthorized: check OPENAI_API_KEY")
        if response.status_code != 200:
            print(f"Text chat API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=502, detail=f"API error: {response.status_code}")

        result = response.json()
        markdown_reply = result["choices"][0]["message"]["content"]
        plain_text_reply = markdown_to_text(markdown_reply)
        return {
            "reply": plain_text_reply,
            "raw_markdown": markdown_reply
        }

    except Exception as e:
        print(f"Text chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/text-chat/stream")
async def text_chat_stream(
    prompt: str = Query(...),
    dataset: str = Query(None),
    lang: str = Query("en")
):
    """Stream text chat responses token-by-token. Returns text/plain stream."""
    try:
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="Server missing OPENAI_API_KEY")

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # Base system message with language control
        lang = (lang or "en").lower()
        if lang == "ar":
            system_message = (
                "You are a helpful AI assistant. Respond in Arabic only. "
                "Use clear, natural Arabic phrasing."
            )
        else:
            system_message = "You are a helpful AI assistant. Provide clear, concise, and helpful responses."

        # Optional dataset context
        if dataset:
            try:
                filename = dataset.replace("-", "_") + ".csv"
                df = load_csv(filename)
                dataset_summary = get_dataset_summary(df)
                dataset_context = f"\n\nYou have access to a dataset with the following information:\n{dataset_summary}"
                system_message += dataset_context
                system_message += ("\n\nWhen answering questions about the data, refer to this dataset information. "
                                   "Provide insights and analysis based on the summary provided.")
            except Exception as e:
                system_message += f"\n\nNote: Could not load dataset '{dataset}': {str(e)}"

        user_message = prompt if not dataset else f"[Context: Analyzing dataset '{dataset}']\n\n{prompt}"

        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.7,
            "stream": True,
        }

        def event_stream():
            with requests.post(API_URL, headers=headers, json=body, stream=True, timeout=60) as r:
                if r.status_code == 401:
                    raise HTTPException(status_code=401, detail="Upstream unauthorized: check OPENAI_API_KEY")
                if r.status_code != 200:
                    raise HTTPException(status_code=502, detail=f"API error: {r.status_code}")
                for line in r.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data = line[len("data: "):].strip()
                        if data == "[DONE]":
                            break
                        try:
                            obj = __import__("json").loads(data)
                            delta = obj.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            # If parsing fails, skip the chunk
                            continue

        return StreamingResponse(event_stream(), media_type="text/plain")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Streaming text chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Plot Serving Endpoint

@app.get("/plot/{filename}")
def serve_plot(filename: str):
    """Serve generated plot images"""
    full_path = os.path.join(tempfile.gettempdir(), filename)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Plot image not found")
    return FileResponse(full_path, media_type="image/png")

# Options Endpoints for CORS

@app.options("/llm-chat")
async def llm_chat_options():
    return {"message": "OK"}

# Debug Endpoints

@app.get("/debug/hf-connection")
async def debug_hf_connection():
    """Debug endpoint to test Hugging Face API connection"""
    try:
        if not OPENAI_API_KEY:
            return {
                "status": "error",
                "message": "OPENAI_API_KEY not found in environment",
                "openai_connected": False,
                "api_key_exists": False
            }
        
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        
        test_payload = {
            "model": "gpt-4o-mini",  # Using OpenAI's GPT-4 mini model
            "messages": [
                {"role": "user", "content": "Hello, this is a connection test."}
            ],
            "max_tokens": 20,
            "temperature": 0.1
        }
        
        print(f"Testing OpenAI API with key: {OPENAI_API_KEY[:10]}...")
        response = requests.post(API_URL, headers=headers, json=test_payload, timeout=30)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            return {
                "status": "success",
                "message": "OpenAI API connection successful",
                "openai_connected": True,
                "api_key_exists": True,
                "api_response": ai_response,
                "model": "gpt-4o-mini",  # Using OpenAI's GPT-4 mini model
                "response_time": response.elapsed.total_seconds()
            }
        else:
            return {
                "status": "error",
                "message": f"API request failed with status {response.status_code}",
                "openai_connected": False,
                "api_key_exists": True,
                "error_details": response.text[:500],
                "status_code": response.status_code,
                "response_headers": dict(response.headers)
            }
            
    except requests.exceptions.Timeout:
        return {
            "status": "error",
            "message": "Request to OpenAI API timed out (30s)",
            "hf_connected": False,
            "api_key_exists": bool(OPENAI_API_KEY)
        }
    except requests.exceptions.ConnectionError as e:
        return {
            "status": "error",
            "message": f"Connection error: {str(e)}",
            "hf_connected": False,
            "api_key_exists": bool(OPENAI_API_KEY)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "hf_connected": False,
            "api_key_exists": bool(OPENAI_API_KEY),
            "error_type": type(e).__name__
        }

@app.get("/debug/environment")
async def debug_environment():
    """Debug endpoint to check environment variables and setup"""
    import sys
    
    # Check if .env file exists
    env_file_exists = os.path.exists('.env')
    env_content = ""
    if env_file_exists:
        try:
            with open('.env', 'r') as f:
                env_content = f.read()
        except:
            env_content = "Could not read .env file"
    
    return {
        "python_version": sys.version,
        "openai_api_key_exists": bool(OPENAI_API_KEY),
        "openai_api_key_length": len(OPENAI_API_KEY) if OPENAI_API_KEY else 0,
        "openai_api_key_preview": f"{OPENAI_API_KEY[:10]}..." if OPENAI_API_KEY and len(OPENAI_API_KEY) > 10 else OPENAI_API_KEY,
        "api_url": API_URL,
        "data_folder_exists": os.path.exists(DATA_FOLDER),
        "data_folder_path": DATA_FOLDER,
        "pandas_version": pd.__version__,
        "matplotlib_version": matplotlib.__version__,
        "matplotlib_backend": matplotlib.get_backend(),
        "env_file_exists": env_file_exists,
        "env_content_has_openai_key": "OPENAI_API_KEY" in env_content if env_content else False,
        "working_directory": os.getcwd(),
        "temp_directory": tempfile.gettempdir()
    }

@app.get("/debug/test-simple-request")
async def debug_simple_request():
    """Test a very simple API request to isolate issues"""
    try:
        if not OPENAI_API_KEY:
            return {"error": "No API key found"}
            
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        
        # Minimal request
        payload = {
            "model": "gpt-4o-mini",  # Using OpenAI's GPT-4 mini model
            "messages": [{"role": "user", "content": "Hi"}],
            "max_tokens": 5
        }
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        
        return {
            "status_code": response.status_code,
            "response_text": response.text,
            "headers": dict(response.headers),
            "request_payload": payload,
            "request_headers": headers
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }

############ OpenAI API key storage ############
CREDS_FILE = Path(__file__).parent / "credentials.yaml"

def _read_yaml() -> dict:
    if CREDS_FILE.exists():
        with CREDS_FILE.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}

def _write_yaml(data: dict) -> None:
    with CREDS_FILE.open("w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)

class ApiKeyPayload(BaseModel):
    api_key: str

@app.get("/config/openai-key")
def get_openai_key():
    data = _read_yaml()
    key = (data.get("openai") or {}).get("api_key")
    return {"api_key": key or None}

@app.post("/config/openai-key")
def set_openai_key(payload: ApiKeyPayload):
    data = _read_yaml()
    if "openai" not in data or not isinstance(data["openai"], dict):
        data["openai"] = {}
    data["openai"]["api_key"] = payload.api_key
    _write_yaml(data)
    return {"status": "ok"}

@app.delete("/config/openai-key")
def delete_openai_key():
    data = _read_yaml()
    if "openai" in data and isinstance(data["openai"], dict) and "api_key" in data["openai"]:
        del data["openai"]["api_key"]
        if not data["openai"]:
            del data["openai"]
        _write_yaml(data)
    return {"status": "ok"}


# Main execution
if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    print(f"Data folder: {DATA_FOLDER}")
    print("Debug endpoints available:")
    print("- GET /debug/hf-connection - Test OpenAI API connection")
    print("- GET /debug/environment - Check environment setup")
    print("- GET /debug/test-simple-request - Test minimal API request")
    uvicorn.run(app, host="0.0.0.0", port=8000)