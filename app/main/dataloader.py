import pandas as pd


def load_csv(file: str):
    ext = file[-3:]
    if ext == 'tsv':
        return pd.read_csv(file, delimiter='\t', index_col=0)
    elif ext == 'csv':
        df = pd.read_csv(file)

        def converter(vector):
            vector = vector.split(' ')
            vector = list(map(float, vector))
            return vector

        df['EMBEDDING'] = df['EMBEDDING'].apply(converter)
        return df
    else:
        raise ValueError('Please format file as .tsv or .csv')


def load_fake_data():
    d = {'col1': [1, 2], 'col2': [3, 4]}
    df = pd.DataFrame(data=d)
    return df


if __name__ == '__main__':

    reddit_body = load_csv('../data/reddit-body.tsv')
    for e in reddit_body:
        print(e)
    print()
    print(reddit_body)

    # reddit_title = load_csv('../data/reddit-title.tsv')
    # for e in reddit_title:
    #     print(e)
    # print()
    # print(reddit_title)

    # reddit_embedding = load_csv('../data/reddit-embedding.csv')
    # for e in reddit_embedding:
    #     print(e)
    # print()
    # print(reddit_embedding)