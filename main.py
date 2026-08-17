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
import time
from datetime import datetime, timezone
import platform
import shutil
app = Flask(__name__)
SERVER_STARTED = time.time()
MUSIC_FOLDER = "music"
UPLOAD_TEMP_FOLDER = "temp"
LRC_FOLDER = "lrc"
os.makedirs(MUSIC_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_TEMP_FOLDER, exist_ok=True)
os.makedirs(LRC_FOLDER, exist_ok=True)
jobs = {}

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Origin": "https://spotidown.app",
    "Referer": "https://spotidown.app/en3"
}
import time
def get_song_metadata(path, filename=None):
    audio = File(path, easy=True)

    if audio is None:
        raise Exception("Unsupported audio format")

    title = audio.get(
        "title",
        [os.path.splitext(filename or os.path.basename(path))[0]]
    )[0]

    artist = audio.get(
        "artist",
        ["Unknown Artist"]
    )[0]

    album = audio.get(
        "album",
        [""]
    )[0]

    try:
        size = os.path.getsize(path)
    except OSError:
        size = 0

    return {
        "file": filename or os.path.basename(path),
        "title": title,
        "artist": artist,
        "album": album,
        "size": size
    }
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
def get_lrc_filename(song):
    return os.path.splitext(song)[0] + ".lrc"
def fetch_lyrics(title, artist, album, duration):

    headers = {
        "User-Agent": "FSX Music Player/1.0"
    }

    # --------------------------------------------------
    # 1. Exact match
    # --------------------------------------------------

    try:
        response = requests.get(
            "https://lrclib.net/api/get",
            params={
                "track_name": title,
                "artist_name": artist,
                "album_name": album,
                "duration": int(duration)
            },
            headers=headers,
            timeout=15
        )

        if response.status_code == 200:

            data = response.json()

            if data.get("syncedLyrics"):
                return data["syncedLyrics"]

            if data.get("plainLyrics"):
                return data["plainLyrics"]

    except Exception as e:
        print("⚠️ Exact lyrics lookup failed:", e)


    # --------------------------------------------------
    # 2. Search fallback
    # --------------------------------------------------

    try:

        response = requests.get(
            "https://lrclib.net/api/search",
            params={
                "track_name": title,
                "artist_name": artist
            },
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        results = response.json()

        if not results:
            return None

        # Prefer synchronized lyrics
        for result in results:

            if result.get("syncedLyrics"):
                return result["syncedLyrics"]

        # Otherwise plain lyrics
        for result in results:

            if result.get("plainLyrics"):
                return result["plainLyrics"]

    except Exception as e:
        print("⚠️ Lyrics search failed:", e)

    return None
def scan_lyrics(job_id=None):

    os.makedirs(LRC_FOLDER, exist_ok=True)

    music_files = [
        file for file in os.listdir(MUSIC_FOLDER)
        if file.lower().endswith((
            ".mp3",
            ".flac",
            ".m4a",
            ".ogg",
            ".opus"
        ))
    ]

    total = len(music_files)

    if total == 0:
        if job_id:
            jobs[job_id]["stage"] = "No songs found"
            jobs[job_id]["progress"] = 100

        return

    for index, file in enumerate(music_files):

        progress = int((index / total) * 100)

        if job_id:
            jobs[job_id]["progress"] = progress
            jobs[job_id]["stage"] = f"Checking {file}"

        lrc_name = os.path.splitext(file)[0] + ".lrc"
        lrc_path = os.path.join(LRC_FOLDER, lrc_name)

        # Already exists
        if os.path.exists(lrc_path):
            print(f"⏭️ Lyrics already exist: {lrc_name}")
            continue

        music_path = os.path.join(MUSIC_FOLDER, file)

        try:
            audio = File(music_path, easy=True)

            if audio is None:
                print(f"⚠️ Unsupported audio: {file}")
                continue

            title = audio.get(
                "title",
                [os.path.splitext(file)[0]]
            )[0]

            artist = audio.get(
                "artist",
                ["Unknown Artist"]
            )[0]

            album = audio.get(
                "album",
                [""]
            )[0]

            try:
                duration = int(round(audio.info.length))
            except Exception:
                duration = 0

            print(
                f"🎵 Searching lyrics: "
                f"{artist} - {title}"
            )

            if job_id:
                jobs[job_id]["stage"] = (
                    f"Searching: {title}"
                )

            lyrics = fetch_lyrics(
                title,
                artist,
                album,
                duration
            )

            if lyrics:

                with open(
                    lrc_path,
                    "w",
                    encoding="utf-8"
                ) as f:
                    f.write(lyrics)

                print(
                    f"✅ Lyrics saved: {lrc_name}"
                )

            else:

                with open(
                    lrc_path,
                    "w",
                    encoding="utf-8"
                ) as f:
                    f.write(
                        "[00:00.00] Lyrics not found"
                    )

                print(
                    f"❌ Lyrics not found: "
                    f"{lrc_name}"
                )

            # Small delay between requests
            time.sleep(0.3)

        except Exception as e:

            print(
                f"⚠️ Lyrics error for "
                f"{file}: {e}"
            )

    if job_id:
        jobs[job_id]["progress"] = 100
        jobs[job_id]["stage"] = "Complete"
@app.route("/lyrics/scan", methods=["POST"])
def lyrics_scan():

    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "progress": 0,
        "stage": "Starting lyrics scan",
        "speed": "",
        "eta": ""
    }

    def worker():
        try:
            scan_lyrics(job_id)

            jobs[job_id]["progress"] = 100
            jobs[job_id]["stage"] = "Complete"

        except Exception as e:
            jobs[job_id]["stage"] = f"Failed: {e}"

    Thread(target=worker, daemon=True).start()

    return jsonify({
        "success": True,
        "job_id": job_id
    })
@app.route("/lyrics/<path:song>")
def lyrics(song):

    lrc_name = get_lrc_filename(song)
    lrc_path = os.path.join(LRC_FOLDER, lrc_name)

    if not os.path.exists(lrc_path):
        return jsonify({
            "success": False,
            "error": "Lyrics not found"
        }), 404

    return send_from_directory(
        LRC_FOLDER,
        lrc_name,
        mimetype="text/plain"
    )
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

        try:
            size = os.path.getsize(path)
        except OSError:
            size = 0

        result.append({
            "file": file,
            "title": title,
            "artist": artist,
            "album": album,
            "size": size
        })

    result.sort(
        key=lambda song: song["title"].lower()
    )

    return jsonify(result)
@app.route("/play/<song>")
def play(song):
    return send_from_directory(MUSIC_FOLDER, song)
# 🎨 COVER API
from flask import Response
from flask import Response, send_from_directory
from mutagen import File
from mutagen.id3 import ID3
from mutagen.mp4 import MP4
from mutagen.flac import FLAC
import os
import base64

@app.route("/cover/<path:song>")
def cover(song):
    path = os.path.join(MUSIC_FOLDER, song)

    try:
        audio = File(path)

        if audio is None:
            print("Unsupported audio:", song)
            raise Exception("Unsupported format")


        if isinstance(audio.tags, ID3):
            apic = audio.tags.getall("APIC")

            if apic:
                image = apic[0]

                return Response(
                    image.data,
                    mimetype=image.mime or "image/jpeg"
                )

    
        if isinstance(audio, FLAC):
            if audio.pictures:
                picture = audio.pictures[0]

                return Response(
                    picture.data,
                    mimetype=picture.mime or "image/jpeg"
                )

      
        if isinstance(audio, MP4):
            if audio.tags and "covr" in audio.tags:

                cover_data = audio.tags["covr"][0]

                # MP4Cover has a .imageformat attribute
                if hasattr(cover_data, "imageformat"):
                    image_format = cover_data.imageformat

                    if image_format == 13:
                        mime = "image/jpeg"
                    elif image_format == 14:
                        mime = "image/png"
                    else:
                        mime = "image/jpeg"
                else:
                    mime = "image/jpeg"

                return Response(
                    bytes(cover_data),
                    mimetype=mime
                )


        if audio.tags:

          
            picture_data = audio.tags.get("metadata_block_picture")

            if picture_data:

              
                if isinstance(picture_data, list):
                    picture_data = picture_data[0]

                try:
                    decoded = base64.b64decode(picture_data)

                    from mutagen.flac import Picture

                    picture = Picture(decoded)

                    return Response(
                        picture.data,
                        mimetype=picture.mime or "image/jpeg"
                    )

                except Exception as e:
                    print(
                        "OGG/OPUS cover decode error:",
                        e
                    )

    except Exception as e:
        print(
            f"Cover error for {song}:",
            e
        )


    return send_from_directory(
        "static",
        "default.jpg"
    )
def ensure_lyrics_for_song(song):

    music_path = os.path.join(MUSIC_FOLDER, song)

    if not os.path.exists(music_path):
        raise FileNotFoundError(f"Song not found: {song}")

    audio = File(music_path, easy=True)

    if audio is None:
        raise Exception("Unsupported audio format")

    title = audio.get(
        "title",
        [os.path.splitext(song)[0]]
    )[0]

    artist = audio.get(
        "artist",
        ["Unknown Artist"]
    )[0]

    album = audio.get(
        "album",
        [""]
    )[0]

    try:
        duration = int(round(audio.info.length))
    except Exception:
        duration = 0

    print(
        f"🎵 Fetching lyrics: {artist} - {title}"
    )

    lyrics = fetch_lyrics(
        title,
        artist,
        album,
        duration
    )

    # IMPORTANT:
    # Only synced lyrics should become an LRC file.
    if not lyrics:
        return False

    lrc_name = get_lrc_filename(song)
    lrc_path = os.path.join(LRC_FOLDER, lrc_name)

    with open(
        lrc_path,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(lyrics)

    print(f"lyrics saved: {lrc_name}")

    return True
@app.route("/upload", methods=["POST"])
def upload():

    try:
        file_data = request.files.get("file")

        if not file_data:
            return jsonify({
                "status": "error",
                "error": "No file provided"
            }), 400

        filename = request.form.get("filename")

        if not filename:
            filename = file_data.filename

        if not filename:
            return jsonify({
                "status": "error",
                "error": "Filename missing"
            }), 400

        chunk_index = int(
            request.form.get("chunkIndex", 0)
        )

        total_chunks = int(
            request.form.get("totalChunks", 1)
        )

        # Prevent accidental path traversal
        filename = os.path.basename(filename)

        temp_path = os.path.join(
            UPLOAD_TEMP_FOLDER,
            filename
        )

        # Write chunk
        with open(temp_path, "ab") as f:
            f.write(file_data.read())

        
        if chunk_index < total_chunks - 1:

            return jsonify({
                "status": "progress",
                "chunk": chunk_index,
                "totalChunks": total_chunks
            })


        final_destination = os.path.join(
            MUSIC_FOLDER,
            filename
        )

       
        if os.path.exists(final_destination):

            base, ext = os.path.splitext(filename)

            counter = 1

            while os.path.exists(final_destination):

                new_filename = (
                    f"{base} ({counter}){ext}"
                )

                final_destination = os.path.join(
                    MUSIC_FOLDER,
                    new_filename
                )

                counter += 1

            filename = new_filename

        os.replace(
            temp_path,
            final_destination
        )

        # Extract metadata
        song = get_song_metadata(
            final_destination,
            filename
        )

        return jsonify({
            "status": "complete",
            "song": song
        })

    except Exception as e:

        print("Upload error:", e)

        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
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
@app.route("/lyrics/ensure/<path:song>", methods=["POST"])
def ensure_lyrics(song):

    lrc_name = get_lrc_filename(song)
    lrc_path = os.path.join(LRC_FOLDER, lrc_name)

    if os.path.exists(lrc_path):
        return jsonify({
            "success": True,
            "available": True,
            "existing": True
        })

    try:
        found = ensure_lyrics_for_song(song)

        if found:
            return jsonify({
                "success": True,
                "available": True
            })

        return jsonify({
            "success": False,
            "available": False,
            "error": "Lyrics not found"
        }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
def get_music_stats():

    total_size = 0
    song_count = 0

    for root, dirs, files in os.walk(MUSIC_FOLDER):

        for file in files:

            path = os.path.join(root, file)

            try:

                total_size += os.path.getsize(path)

                if file.lower().endswith((
                    ".mp3",
                    ".flac",
                    ".m4a",
                    ".ogg",
                    ".opus"
                )):
                    song_count += 1

            except OSError:
                continue

    return {
        "size": total_size,
        "songs": song_count
    }
@app.route("/api/raw")
def health():

    uptime = int(time.time() - SERVER_STARTED)

    try:

        disk = shutil.disk_usage("/")

        storage = {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free
        }

    except Exception:

        storage = {
            "total": None,
            "used": None,
            "free": None
        }


    music = get_music_stats()


    return jsonify({

        "status": "online",

        "service": "FSX",

        "version": "2.1.0",


        "server": {

            "uptime": uptime,

            "started_at":
                datetime.fromtimestamp(
                    SERVER_STARTED,
                    timezone.utc
                ).isoformat(),

            "hostname":
                platform.node(),

            "platform":
                platform.system(),

            "platform_version":
                platform.release(),

            "architecture":
                platform.machine(),

            "python":
                platform.python_version()

        },


        "storage": storage,


        "music": {

            "folder":
                MUSIC_FOLDER,

            "size":
                music["size"],

            "songs":
                music["songs"]

        },


        "timestamp":
            datetime.now(
                timezone.utc
            ).isoformat()

    })
@app.route("/api/health")
def health_page():

    return send_from_directory(
        "static",
        "health.html"
    )
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)