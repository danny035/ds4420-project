# Game Rating Prediction System

**DS 4420: Machine Learning and Data Mining 2 - Fall 2025**  
**Professor:** Eric Gerber  
**Northeastern University**

**Team Members:**
- Kaan Tural - tural.k@northeastern.edu
- Hanfu Yao - yao.hanf@northeastern.edu

---

## Project Overview

This project predicts video game user ratings using two complementary machine learning approaches: a manually-implemented Wide & Deep neural network and a Bayesian regression model. We compare these methods on a dataset of ~6,800 games to understand which features most strongly influence player satisfaction.

**Key Results:**
- Wide & Deep MLP: **10.6 RMSE** (28% improvement over baseline)
- Bayesian Regression: **10.9 RMSE** (26% improvement over baseline)
- Most important feature: Critic Score (+9.05 points per standard deviation)

---

## Dataset

**Source:** [Video Game Sales with Ratings](https://www.kaggle.com/datasets/rush4ratio/video-game-sales-with-ratings) (Kaggle)

The dataset includes:
- ~6,800 video games released before 2016
- Platform (PS2, Xbox, PC, etc.)
- Genre (Action, RPG, Sports, etc.)
- ESRB Rating (E, T, M, etc.)
- Critic scores and review counts
- User ratings (0-10 scale, rescaled to 0-100)
- Regional and global sales figures

---

## Methods

### Wide & Deep MLP (Python/NumPy)
A manually-implemented neural network inspired by Google's Wide & Deep architecture. The **deep path** learns smooth, non-linear patterns through two hidden layers (32 → 16 neurons), while the **wide path** directly captures specific Platform × Genre interactions using a linear layer.

**Implementation:** Manual backpropagation with mini-batch gradient descent, L2 regularization, and ReLU activations. No high-level frameworks (PyTorch/TensorFlow) used.

### Bayesian Regression (R/brms)
A probabilistic linear model using MCMC inference to provide interpretable coefficients with uncertainty quantification. Features were grouped (rare platforms/genres → "Other") to ensure convergence.

**Implementation:** brms/Stan with weakly informative priors and 4-chain MCMC sampling.

---

## Project Structure
```
game-rating-prediction/
├── Bayesian/
│   ├── bayesian_model.R              # Main Bayesian model training script
│   ├── bayesian_analysis.Rmd         # Analysis and visualization notebook
│   ├── bayesian_analysis.html        # Rendered analysis report
│   ├── bayesian_model.rds            # Saved trained model
│   ├── feature_importance.csv        # Extracted coefficients
│   └── Video_Games_Sales_preprocessing.csv
├── MLP/
│   ├── DS4420_MLP.ipynb              # Wide & Deep model implementation
│   ├── DS4420 Final Project EDA (2).ipynb  # Exploratory data analysis
│   ├── Video_Games_Sales_as_at_22_Dec_2016.csv
│   └── Video_Games_Sales_preprocessing.csv
├── Reports/
│   ├── DS4420_Project_Phase1 (1).pdf # Literature review
│   └── Game Recommandation.pdf       # Final poster
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Python Requirements
```bash
pip install numpy pandas matplotlib seaborn jupyter
```

### R Requirements
```R
install.packages(c("brms", "tidyverse", "ggplot2"))
```

---

## Usage

### Running the MLP
1. Open `MLP/DS4420_MLP.ipynb` in Jupyter Notebook or JupyterLab
2. Select "Run All" to execute the complete pipeline:
   - Data preprocessing and standardization
   - Wide & Deep model training (200 epochs)
   - Validation performance evaluation
   - Results visualization

### Running the Bayesian Model
1. Open RStudio or R console
2. Set working directory: `setwd("Bayesian/")`
3. Run the main script:
```R
   source("bayesian_model.R")
```
4. For full analysis with visualizations, knit `bayesian_analysis.Rmd`

---

## Key Results

### Performance Comparison

| Model | RMSE | Improvement |
|-------|------|-------------|
| Baseline (mean) | 14.7 | --- |
| Wide & Deep MLP | 10.6 | 28% |
| Bayesian Regression | 10.9 | 26% |

### Most Important Features (Bayesian Model)

1. **Critic Score** (+9.05): Strongest predictor by far
2. **Genre: Sports** (-4.69): Sports games rated lower
3. **Platform: PC** (-4.34): PC games rated lower on average
4. **Platform: PS2** (+2.65): PS2 games rated higher
5. **Year of Release** (-2.32): Older games rated higher (possible survivorship bias)

---

## Key Findings

Both models achieved similar predictive performance (~27% improvement over baseline), validating that they captured real patterns in the data. The Bayesian model provided additional interpretability through coefficient estimates and uncertainty quantification, while the MLP offered flexibility to capture non-linear interactions through its deep architecture.

The close performance between models suggests that the relationship between features and ratings is largely linear, with the MLP's deep architecture providing marginal gains through non-linear interactions captured in the wide path's cross-features.

---

## References

1. Cheng, H. T., et al. (2016). "Wide & Deep Learning for Recommender Systems." *Proceedings of the 1st Workshop on Deep Learning for Recommender Systems*.
2. Lim, Y. J., & Teh, Y. W. (2007). "Variational Bayesian Approach to Movie Rating Prediction." *Proceedings of KDD Cup and Workshop*.
3. Sifa, R., et al. (2021). "Large-Scale Cross-Game Player Behavior Analysis on Steam." *IEEE Transactions on Games*.

Full bibliography available in `Reports/DS4420_Project_Phase1 (1).pdf`

---

## Notes

- The preprocessed datasets are identical between MLP and Bayesian folders for reproducibility
- Training the Bayesian model takes ~5-10 minutes on a standard laptop
- The MLP trains in ~2-3 minutes with mini-batch gradient descent

---

## License

This project was completed for educational purposes as part of DS 4420 at Northeastern University, Fall 2025.
