import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import pickle
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GamePredictionModel:
    def __init__(self, model_path='models/game_prediction_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.load_or_create_model()
        
    def load_or_create_model(self):
        try:
            if os.path.exists(self.model_path):
                logger.info(f"Loading existing model from {self.model_path}")
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
            else:
                logger.info("Creating new model")
                self.model = self._create_model()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = self._create_model()
    
    def _create_model(self):
        # Create a pipeline with preprocessing and model
        home_pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        away_pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        return {
            'home': home_pipeline,
            'away': away_pipeline
        }
    
    def train(self, game_data):
        """
        Train the model using historical game data.
        
        Parameters:
        game_data (DataFrame): DataFrame with columns:
            - home_team_batting_avg
            - home_team_era
            - home_team_runs_per_game
            - away_team_batting_avg
            - away_team_era
            - away_team_runs_per_game
            - home_team_runs (target for home model)
            - away_team_runs (target for away model)
        """
        logger.info("Training game prediction model")
        
        # Features for prediction
        features = [
            'home_team_batting_avg', 'home_team_era', 'home_team_runs_per_game',
            'away_team_batting_avg', 'away_team_era', 'away_team_runs_per_game'
        ]
        
        # Check if all required columns exist
        required_columns = features + ['home_team_runs', 'away_team_runs']
        for col in required_columns:
            if col not in game_data.columns:
                logger.error(f"Missing required column: {col}")
                return False
        
        # Prepare data
        X = game_data[features]
        y_home = game_data['home_team_runs']
        y_away = game_data['away_team_runs']
        
        # Split data
        X_train, X_test, y_home_train, y_home_test, y_away_train, y_away_test = train_test_split(
            X, y_home, y_away, test_size=0.2, random_state=42
        )
        
        # Train models
        self.model['home'].fit(X_train, y_home_train)
        self.model['away'].fit(X_train, y_away_train)
        
        # Evaluate models
        home_score = self.model['home'].score(X_test, y_home_test)
        away_score = self.model['away'].score(X_test, y_away_test)
        logger.info(f"Home model R² score: {home_score:.4f}")
        logger.info(f"Away model R² score: {away_score:.4f}")
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        return {
            'home_score': home_score,
            'away_score': away_score
        }
    
    def predict(self, game_features):
        """
        Predict scores for a game using the trained model.
        
        Parameters:
        game_features (dict): Dictionary with features:
            - home_team_batting_avg
            - home_team_era
            - home_team_runs_per_game
            - away_team_batting_avg
            - away_team_era
            - away_team_runs_per_game
            
        Returns:
        dict: Predicted scores and confidence
        """
        if not self.model:
            logger.error("Model not loaded")
            return None
        
        # Convert input to DataFrame
        features = pd.DataFrame([game_features])
        
        # Make predictions
        predicted_home_score = max(0, self.model['home'].predict(features)[0])
        predicted_away_score = max(0, self.model['away'].predict(features)[0])
        
        # Calculate simple confidence score (0-1) based on model's feature importances
        # This is a simplified approach - in a real system you'd use prediction intervals
        confidence_score = 0.7  # Default baseline confidence
        
        return {
            'predicted_home_score': round(predicted_home_score, 1),
            'predicted_away_score': round(predicted_away_score, 1),
            'predicted_total': round(predicted_home_score + predicted_away_score, 1),
            'confidence_score': confidence_score
        }


# If run as script, train on sample data
if __name__ == "__main__":
    # Create sample data for testing
    # In a real application, you would load this from your database
    np.random.seed(42)
    
    sample_size = 1000
    
    # Generate random features
    data = {
        'home_team_batting_avg': np.random.uniform(0.220, 0.280, sample_size),
        'home_team_era': np.random.uniform(3.0, 5.0, sample_size),
        'home_team_runs_per_game': np.random.uniform(3.0, 6.0, sample_size),
        'away_team_batting_avg': np.random.uniform(0.220, 0.280, sample_size),
        'away_team_era': np.random.uniform(3.0, 5.0, sample_size),
        'away_team_runs_per_game': np.random.uniform(3.0, 6.0, sample_size),
    }
    
    # Generate target values with some relationship to features
    home_runs_base = data['home_team_batting_avg'] * 20 - data['away_team_era'] * 0.5 + data['home_team_runs_per_game'] * 0.8
    away_runs_base = data['away_team_batting_avg'] * 20 - data['home_team_era'] * 0.5 + data['away_team_runs_per_game'] * 0.8
    
    # Add some noise and ensure positive values
    data['home_team_runs'] = np.maximum(0, home_runs_base + np.random.normal(0, 1, sample_size))
    data['away_team_runs'] = np.maximum(0, away_runs_base + np.random.normal(0, 1, sample_size))
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Train model
    model = GamePredictionModel()
    results = model.train(df)
    
    # Test prediction
    test_features = {
        'home_team_batting_avg': 0.265,
        'home_team_era': 3.75,
        'home_team_runs_per_game': 4.8,
        'away_team_batting_avg': 0.248,
        'away_team_era': 4.25,
        'away_team_runs_per_game': 4.2
    }
    
    prediction = model.predict(test_features)
    print(f"\nSample Prediction:")
    print(f"Home Score: {prediction['predicted_home_score']}")
    print(f"Away Score: {prediction['predicted_away_score']}")
    print(f"Total: {prediction['predicted_total']}")
    print(f"Confidence: {prediction['confidence_score']:.2f}")