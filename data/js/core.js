const body = document.querySelector('body');
const container = document.querySelector('.container');
let storiesCache = [];
let commentsCache;
let storiesPerPage = 10;
let page = 1;

const baseUrl = "https://hacker-news.firebaseio.com/v0/";
const topStoriesUrl = baseUrl + "topstories.json";
// const container = document.querySelector('container');
container.addEventListener('click', handleClick);

function handleClick(e) {
    if (e.target.classList.contains('more_comments')) {
        container.innerHTML = '';
        //console.log(e.target.parentNode.id);
        openStory(e.target.parentNode.id);   
    } else if (e.target.classList.contains('button_previous')) {
        if (page > 1) {
            page--;
            container.innerHTML = '';
            loadPage(page, storiesPerPage);
        }
    } else if (e.target.classList.contains('button_next')) {
        page++;
        container.innerHTML = '';
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

function CommentTree(data) {
    let node = new Node(data);
    this._root = node;
}

function CommentNode(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
}

CommentTree.prototype.traverseDepthFirst = function(callback) {
    (function recurse(currentNode) {
        for (let i = 0, length = currentNode.children.length; i < length; i++) {
            recurse(currentNode.children[i]);
        }

        callback(currentNode);
    })(this._root);
}

function loadComments(commentIDs, appendTo = container, depth = 0, count = 10) {
    //const baseUrl = "https://hacker-news.firebaseio.com/v0/item/";
    const limit = ((commentIDs.length < count) ? commentIDs.length : count);
    for (let i = 0; i < limit; i++) {
        const div = document.createElement('div');
        const user = document.createElement('a');
        user.classList.add('user');
        if (depth!==0) {
            div.classList.add('subcomment');
        } else {
            div.classList.add('comment');
        }
        fetch(baseUrl + "item/" + commentIDs[i] + ".json").then(comment => {
            return comment.json();
        }).then(comment => {
            user.href = baseUrl + "user/" + comment.by + ".json";
            user.innerText = comment.by;
            div.appendChild(user);
            div.id = comment.id;
            div.innerHTML += comment.text;
            if (comment.kids) {
                if ((i === limit - 1) && (commentIDs.length > limit)) {
                    let moreP = document.createElement('p');
                    moreP.classList.add('load_more');
                    moreP.innerText = 'load more';
                    appendTo.appendChild(moreP);
                }
                return loadComments(comment.kids, div, ++depth, count);
            }
        });

        appendTo.appendChild(div);
    }
}
// function loadComments(commentIDs, appendTo = container, depth = 0, count = 10) {
//     //const baseUrl = "https://hacker-news.firebaseio.com/v0/item/";
//     const limit = ((commentIDs.length < count) ? commentIDs.length : count);
//     for (let i = 0; i < limit; i++) {
//         const div = document.createElement('div');
//         const user = document.createElement('a');
//         user.classList.add('user');
//         if (depth!==0) {
//             div.classList.add('subcomment');
//         } else {
//             div.classList.add('comment');
//         }
//         fetch(baseUrl + "item/" + commentIDs[i] + ".json").then(comment => {
//             return comment.json();
//         }).then(comment => {
//             user.href = baseUrl + "user/" + comment.by + ".json";
//             user.innerText = comment.by;
//             div.appendChild(user);
//             div.id = comment.id;
//             div.innerHTML += comment.text;
//             if (comment.kids) {
//                 if ((i === limit - 1) && (commentIDs.length > limit)) {
//                     let moreP = document.createElement('p');
//                     moreP.classList.add('load_more');
//                     moreP.innerText = 'load more';
//                     appendTo.appendChild(moreP);
//                 }
//                 return loadComments(comment.kids, div, ++depth, count);
//             }
//         });

//         appendTo.appendChild(div);
//     }
// }

function openStory(storyID) {
    const json = storiesCache.find(el => {
        return (el.id == storyID);
    });
    const div = document.createElement('div');
    const link = document.createElement('a');
    const p = document.createElement('p');
    div.classList.add('story');
    div.id = json.id;
    link.href = json.url;
    link.innerText = json.title;
    commentsCache = json.kids;
    div.appendChild(link);
    container.appendChild(div);
    loadCommentsIDs(storyID).then(pr => loadComments(pr, container));
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
        promisesArr.push(
            fetch(url).then(storyJson => {
                    return storyJson.json();
            })
        );
    }
    return Promise.all(promisesArr);
}

function loadPage(page, storiesPerPage) {
    getTopStoriesIDs(topStoriesUrl).then(ids => {
        storiesFrom = (page === 1 ) ? 0 : (storiesPerPage * page);
        storiesTo = storiesFrom + storiesPerPage - 1;
        return loadStories(ids.slice(storiesFrom, storiesTo));
    }).then(stories => {
        stories.forEach(json => {
            storiesCache.push(json);
            const div = document.createElement('div');
            const link = document.createElement('a');
            const p = document.createElement('p');
            div.classList.add('story');
            p.classList.add('more_comments');
            p.innerText = "comments";
            div.id = json.id;
            link.href = json.url;
            link.innerText = json.title;
            commentsCache = json.kids;
            div.appendChild(link);
            div.appendChild(p);
            container.appendChild(div);
        });
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
        container.appendChild(div);
    }); 
} 

loadPage(page,10);