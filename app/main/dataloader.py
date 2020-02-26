import pandas as pd


def load_csv(file: str):
    ext = file[-3:]
    if ext == 'tsv':
        return pd.read_csv(file, delimiter='\t', index_col=0)
    elif ext == 'csv':
        return pd.read_csv(file, index_col=0)
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
    print(reddit_body)

    # reddit_title = load_csv('../data/reddit-title.tsv')
    # for e in reddit_title:
    #     print(e)
    # print(reddit_title)