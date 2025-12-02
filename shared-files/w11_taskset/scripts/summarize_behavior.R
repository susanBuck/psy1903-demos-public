#### Score Behavioral Data ------------------------------------

summarize_behavior <- function(data, rt_min = 300, rt_max = 900) {
  # Ensure all expected column names are there
  if (!all(c("block","condition","color","word","rt","response","correct",
             "stim_onset_ms","resp_time_ms") %in% names(data)) ||
      !any(c("trial_type", "trialType") %in% names(data))) {
    stop("Input data frame is missing required columns.")
  }
  if ("trial_type" %in% names(data)) {
    names(data)[names(data) == "trial_type"] <- "trialType"
  }
  
  ## Check if rt column is numeric 
  if (!is.numeric(data$rt)) {
    data$rt <- as.numeric(data$rt)
    warning("'rt' column was not numeric. Coerced with as.numeric().")
  }
  
  ## Change correct column to logical
  if (!is.logical(data$correct)) { 
    data$correct <- as.logical(data$correct) 
  }
  
  
  ## Filter out unreasonable reaction times (keep 300–900 ms)
  data_filtered    <- data[data$rt >= rt_min & 
                             data$rt <= rt_max, ]
  
  ## Calcluate mean accuracy
  mean_accuracy <- mean(data_filtered$correct, na.rm = TRUE)
  
  ## Calculate mean reaction time for only correct trials
  mean_rt_correct <- mean(data_filtered[data_filtered$correct == TRUE, ]$rt, na.rm = TRUE)
  
  ## Extra Credit: Calculate mean RT by condition
  emo_means <- tapply(data_filtered[data_filtered$correct == TRUE, ]$rt, 
                      data_filtered[data_filtered$correct == TRUE, ]$condition, 
                      FUN = mean, na.rm = TRUE)
  
  ## Create data frame
  participant_summary <- data.frame(
    mean_accuracy    = mean_accuracy,
    mean_rt_correct  = mean_rt_correct,
    mean_rt_negative = unname(emo_means["negative"]),
    mean_rt_positive = unname(emo_means["positive"]),
    mean_rt_neutral = unname(emo_means["neutral"]),
    stringsAsFactors   = FALSE
    )

  
  return(participant_summary)
}
