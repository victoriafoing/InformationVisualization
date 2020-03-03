import pandas as pd


def load_csv(file: str):
    ext = file[-3:]
    if ext == 'tsv':
        df = pd.read_csv(file, delimiter='\t', index_col=0)

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
    result = df.groupby([df['TIMESTAMP'].dt.year, df['TIMESTAMP'].dt.month
                         ])['LINK_SENTIMENT'].sum().sort_values()
    return [{
        "time": key,
        "sentiment": value
    } for key, value in result.items() if value > 100]


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
    
# def get_top_5(df: pd.Dataframe, month: int, sent: int, is_tar: bool):
#     '''
#     :param sent: 1 for positive, -1 for negative sentiment.
#     :param is_tar: True if you want the Target or False for the Source to be calculated.
#     '''
#     # TODO how to get the starting month?
#     old_ts = datetime.strptime(df.iloc[0,3], fmt)
#     td_max = 2629743
#     td = 0
#     store = defaultdict(int)
#     if istar:
#         idx = 1
#     else:
#         idx = 0
#     while td < td_max:
#         for tpl in df.itertuples(index=False):
#             if tpl[4] == sent:
#                 store[tpl[idx]] += 1
#             new_ts = datetime.strptime(tpl[3], fmt)
#             td = new_ts - old_ts
#             td = td.total_seconds()
#     df_src = pd.DataFrame(store.items(), columns=['Sr', 'Sent_count'])
#     return df_src.nlargest(5, 'Sent_count')

def get_top_5(df, month, year, sent: bool, is_tar: bool, n = 5):
    '''
    :param sent: True for positive, False for negative sentiment
    :param is_tar: 
    '''
    if sent:
        df = df[df['LINK_SENTIMENT'] > 0]
    else:
        df = df[df['LINK_SENTIMENT'] < 0]
        df['LINK_SENTIMENT'] = df['LINK_SENTIMENT']*-1

    filtered_df = filter_year(int(year), filter_month(int(month), df))
    
    if is_tar:
        direction = 'TARGET_SUBREDDIT'
    else:
        direction = 'SOURCE_SUBREDDIT'

    grouped = list(filtered_df.groupby(direction)['LINK_SENTIMENT'].sum().sort_values().items())
    top = grouped[-n:]
    return {
        "names": [ele[0] for ele in top], # lol,the_donald,etc
        "count" : [ele[1] for ele in top] # 150, 112, etc
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