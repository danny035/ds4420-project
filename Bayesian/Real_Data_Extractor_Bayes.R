# File made solely to get data for displaying on the website

library(brms)
df <- read.csv("Video_Games_Sales_preprocessing.csv")

set.seed(42)
n <- nrow(df)
train_indices <- sample(1:n, size = floor(0.8 * n))

train_data <- df[train_indices, ]
validation_data <- df[-train_indices, ]

# Function to group rare levels
group_rare_levels <- function(data, column_name, min_count = 100) {
  counts <- table(data[[column_name]])
  rare_levels <- names(counts[counts < min_count])
  
  data[[paste0(column_name, "_grouped")]] <- as.character(data[[column_name]])
  data[[paste0(column_name, "_grouped")]][data[[column_name]] %in% rare_levels] <- "Other"
  data[[paste0(column_name, "_grouped")]] <- as.factor(data[[paste0(column_name, "_grouped")]])
  
  return(data)
}

# Group platforms (< 100 observations → "Other")
train_data <- group_rare_levels(train_data, "Platform", min_count = 100)
validation_data <- group_rare_levels(validation_data, "Platform", min_count = 100)

# Group genres (< 100 observations → "Other")
train_data <- group_rare_levels(train_data, "Genre", min_count = 100)
validation_data <- group_rare_levels(validation_data, "Genre", min_count = 100)

# Function to scale using training set statistics
scale_with_train_stats <- function(train_col, val_col) {
  train_mean <- mean(train_col, na.rm = TRUE)
  train_sd <- sd(train_col, na.rm = TRUE)
  
  val_scaled <- (val_col - train_mean) / train_sd
  return(val_scaled)
}

# Scale Year_of_Release
validation_data$Year_of_Release_scaled <- scale_with_train_stats(
  train_data$Year_of_Release,
  validation_data$Year_of_Release
)

# Scale Critic_Score
validation_data$Critic_Score_scaled <- scale_with_train_stats(
  train_data$Critic_Score,
  validation_data$Critic_Score
)

# Scale User_Count
validation_data$User_Count_scaled <- scale_with_train_stats(
  train_data$User_Count,
  validation_data$User_Count
)

# Scale Global_Sales
validation_data$Global_Sales_scaled <- scale_with_train_stats(
  train_data$Global_Sales,
  validation_data$Global_Sales
)

bayesian_model <- readRDS("bayesian_model.rds")
bayesian_predictions <- predict(bayesian_model, newdata = validation_data, summary = TRUE)
bayesian_pred <- bayesian_predictions[, "Estimate"]
actual_values <- validation_data$User_Rating

results <- data.frame(
  actual = actual_values,
  bayesian = bayesian_pred
)

# Remove any NAs
results <- results[complete.cases(results), ]

write.csv(results, "bayesian_predictions.csv", row.names = FALSE)