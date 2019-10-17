const body = document.querySelector('body');

// https://hacker-news.firebaseio.com/v0/item/21278545.json


const baseUrl = "https://hacker-news.firebaseio.com/v0/";
const topStoriesUrl = baseUrl + "topstories.json"

function retrieveComments(commentIDs, appendTo = body, depth = 0) {
    //const baseUrl = "https://hacker-news.firebaseio.com/v0/item/";
    const limit = ((commentIDs.length < 10) ? commentIDs.length : 10);
    for (let i = 0; i < limit; i++) {
        let div = document.createElement('div');
        div.classList.add('comment');
        fetch(baseUrl + "item/" + commentIDs[i] + ".json").then(comment => {
            console.log(commentIDs[i]);
            return comment.json();
        }).then(comment => {
            div.innerHTML = comment.text;
            console.log(comment);
            if (comment.kids) {
                return retrieveComments(comment.kids, div, depth++);
            }
        });
        appendTo.appendChild(div);
    }
}

fetch(topStoriesUrl).then(response => {
    if (!response.ok) {
        throw Error (response.statusText);
    }
    return response.json();
}).then(resp => {
    // console.log(resp);
    let url = baseUrl + "item/" + resp[0] + ".json";
    return fetch(url).then(storyJson => {
        return storyJson.json();
    }).then(storyJson => {
        const h1 = document.createElement('h1');
        const link = document.createElement('a');
        link.href = storyJson.url;
        link.innerText = storyJson.title;
        //console.log(storyJson);
        h1.appendChild(link);
        body.appendChild(h1);
        retrieveComments(storyJson.kids, body, 0);
    });
});