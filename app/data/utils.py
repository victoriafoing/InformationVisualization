from collections import Counter
from typing import List

import pandas as pd

def most_active_sr(infile: str, n: int) -> List[str]:
    body = pd.read_csv(infile, delimiter='\t', index_col=0)

    active_c = Counter(body['SOURCE_SUBREDDIT'])
    active_c.update(body['TARGET_SUBREDDIT'])

    return list(map(lambda x: x[0], active_c.most_common(n)))

if __name__ == '__main__':
    most_active_sr('reddit-body-filtered.tsv', 250)