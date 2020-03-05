from typing import Union

import numpy as np
import pandas as pd
from sklearn.manifold import TSNE


def embedding_to_np_matrix(df: Union[str, pd.DataFrame]) -> np.array:
    if type(df) == str:
        df = pd.read_csv(df)

    def converter(vector):
        vector = vector.split(' ')
        vector = list(map(float, vector))
        return vector

    df['EMBEDDING'] = df['EMBEDDING'].apply(converter)

    array = []
    names = []
    for i, e in enumerate(df.values):
        array.append(np.array(e[-1]))
        names.append(df.loc[i, 'SUBREDDIT_ID'])

    return names, np.array(array)


def dim_reduct(embedding_df: Union[str, pd.DataFrame],
               dim=2,
               perplexity=30,
               timing=False) -> dict:
    names, array = embedding_to_np_matrix(embedding_df)
    reductor = TSNE(dim, perplexity=perplexity)

    if timing:
        import time
        start = time.time()

    array = reductor.fit_transform(array)

    if timing:
        print(f'Projection took {round(time.time() - start, 1)}s\n')

    embeddings = {}
    for name, proj in zip(names, array):
        embeddings[name] = list(proj)

    return embeddings


if __name__ == '__main__':
    projections = dim_reduct('../data/reddit-embedding-filtered.csv')
    for name, proj in projections.items():
        print(name, proj)