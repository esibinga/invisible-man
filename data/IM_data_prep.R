setwd("~evasibinga/advanced-studio-F20/Invisible-Man/data/")

#install.packages("quanteda")
library(quanteda)
install.packages("readtext")
require(readtext)
im.text <- readtext("invisible_man.txt", cache = FALSE)
my_corpus <- corpus(im.text)
summary(my_corpus, 5)

im_token <- tokens(my_corpus, remove_numbers = FALSE,  remove_punct = TRUE)
kwic(my_corpus, "invisible")

im_dfm <- dfm(my_corpus)

sim <- textstat_simil(im_dfm, im_dfm[, c("invisible", "man", "black")], 
                      method = "cosine", margin = "features")
lapply(as.list(sim), head, 10)

dispersion_plot(im.text, c("poor", "strange", "dead", "death", "wild", "dark", "whale", "ahab", "great", "well", "good", "right", "best", "work"),
                color = "black", bg.color = "grey90", horiz.color = "grey85",
                total.color = "black", symbol = "|", title = "Lexical Dispersion Plot in Invisible Man",
                rev.factor = TRUE, wrap = "'", xlab = NULL, ylab = "Word Frequencies",
                size = 3, plot = TRUE)
