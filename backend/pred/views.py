from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
import json
import numpy as np
import pandas as pd
import os
import tensorflow as tf
from sklearn.preprocessing import RobustScaler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load model and necessary data
MODEL_PATH = r'C:\Users\LOQ\Desktop\statvalue-ai\models\market_value_lstm_model.h5'
DATASET_PATH = r'C:\Users\LOQ\Desktop\statvalue-ai\models\finaldataset.xlsx'
FEATURE_SCALER_PATH = r'C:\Users\LOQ\Desktop\statvalue-ai\models\feature_scaler.npy'
TARGET_SCALER_PATH = r'C:\Users\LOQ\Desktop\statvalue-ai\models\target_scaler.npy'
IMPORTANT_FEATURES_PATH = r'C:\Users\LOQ\Desktop\statvalue-ai\models\important_features.npy'

# Initialize globals
model = None
df = None
feature_scaler = None
target_scaler = None    
important_features = None
lookback = 4  # Set based on your model requirements

def load_models_and_data():
    """Load the model, data, and scalers if not loaded"""
    global model, df, feature_scaler, target_scaler, important_features
    
    try:
        # Only load if not already loaded
        if model is None:
            logger.info("Loading prediction model and data...")
            
            # Load model and other components first
            if not os.path.exists(MODEL_PATH):
                logger.error(f"Model file not found at {MODEL_PATH}")
                return False
            model = tf.keras.models.load_model(MODEL_PATH)
            logger.info("Model loaded successfully")
            
            if not os.path.exists(FEATURE_SCALER_PATH):
                logger.error(f"Feature scaler not found at {FEATURE_SCALER_PATH}")
                return False
            feature_scaler = np.load(FEATURE_SCALER_PATH, allow_pickle=True)[0]
            logger.info("Feature scaler loaded successfully")
            
            if not os.path.exists(TARGET_SCALER_PATH):
                logger.error(f"Target scaler not found at {TARGET_SCALER_PATH}")
                return False
            target_scaler = np.load(TARGET_SCALER_PATH, allow_pickle=True)[0]
            logger.info("Target scaler loaded successfully")
            
            if not os.path.exists(IMPORTANT_FEATURES_PATH):
                logger.error(f"Important features not found at {IMPORTANT_FEATURES_PATH}")
                return False
            important_features = np.load(IMPORTANT_FEATURES_PATH, allow_pickle=True)
            logger.info(f"Loaded {len(important_features)} important features")
            
            # Load dataset
            if not os.path.exists(DATASET_PATH):
                logger.error(f"Dataset not found at {DATASET_PATH}")
                return False
                
            df = pd.read_excel(DATASET_PATH)
            logger.info(f"Dataset loaded with {len(df)} records")
            
            # Create derived features based on the collaborative notebook code
            logger.info("Creating derived features...")
            
            # Make a copy of the player names
            df['player_name'] = df['name'].copy()
            
            # Enhanced Club Reputation - use both preset tiers and market values
            top_clubs_1 = ['PSG', 'Manchester Utd', 'Liverpool', 'Real Madrid', 'Barcelona',
                          'Bayern Munich', 'Arsenal', 'Atlético Madrid', 'Inter', 'Chelsea', 'Manchester City']
            top_clubs_2 = ['Juventus', 'Tottenham', 'Napoli', 'Dortmund', 'Atalanta', 'Milan', 'Athletic Club',
                          'RB Leipzig','Monaco', 'Brighton', 'Valencia', 'Sevilla']
            df['CR_base'] = df['Club'].apply(lambda x: 1 if x in top_clubs_1 else 2 if x in top_clubs_2 else 3)

            # Calculate average market value by club and use that to improve CR
            club_avg_mv = df.groupby('Club')['MV'].mean().reset_index()
            club_avg_mv['CR_value'] = pd.qcut(club_avg_mv['MV'], q=5, labels=[1, 2, 3, 4, 5]).astype(int)
            df = df.merge(club_avg_mv[['Club', 'CR_value']], on='Club', how='left')

            # Combined club reputation (weighting preset tiers and market value data)
            df['CR'] = (df['CR_base'] * 0.6 + df['CR_value'] * 0.4).round().astype(int)
            
            # Combined reputation metric
            if 'CR' in df.columns and 'NR' in df.columns and 'PR' in df.columns:
                df['ReputationIndex'] = (df['CR'] + df['NR'] + df['PR']) / 3
            elif 'CR' in df.columns:
                # Fallback if we only have CR
                df['ReputationIndex'] = df['CR']
                
            # Previous year market value - crucial for prediction
            # Create lag features - previous year's MV
            df = df.sort_values(['player_name', 'Year'])
            df['PrevYearMV'] = df.groupby('player_name')['MV'].shift(1)
            df['MV_Trend'] = df['MV'] - df['PrevYearMV']  # Year-to-year change

            # Market value growth rate
            df['MV_GrowthRate'] = (df['MV'] / df['PrevYearMV'].replace(0, 0.1)) - 1

            # Handling NaN values for first year entries
            df['PrevYearMV'].fillna(df['MV'], inplace=True)
            df['MV_Trend'].fillna(0, inplace=True)
            df['MV_GrowthRate'].fillna(0, inplace=True)
            
            # Check if all important features are now available
            missing_features = set(important_features) - set(df.columns)
            if missing_features:
                logger.warning(f"Still missing features after derivation: {missing_features}")
                
                # For any still missing features, create placeholders with default values
                for feature in missing_features:
                    logger.info(f"Creating placeholder for missing feature: {feature}")
                    df[feature] = 0.0
            
            logger.info("Successfully prepared all required features")
            return True
        else:
            return True  # Already loaded
            
    except Exception as e:
        logger.error(f"Error loading models and data: {str(e)}")
        return False

@csrf_exempt
@require_http_methods(["GET"])
def player_list(request):
    """API endpoint to get list of all players"""
    try:
        # Load data if not already loaded
        if not load_models_and_data():
            return JsonResponse({"error": "Failed to load model and data"}, status=500)
        
        # Get unique players with their IDs
        players = df[['name']].drop_duplicates().copy()
        players['id'] = range(1, len(players) + 1)  # Create synthetic IDs
        
        # Convert to list of dictionaries
        player_list = players.to_dict('records')
        
        return JsonResponse(player_list, safe=False)
    
    except Exception as e:
        logger.error(f"Error in player_list: {str(e)}")
        return JsonResponse({"error": f"Failed to retrieve player list: {str(e)}"}, status=500)

def predict_market_value(player_name, target_year):
    """Function to predict market value for a player in a specific year"""
    try:
        # Load data if not already loaded
        if not load_models_and_data():
            return {"error": "Failed to load model and data"}
        
        # Get player data
        player_df = df[df['name'] == player_name].sort_values('Year')
        
        if len(player_df) == 0:
            return {"error": f"Player '{player_name}' not found in the dataset"}
            
        if len(player_df) < lookback:
            return {"error": f"Not enough historical data for player '{player_name}'. Need at least {lookback} years of data."}
        
        # Get the latest available data for this player
        latest_data = player_df.tail(lookback)
        last_known_year = int(latest_data['Year'].iloc[-1])  # Convert to Python int
        last_known_mv = float(latest_data['MV'].iloc[-1])    # Convert to Python float
        last_known_age = int(latest_data['Age'].iloc[-1]) if 'Age' in latest_data.columns else None  # Convert to Python int
        
        # Check if we have data that's before the target year
        if last_known_year >= target_year:
            # We already have data for this year, return the actual value
            year_data = player_df[player_df['Year'] == target_year]
            if not year_data.empty:
                actual_mv = float(year_data['MV'].iloc[0])  # Convert to Python float
                actual_age = int(year_data['Age'].iloc[0]) if 'Age' in year_data.columns else None

                return {
                    "playerName": player_name,
                    "year": int(target_year),
                    "predictedValue": actual_mv,
                    "currentValue": last_known_mv,
                    "confidenceLevel": "High (Actual Data)",
                    "lastKnownAge": actual_age,
                    "projectedAge": actual_age
                }
            else:
                # We don't have the exact year but we have later years
                return {"error": f"No data available for {player_name} in {target_year}, but we have more recent data"}
        
        # Project features for target year - this is critical for year-dependent predictions
        years_forward = target_year - last_known_year
        logger.info(f"Projecting {years_forward} years forward from {last_known_year} to {target_year}")
        
        # Create a copy of the latest data for projection
        projected_data = latest_data.iloc[-1:].copy()
        
        # Update year-dependent features
        projected_data['Year'] = target_year
        
        # Update age if available
        if last_known_age is not None:
            projected_age = last_known_age + years_forward
            projected_data['Age'] = projected_age
            logger.info(f"Projecting age from {last_known_age} to {projected_age}")
            
            # Update age-related features if they exist
            if 'Age_squared' in projected_data.columns:
                projected_data['Age_squared'] = projected_age ** 2
            
            if 'Years_from_peak' in projected_data.columns:
                projected_data['Years_from_peak'] = abs(projected_age - 27)
                
            if 'PeakAgeFactor' in projected_data.columns:
                projected_data['PeakAgeFactor'] = 1 - abs(projected_age - 27) / 15
                
            # Update career phase if it exists
            if 'CareerPhase' in projected_data.columns:
                if projected_age <= 21:
                    projected_data['CareerPhase'] = 'Rising'
                    if 'CareerPhaseValue' in projected_data.columns:
                        projected_data['CareerPhaseValue'] = 1
                elif projected_age <= 25:
                    projected_data['CareerPhase'] = 'Development'
                    if 'CareerPhaseValue' in projected_data.columns:
                        projected_data['CareerPhaseValue'] = 2
                elif projected_age <= 29:
                    projected_data['CareerPhase'] = 'Peak'
                    if 'CareerPhaseValue' in projected_data.columns:
                        projected_data['CareerPhaseValue'] = 3
                elif projected_age <= 33:
                    projected_data['CareerPhase'] = 'Experienced'
                    if 'CareerPhaseValue' in projected_data.columns:
                        projected_data['CareerPhaseValue'] = 2
                else:
                    projected_data['CareerPhase'] = 'Veteran'
                    if 'CareerPhaseValue' in projected_data.columns:
                        projected_data['CareerPhaseValue'] = 1
        
        # Create a synthetic time sequence for prediction using projected data
        X_input = latest_data[important_features].values
        
        # For the last timestep in the sequence, replace with projected data
        # This helps the model see the trend into the future
        for feature in important_features:
            if feature in projected_data.columns:
                X_input[-1, list(important_features).index(feature)] = projected_data[feature].iloc[0]
        
        # Reshape and scale for prediction
        X_reshaped = X_input.reshape(1, lookback, len(important_features))
        
        # Scale the features
        X_scaled = np.zeros((1, lookback, len(important_features)))
        for i in range(lookback):
            X_scaled[0, i, :] = feature_scaler.transform(X_input[i].reshape(1, -1))
        
        # Make prediction
        pred_scaled = model.predict(X_scaled)
        predicted_value = float(target_scaler.inverse_transform(pred_scaled)[0][0])
        
        # Apply age-based adjustment for far-future predictions
        if last_known_age is not None:
            projected_age = last_known_age + years_forward
            
            # Value generally peaks and then declines after age 30
            if projected_age > 30:
                # Progressive decline with age after 30
                age_factor = max(0.5, 1.0 - 0.05 * (projected_age - 30))
                original_prediction = predicted_value
                predicted_value = predicted_value * age_factor
                logger.info(f"Applied age adjustment factor of {age_factor} for age {projected_age} "
                           f"(original: {original_prediction:.2f}, adjusted: {predicted_value:.2f})")
        
        # Calculate confidence based on years forward
        years_forward = target_year - last_known_year
        base_confidence = 0.9
        confidence_penalty = min(0.4, 0.05 * years_forward)  # Reduce confidence for future predictions
        
        confidence_level = base_confidence - confidence_penalty
        
        # Convert to descriptive confidence level
        if confidence_level > 0.8:
            confidence_desc = "High"
        elif confidence_level > 0.6:
            confidence_desc = "Medium"
        else:
            confidence_desc = "Low"
            
        # Format the confidence descriptor
        confidence_text = f"{confidence_desc} ({int(confidence_level * 100)}%)"
        projected_age = None
        if last_known_age is not None:
            projected_age = last_known_age + years_forward
        # Ensure all values are JSON serializable
        return {
            "playerName": player_name,
            "year": int(target_year),
            "predictedValue": round(predicted_value, 2),
            "currentValue": round(last_known_mv, 2),
            "confidenceLevel": confidence_text,
            "yearsForward": int(years_forward),  # Convert to Python int
            "lastKnownYear": last_known_year,
            "lastKnownAge": last_known_age,
            "projectedAge": projected_age
        }
        
    except Exception as e:
        logger.error(f"Error in predict_market_value: {str(e)}")
        return {"error": f"Prediction failed: {str(e)}"}

@csrf_exempt
@require_http_methods(["POST"])
def generate_prediction(request):
    """API endpoint to generate player value prediction"""
    try:
        # Parse JSON data from request
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['playerName', 'year']
        for field in required_fields:
            if field not in data:
                return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
        
        # Extract data
        player_name = data['playerName']
        target_year = int(data['year'])
        
        # Validate year is in reasonable range
        current_year = 2025  # Update as needed
        if target_year < 2000 or target_year > current_year + 5:
            return JsonResponse({"error": f"Year must be between 2000 and {current_year + 5}"}, status=400)
        
        # Generate prediction
        prediction = predict_market_value(player_name, target_year)
        
        # Check if prediction has error
        if "error" in prediction:
            return JsonResponse({"error": prediction["error"]}, status=400)
        
        # Ensure all values are JSON serializable before returning
        for key, value in prediction.items():
            if isinstance(value, np.int64):
                prediction[key] = int(value)
            elif isinstance(value, np.float64):
                prediction[key] = float(value)
        
        return JsonResponse(prediction)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        logger.error(f"Error in generate_prediction: {str(e)}")
        return JsonResponse({"error": f"Failed to generate prediction: {str(e)}"}, status=500)
from .models import PlayerStats

@api_view(['GET'])
def search_players(request):
    players = PlayerStats.objects.all()
    try:
        data = [{'name': p.name} for p in players]
        if not data:
            data = []
    except Exception as e:
        data = []
    return JsonResponse(data, safe=False)

from .serializers import PlayerSerializer

@csrf_exempt
@require_http_methods(["GET"])
def player_history(request, player_name):
    """API endpoint to get player market value history"""
    try:
        # Load data if not already loaded
        if not load_models_and_data():
            return JsonResponse({"error": "Failed to load model and data"}, status=500)
        
        # Filter for the player and years from 2018 onwards
        player_df = df[(df['name'] == player_name) & (df['Year'] >= 2018)].sort_values('Year')
        
        if len(player_df) == 0:
            return JsonResponse({"error": f"No historical data found for player '{player_name}'"}, status=404)
        
        # Prepare data for JSON response
        history_data = []
        for _, row in player_df.iterrows():
            history_data.append({
                "year": int(row['Year']),
                "marketValue": float(row['MV']),
                "age": int(row['Age']) if 'Age' in row else None
            })
        
        return JsonResponse(history_data, safe=False)
    
    except Exception as e:
        logger.error(f"Error in player_history: {str(e)}")
        return JsonResponse({"error": f"Failed to retrieve player history: {str(e)}"}, status=500)