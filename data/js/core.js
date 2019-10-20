const body = document.querySelector('body');
let storiesCache;
let commentsCache;
let storiesPerPage = 10;
let page = 1;

const baseUrl = "https://hacker-news.firebaseio.com/v0/";
const topStoriesUrl = baseUrl + "topstories.json";
// const container = document.querySelector('container');
body.addEventListener('click', handleClick);

function handleClick(e) {
    if (e.target.classList.contains('more_comments')) {
        body.innerHTML = '';
        //console.log(e.target.parentNode.id);
        openStory(e.target.parentNode.id);   
    } else if (e.target.classList.contains('button_previous')) {
        if (page > 1) {
            page--;
            loadPage(page, storiesPerPage);
        }
    } else if (e.target.classList.contains('button_next')) {
        page++;
        loadPage(page, storiesPerPage);
    }
}

// https://hacker-news.firebaseio.com/v0/item/21278545.json
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
    loadCommentsIDs(storyID);
    loadCommentsIDs(storyID).then(pr => loadComments(pr, body));
}

function getTopStoriesIDs(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw Error (response.statusText);
        }
        return response.json();
    });
}

function loadStories(storyIDArr) {
    let promisesArr = [];
    //let limit = (storyIDArr.length < count) ? storyIDArr.length : count;
    for (let i = 0; i < storyIDArr.length; i++) {
        let url = baseUrl + "item/" + storyIDArr[i] + ".json";
        const div = document.createElement('div');
        const link = document.createElement('a');
        const p = document.createElement('p');
        div.classList.add('story');
        p.classList.add('more_comments');
        p.innerText = "comments";
        promisesArr.push(
            fetch(url).then(storyJson => {
                    return storyJson.json();
            }).then(storyJson => {
                    div.id = storyJson.id;
                    link.href = storyJson.url;
                    link.innerText = storyJson.title;
                    commentsCache = storyJson.kids;
                    div.appendChild(link);
                    div.appendChild(p);
                    body.appendChild(div);
            })
        );
    }
    return Promise.all(promisesArr);
}
// 0-9, 10-19, 20-29
//0-14, 15-29, 30-45

function loadPage(page, storiesPerPage) {
    getTopStoriesIDs(topStoriesUrl).then(ids => {
        storiesFrom = (page === 1 ) ? 0 : (storiesPerPage * page);
        storiesTo = storiesFrom + storiesPerPage - 1;
        return loadStories(ids.slice(storiesFrom, storiesTo));
    }).then(() => {
        let div = document.createElement('div');
        let p = document.createElement('p');
        p.innerText = page;
        div.classList.add('control');
        const buttonPrevious = document.createElement('button');
        const buttonNext = document.createElement('button');
        buttonPrevious.classList.add('button_previous');
        buttonPrevious.innerText = 'Previous';
        buttonNext.innerText = 'Next';
        buttonNext.classList.add('button_next');
        div.appendChild(buttonPrevious);
        div.appendChild(p);
        div.appendChild(buttonNext);
        body.appendChild(div);
    }); 
} 


loadPage(page,10);