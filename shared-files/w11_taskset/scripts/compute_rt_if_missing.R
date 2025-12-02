#### Q5 Scoring and Cleaning: RT Recovery --------------------------------------
## Vector Version:
compute_rt_if_missing <- function(data) {
  data$rt <- ifelse(
    is.na(data$rt) & !is.na(data$stim_onset_ms) & !is.na(data$resp_time_ms),
    data$resp_time_ms - data$stim_onset_ms,
    data$rt
  )
  return(data)
}

## Loop Version:
# compute_rt_if_missing_loop <- function(data) {
#   for (i in seq_len(nrow(data))) {
#     if (is.na(data$rt[i]) &&
#         !is.na(data$stim_onset_ms[i]) &&
#         !is.na(data$resp_time_ms[i])) {
#       data$rt[i] <- data$resp_time_ms[i] - data$stim_onset_ms[i]
#     }
#   }
#   return(data)
# }