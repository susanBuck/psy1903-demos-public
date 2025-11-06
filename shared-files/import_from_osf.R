#### Install and Load Packages -------------------------------------------------
if (!require("pacman")) {install.packages("pacman"); require("pacman")}
p_load("httr", "jsonlite", "fs", "stringr", "lubridate")



#### Setup ---------------------------------------------------------------------
## 1. Personal Access Token (authentication)
## To allow R to connect to your OSF account:
## Go to OSF → Profile icon (top right) → Settings → Personal Access Tokens.
## Click "Create Token", name it (e.g., "OSF_API"), check all permissions,
## and copy the generated string below. This token works like a password,
## so keep it private and do not share it publicly.

## TOKEN <- "paste_your_token_here"
TOKEN <- "SzqxYX88znq4U5Epy5JV3t8NsH88RWLygXhLq1gi6hj5HWiEfBeQ4ORNaikCObqohPZL8G"

## 2. Project Node ID (location of your data)
## Each OSF project or component has a unique 5-character node ID.
## To find it, open your OSF project in a browser:
## Example URL: https://osf.io/avm5d/
## The part after "osf.io/" (here, "avm5d") is the node ID for that project
## or component. Copy and paste that string below.

## NODE <- "paste_your_node_here"
NODE <- "avm5d"

## Only download files matching this prefix
PREFIX <- "lexical-decision"

## Only download files modified after this date (UTC)
CUTOFF_DATE <- ymd("2025-10-15", tz = "UTC")

#### Fetch file listing --------------------------------------------------------
BASE <- paste0("https://api.osf.io/v2/nodes/", NODE, "/files/osfstorage/")
res <- GET(BASE, add_headers(Authorization = paste("Bearer", TOKEN)))
stop_for_status(res)
page <- fromJSON(content(res, as = "text", encoding = "UTF-8"), flatten = TRUE)

## Follow pagination if present
all <- list(page)
while (!is.null(all[[length(all)]]$links$`next`) && nzchar(all[[length(all)]]$links$`next`)) {
  nxt <- all[[length(all)]]$links$`next`
  res <- GET(nxt, add_headers(Authorization = paste("Bearer", TOKEN)))
  stop_for_status(res)
  all[[length(all) + 1]] <- fromJSON(content(res, as = "text", encoding = "UTF-8"), flatten = TRUE)
}

## Combine pages and keep only actual files
rows <- do.call(rbind, lapply(all, function(p) p$data))
files <- subset(rows, attributes.kind == "file")

#### Filter by prefix and modification date ------------------------------------
files$modified <- ymd_hms(files$attributes.date_modified, tz = "UTC")

files_subset <- subset(
  files,
  str_detect(attributes.name, fixed(PREFIX)) &
    modified > CUTOFF_DATE
)

message("Found ", nrow(files_subset), " matching files.")

#### Download ------------------------------------------------------------------
if (!dir_exists("osf_downloads")) dir_create("osf_downloads")

for (i in seq_len(nrow(files_subset))) {
  file_id <- files_subset$id[i]
  name    <- files_subset$attributes.name[i]
  path    <- fs::path("osf_downloads", name)
  
  url <- paste0("https://api.osf.io/v2/files/", file_id, "/?action=download&direct=1")
  r <- GET(url, add_headers(Authorization = paste("Bearer", TOKEN)))
  stop_for_status(r)
  writeBin(content(r, as = "raw"), path)
  message("Saved: ", path)
}

#### Remove Intermediate Steps -------------------------------------------------
rm(all, files, files_subset, page, r, res, rows, BASE, CUTOFF_DATE, file_id, i, name, NODE, path, PREFIX, TOKEN, url)

   