# Script to combine MLP and Bayesian predictions into a single JSON file
# for the interactive website visualizations.

import pandas as pd
import json

def combine_predictions():
    """Combine MLP and Bayesian predictions into single JSON file."""
    
    # Load predictions from both models
    bayesian_df = pd.read_csv('bayesian_predictions.csv')
    mlp_df = pd.read_csv('mlp_predictions.csv')

    
    # Check if they have the same number of rows
    if len(bayesian_df) != len(mlp_df):
        # Use only the minimum number of rows
        min_rows = min(len(bayesian_df), len(mlp_df))
        bayesian_df = bayesian_df.iloc[:min_rows]
        mlp_df = mlp_df.iloc[:min_rows]
    
    # Verify actual values match (they should be the same validation set)
    actual_match = all(abs(bayesian_df['actual'] - mlp_df['actual']) < 0.01)
    if not actual_match:
        print("\n⚠ Warning: Actual values don't match between models!")
        print("  Make sure both models used the SAME validation set.")
        print("  Using Bayesian actual values...")
    
    combined_df = pd.DataFrame({
        'actual': bayesian_df['actual'].round(1),
        'mlp': mlp_df['mlp'].round(1),
        'bayesian': bayesian_df['bayesian'].round(1)
    })
    
    combined_df = combined_df.dropna()
    
    # Convert to list of dictionaries (JSON format)
    predictions_list = combined_df.to_dict('records')
    
    # Save to JSON file
    output_file = 'predictions.json'
    with open(output_file, 'w') as f:
        json.dump(predictions_list, f, indent=2)
        
    return combined_df

if __name__ == "__main__":
    combine_predictions()