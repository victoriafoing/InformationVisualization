import pandas as pd
import requests

def load_csv(file: str):
    ext = file[-3:]
    if ext == 'tsv':
        df = pd.read_csv(file, delimiter='\t')

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
        "mean": df['LINK_SENTIMENT'].mean(),
        "std": df['LINK_SENTIMENT'].std()
    }
    return result


def calc_stats_for_month_year(df, month, year):
    filtered_df = filter_year(int(year), filter_month(int(month), df))
    if filtered_df.size > 0:
        return calc_stats(filtered_df)
    else:
        return {"mean": 0.0, "std": 0.0}


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

def get_top_5_both_sent(df, month, year, is_tar: bool, n=5, min_count = 25):
    good = get_top_5(df, month, year, True, is_tar=is_tar, n=n, min_count=min_count)
    bad = get_top_5(df, month, year, False, is_tar=is_tar, n=n, min_count=min_count)
    return {
        "loved" : good,
        "hated" : bad
    }

def get_top_5(df, month, year, n=5, min_count = 20):

    df_filt = filter_year(int(year), filter_month(int(month), df))

    # Filter subreddits that dont appear often
    f = df_filt['TARGET_SUBREDDIT'].value_counts()
    df_tar = df_filt[df_filt['TARGET_SUBREDDIT'].isin(f.index[f.gt(min_count)])]
    w = df_filt['SOURCE_SUBREDDIT'].value_counts()
    df_src = df_filt[df_filt['SOURCE_SUBREDDIT'].isin(w.index[w.gt(min_count)])]
 
    df_tar = df_tar[df_tar['LINK_SENTIMENT'] < 0]
    df_tar['LINK_SENTIMENT'] = df_tar['LINK_SENTIMENT'] * -1

    df_src = df_src[df_src['LINK_SENTIMENT'] < 0]
    df_src['LINK_SENTIMENT'] = df_src['LINK_SENTIMENT'] * -1


    def make_the_json(df_in, n, v, direction: str):
        grouped = list(
            df_in.groupby(direction)['LINK_SENTIMENT']
                    .sum()
                    .sort_values()
                    .items()
        )
        grouped = sorted(list(map(lambda x: (x[0],x[1]/v[x[0]]),grouped)),key= lambda tup: tup[1], reverse=True)
        top = grouped[:n]
        return [{
            "name" : ele[0],
            "count" : round(ele[1]*100,1)
                } for ele in top]
    
    return {
        "source" : make_the_json(df_src, n, w, 'SOURCE_SUBREDDIT'),
        "target" : make_the_json(df_tar, n, f, 'TARGET_SUBREDDIT')
    } 
    


def get_most_hated_loved_subreddits_by_month_year(df, month, year):
    filtered_df = filter_year(int(year), filter_month(int(month), df))
    grouped = list(
        filtered_df.groupby('TARGET_SUBREDDIT')
        ['LINK_SENTIMENT'].sum().sort_values().items())
    most_hated = grouped[0]
    most_loved = grouped[-1]
    return {
        "hated": {
            "name": most_hated[0],
            "count": most_hated[1]
        },
        "loved": {
            "name": most_loved[0],
            "count": most_loved[1]
        }
    }

def get_activity(df, subreddit):

    temp = df.copy()

    # Add time categories for grouping
    temp["Date"] = temp["TIMESTAMP"].astype(str).str.split(expand=True)[0]
    temp['Year-Month'] = temp["Date"].str[:7]

    # Add sentiment categories to facilitate sums
    temp['pos_source'] = ((df.SOURCE_SUBREDDIT == subreddit) & (df.LINK_SENTIMENT == 1)).map(
        {True: 1, False: 0})
    temp['neg_source'] = ((df.SOURCE_SUBREDDIT == subreddit) & (df.LINK_SENTIMENT == -1)).map(
        {True: 1, False: 0})
    temp['pos_target'] = ((df.TARGET_SUBREDDIT == subreddit) & (df.LINK_SENTIMENT == 1)).map(
        {True: 1, False: 0})
    temp['neg_target'] = ((df.TARGET_SUBREDDIT == subreddit) & (df.LINK_SENTIMENT == -1)).map(
        {True: 1, False: 0})

    # Group table by year-month and calculate sums for sentiment categories
    activity = temp.groupby('Year-Month')[['pos_source', 'neg_source', 'pos_target', 'neg_target']].sum()

    dates = list(activity.groupby('Year-Month').groups.keys())

    # Convert grouped sums to lists
    pos_source = list(activity['pos_source'])
    neg_source = list(activity['neg_source'])
    pos_target = list(activity['pos_target'])
    neg_target = list(activity['neg_target'])

    # Return list of dictionaries (one dictionary for each time point)
    return [{
        "date": dates[i],
        "pos_source": pos_source[i],
        "neg_source": neg_source[i],
        "pos_target": pos_target[i],
        "neg_target": neg_target[i],
    } for i in range(0,len(dates))]

def sample_post(df, subreddit, month, year, dir):

    # Filter table by direction of hyperlinks
    if dir == '_source':
        filtered_df = df[df['SOURCE_SUBREDDIT'] == subreddit]
    elif dir == '_target':
        filtered_df = df[df['TARGET_SUBREDDIT'] == subreddit]

    # Add time categories for grouping
    filtered_df["Date"] = filtered_df["TIMESTAMP"].astype(str).str.split(expand=True)[0]
    filtered_df['Year-Month'] = filtered_df["Date"].str[:7]
    
    # Sentiment function
    def sent2str(sent):
        if sent == -1:
            return '-'
        else:
            return '+'

    # Filter table by date
    if len(month) == 1:
        month = "0" + str(month)
    year_month = str(year) + "-" + str(month)
    result = filtered_df[filtered_df['Year-Month'] == year_month][['Date','Year-Month','LINK_SENTIMENT','SOURCE_SUBREDDIT','TARGET_SUBREDDIT','POST_ID']]

    # Return subreddit and post info
    if result.size == 0:
        return []
    else:
        print("samples:",min(result.size-1,5))
        samples = result.sample(min(result.size-1,5)).sort_values(by=['Date'])

        return [{
           'date': row['Date'],
           'sent': sent2str(row['LINK_SENTIMENT']),
           'source': row['SOURCE_SUBREDDIT'],
           'target': row['TARGET_SUBREDDIT'],
           'post_id': row['POST_ID'][0:6],
           'url': "http://reddit.com/r/"+row['SOURCE_SUBREDDIT']+"/comments/"+row['POST_ID'][0:6]+"/",
        } for i,row in samples.iterrows()];

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