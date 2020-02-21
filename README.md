# Reddit Visualization

## Requirements

You can automatically install all the requirements by running: `pip install -r requirements.txt`

It is recommended to first create a virtual environment by running: `python3.8 -m venv --prompt infovis .venv` and to activate it by running `. .venv/bin/activate` or `source .venv/bin/activate` (Linux syntax)

You need to put the reddit `csv` and `tsv` files in `app/data/`

## Examples and Template

In `app/static/`, the `css` and `js` of `barchart` and `tooltip` where left as an example as well as their integration in `app/templates/home.html`

An example of communication with SocketIO was left in `app/main/events.py` and an example route was left in `app/main/routes.py`

## Running

### Linux & Mac

* The app can be started by running: `bash start_app.sh`
* The app can then be accessed by navigating [here](http://127.0.0.1:5000/)

### Windows

* Type the following in your terminal when using Windows CMD: `set FLASK_ENV=development` or with Windows PowerShell: `$env:FLASK_ENV=development`
* Followed by: `python run.py`
* The app can then be accessed by navigating [here](http://127.0.0.1:5000/)
