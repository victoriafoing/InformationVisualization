from flask import render_template, request, jsonify, current_app
import pandas as pd

from app import data
from . import main
from .dataloader import load_csv, load_fake_data, get_timeline_data, calc_stats_for_month_year, \
    get_most_hated_loved_subreddits_by_month_year, get_top_5, get_top_5_both_sent, get_activity
from .dim_reduction import dim_reduct

import json

# Initialization
# embeddings = dim_reduct('app/data/reddit-embedding-filtered.csv')
# embeddings = json.dumps(embeddings)


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
#
# @main.route("/embeddings", methods=['GET'])
# def get_embeddings():
#     return embeddings


# @main.route('/d3', methods=['GET', 'POST'])
# def d3():
#     area_name = request.args.get("area_name")

#     if area_name is None:
#         area_name = "Centrum-West"

#     plot_data = data.stats_ams.loc[data.stats_ams['area_name'] == area_name]
#     plot_data = plot_data.drop(['area_name', 'area_code'], axis=1)
#     plot_data = plot_data.to_json(orient='records')

#     meta_data = data.stats_ams_meta.to_json(orient='records')
#     return render_template("d3.html",
#                            data=plot_data,
#                            meta_data=meta_data,
#                            x_variables=data.model_vars,
#                            area_names=data.area_names,
#                            selected_area_name=area_name)
