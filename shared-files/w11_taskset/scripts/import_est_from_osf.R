#### import_est_from_osf.R -----------------------------------------------------
## Purpose: Download Emotional Stroop CSVs from OSF into data/raw/

if (!require("pacman")) {install.packages("pacman"); require("pacman")}
p_load("httr", "jsonlite", "fs", "stringr", "lubridate", "here")

## ----------------------------- CONFIG ---------------------------------------
NODE         <- "crbtp"
PREFIX       <- "est-experiment"
CUTOFF_DATE  <- lubridate::ymd("2025-11-01")
DATA_DIR     <- here::here("data/raw")
VERBOSE      <- TRUE # turn console messages on/off

## Optional:
## TOKEN <- "paste_your_OSF_personal_access_token_here"

add_auth <- function(...) {
    if (exists("TOKEN") && is.character(TOKEN) && nzchar(TOKEN)) {
        httr::add_headers(Authorization = paste("Bearer", TOKEN))
    } else {
        NULL
    }
}

## ----------------------- FETCH PAGINATED FILE LIST --------------------------
BASE <- paste0("https://api.osf.io/v2/nodes/", NODE, "/files/osfstorage/")
if (VERBOSE) cat("Fetching OSF file list ...\n")       # <<<

resp <- httr::GET(BASE, add_auth())
httr::stop_for_status(resp)

page <- jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"), flatten = TRUE)
all_pages <- list(page)

page_idx <- 1                                         # <<<
repeat {                                              # <<<
    next_link <- all_pages[[length(all_pages)]]$links$`next`
    if (is.null(next_link) || !nzchar(next_link)) break
    page_idx <- page_idx + 1
    if (VERBOSE) cat(sprintf("  • Page %d ...\n", page_idx))  # <<<
    resp <- httr::GET(next_link, add_auth())
    httr::stop_for_status(resp)
    all_pages[[length(all_pages) + 1]] <-
        jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"), flatten = TRUE)
}

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

files <- rows[rows$kind == "file" & !is.na(rows$download), , drop = FALSE]
files$modified <- suppressWarnings(lubridate::ymd_hms(files$date_modified, tz = "UTC"))
keep <- stringr::str_detect(files$name, stringr::fixed(PREFIX)) & (files$modified > CUTOFF_DATE)
files_subset <- files[keep, , drop = FALSE]

if (VERBOSE) {
    cat(sprintf("Found %d candidate files; %d match prefix/date filter.\n",
                nrow(files), nrow(files_subset)))       # <<<
}

## ------------------------------- DOWNLOAD -----------------------------------
if (!fs::dir_exists(DATA_DIR)) fs::dir_create(DATA_DIR)

fix_names <- function(df) {
    nms <- names(df)
    nms[nms == "trial_type"] <- "trialType"
    names(df) <- nms
    df
}

if (nrow(files_subset) == 0L) {
    if (VERBOSE) cat("No files to download — exiting.\n")
} else {
    # Overall progress bar
    pb <- utils::txtProgressBar(min = 0, max = nrow(files_subset), style = 3)  # <<<
    on.exit(close(pb), add = TRUE)                                             # <<<
    
    for (i in seq_len(nrow(files_subset))) {
        name <- files_subset$name[i]
        url  <- files_subset$download[i]
        dest <- fs::path(DATA_DIR, name)
        
        if (VERBOSE) cat(sprintf("\n[%d/%d] Downloading %s ...\n", i, nrow(files_subset), name))  # <<<
        
        # Per-file HTTP progress indicator (prints bytes/%) in console
        r <- httr::GET(url, add_auth(), httr::progress())    # <<<
        httr::stop_for_status(r)
        writeBin(httr::content(r, as = "raw"), dest)
        
        # Read, standardize headers, and write back cleanly
        df <- try(utils::read.csv(dest, stringsAsFactors = FALSE), silent = TRUE)
        if (!inherits(df, "try-error")) {
            df <- fix_names(df)
            utils::write.csv(df, dest, row.names = FALSE)
        }
        
        utils::setTxtProgressBar(pb, i)                      # <<<
    }
    if (VERBOSE) cat("\nAll downloads complete.\n")        # <<<
}

## ------------------ REINTRODUCE NAMES ----------------------------------------
target_file <- file.path(DATA_DIR, "est-experiment-2025-11-05-10-11-45.csv")

if (file.exists(target_file)) {
    lines <- readLines(target_file)
    lines[1] <- sub("\\btrialType\\b", "trial_type", lines[1])
    writeLines(lines, target_file)
    if (VERBOSE) cat("Header tweak applied to:", basename(target_file), "\n")   # <<<
}

## ------------------------------- DONE ---------------------------------------
invisible(TRUE)
rm("add_auth", "all_pages", "BASE", "CUTOFF_DATE", "DATA_DIR", "dest", "df", "files", "files_subset",
   "fix_names", "i", "keep", "lines", "name", "NODE", "page", "page_to_df", "pages_df", "PREFIX",
   "resp", "rows", "target_file", "url")
