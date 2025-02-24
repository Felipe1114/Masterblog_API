// Function that runs once the window is fully loaded
window.onload = function() {
    var savedBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:5002';
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
        loadPosts();
    }
}

// Function to fetch all the posts from the API and display them on the page
function loadPosts() {
    var baseUrl = document.getElementById('api-base-url').value;
    localStorage.setItem('apiBaseUrl', baseUrl);

    const sortField = document.getElementById('sort-field').value;
    const sortDirection = document.getElementById('sort-direction').value;

    let url = baseUrl + '/posts';

    if (sortField) {
        url += `?sort=${sortField}&direction=${sortDirection}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayPosts(data);
        })
        .catch(error => console.error('Error:', error));
}

// Function to send a POST request to the API to add a new post
function addPost() {
    var baseUrl = document.getElementById('api-base-url').value;
    var postTitle = document.getElementById('post-title').value;
    var postContent = document.getElementById('post-content').value;

    fetch(baseUrl + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent })
    })
    .then(response => response.json())
    .then(post => {
        console.log('Post added:', post);
        loadPosts();
    })
    .catch(error => console.error('Error:', error));
}

// Function to send a DELETE request to the API to delete a post
function deletePost(postId) {
    var baseUrl = document.getElementById('api-base-url').value;

    fetch(baseUrl + '/posts/' + postId, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Post deleted:', postId);
        loadPosts();
    })
    .catch(error => console.error('Error:', error));
}

// Function to search for posts by title or content
function searchPosts() {
    var baseUrl = document.getElementById('api-base-url').value;
    const titleQuery = document.getElementById('search-title').value;
    const contentQuery = document.getElementById('search-content').value;

    let url = `${baseUrl}/posts/search`;

    if (titleQuery || contentQuery) {
        url += `?title=${titleQuery}&content=${contentQuery}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(posts => {
            displayPosts(posts);
        })
        .catch(error => console.error('Error searching posts:', error));
}

// Function to display posts on the page
function displayPosts(posts) {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
        postContainer.appendChild(postDiv);
    });
}


// Function to update a post
function updatePost() {
    var baseUrl = document.getElementById('api-base-url').value;
    var postId = document.getElementById('update-id').value;
    var postTitle = document.getElementById('update-title').value;
    var postContent = document.getElementById('update-content').value;

    // Validate if postId is a number
    if (isNaN(postId) || postId === "") {
        alert("Please enter a valid Post ID.");
        return;
    }

    fetch(baseUrl + '/posts/' + postId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error || 'Failed to update post.');
            });
        }
        return response.json();
    })
    .then(post => {
        console.log('Post updated:', post);
        loadPosts(); // Reload posts after update
        // Clear input fields
        document.getElementById('update-id').value = '';
        document.getElementById('update-title').value = '';
        document.getElementById('update-content').value = '';
    })
    .catch(error => {
        console.error('Error updating post:', error.message);
        alert(error.message);
    });
}
