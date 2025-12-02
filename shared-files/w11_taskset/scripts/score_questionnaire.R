#### Q6.1 Score ESQ-9 ----------------------------------------------------------
## Purpose: Take a JSON string from the questionnaire row and return a single score.
## Scale: jsPsychSurveyLikert default 0–4. Reverse items: 2, 5, 9.
## Example input: participant_data[participant_data$trialType == "questionnaire", "response"]

score_questionnaire <- function(json_string, 
                                reverse = c(2, 5, 9), 
                                scale_min = 0L, 
                                scale_max = 4L) {
  
  # If a tibble/data frame was passed, pull the first column
  if (is.data.frame(json_string)) {
    json_string <- json_string[[1]]
  }
  
  # Use only the first element, in case a vector is passed
  json_string <- json_string[1]
  
  # Guard against length-0 and NA / empty strings
  if (length(json_string) == 0 || is.na(json_string) || !nzchar(json_string)) {
    return(NA_real_)
  }
  
  ## 1) Parse the JSON string into an R object
  responses <- jsonlite::fromJSON(json_string)
  
  ## 2) Flatten and convert to numeric
  responses <- as.numeric(unlist(responses))
  
  # If reverse is provided, it must reference valid item positions
  if (length(reverse) > 0) {
    if (any(reverse < 1 | reverse > length(responses))) {
      stop("One or more 'reverse' item indices are out of range for this questionnaire response.")
    }
  }
  
  ## 3) Reverse-score the specified items
  if (length(reverse) > 0) {
    responses[reverse] <- (scale_max + scale_min) - responses[reverse]
  }
  
  ## 5) Compute the final score
  sum_score <- sum(responses, na.rm = TRUE)
  
  return(sum_score)
}