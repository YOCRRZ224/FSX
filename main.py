from flask import Flask, send_from_directory, jsonify
import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3
import math
from flask import request
import requests
import re
from bs4 import BeautifulSoup
import uuid
from threading import Thread

app = Flask(__name__)

MUSIC_FOLDER = "music"
# Configuration for uploads
UPLOAD_TEMP_FOLDER = "temp"
os.makedirs(UPLOAD_TEMP_FOLDER, exist_ok=True)
jobs = {}
# =========================
# SPOTIFY HELPER FUNCTIONS
# =========================

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Origin": "https://spotidown.app",
    "Referer": "https://spotidown.app/en3"
}
import time

def download_file(url, filename, job_id=None):
    with requests.get(url, headers=HEADERS, stream=True) as r:
        r.raise_for_status()

        total = int(r.headers.get("content-length", 0))
        downloaded = 0

        start_time = time.time()

        with open(filename, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if not chunk:
                    continue

                f.write(chunk)
                downloaded += len(chunk)

                if job_id and total > 0:
                    elapsed = max(time.time() - start_time, 0.1)

                    speed = downloaded / elapsed
                    speed_mb = speed / (1024 * 1024)

                    remaining = total - downloaded
                    eta = remaining / speed if speed > 0 else 0

                    jobs[job_id]["progress"] = int(
                        70 + (downloaded / total) * 20
                    )

                    jobs[job_id]["speed"] = f"{speed_mb:.2f} MB/s"
                    jobs[job_id]["eta"] = f"{int(eta)}s"
@app.route("/job/<job_id>")
def job_status(job_id):
    return jsonify(
        jobs.get(job_id, {
            "progress": 0,
            "stage": "Unknown",
            "speed": "",
            "eta": ""
        })
    )
def fetch_track(spotify_url, job_id=None):
    session = requests.Session()
    session.headers.update(HEADERS)

    if job_id:
        jobs[job_id]["stage"] = "Loading SpotiDown"
        jobs[job_id]["progress"] = 10

    response = session.get("https://spotidown.app/en3")

    soup = BeautifulSoup(response.text, "html.parser")

    hidden_input = soup.find(
        "input",
        type="hidden",
        attrs={"name": lambda x: x != "g-recaptcha-response"}
    )

    token_name = hidden_input["name"]
    token_value = hidden_input["value"]

    payload = {
        "url": spotify_url,
        "g-recaptcha-response": "",
        token_name: token_value
    }

    if job_id:
        jobs[job_id]["stage"] = "Submitting Track"
        jobs[job_id]["progress"] = 25

    api_response = session.post(
        "https://spotidown.app/action",
        data=payload
    )

    html_content = api_response.json()["data"]

    track_soup = BeautifulSoup(html_content, "html.parser")

    final_payload = {
        "data": track_soup.find("input", {"name": "data"})["value"],
        "base": track_soup.find("input", {"name": "base"})["value"],
        "token": track_soup.find("input", {"name": "token"})["value"]
    }

    if job_id:
        jobs[job_id]["stage"] = "Fetching Track Data"
        jobs[job_id]["progress"] = 40

    final_response = session.post(
        "https://spotidown.app/action/track",
        data=final_payload
    )

    final_html = final_response.json()["data"]

    result_soup = BeautifulSoup(final_html, "html.parser")

    title_node = result_soup.find("h3", itemprop="name")

    title = (
        title_node.get_text(strip=True)
        if title_node else "Unknown Track"
    )

    links = result_soup.find_all("a", id="popup")

    mp3_url = None
    cover_url = None

    if job_id:
        jobs[job_id]["stage"] = "Finding MP3 URL"
        jobs[job_id]["progress"] = 55

    for link in links:
        text = link.get_text(strip=True)
        href = link.get("href")

        print(text, href)

        if "Cover" in text:
            cover_url = href

        elif "Mp3" in text:
            mp3_url = href

    if not mp3_url:
        raise Exception("MP3 URL not found")

    filename = re.sub(r'[\\/*?:"<>|]', "", title)
    filename += ".mp3"

    save_path = os.path.join(MUSIC_FOLDER, filename)

    if job_id:
        jobs[job_id]["stage"] = "Downloading MP3"
        jobs[job_id]["progress"] = 70

    download_file(mp3_url, save_path, job_id)

    if job_id:
        jobs[job_id]["stage"] = "Saving File"
        jobs[job_id]["progress"] = 95

    if job_id:
        jobs[job_id]["stage"] = "Complete"
        jobs[job_id]["progress"] = 100

    return {
        "title": title,
        "filename": filename
    }
@app.route("/")
def home():
    return send_from_directory("static", "index.html")
from mutagen import File

@app.route("/songs")
def songs():
    result = []

    for file in os.listdir(MUSIC_FOLDER):
        path = os.path.join(MUSIC_FOLDER, file)

        try:
            audio = File(path, easy=True)

            title = audio.get("title", [file])[0]
            artist = audio.get("artist", ["Unknown Artist"])[0]
            album = audio.get("album", [""])[0]

        except:
            title = file
            artist = "Unknown Artist"
            album = ""

        result.append({
            "file": file,
            "title": title,
            "artist": artist,
            "album": album
        })

    return jsonify(result)

@app.route("/play/<song>")
def play(song):
    return send_from_directory(MUSIC_FOLDER, song)
# 🎨 COVER API
from flask import Response

@app.route("/cover/<song>")
def cover(song):
    path = os.path.join(MUSIC_FOLDER, song)

    try:
        audio = ID3(path)

        # 🔥 Correct way: get ALL APIC frames
        apic = audio.getall("APIC")

        if apic:
            return Response(apic[0].data, mimetype="image/jpeg")

    except Exception as e:
        print("Cover error:", e)

    return send_from_directory("static", "default.jpg")
@app.route("/upload", methods=["POST"])
def upload():
    file_data = request.files['file']
    filename = request.form['filename']
    chunk_index = int(request.form['chunkIndex'])
    total_chunks = int(request.form['totalChunks'])
    
    # Use a temp directory for specific files to avoid collisions
    temp_path = os.path.join(UPLOAD_TEMP_FOLDER, filename)
    
    # Write the chunk to the file (append mode)
    with open(temp_path, "ab") as f:
        f.write(file_data.read())
    
    # If this is the last chunk, move it to the main music folder
    if chunk_index == total_chunks - 1:
        final_destination = os.path.join(MUSIC_FOLDER, filename)
        os.rename(temp_path, final_destination)
        return jsonify({"status": "complete", "message": f"{filename} uploaded successfully!"})
    
    return jsonify({"status": "progress", "chunk": chunk_index})
@app.route("/spotify-download", methods=["POST"])
def spotify_download():
    data = request.json
    spotify_url = data.get("url")

    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "progress": 0,
        "stage": "Queued",
        "speed": "",
        "eta": ""
    }

    def worker():
        try:
            fetch_track(spotify_url, job_id)

        except Exception as e:
            jobs[job_id]["stage"] = f"Failed: {e}"

    Thread(target=worker, daemon=True).start()

    return jsonify({
        "success": True,
        "job_id": job_id
    })
@app.route("/delete/<song>", methods=["DELETE"])
def delete_song(song):
    try:
        path = os.path.join(MUSIC_FOLDER, song)

        if not os.path.exists(path):
            return jsonify({
                "success": False,
                "error": "Song not found"
            }), 404

        os.remove(path)

        return jsonify({
            "success": True,
            "message": f"{song} deleted"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)