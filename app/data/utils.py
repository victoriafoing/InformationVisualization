from collections import Counter
from typing import List

import numpy as np
import pandas as pd


def most_active_sr(body_file: str, title_file: str, n: int) -> List[str]:
    body = pd.read_csv(body_file, delimiter='\t', index_col=0)
    title = pd.read_csv(title_file, delimiter='\t', index_col=0)

    active_c = Counter()
    active_c.update(body['SOURCE_SUBREDDIT'])
    active_c.update(body['TARGET_SUBREDDIT'])
    active_c.update(title['SOURCE_SUBREDDIT'])
    active_c.update(title['TARGET_SUBREDDIT'])

    return list(map(lambda x: x[0], active_c.most_common(n)))


def embedding_to_np_matrix(infile: str) -> np.array:
    df = pd.read_csv(infile, index_col='SUBREDDIT_ID')

    def converter(vector):
        vector = vector.split(' ')
        vector = list(map(float, vector))
        return vector

    df['EMBEDDING'] = df['EMBEDDING'].apply(converter)

    array = []
    for i, e in enumerate(df.values):
        array.append(np.array(e[0]))

    return np.array(array)


if __name__ == '__main__':
    print(
        most_active_sr('reddit-body-filtered.tsv', 'reddit-title-filtered.tsv',
                       200))
