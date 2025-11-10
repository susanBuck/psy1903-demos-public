#### import_est_from_osf.R -----------------------------------------------------
## Purpose: Download Emotional Stroop CSVs from OSF into data/raw/
## - Works with PUBLIC OSF components out of the box.
## - If TOKEN is defined, uses it for PRIVATE components.
## - Handles OSF pagination & flattens safely
## - Filters by prefix + date

if (!require("pacman")) {install.packages("pacman"); require("pacman")}
p_load("httr", "jsonlite", "fs", "stringr", "lubridate")

## ----------------------------- CONFIG ---------------------------------------
NODE         <- "crbtp"                         # your OSF component ID
PREFIX       <- "est-experiment"                # only download files matching this prefix
CUTOFF_DATE  <- lubridate::ymd("2025-11-01")    # only files modified AFTER this date
DATA_DIR     <- "../data/raw"                   # destination folder

## Optional for PRIVATE components (leave undefined for public):
## TOKEN <- "paste_your_OSF_personal_access_token_here"

## Helper: add auth header only if TOKEN is available
add_auth <- function(...) {
  if (exists("TOKEN") && is.character(TOKEN) && nzchar(TOKEN)) {
    httr::add_headers(Authorization = paste("Bearer", TOKEN))
  } else {
    NULL
  }
}

## ----------------------- FETCH PAGINATED FILE LIST --------------------------
BASE <- paste0("https://api.osf.io/v2/nodes/", NODE, "/files/osfstorage/")
resp <- httr::GET(BASE, add_auth())
httr::stop_for_status(resp)

page <- jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"), flatten = TRUE)
all_pages <- list(page)

## Follow pagination
while (!is.null(all_pages[[length(all_pages)]]$links$`next`) &&
       nzchar(all_pages[[length(all_pages)]]$links$`next`)) {
  nxt <- all_pages[[length(all_pages)]]$links$`next`
  resp <- httr::GET(nxt, add_auth())
  httr::stop_for_status(resp)
  all_pages[[length(all_pages) + 1]] <-
    jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"), flatten = TRUE)
}

## Map each page to a uniform data frame (avoid rbind() column mismatch)
page_to_df <- function(p) {
  d <- as.data.frame(p$data, stringsAsFactors = FALSE)
  data.frame(
    id            = if ("id" %in% names(d)) d$id else NA_character_,
    name          = if ("attributes.name" %in% names(d)) d$attributes.name else NA_character_,
    kind          = if ("attributes.kind" %in% names(d)) d$attributes.kind else NA_character_,
    date_modified = if ("attributes.date_modified" %in% names(d)) d$attributes.date_modified else NA_character_,
    download      = if ("links.download" %in% names(d)) d$links.download else NA_character_,
    stringsAsFactors = FALSE
  )
}

pages_df <- lapply(all_pages, page_to_df)
rows <- do.call(rbind, pages_df)

## Keep only files
files <- rows[rows$kind == "file" & !is.na(rows$download), , drop = FALSE]

## Parse modification date and filter
files$modified <- suppressWarnings(lubridate::ymd_hms(files$date_modified, tz = "UTC"))
keep <- stringr::str_detect(files$name, stringr::fixed(PREFIX)) & (files$modified > CUTOFF_DATE)
files_subset <- files[keep, , drop = FALSE]

## ------------------------------- DOWNLOAD -----------------------------------
if (!fs::dir_exists(DATA_DIR)) fs::dir_create(DATA_DIR)

## Standardize header names in-memory after download
fix_names <- function(df) {
  nms <- names(df)
  nms[nms == "trial_type"] <- "trialType"
  names(df) <- nms
  df
}

for (i in seq_len(nrow(files_subset))) {
  name <- files_subset$name[i]
  url  <- files_subset$download[i]
  dest <- fs::path(DATA_DIR, name)
  
  r <- httr::GET(url, add_auth())
  httr::stop_for_status(r)
  writeBin(httr::content(r, as = "raw"), dest)
  
  ## Read, standardize headers, and write back cleanly
  df <- try(utils::read.csv(dest, stringsAsFactors = FALSE), silent = TRUE)
  if (!inherits(df, "try-error")) {
    df <- fix_names(df)
    utils::write.csv(df, dest, row.names = FALSE)
  }
}

## ------------------ REINTRODUCE NAMES ----------------------------------------
target_file <- file.path(DATA_DIR, "est-experiment-2025-11-05-10-11-45.csv")

if (file.exists(target_file)) {
  lines <- readLines(target_file)
  lines[1] <- sub("\\btrialType\\b", "trial_type", lines[1])
  writeLines(lines, target_file)
}

## ------------------------------- DONE ---------------------------------------
invisible(TRUE)
rm("add_auth", "all_pages", "BASE", "CUTOFF_DATE", "DATA_DIR", "dest", "df", "files", "files_subset", "fix_names", "i", "keep", "lines", "name", "NODE", "nxt", "page", "page_to_df", "pages_df", "PREFIX", "r", "resp", "rows", "target_file", "url")
