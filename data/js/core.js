const body = document.querySelector('body');
body.addEventListener('click', handleClick);

function handleClick(e) {
    if (e.target.classList.contains('more_comments')) {
        body.innerHTML = '';
        //console.log(e.target.parentNode.id);
        openStory(e.target.parentNode.id);   
    } else if (e.target.classList.contains('story')) {    
    }
}

// https://hacker-news.firebaseio.com/v0/item/21278545.json


const baseUrl = "https://hacker-news.firebaseio.com/v0/";
// const topStoriesUrl = baseUrl + "topstories.json"
//https://hacker-news.firebaseio.com/v0/user/ryanlol.json

function loadCommentsIDs(storyID) {
    // console.log(baseUrl + "item/" + storyID + ".json");
    return fetch(baseUrl + "item/" + storyID + ".json").then(story => {
        return story.json();
    }).then(json => {
        // console.log(json);
        return json.kids;
    });
}

function loadComments(commentIDs, appendTo = body, depth = 0, count = 10) {
    //const baseUrl = "https://hacker-news.firebaseio.com/v0/item/";
    const limit = ((commentIDs.length < count) ? commentIDs.length : count);
    for (let i = 0; i < limit; i++) {
        const div = document.createElement('div');
        const user = document.createElement('a');
        div.classList.add('comment');
        fetch(baseUrl + "item/" + commentIDs[i] + ".json").then(comment => {
            return comment.json();
        }).then(comment => {
            user.href = baseUrl + "user/" + comment.by + ".json";
            user.innerText = comment.by;
            div.appendChild(user);
            div.id = comment.id;
            div.innerHTML += comment.text;
            if (comment.kids) {
                return loadComments(comment.kids, div, depth++, count);
            }
        });
        appendTo.appendChild(div);
    }
}

function openStory(storyID) {
    loadStories([storyID]);
    loadCommentsIDs(storyID).then(pr => console.log(pr));
    loadCommentsIDs(storyID).then(pr => loadComments(pr, body));
}

let storiesCache;
let commentsCache;

const topStoriesUrl = baseUrl + "topstories.json";

function getTopStoriesIDs(url, from = 0, to = 10) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw Error (response.statusText);
        }
        return response.json();
    }).then(storiesJson => {
        storiesCache = storiesJson.slice(from, to);
        return storiesCache;
    });
}

function loadStories(storyIDArr) {
    for (let i = 0; i < storyIDArr.length; i++) {
        let url = baseUrl + "item/" + storyIDArr[i] + ".json";
        const div = document.createElement('div');
        const link = document.createElement('a');
        const p = document.createElement('p');
        div.classList.add('story');
        p.classList.add('more_comments');
        p.innerText = "comments";
        fetch(url).then(storyJson => {
                return storyJson.json();
        }).then(storyJson => {
                console.log(storyIDArr[i]);
                div.id = storyJson.id;
                link.href = storyJson.url;
                link.innerText = storyJson.title;
                commentsCache = storyJson.kids;
                div.appendChild(link);
                div.appendChild(p);
                body.appendChild(div);
        });
    }
}

getTopStoriesIDs(topStoriesUrl).then(storyIDArr => {
    loadStories(storyIDArr);
});

// getTopStories(topStoriesUrl);