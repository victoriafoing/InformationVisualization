import json

import pandas as pd
import requests


def transform_properties(infile: str, outfile: str) -> None:
    df = pd.read_csv(infile, sep='\t')
    features = [
        'Number of characters',
        'Number of characters without counting white space',
        'Fraction of alphabetical characters', 'Fraction of digits',
        'Fraction of uppercase characters', 'Fraction of white spaces',
        'Fraction of special characters, such as comma, exclamation mark, etc.',
        'Number of words', 'Number of unique works',
        'Number of long words (at least 6 characters)', 'Average word length',
        'Number of unique stopwords', 'Fraction of stopwords',
        'Number of sentences', 'Number of long sentences (at least 10 words)',
        'Average number of characters per sentence',
        'Average number of words per sentence', 'Automated readability index',
        'Positive sentiment calculated by VADER',
        'Negative sentiment calculated by VADER',
        'Compound sentiment calculated by VADER', 'LIWC_Funct', 'LIWC_Pronoun',
        'LIWC_Ppron', 'LIWC_I', 'LIWC_We', 'LIWC_You', 'LIWC_SheHe',
        'LIWC_They', 'LIWC_Ipron', 'LIWC_Article', 'LIWC_Verbs', 'LIWC_AuxVb',
        'LIWC_Past', 'LIWC_Present', 'LIWC_Future', 'LIWC_Adverbs',
        'LIWC_Prep', 'LIWC_Conj', 'LIWC_Negate', 'LIWC_Quant', 'LIWC_Numbers',
        'LIWC_Swear', 'LIWC_Social', 'LIWC_Family', 'LIWC_Friends',
        'LIWC_Humans', 'LIWC_Affect', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx',
        'LIWC_Anger', 'LIWC_Sad', 'LIWC_CogMech', 'LIWC_Insight', 'LIWC_Cause',
        'LIWC_Discrep', 'LIWC_Tentat', 'LIWC_Certain', 'LIWC_Inhib',
        'LIWC_Incl', 'LIWC_Excl', 'LIWC_Percept', 'LIWC_See', 'LIWC_Hear',
        'LIWC_Feel', 'LIWC_Bio', 'LIWC_Body', 'LIWC_Health', 'LIWC_Sexual',
        'LIWC_Ingest', 'LIWC_Relativ', 'LIWC_Motion', 'LIWC_Space',
        'LIWC_Time', 'LIWC_Work', 'LIWC_Achiev', 'LIWC_Leisure', 'LIWC_Home',
        'LIWC_Money', 'LIWC_Relig', 'LIWC_Death', 'LIWC_Assent',
        'LIWC_Dissent', 'LIWC_Nonflu', 'LIWC_Filler'
    ]

    new_cols = df["PROPERTIES"].str.split(",", expand=True)
    for i, feat in enumerate(features):
        df[feat] = new_cols[i]
    df = df.drop(columns='PROPERTIES')

    df.to_csv(outfile, sep='\t')


def filter_properties(infile: str, outfile: str, other_columns=None) -> None:
    df = pd.read_csv(infile, sep='\t', index_col=0)

    columns = [
        'SOURCE_SUBREDDIT', 'TARGET_SUBREDDIT', 'POST_ID', 'TIMESTAMP',
        'LINK_SENTIMENT'
    ]
    if other_columns is not None:
        columns.extend(other_columns)

    df[columns].to_csv(outfile, sep='\t')


def process_embeddings(infile: str, outfile: str) -> None:
    with open(infile) as infile:
        lines = infile.readlines()

    for i, line in enumerate(lines):
        line = line[:-1].split(',')
        line = f"{line[0]},{' '.join(line[1:])}"
        lines[i] = line

    with open(outfile, 'w') as outfile:
        outfile.write('SUBREDDIT_ID,EMBEDDING\n')
        for line in lines:
            outfile.write(f'{line}\n')


def filter_embeddings(infile: str, outfile: str, n: int) -> None:
    df = pd.read_csv(infile, index_col='SUBREDDIT_ID')
    most_active = most_active_sr('reddit-body-filtered.tsv',
                                 'reddit-title-filtered.tsv', n)
    df.loc[most_active].to_csv(outfile)


def fetch_thumbnails_description(outfile: str, n: int) -> None:
    most_active = most_active_sr('reddit-body-filtered.tsv',
                                 'reddit-title-filtered.tsv', n)

    thumbnails = []
    public_descriptions = []

    for sr in most_active:
        url = 'https://www.reddit.com/r/' + sr + '/about.json'
        sr_info = requests.get(
            url, headers={'User-agent': 'Reddit Visualization Project'})

        if sr_info.status_code == 200:
            sr_info = sr_info.json()['data']

            community_icon = sr_info['community_icon']
            icon_img = sr_info['icon_img']

            if community_icon != '':
                thumbnails.append(community_icon)
            elif icon_img != '':
                thumbnails.append(icon_img)
            else:
                thumbnails.append(
                    'https://styles.redditmedia.com/t5_6/styles/communityIcon_a8uzjit9bwr21.png'
                )

            description = sr_info['public_description']
            if description != '':
                public_descriptions.append(description)
            else :
                public_descriptions.append("This subreddit does not have a description")

        elif sr_info.status_code in [403, 404]:
            sr_info = sr_info.json()

            thumbnails.append(
                'https://styles.redditmedia.com/t5_6/styles/communityIcon_a8uzjit9bwr21.png'
            )
            public_descriptions.append(
                f"data not found because the subreddit is {sr_info['reason']}")
            print(f"data not found for {sr} because it is {sr_info['reason']}")

        else:
            print("Other status code")
            print(sr_info.status_code)
            print(sr_info.json())

    df = pd.Index(most_active, name='SUBREDDIT_ID')
    df = pd.DataFrame(index=df)
    df['THUMBNAILS'] = thumbnails
    df['PUBLIC_DESCRIPTIONS'] = public_descriptions

    df.to_csv(outfile)


if __name__ == '__main__':
    from utils import most_active_sr

    import os.path

    if not os.path.exists('reddit-body.tsv'):
        transform_properties('soc-redditHyperlinks-body.tsv',
                             'reddit-body.tsv')

    if not os.path.exists('reddit-body-filtered.tsv'):
        filter_properties('reddit-body.tsv', 'reddit-body-filtered.tsv')

    if not os.path.exists('reddit-title.tsv'):
        transform_properties('soc-redditHyperlinks-title.tsv',
                             'reddit-title.tsv')

    if not os.path.exists('reddit-title-filtered.tsv'):
        filter_properties('reddit-title.tsv', 'reddit-title-filtered.tsv')

    if not os.path.exists('reddit-embedding.csv'):
        process_embeddings('web-redditEmbeddings-subreddits.csv',
                           'reddit-embedding.csv')

    n = 250

    if not os.path.exists('reddit-embedding-filtered.csv'):
        filter_embeddings('reddit-embedding.csv',
                          'reddit-embedding-filtered.csv', n)

    if not os.path.exists('reddit-embedding-thumbnail-description.csv'):
        fetch_thumbnails_description(
            'reddit-embedding-thumbnail-description.csv', n)
