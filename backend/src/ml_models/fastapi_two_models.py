from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from astrapy import DataAPIClient
import os
import asyncio
import pandas as pd
import numpy as np
from joblib import load
from textblob import TextBlob
from fastapi.middleware.cors import CORSMiddleware
from sklearn.preprocessing import RobustScaler
from sklearn.impute import KNNImputer
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

# Configuration
ASTRA_DB_TOKEN = os.getenv('ASTRA_DB_TOKEN')
ASTRA_DB_URL = os.getenv('ASTRA_DB_URL')
ENGAGEMENT_MODEL_DIR = './engagement/'  # Directory for engagement models
PERFORMANCE_MODEL_DIR = './performance/'  # Directory for performance ranking models

# Create FastAPI app
app = FastAPI(
    title="Instagram Post Analysis API",
    description="API for analyzing Instagram posts and predicting performance",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body models
class RequestBody(BaseModel):
    container_id: str = None
    collection_name: str = None

# Load both sets of models at startup
engagement_models = {}
performance_models = {}

# Load engagement models
try:
    print("Loading engagement prediction models...")
    engagement_models["likesCount"] = load(f"{ENGAGEMENT_MODEL_DIR}likes_model.pkl")
    engagement_models["commentsCount"] = load(f"{ENGAGEMENT_MODEL_DIR}comments_model.pkl")
    engagement_scaler = load(f"{ENGAGEMENT_MODEL_DIR}features_scaler.pkl")
    print("✅ Engagement models loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading engagement models: {e}")
    print(f"Looking in: {os.path.abspath(ENGAGEMENT_MODEL_DIR)}")
    print("Engagement prediction functionality may be limited")

# Load performance ranking models
try:
    print("Loading performance ranking models...")
    performance_models["likesCount"] = load(f"{PERFORMANCE_MODEL_DIR}likes_model.pkl")
    performance_models["commentsCount"] = load(f"{PERFORMANCE_MODEL_DIR}comments_model.pkl")
    
    try:
        performance_models["reach"] = load(f"{PERFORMANCE_MODEL_DIR}reach_model.pkl")
        print("✅ Performance models (including reach) loaded successfully!")
    except:
        print("Reach model not found, will use approximation")
        print("✅ Performance models (without reach) loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading performance models: {e}")
    print(f"Looking in: {os.path.abspath(PERFORMANCE_MODEL_DIR)}")
    print("Top posts ranking functionality may be limited")

# Database connection
async def connectDB():
    """Connect to AstraDB database"""
    try:
        client = DataAPIClient(token=ASTRA_DB_TOKEN)
        database = await asyncio.to_thread(client.get_database, ASTRA_DB_URL)
        print(f"* Connected to Database: {database.info().name}")
        return database
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

async def fetch_data(container_id):
    """Fetch data from specified collection"""
    try:
        database = await connectDB()
        if not database:
            raise Exception("Database connection failed")
        collection = await asyncio.to_thread(database.get_collection, container_id)
        cursor = await asyncio.to_thread(collection.find)
        data = await asyncio.to_thread(list, cursor)
        return pd.DataFrame(data) if data else pd.DataFrame()
    except Exception as e:
        print(f"Data fetch error: {e}")
        return pd.DataFrame()

# Data preprocessing functions
def preprocess_for_engagement(data):
    """Preprocess data for engagement prediction models"""
    data = data.copy()
    data['hashtag_count'] = data['hashtags'].apply(lambda x: len(x) if isinstance(x, list) else 0)
    data['mentions_count'] = data['mentions'].apply(lambda x: len(x) if isinstance(x, list) else 0)
    data['caption_length'] = data['caption'].apply(lambda x: len(x) if isinstance(x, str) else 0)
    data['caption_sentiment'] = data['caption'].apply(lambda x: TextBlob(x).sentiment.polarity if isinstance(x, str) else 0)
    
    # Process timestamp if available
    if 'timestamp' in data.columns:
        data['timestamp'] = pd.to_datetime(data['timestamp'])
        data['hour'] = data['timestamp'].dt.hour
        data['day_of_week_encoded'] = data['timestamp'].dt.dayofweek
    else:
        data['hour'] = 12  # Default value
        data['day_of_week_encoded'] = 0  # Default value
    
    return data

def preprocess_for_performance(data):
    """Preprocess data for performance ranking models"""
    data = data.copy()
    
    # Calculate interaction (performance models use this)
    likes = data.get("likesCount", pd.Series([0] * len(data)))
    comments = data.get("commentsCount", pd.Series([0] * len(data)))
    data["interaction"] = (likes * comments) / 100
    
    # Process timestamp if needed
    if "timestamp" in data.columns:
        data["timestamp"] = pd.to_datetime(data["timestamp"])
        data["hour"] = data["timestamp"].dt.hour
        data["day_of_week"] = data["timestamp"].dt.dayofweek
        data["month"] = data["timestamp"].dt.month
    
    # Add other features that might be needed
    data["hashtags_count"] = data.get("hashtags", pd.Series([[]] * len(data))).apply(
        lambda x: len(x) if isinstance(x, list) else 0)
    data["mentions_count"] = data.get("mentions", pd.Series([[]] * len(data))).apply(
        lambda x: len(x) if isinstance(x, list) else 0)
    
    return data

def recommend_next_post(data_from_db):
    """Recommend next post type based on engagement predictions"""
    if not engagement_models or not engagement_scaler:
        return {"error": "Engagement prediction models not available"}
    
    recent_data = preprocess_for_engagement(data_from_db)
    
    feature_columns = ['caption_length', 'hour', 'hashtag_count', 'mentions_count', 
                       'day_of_week_encoded', 'caption_sentiment']
    
    # Handle missing columns
    for col in feature_columns:
        if col not in recent_data.columns:
            recent_data[col] = 0

    # Scale features using the engagement scaler
    X_scaled = engagement_scaler.transform(recent_data[feature_columns])
    
    # Make predictions using engagement models
    likes_predictions = np.expm1(engagement_models["likesCount"].predict(X_scaled))
    comments_predictions = np.expm1(engagement_models["commentsCount"].predict(X_scaled))

    # Analyze by post type
    post_types = recent_data['type'].unique().tolist() if 'type' in recent_data.columns else ['Image', 'Video', 'Sidecar']
    if not post_types:
        post_types = ['Image', 'Video', 'Sidecar']
        
    recommendations = {}

    for post_type in post_types:
        post_indices = (recent_data['type'] == post_type).to_numpy() if 'type' in recent_data.columns else []
        
        avg_likes = likes_predictions[post_indices].mean() if post_indices.any() else 0
        avg_comments = comments_predictions[post_indices].mean() if post_indices.any() else 0
        engagement_score = avg_likes + avg_comments * 2

        recommendations[post_type] = {
            'expected_average_likes': int(avg_likes),
            'expected_average_comments': int(avg_comments),
            'engagement_score': int(engagement_score)
        }

    return dict(sorted(recommendations.items(), key=lambda x: x[1]['engagement_score'], reverse=True))

def get_top_5_posts(df_data):
    """
    Get top 5 performing posts based on trained models.
    
    Args:
        df_data: DataFrame containing posts data
    
    Returns:
        DataFrame containing top 5 posts and their metrics
    """
    if not performance_models:
        return pd.DataFrame(columns=["_id", "caption", "performance_score"])
    
    print(f"Processing {len(df_data)} posts...")
    
    if df_data.empty:
        print("Warning: Empty dataset provided")
        return pd.DataFrame()
    
    # Create a working copy of the data
    df_original = df_data.copy()
    df = preprocess_for_performance(df_data)
    
    try:
        # Performance models are designed to use 'interaction' feature
        print("Using 'interaction' feature for performance predictions")
        
        # Make predictions using performance models
        for target in ["likesCount", "commentsCount", "reach"]:
            try:
                if target in performance_models:
                    # Predict using the interaction feature
                    predictions = performance_models[target].predict(df[['interaction']])
                    
                    # Transform predictions if needed
                    if np.all(predictions < 20):  # Log-transformed
                        predictions = np.expm1(predictions)
                    
                    # Ensure no negative values
                    predictions = np.maximum(0, predictions)
                    
                    df_original[f"predicted_{target}"] = predictions
                    print(f"✓ {target} predictions: min={predictions.min():.2f}, max={predictions.max():.2f}")
                else:
                    # Handle missing models with reasonable approximations
                    if target == "reach":
                        # If we have likes and comments predictions, use them to approximate reach
                        if all(col in df_original.columns for col in ["predicted_likesCount", "predicted_commentsCount"]):
                            df_original["predicted_reach"] = df_original["predicted_likesCount"] * 5 + df_original["predicted_commentsCount"] * 10
                            print("✓ Approximated reach based on other predictions")
                        else:
                            df_original["predicted_reach"] = np.random.lognormal(8, 1, size=len(df_original))
                            print("⚠️ Using random values for reach")
                    else:
                        print(f"⚠️ {target} model not found, using fallback")
                        df_original[f"predicted_{target}"] = df_original[target] if target in df_original else np.random.lognormal(4, 1, size=len(df_original))
            except Exception as e:
                print(f"Error predicting {target}: {e}")
                # Use actual values if available, otherwise reasonable defaults
                if target in df_original.columns:
                    df_original[f"predicted_{target}"] = df_original[target]
                else:
                    df_original[f"predicted_{target}"] = np.random.lognormal(4, 1, size=len(df_original))
        
        # Calculate performance score
        max_likes = max(df_original["predicted_likesCount"].max(), 1)
        max_comments = max(df_original["predicted_commentsCount"].max(), 1)
        max_reach = max(df_original.get("predicted_reach", pd.Series([1] * len(df_original))).max(), 1)
        
        df_original["performance_score"] = (
            0.5 * df_original["predicted_likesCount"] / max_likes +
            0.3 * df_original["predicted_commentsCount"] / max_comments +
            0.2 * df_original.get("predicted_reach", pd.Series([1] * len(df_original))) / max_reach
        )
        
        # Get top 5 posts
        top_posts = df_original.nlargest(5, "performance_score")
        
        # Select columns for return
        base_columns = ["performance_score", "predicted_likesCount", "predicted_commentsCount"]
        if "predicted_reach" in df_original.columns:
            base_columns.append("predicted_reach")
        
        # Add other columns if available
        optional_columns = []
        for col in ["_id", "type", "caption", "timestamp", "media_url", "likesCount", "commentsCount"]:
            if col in top_posts.columns:
                optional_columns.append(col)
        
        result_columns = optional_columns + base_columns
        
        print(f"Top post identified with score: {top_posts['performance_score'].max():.2f}")
        return top_posts[result_columns]
        
    except Exception as e:
        print(f"Error in get_top_5_posts: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty DataFrame with expected columns
        return pd.DataFrame(columns=["_id", "caption", "performance_score"])

# ----- API ENDPOINTS ----

@app.get("/health")
async def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "engagement_models": list(engagement_models.keys()) if engagement_models else [],
        "performance_models": list(performance_models.keys()) if performance_models else [],
        "timestamp": str(pd.Timestamp.now())
    }

@app.get("/collections")
async def list_collections():
    """List all available collections"""
    try:
        database = await connectDB()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        collections = await asyncio.to_thread(database.list_collections)
        return {"collections": [col.name for col in collections]}
    except Exception as e:
        print(f"Error listing collections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
async def get_recommendations(request: RequestBody):
    """Get recommendations for next post type using engagement models"""
    try:
        # Check if engagement models are loaded
        if not engagement_models:
            raise HTTPException(status_code=503, detail="Engagement prediction models not available")
        
        # Use either container_id or collection_name
        collection_id = request.container_id or request.collection_name
        
        if not collection_id:
            raise HTTPException(status_code=400, detail="Missing collection identifier. Please provide either container_id or collection_name")
            
        print(f"Received recommendation request for collection: {collection_id}")
        data_from_db = await fetch_data(collection_id)
        
        if not data_from_db.empty:
            print(f"Found {len(data_from_db)} rows of data")
            recommendations = recommend_next_post(data_from_db)
            return {"status": "success", "recommendations": recommendations}
        else:
            print("No data found in database")
            raise HTTPException(status_code=404, detail="No data available")
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/top5_posts")
async def top5_posts(request: RequestBody):
    """Get top 5 posts based on predicted performance using performance models"""
    try:
        # Check if performance models are loaded
        if not performance_models:
            raise HTTPException(status_code=503, detail="Performance ranking models not available")
        
        # Use either container_id or collection_name
        collection_id = request.container_id or request.collection_name
        
        if not collection_id:
            raise HTTPException(status_code=400, detail="Missing collection identifier")
            
        print(f"📊 Analyzing top posts for collection: {collection_id}")
        
        # Fetch data
        data_from_db = await fetch_data(collection_id)
        
        if data_from_db.empty:
            print("No data found in database")
            raise HTTPException(status_code=404, detail="No data available")
        
        print(f"Found {len(data_from_db)} posts to analyze")
        
        # Get top posts
        top_posts = get_top_5_posts(data_from_db)
        
        if top_posts is None or top_posts.empty:
            raise HTTPException(status_code=500, detail="Failed to identify top posts")
        
        # Prepare for JSON serialization
        top_posts_dict = top_posts.copy()
        
        # REMOVE prediction columns - only keep performance_score
        columns_to_keep = [col for col in top_posts_dict.columns if not col.startswith('predicted_') or col == 'performance_score']
        top_posts_dict = top_posts_dict[columns_to_keep]
        
        # Rename performance_score for clarity
        if 'performance_score' in top_posts_dict.columns:
            top_posts_dict = top_posts_dict.rename(columns={'performance_score': 'engagement_score'})
        
        # Convert timestamp to string if present
        if "timestamp" in top_posts_dict.columns:
            top_posts_dict["timestamp"] = top_posts_dict["timestamp"].astype(str)
            
        # Round numerical values
        for col in top_posts_dict.columns:
            if col not in ["_id", "caption", "timestamp", "type", "media_url"]:
                if pd.api.types.is_numeric_dtype(top_posts_dict[col]):
                    top_posts_dict[col] = top_posts_dict[col].round(2).fillna(0)
        
        # Reorder columns for nicer presentation
        preferred_column_order = ["_id", "type", "engagement_score", "timestamp", "caption", "media_url", "likesCount", "commentsCount"]
        available_columns = [col for col in preferred_column_order if col in top_posts_dict.columns]
        other_columns = [col for col in top_posts_dict.columns if col not in preferred_column_order]
        
        # Set final column order using available preferred columns first, then any remaining columns
        top_posts_dict = top_posts_dict[available_columns + other_columns]
        
        result = top_posts_dict.to_dict(orient="records")
        
        return {
            "status": "success", 
            "message": f"Found {len(result)} top posts", 
            "top_posts": result
        }
        
    except Exception as e:
        print(f"Error in top5_posts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Run the API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_two_models:app", host="0.0.0.0", port=8000, reload=True)
