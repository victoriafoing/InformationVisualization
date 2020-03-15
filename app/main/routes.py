from flask import render_template, request, jsonify, current_app
import pandas as pd
import requests

from app import data
from . import main
from .dataloader import load_csv, load_fake_data, get_timeline_data, calc_stats_for_month_year, \
    get_most_hated_loved_subreddits_by_month_year, get_top_5, get_top_5_both_sent, get_activity, sample_post
from .dim_reduction import dim_reduct, merge_thumbnails_descriptions

import json
import time

# Initialization
# print('Computing embbedings dimensionality reduction ... ', end='', flush=True)
# start = time.time()
embeddings = dim_reduct('app/data/reddit-embedding-filtered.csv')
embeddings = merge_thumbnails_descriptions(
    embeddings, 'app/data/reddit-embedding-thumbnail-description.csv')
embeddings = json.dumps(embeddings)
# print(f'Done ! ({round(time.time() - start, 2)}s)')


@main.route('/', methods=['GET'])
def index():
    return render_template("home.html")


@main.route("/data/<year>/<month>", methods=['GET'])
def get_data_by_month_year(month, year):
    data = calc_stats_for_month_year(current_app.df, month, year)
    return json.dumps(data)


@main.route("/top/<year>/<month>", methods=['GET'])
def get_top_subreddits_by_month_year(month, year):
    data = get_top_5_both_sent(current_app.df, month, year, False)
    print(data)
    return json.dumps(data)


@main.route("/data", methods=['GET'])
def get_data():
    data = get_timeline_data(current_app.df)
    return json.dumps(data)


@main.route("/activity/<subreddit>", methods=['GET'])
def get_subreddit_activity(subreddit):

    data = get_activity(current_app.df, subreddit)
    return json.dumps(data)


@main.route("/embeddings", methods=['GET'])
def get_embeddings():
    return embeddings


@main.route("/reddit-info/<url>", methods=['GET'])
def test(url):
    url = 'https://www.reddit.com/r/' + url + '/about.json'
    return requests.get(url,
                        headers={
                            'User-agent': 'Reddit Visualization Project'
                        }).text

@main.route("/sample/<subreddit>/<sent>", methods=['GET'])
def get_sample(subreddit, sent):
    data = sample_post(current_app.df, subreddit, sent)
    return json.dumps(data)