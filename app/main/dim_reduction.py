from typing import Union, List

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
               timing=False) -> List[tuple]:
    names, array = embedding_to_np_matrix(embedding_df)
    reductor = TSNE(dim, perplexity=perplexity)

    if timing:
        import time
        start = time.time()

    array = reductor.fit_transform(array)

    if timing:
        print(f'Projection took {round(time.time() - start, 1)}s\n')

    projections = []
    for name, proj in zip(names, array):
        proj = list(map(float, proj))
        projections.append((name, proj[0], proj[1]))

    return projections


def merge_thumbnails_descriptions(projections: List[tuple],
                                  thumb_description_file: str) -> List[tuple]:
    df = pd.read_csv(thumb_description_file, index_col='SUBREDDIT_ID')

    for i, projection in enumerate(projections):
        thumbnail = df.loc[projection[0], "THUMBNAILS"]
        description = df.loc[projection[0], "PUBLIC_DESCRIPTIONS"]

        projections[i] = (*projection, thumbnail, description)

    return projections


if __name__ == '__main__':
    projections = dim_reduct('../data/reddit-embedding-filtered.csv')
    # for name, proj in projections.items():
    #     print(name, proj)

    embeddings_info = merge_thumbnails_descriptions(
        projections, '../data/reddit-embedding-thumbnail-description.csv')

    # import json
    # print(json.dumps(projections))