const body = document.querySelector('body');
// // let url = "https://hacker-news.firebaseio.com/v0/maxitem.json";

// // fetch(url).then(response => {
// //     return response.text();
// // }).then(txt => {
// //     console.log(txt);
// // })

// let url = "https://hacker-news.firebaseio.com/v0/maxitem.json";

// let topStoryId = fetch(url).then(response => {
//     if (!response.ok) {
//         throw Error (response.statusText);
//     }

//     return response.text();
// });


// function getTopStory(id) {
//     let url = "https://hacker-news.firebaseio.com/v0/item/" + id +".json";
//     return fetch(url).then(response => {
//         if (!response.ok) {
//             throw Error (response.statusText);
//         }
//         return response.json();
//     });
// }
// // let id = "21274400"
// // let url = "https://hacker-news.firebaseio.com/v0/item/21274400.json";
// // fetch(url).then(response => {
// //     if (!response.ok) {
// //         throw Error (response.statusText);
// //     }
// //     return response.json()
// // }).then(response => {
// //     console.log(response);
// // });

// getTopStory(21274400).then(result => console.log(result));

let topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
const baseUrl = "https://hacker-news.firebaseio.com/v0/";

fetch(topStoriesUrl).then(response => {
    if (!response.ok) {
        throw Error (response.statusText);
    }
    return response.json();
}).then(resp => {
    //console.log(resp[0]);
    let url = baseUrl + "item/" + resp[0] + ".json";
    return fetch(url).then(storyJson => {
        return storyJson.json();
    }).then(storyJson => {
        const h1 = document.createElement('h1');
        h1.innerText = storyJson.title;
        body.appendChild(h1);
        for (let i = 0; i < 10; i++) {
            let div = document.createElement('div');
            fetch(baseUrl + "item/" + storyJson.kids[i] + ".json").then(comment => {
                return comment.json();
            }).then(comment => {
                div.innerText = comment.text;
                console.log(comment);
                body.appendChild(div);
            });
        }
        //console.log(storyJson);
    });
})


// .then(resp => {
//     console.log(resp);
// });
