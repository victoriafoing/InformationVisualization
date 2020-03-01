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
    result = {
        "mean" : df['LINK_SENTIMENT'].mean(),
        "std" : df['LINK_SENTIMENT'].std()
    }
    return result

def calc_stats_for_month_year(df, month, year):
    filtered_df = filter_year(int(year),filter_month(int(month),df))
    if filtered_df.size > 0:
        return calc_stats(filtered_df)
    else:
        return {
        "mean" : 0.0,
        "std" : 0.0
    }

def get_most_hated_loved_subreddits_by_month_year(df, month, year):
    filtered_df = filter_year(int(year), filter_month(int(month), df))
    grouped = list(filtered_df.groupby('TARGET_SUBREDDIT')['LINK_SENTIMENT'].sum().sort_values().items())
    most_hated = grouped[0]
    most_loved = grouped[-1]
    return {
        "hated" : {
            "name": most_hated[0],
            "count" : most_hated[1]
        },
        "loved": {
            "name": most_loved[0],
            "count": most_loved[1]
        }
    }

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