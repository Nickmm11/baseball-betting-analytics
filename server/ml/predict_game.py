import sys
import json
from game_prediction_model import GamePredictionModel

def main():
    # Get features from command line argument
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "No features provided"
        }))
        sys.exit(1)
    
    try:
        # Parse features
        features_json = sys.argv[1]
        features = json.loads(features_json)
        
        # Load model and make prediction
        model = GamePredictionModel()
        prediction = model.predict(features)
        
        # Return prediction as JSON
        print(json.dumps(prediction))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()