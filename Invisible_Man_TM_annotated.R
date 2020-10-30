# Eva Sibinga
# Advisors: Professor Crystal Hall & Professor Guy Mark Foster
# Topic Modeling of Ralph Ellison's Invisible Man
# Fall 2016

# This is the annotated code that accompanies my project. This is written for the software R.
# The hashtag symbol (#) is used to make annotations-- please feel free to read along if you would like to see a bit about how topic modeling is done

# written using lda topic modeling code from Prof. Crystal Hall, as well as text analysis clean up based on code by Matthew Jockers

# STEP 0: set the working directory for this project, import a text file of Invisible Man downloaded from Project Gutenberg

setwd("~/Desktop/Fall16/Honors/Data")
IMtext.v <- scan("~/Desktop/Fall16/Honors/Data/invisible_man.txt", what="character", sep="\n")


# STEP 1: put the .txt file in a form usable in R, a vector of every word in the text (in the order they appear in the novel), with no punctuation etc

start.v <- which(IMtext.v == "PRINTED IN THE UNITED STATES OF AMERICA\\") # identify start point of actual text in Project Gutenberg file
end.v <- which(IMtext.v == "Who knows but that, on the lower frequencies, I speak for you?\\") #identify end point of text
start.metadata.v <- IMtext.v[1:start.v -1] 
end.metadata.v <- IMtext.v[ (end.v+1) :length(IMtext.v)]
metadata.v <- c(start.metadata.v, end.metadata.v) # metadata is the chunk before and the chunk after the novel text
novel.lines.v <- IMtext.v[start.v:end.v]
IMnovel.v <- paste(novel.lines.v, collapse=" ") # collapse carriage returns (which are preserved as they appear in the print edition)
IM.novel.lower.v <- tolower(IMnovel.v) # make the text all lowercase, since R would otherwise recognize "Man" and "man" as two separate strings
IM.words.l <- strsplit(IM.novel.lower.v, "\\W") 
IM.word.v <- unlist(IM.words.l) # make it into a vector file
not.blanks.v <- which(IM.word.v!="")
IM.word.v <- IM.word.v[not.blanks.v] # making a list of all the words in the text file


# STEP 2: identify chapter starts to divide text by chapter

chap.positions.v <- grep("^Chapter \\d", novel.lines.v) # find the start of each chapter so that I can separate the book and analyze by chapter
novel.lines.v <- c(novel.lines.v, "END")
last.position.v <- length(novel.lines.v)
chap.positions.v <- c(chap.positions.v, last.position.v) # make sure that R knows where the end of the last chapter is, otherwise it will try to look for the next (nonexistent) chapter and return an error message


# STEP 3: generate relative word frequencies for each chapter

chapter.raws.l <- list() # make empty lists, necessary for the next steps
chapter.freqs.l <- list()
strings.v <- character() # empty list in which to put values in the for loop below
for(i in 1:length(chap.positions.v)){
  if(i != length(chap.positions.v)){
    chapter.title <- novel.lines.v[chap.positions.v[i]]
    start <- chap.positions.v[i]+1
    end <- chap.positions.v[i+1]-1
    chapter.lines.v <- novel.lines.v[start:end]
    chapter.words.v <- tolower(paste(chapter.lines.v, collapse=" "))
    chapter.words.l <- strsplit(chapter.words.v, "\\W")
    chapter.word.v <- unlist(chapter.words.l)
    chapter.word.v <- chapter.word.v[which(chapter.word.v!="")]
    string <- paste(chapter.word.v, collapse=" ")
    strings.v[i] <- string
    chapter.freqs.t <- table(chapter.word.v)
    chapter.raws.l[[chapter.title]] <- chapter.freqs.t
    chapter.freqs.t.rel <- 100*(chapter.freqs.t/sum(chapter.freqs.t))
    chapter.freqs.l[[chapter.title]] <- chapter.freqs.t.rel
  }
}


# STEP 4: clean up the "chapters" file (which contains the text of each chapter)

#chapters <- strings.v
chapters <- gsub("'", "", chapters)  # remove apostrophes
chapters <- gsub("[[:punct:]]", " ", chapters)  # replace punctuation with space
chapters <- gsub("[[:cntrl:]]", " ", chapters)  # replace control characters with space
chapters <- gsub("^[[:space:]]+", "", chapters) # remove whitespace at beginning of chapters
chapters <- gsub("[[:space:]]+$", "", chapters) # remove whitespace at end of chapters
chapters <- gsub('[[:digit:]]+', '', chapters)  # remove number digits
chapters <- tolower(chapters)                   # force to lowercase
chapters <- iconv(strings.v,to='UTF-8-MAC', sub='byte')  # make text formatting readable by Macs


# STEP 5: Latent Dirichlet Allocation (LDA) topic modeling, using the R package(lda)

chapter.list <- strsplit(chapters, "[[:space:]]+") # recognize each word as a single token, and output all as a list

# compute the table of terms-- the number of times each word is used in the novel
term.table <- table(unlist(chapter.list))
term.table <- sort(term.table, decreasing = TRUE)
print(dim(term.table))
# remove terms that are stop words or occur fewer than 5 times (standard practice for topic modeling)
stopWordFile = "stopWordFile.txt"
stop_words = scan(stopWordFile, what = "character", sep = "\n")
del <- names(term.table) %in% stop_words | term.table < 5 # this number can also change
term.table <- term.table[!del]
term.table <- term.table[which(names(term.table) != "")]
vocab <- names(term.table)

# put the chapters into the format required by the lda topic modeling package:
get.terms <- function(x) {
  index <- match(x, vocab)
  index <- index[!is.na(index)]
  rbind(as.integer(index - 1), as.integer(rep(1, length(index))))
}
all.chapters <- lapply(chapter.list, get.terms)

# define variables necessary for lda topic modeling
D <- length(all.chapters)
W <- length(vocab)
chap.length <- sapply(all.chapters, function(x) sum(x[2, ]))
N <- sum(chap.length)
term.frequency <- as.integer(term.table)

# MCMC and model tuning parameters:
K <- 20 # number of topics -- this one has the greatest effect on the results
G <- 5000 # number of iterations of sampling over the corpus
alpha <- 0.2 # scalar value of Dirichlet hyperparameter for topic proportions
eta <- 0.2 # scalar value of Dirichlet hyperparameter for topic multinomials

# Fit the model: (infer topics across corpus using the parameters above)
# documentation for lda package:   https://cran.r-project.org/web/packages/lda/lda.pdf
install.packages("lda")
library(lda)
set.seed(357) # random number generator, but allows results to be reproduced
# if correctly understood, randomly generated results, like the topics, can be replicated on a corpus
t1 <- Sys.time()
# run the topic model!
fit <- lda.collapsed.gibbs.sampler(documents = all.chapters, K = K, vocab = vocab,
                                   num.iterations = G, alpha = alpha,
                                   eta = eta, initial = NULL, burnin = 1,
                                   compute.log.likelihood = TRUE)
t2 <- Sys.time()
t2 - t1  # 20 topics took about 4 minutes on my laptop


# STEP 6: write results into a user friendly format, a .csv file that can be opened as a Microsoft Excel spreadsheet

# make a "top.words" spreadsheet that contains the top 10 words in each of the 20 topics
top.words <- top.topic.words(fit$topics,10, by.score=TRUE)
write.csv(top.words, "IMTopWords_20_by_10.csv", row.names=FALSE)
# determine propotional relationships between topics-- i.e. how important is each topic within a chapter? or compared to the other topics?
topic.proportions <- t(fit$document_sums) / colSums(fit$document_sums)
# put column names on so that you know which topic is referred to
colnames(topic.proportions) <- apply(top.words, 2, paste, collapse=" ")


# STEP 7: change (reshape) data format in R so that it can be graphed using ggplot, my preferred tool for graphical analysis in R

# reshape the data from long format to wide format
library(reshape2)
topic.proportions.df <- cbind(data.frame(topic.proportions),
                                   chapter=factor(1:length(all.chapters), labels = "chapter"))
topic.proportions.melt.df <- melt(topic.proportions.df)

# show each chapter's representation of topics
write.csv(topic.proportions.df, "IM_20_by_10_TopicProportions.csv")


# STEP 8: Visualize the data in R!!

# I took out one extraneous topic in Excel, then re-uploaded the file to R as "IM_TM_19," which is used below in the visualization

library(ggplot2) 
install.packages("RColorBrewer")
library(RColorBrewer)            #install necessary packages for making graph and applying custom colors for better visualizations

colorCount <- length(unique(IM_TM_19$chapter))
getpalette <- colorRampPalette(brewer.pal(8, "Accent"))   # The normal color palette in ggplot will only use 11 colors, so I had to make my own palette with 19 colors (topic modeling for 20 topics, minus 1 extraneous )

ggplot(data=IM_TM_19, aes(x=chapter, y=value, group=variable, fill=variable)) +   # plot a graph using IM_TM_19 data, graphed by chapter on the x axis ("chapter") and topic model values on the y axis ("value"), with color fill applied based upon the topic identity ("variable")
  geom_bar(stat="identity") +    # make the plot a bar graph
  scale_x_discrete("chapter", labels=c("chapter000"="Pro.", "chapter001"="1", "chapter002"="2", "chapter003"="3", "chapter004"="4", "chapter005"="5", "chapter006"="6", "chapter007"="7", "chapter008"="8", "chapter009"="9", "chapter010"="10", "chapter011"="11", "chapter012"="12", "chapter013"="13", "chapter014"="14", "chapter015"="15", "chapter016"="16", "chapter017"="17","chapter018"= "18", "chapter019"="19", "chapter020"="20", "chapter021"="21", "chapter022"="22", "chapter023"="23", "chapter024"="24", "chapter025"="25", "chapter026"="Ep.")) +      # change x axis labels to be more readable
  scale_fill_manual(values=getpalette(colorCount))       # apply custom color palette to improve visualization


