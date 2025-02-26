from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

POSTS = [
    {"id": 1, "title": "First post", "content": "This is the first post."},
    {"id": 2, "title": "Second post", "content": "This is the second post."},
    {"id": 3, "title": "Felipe", "content": "Hallo"}
]

# GET: List all posts (with optional sorting)
@app.route('/posts', methods=['GET'])
def get_posts():
    sort_field = request.args.get('sort')
    direction = request.args.get('direction', 'asc')

    if sort_field and sort_field not in ['title', 'content']:
        return jsonify({"error": "Invalid sort field. Use 'title' or 'content'."}), 400

    if direction not in ['asc', 'desc']:
        return jsonify({"error": "Invalid direction. Use 'asc' or 'desc'."}), 400

    sorted_posts = POSTS
    if sort_field:
        reverse = direction == 'desc'
        sorted_posts = sorted(POSTS, key=lambda x: x.get(sort_field, '').lower(), reverse=reverse)

    return jsonify(sorted_posts)

# POST: Add a new post
@app.route('/posts', methods=['POST'])
def add_post():
    data = request.get_json()

    if not data or 'title' not in data or 'content' not in data:
        return jsonify({"error": "Both 'title' and 'content' are required."}), 400

    new_id = max(post['id'] for post in POSTS) + 1 if POSTS else 1
    new_post = {
        "id": new_id,
        "title": data['title'],
        "content": data['content']
    }

    POSTS.append(new_post)
    return jsonify(new_post), 201

# DELETE: Remove a post by id
@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    global POSTS
    post = next((post for post in POSTS if post['id'] == post_id), None)

    if not post:
        return jsonify({"error": f"Post with id {post_id} not found."}), 404

    POSTS = [post for post in POSTS if post['id'] != post_id]
    return jsonify({"message": f"Post with id {post_id} has been deleted successfully."}), 200

# PUT: Update a post by id
@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    data = request.get_json()
    post = next((post for post in POSTS if int(post['id']) == post_id), None)

    if not post:
        return jsonify({"error": f"Post with id {post_id} not found."}), 404

    post['title'] = data.get('title', post['title'])
    post['content'] = data.get('content', post['content'])

    return jsonify(post), 200

# GET: Search for posts by title or content
@app.route('/posts/search', methods=['GET'])
def search_posts():
    title_query = request.args.get('title', '').lower()
    content_query = request.args.get('content', '').lower()

    filtered_posts = [post for post in POSTS if
      (not title_query or title_query in post['title'].lower()) and
      (not content_query or content_query in post['content'].lower())
    ]

    return jsonify(filtered_posts)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)
