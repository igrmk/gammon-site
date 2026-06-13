from flask import Flask, send_from_directory, send_file, request
from waitress import serve
import gammon as M
import io

app = Flask(__name__, static_folder='../frontend/dist')


@app.route('/', methods=['GET'])
def root():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400
    if file:
        try:
            result = io.BytesIO()
            M.convert(file, result, False, False)
            result.seek(0)
            return send_file(result, as_attachment=True, download_name=file.filename)
        except M.ConversionError:
            return "Invalid file", 400


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


if __name__ == '__main__':
    serve(app, host="0.0.0.0", port=8080)
