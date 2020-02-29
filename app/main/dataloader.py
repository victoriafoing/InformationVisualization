import pandas as pd


def load_csv(file: str):
    ext = file[-3:]
    if ext == 'tsv':
        df =  pd.read_csv(file, delimiter='\t', index_col=0)

    elif ext == 'csv':
        df = pd.read_csv(file)

        def converter(vector):
            vector = vector.split(' ')
            vector = list(map(float, vector))
            return vector

        df['EMBEDDING'] = df['EMBEDDING'].apply(converter)

    else:
        raise ValueError('Please format file as .tsv or .csv')

    df['TIMESTAMP'] = pd.to_datetime(df['TIMESTAMP'])
    return df

def get_timeline_data(df: pd.DataFrame):
    result = df.groupby([df['TIMESTAMP'].dt.year, df['TIMESTAMP'].dt.month])['LINK_SENTIMENT'].sum().sort_values()
    return [{"time": key, "sentiment": value} for key, value in result.items() if value > 100]

def load_fake_data():
    d = {'col1': [1, 2], 'col2': [3, 4]}
    df = pd.DataFrame(data=d)
    return df

def filter_year(year, df: pd.DataFrame):
    return df[df['TIMESTAMP'].dt.year == year]

def filter_month(month, df: pd.DataFrame):
    return df[df['TIMESTAMP'].dt.month == month]

def calc_stats(df):
    mean_sentiment = df['LINK_SENTIMENT'].mean()
    std_sentiment = df['LINK_SENTIMENT'].std()
    return mean_sentiment, std_sentiment

def calc_stats_for_month_year(df, month, year):
    return calc_stats(filter_year(year,filter_month(month,df)))

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