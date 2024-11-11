#### (1) Setup initial directory structure -------------------------------------

## Start by setting your working directory to your psy1903 folder. Replace "~/Desktop/" with the correct path to your psy1903 directory:
setwd("~/Desktop/psy1903/")

## Create a new parent directory called "stats" where we will be doing all of our R work:
dir.create("stats/")

## Create a new directory called "rIntro" for today's exercises:
dir.create("stats/rIntro")
## Create a new subdirectories "data", "scripts", & "output" for today's exercises:
dir.create("stats/rIntro/data")
dir.create("stats/rIntro/scripts")
dir.create("stats/rIntro/output")

## Set working directory to the rIntro/scripts parent directory, which will be our home base for today:
setwd("~/Desktop/psy1903/stats/rIntro/scripts")

## Save this script as R_introduction.R within your scripts directory (you can just use command-S or File --> Save As)



#### (2) Installation of packages ----------------------------------------------

## Packages are essential toolboxes that you load into R and allow you to do cool things with your data
## One package called "pacman" makes installing packages very easy...

if (!require("pacman")) {install.packages("pacman"); require("pacman")}  # First install and load in pacman to R

## Then use p_load and a list of all of the packages that you need for the project (with each one being in "quotes")

p_load("tidyverse","rstudioapi","lme4","emmeans","psych","corrplot")  # tidyverse contains many packages like dplyr, tidyr, stringr, and ggplot2, among others, and the additional packages should cover our data manipulations, plotting, and analyses


#### (3) Basic Syntax ----------------------------------------------------------

### Comments
## Anything following a # will be a comment and will not be read by R when the script executes. Hashtags can be used at the beginning of the line to comment out the full line, or can be used after a line of code so that the remainder of the line is a comment:

# This is a comment
3 + 5 # This is also a comment, but the "3 + 5" before the hashtag is executable code

## R does not have the ability to comment out an entire block of code, you have to place a hashtag at the beginning of every line you want it to ignore. However, you can do this quickly by selecting all lines you want to comment out or uncomment and hitting: command-shift-C (Max) or control-shift-C (windows)



### Getting Help
## You can look up help for different functions in one of four ways:
## 1. Use the help function: help(function) will bring up the help documentation for a given function, or you can use help("function", package = "package") to read the help documentation for a function from a specific package if there are multiple functions with the same name
## 2. Use the ? feature to get help with a particular function: ?function will bring up the help documentation for a given function
## 3. Use the search feature under the Help panel
## 4. Use the ?? feature to search all functions for a particular string: ??"keyword" will search all functions for the keyword and bring up a list of help documentation to select from



### Expressions and Operators
# + for addition
# - for subtraction
# * for multiplication
# / for division
# ^ for exponentiation
# () can be used for more complex equations, R will follow order of operations



### Variable Assignment
## R assigns variables using the operator <-, following the syntax: 
## variable <- value/object you want to assign

## If you have already assigned a variable and then reassign it, R will overwrite the first assignment


#### (4) Existing Functions ----------------------------------------------------

## R has many existing functions, which typically follow the syntax:
## function_name(argument1, argument2, ...)
## The order of arguments is important, and the help feature can often tell you what the order should be.
## Some basic built-in functions are sum(), mean(), and length()
sum(1, 2, 3)       # Adds numbers 1, 2, and 3, returns 6
mean(c(1, 2, 3))   # Finds the mean (average) of the vector numbers. 
length(c(1, 2, 3)) # Finds the length of a vector, returns 3

## But if there are NA's or missing values, these can fail, so we can add arguments to tell R how to deal with NA's (or other relevant arguments as necessary)
mean(c(1, 2, 3, NA, 5)) # Will output NA because it doesn't know how to handle it
mean(c(1, 2, 3, NA, 5), na.rm = TRUE) # Will remove the NA and calculate the mean of the remaining numbers, outputting 2.75 (the correct answer)



#### (5) Reading in data -------------------------------------------------------

## Read in a csv of data
mydata <- read.csv("~/Desktop/psy1903/stats/rIntro/data/data.csv", header = TRUE, stringsAsFactors = FALSE, na.strings = c("NA", "?"))

## Check out some basics of the new dataframe
head(mydata)      # View the first few rows
str(mydata)       # See the structure of the data frame
summary(mydata)   # Get a summary of each column

## To change the structure of one column:
## Start by specifying the dataframe: mydata
## Using the $ to access or extract specific elements of a list or a data frame by their name, in this case moodGroup
mydata$moodGroup 

## If we look at the structure of mydata$moodGroup, we can see that it is currently a character. To turn it into a factor, we can use the as.factor() function:
as.factor(mydata$moodGroup)

## However, this just displays the list as a factor within the console, so we need to reassign it within our dataframe:
mydata$moodGroup <-- as.factor(mydata$moodGroup)

## Now if we check the structure of the dataframe, we can see that moodGroup is a factor and no longer a character
str(mydata)

## Don't forget to save your RScript and push/sync it to GitHub!
