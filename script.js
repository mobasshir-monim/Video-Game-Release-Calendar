const apiKey='2d8c8710aa3a4f418493a528f357ca23';
let currentMonth=new Date().getMonth();
let currentYear=new Date().getFullYear();

//function to remove html tag from a string

function stripHtml(input){
    const doc = new DOMParser().parseFromString(input,'text/html');
    return doc.body.textContent || "";
}

//function to fetch games for a giver year and month from api

function fetchGamesForMonth(year,month){
   
    //updating display style of navigation buttons  based on the current date
   
   
    document.querySelector('#prevMonth').style.display= (month <= new Date().getMonth()-1 && year ===new Date().getFullYear())? 'none' : 'block';
    document.querySelector('#nextMonth').style.display= (month >= new Date().getMonth()+1 && year ===new Date().getFullYear())? 'none' : 'block';

    //performing the api request

    fetch(`https://api.rawg.io/api/games?dates=${year}-${month+1}-01,${year}-${month+1}-30&key=${apiKey}`).then(response => response.json()).then(data =>{
        //filtering games to only include the ones with images
        const games=data.results.filter(game => game.background_image);

        //calculating the number of days in the given month
        const dayInMonth=new Date(year,month+1,0).getDate();
        let htmlContent='';
        for(let i=1;i<=dayInMonth;i++) {
            let gamesForDay=games.filter(game => new Date(game.released).getDate()===i);

            htmlContent+= `
                <div class="date">
                    <strong>${i}</strong>
                    ${gamesForDay.map(game => `
                        <div class="game" data-id="${game.id}">
                             <img src="${game.background_image}" alt="${game.name} Thumbnail">
                             <div class="game-details">${game.name}</div>
                        </div>
                `).join('')}
            </div>
            `;
        }

        document.querySelector('#calendar').innerHTML=htmlContent;
        document.querySelector('#currentMonthYear').innerText=`${monthNames[month]} ${year}`;

        //add click event listener for each game to show modal

        document.querySelectorAll('.game').forEach(gameEl => {
            gameEl.addEventListener('click', () =>{
                const gameId=gameEl.getAttribute('data-id');

                //fetch game details

                fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`).then(response => response.json()).then(gameDetails => {
                    document.querySelector('#gameTitle').innerText= gameDetails.name;
                    document.querySelector('#gameImage').src= gameDetails.background_image;

                    const descriptionElement= document.querySelector('.modal-content p strong');
                    descriptionElement.nextSibling.nodeValue=" " + stripHtml(gameDetails.description || "No description available");

                    document.querySelector('#gameReleaseDate').innerText= gameDetails.released;
                    document.querySelector('#gameRating').innerText= gameDetails.rating;
                    document.querySelector('#gamePlatforms').innerText= gameDetails.platforms.map(platform => platform.platform.name).join(',');
                    document.querySelector('#gameModal').style.display= 'block';

                });
            });
        });
    });
};

const monthNames= ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];


document.querySelector('#prevMonth').addEventListener('click',() =>{
    currentMonth--;
    if (currentMonth<0){
        currentMonth=11;
        currentYear--;
    }
    fetchGamesForMonth(currentYear,currentMonth);

});
    
document.querySelector('#nextMonth').addEventListener('click',() =>{
    
    currentMonth++;
        if(currentMonth>11){
            currentMonth=0;
            currentYear++;
        }
        fetchGamesForMonth(currentYear,currentMonth);
    });


//close modal function
document.querySelector('.close').addEventListener('click', () =>{
    document.querySelector('#gameModal').style.display='none';
});

window.addEventListener('click', (event) => {
    if (event.target ===document.querySelector('#gameModal')){
        document.querySelector('#gameModal').style.display='none';
    }
});

fetchGamesForMonth(currentYear,currentMonth);