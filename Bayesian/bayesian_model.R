# bayesian_model.R
# Bayesian regression for game rating prediction
# Kaan & Hanfu - DS 4420 Final Project

library(brms)
library(bayesplot)
library(ggplot2)
library(tidybayes)

# Load preprocessed data (same file partner used)
df <- read.csv("Video_Games_Sales_preprocessing.csv")
cat("Dataset shape:", nrow(df), "x", ncol(df), "\n")

# Define features (matching partner's MLP)
target_col <- "User_Rating"
cat_cols <- c("Platform", "Genre", "Rating")
num_cols <- c("Year_of_Release", "Critic_Score", "Critic_Count", 
              "User_Score_Clean", "User_Count",
              "NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales", "Global_Sales")

needed_cols <- c(target_col, cat_cols, num_cols)

# Filter data - drop NAs and non-finite values
# Small detail, I get 6894 rows vs Hanfu's 6826 (68 row difference, ~1%)
# This small discrepancy likely comes from subtle differences in how
# R vs Python handle edge cases in filtering, shouldn't impact though, as I
# check after and there aren't any NAs remaining so nothing to worry about
df_clean <- df[needed_cols]
df_clean <- df_clean[complete.cases(df_clean), ]
for (col in num_cols) {
  df_clean <- df_clean[is.finite(df_clean[[col]]), ]
}

# Check if any NAs remain
cat("\n=== Checking for remaining NAs ===\n")
na_counts <- colSums(is.na(df_clean))
if (sum(na_counts) == 0) {
  cat("No NAs found in df_clean\n")
} else {
  cat("NAs still present:\n")
  print(na_counts[na_counts > 0])
}

cat("After filtering:", nrow(df_clean), "rows\n")

# Convert categorical variables to factors
df_clean$Platform <- as.factor(df_clean$Platform)
df_clean$Genre <- as.factor(df_clean$Genre)
df_clean$Rating <- as.factor(df_clean$Rating)

# Standardize numeric features
for (col in num_cols) {
  scaled_col <- paste0(col, "_scaled")
  df_clean[[scaled_col]] <- scale(df_clean[[col]])[,1]
}

# Train/val split (80/20)
set.seed(42)
n <- nrow(df_clean)
train_idx <- sample(1:n, size = floor(0.8 * n))
val_idx <- setdiff(1:n, train_idx)

train_data <- df_clean[train_idx, ]
val_data <- df_clean[val_idx, ]

cat("Train size:", nrow(train_data), "\n")
cat("Val size:", nrow(val_data), "\n")

# Group rare categorical levels to help convergence
cat("Grouping rare categorical levels\n")

platform_counts <- table(train_data$Platform)
major_platforms <- names(platform_counts[platform_counts >= 100])
train_data$Platform_grouped <- ifelse(train_data$Platform %in% major_platforms, 
                                      as.character(train_data$Platform), "Other")
val_data$Platform_grouped <- ifelse(val_data$Platform %in% major_platforms,
                                    as.character(val_data$Platform), "Other")

genre_counts <- table(train_data$Genre)
major_genres <- names(genre_counts[genre_counts >= 100])
train_data$Genre_grouped <- ifelse(train_data$Genre %in% major_genres,
                                   as.character(train_data$Genre), "Other")
val_data$Genre_grouped <- ifelse(val_data$Genre %in% major_genres,
                                 as.character(val_data$Genre), "Other")

train_data$Platform_grouped <- as.factor(train_data$Platform_grouped)
train_data$Genre_grouped <- as.factor(train_data$Genre_grouped)
val_data$Platform_grouped <- as.factor(val_data$Platform_grouped)
val_data$Genre_grouped <- as.factor(val_data$Genre_grouped)

cat("Platform levels:", nlevels(train_data$Platform_grouped), "\n")
cat("Genre levels:", nlevels(train_data$Genre_grouped), "\n")

# Model formula (excluding User_Score_Clean to avoid circular prediction, was a nagging problem until found)
model_formula <- bf(
  User_Rating ~ 
    Platform_grouped + Genre_grouped + Rating +
    Year_of_Release_scaled + Critic_Score_scaled + 
    User_Count_scaled + Global_Sales_scaled
)

# Weakly informative priors
priors <- c(
  prior(normal(70, 20), class = Intercept),
  prior(normal(0, 5), class = b),
  prior(student_t(3, 0, 10), class = sigma)
)

cat("Fitting Bayesian model")
bayes_model <- brm(
  formula = model_formula,
  data = train_data,
  family = gaussian(),
  prior = priors,
  chains = 4,
  iter = 2000,
  warmup = 1000,
  cores = 4,
  seed = 42,
  control = list(adapt_delta = 0.95),
  refresh = 200
)

cat("done fitting\n")
print(summary(bayes_model))

# Val performance
cat("Validation Performance\n")
val_predictions <- predict(bayes_model, newdata = val_data)
val_pred_mean <- val_predictions[, "Estimate"]
val_true <- val_data$User_Rating

val_mse <- mean((val_pred_mean - val_true)^2)
val_rmse <- sqrt(val_mse)
val_mae <- mean(abs(val_pred_mean - val_true))

baseline_pred <- mean(train_data$User_Rating)
baseline_mse <- mean((val_true - baseline_pred)^2)
baseline_rmse <- sqrt(baseline_mse)

cat("Validation RMSE:", val_rmse, "\n")
cat("Validation MAE:", val_mae, "\n")
cat("Baseline RMSE:", baseline_rmse, "\n")
cat("Improvement:", round((1 - val_rmse/baseline_rmse) * 100, 1), "%\n")

# Extract feature importance
posterior_samples <- as_draws_df(bayes_model)
coef_cols <- grep("^b_", names(posterior_samples), value = TRUE)
coef_cols <- coef_cols[coef_cols != "b_Intercept"]

feature_importance <- data.frame(
  feature = coef_cols,
  mean = sapply(coef_cols, function(x) mean(posterior_samples[[x]])),
  lower = sapply(coef_cols, function(x) quantile(posterior_samples[[x]], 0.025)),
  upper = sapply(coef_cols, function(x) quantile(posterior_samples[[x]], 0.975))
)
feature_importance$abs_mean <- abs(feature_importance$mean)
feature_importance <- feature_importance[order(-feature_importance$abs_mean), ]

# Save model and results
saveRDS(bayes_model, "bayesian_model.rds")
write.csv(feature_importance, "feature_importance.csv", row.names = FALSE)