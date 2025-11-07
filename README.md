# Game Rating Prediction System

**DS 4420: Machine Learning and Data Mining 2 - Fall 2025**  
**Professor:** Eric Gerber

## Team Members
- Kaan Tural - tural.k@northeastern.edu
- Hanfu Yao - yao.hanf@northeastern.edu

## Project Overview

This project tackles the problem of predicting video game ratings using machine learning. We're building two complementary models: a neural network (MLP) for prediction and a Bayesian model for understanding feature importance. The goal is to help game publishers estimate market reception before release, assist digital storefronts in identifying quality titles, and provide indie developers with data-driven design feedback.

### Research Questions

**Prediction (MLP):**
- Can we predict how well a new game will score before it releases?
- What combination of features (genre, platform, art style, etc.) best predicts ratings?

**Understanding (Bayesian Modeling):**
- Which game features are most strongly associated with higher or lower ratings?
- Do certain genres or platforms consistently lead to better reception?
- How does review sentiment relate to numerical ratings?
- Does release timing matter?

## Dataset

**Source:** [Video Game Reviews and Ratings - Kaggle](https://www.kaggle.com/datasets/jahnavipaliwal/video-game-reviews-and-ratings/data)

The dataset includes:
- Game metadata (title, genre, platform, release year)
- User ratings
- Review text and sentiment
- Various other game attributes

## Methods

### 1. Neural Network (MLP) - Python
- **Architecture:** Wide & Deep inspired model
- **Purpose:** Predict game ratings from metadata
- **Implementation:** Manual (NumPy-based), no pre-built modeling packages
- **Features:** Genre, platform, release year, review sentiment, etc.

### 2. Bayesian Modeling - R
- **Purpose:** Understand feature importance and uncertainty
- **Implementation:** Using R's Bayesian libraries
- **Focus:** Identifying which features most strongly predict ratings

## Project Structure
```
game-rating-prediction/
├── README.md
├── data/
│   ├── raw/                  # Original dataset
│   └── processed/            # Cleaned and preprocessed data
├── src/
│   ├── python/
│   │   ├── data_preprocessing.py
│   │   ├── mlp_model.py      # Manual MLP implementation
│   │   ├── train.py
│   │   └── evaluate.py
│   └── r/
│       ├── data_preprocessing.R
│       ├── bayesian_model.R
│       └── analysis.R
├── notebooks/
│   ├── exploratory_analysis.ipynb
│   └── results_visualization.ipynb
├── results/
│   ├── figures/
│   └── metrics/
├── reports/
│   ├── literature_review.pdf
│   ├── final_report.pdf
│   └── poster.pdf
└── requirements.txt
```

## Setup & Installation

### Python Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### R Environment
```R
# Install required packages
install.packages(c("tidyverse", "caret", "rstan", "bayesplot"))
```

## Current Status

- [x] Team formed and registered
- [x] Dataset identified and downloaded
- [x] Literature review completed
- [ ] Data preprocessing pipeline
- [ ] MLP model implementation
- [ ] Bayesian model implementation
- [ ] Model evaluation and comparison
- [ ] Final report and poster

## Timeline

| Milestone | Due Date |
|-----------|----------|
| Phase I: Literature Review + GitHub Setup | Nov 7, 2025 |
| Project Check-In | Week of Nov 17, 2025 |
| Final Report & Poster | Dec 4, 2025 |

## Key References

1. **Cheng et al. (2016)** - "Wide & Deep Learning for Recommender Systems" - Neural network architecture for recommendations
2. **Hasan et al. (2024)** - "Review-Based Recommender Systems" - Survey of review-based approaches
3. **Lim & Teh (2007)** - "Variational Bayesian Approach to Movie Rating Prediction" - Bayesian methods for ratings
4. **Sifa et al. (2021)** - "Large-Scale Cross-Game Player Behavior Analysis on Steam" - Understanding game success metrics

Full bibliography available in `reports/literature_review.pdf`

## Usage

*(To be updated as implementation progresses)*

### Training the MLP
```python
python src/python/train.py --data data/processed/train.csv --epochs 100
```

### Running Bayesian Analysis
```R
source("src/r/bayesian_model.R")
```

## Results

*(To be updated with final results)*

## License

This project is for educational purposes as part of DS 4420 at Northeastern University.

## Contact

For questions or collaboration inquiries, please contact the team members listed above.
