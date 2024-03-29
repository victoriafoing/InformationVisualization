import numpy as np
import pandas as pd


df = pd.read_csv("reddit_title.tsv", sep="\t")
features = [
    'Number of characters',
    'Number of characters without counting white space',
    'Fraction of alphabetical characters',
    'Fraction of digits',
    'Fraction of uppercase characters',
    'Fraction of white spaces',
    'Fraction of special characters, such as comma, exclamation mark, etc.',
    'Number of words',
    'Number of unique works',
    'Number of long words (at least 6 characters)',
    'Average word length',
    'Number of unique stopwords',
    'Fraction of stopwords',
    'Number of sentences',
    'Number of long sentences (at least 10 words)', 'Average number of characters per sentence', 'Average number of words per sentence', 'Automated readability index', 'Positive sentiment calculated by VADER', 'Negative sentiment calculated by VADER', 'Compound sentiment calculated by VADER', 'LIWC_Funct', 'LIWC_Pronoun', 'LIWC_Ppron', 'LIWC_I', 'LIWC_We', 'LIWC_You', 'LIWC_SheHe', 'LIWC_They', 'LIWC_Ipron', 'LIWC_Article', 'LIWC_Verbs', 'LIWC_AuxVb', 'LIWC_Past', 'LIWC_Present', 'LIWC_Future', 'LIWC_Adverbs', 'LIWC_Prep', 'LIWC_Conj', 'LIWC_Negate', 'LIWC_Quant', 'LIWC_Numbers', 'LIWC_Swear', 'LIWC_Social', 'LIWC_Family', 'LIWC_Friends', 'LIWC_Humans', 'LIWC_Affect', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger', 'LIWC_Sad', 'LIWC_CogMech', 'LIWC_Insight', 'LIWC_Cause', 'LIWC_Discrep', 'LIWC_Tentat', 'LIWC_Certain', 'LIWC_Inhib', 'LIWC_Incl', 'LIWC_Excl', 'LIWC_Percept', 'LIWC_See', 'LIWC_Hear', 'LIWC_Feel', 'LIWC_Bio', 'LIWC_Body', 'LIWC_Health', 'LIWC_Sexual', 'LIWC_Ingest', 'LIWC_Relativ', 'LIWC_Motion', 'LIWC_Space', 'LIWC_Time', 'LIWC_Work', 'LIWC_Achiev', 'LIWC_Leisure', 'LIWC_Home', 'LIWC_Money', 'LIWC_Relig', 'LIWC_Death', 'LIWC_Assent', 'LIWC_Dissent', 'LIWC_Nonflu', 'LIWC_Filler']

# new_cols = df["PROPERTIES"].str.split(",", n=len(features), expand=True)
# for i, feat in enumerate(features):
#     df[feat] = new_cols[i]

df.to_csv("reddit_title.csv")
print(df.head(5))
