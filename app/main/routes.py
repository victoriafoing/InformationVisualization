from flask import render_template, request, jsonify
import pandas as pd

from app import data
from . import main
from .dataloader import load_csv, load_fake_data, get_timeline_data

import json

@main.route('/', methods=['GET'])
def index():
    return render_template("home.html")



@main.route("/data", methods=['GET'])
def get_data():
    data = get_timeline_data(load_csv("./app/data/reddit-body.tsv"))
    return json.dumps(data)

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
