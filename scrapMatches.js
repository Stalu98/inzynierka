const { Client } = require("pg");
const connectionString =
    "postgressql://postgres:postgres@localhost:5433/postgres";
const scraper = require("./scraper");
const puppeteer = require("puppeteer");

const client = new Client({
    connectionString: connectionString,
});

const season = "-2020-2021";
const headlessMode = true;

const leagues = [
    {
        name: "premierleague",
        url: `https://www.flashscore.pl/pilka-nozna/anglia/premier-league${season}/`,
    },
    {
        name: "bundesliga",
        url: `https://www.flashscore.pl/pilka-nozna/niemcy/bundesliga${season}/`,
    },
    {
        name: "seriea",
        url: `https://www.flashscore.pl/pilka-nozna/wlochy/serie-a${season}/`,
    },
    {
        name: "laliga",
        url: `https://www.flashscore.pl/pilka-nozna/hiszpania/laliga${season}/`,
    },
    {
        name: "ligue1",
        url: `https://www.flashscore.pl/pilka-nozna/francja/ligue-1${season}/`,
    },
];

// To pobiera mecze i wsadza je do bazy.
(async () => {
    // to odpala bota
    const browser = await puppeteer.launch({ headless: headlessMode });

    // to łączy się z bazą
    await client.connect();
    // to ustawia localsy żeby się daty dobrze wsadziły do bazy
    await client.query('SET DATESTYLE = ISO, DMY');


    // to pobiera teamy
    const ids = (
        await Promise.allSettled(
            leagues
                // to mapuje urle lig do podstron z wynikami
                .map(({ url }) => url + "wyniki/")
                // to wywołuje metode skrapera do skrapowania idików meczy
                .map((url) => scraper.getMatchIds(url, browser))
        )
    ).reduce((acc, result) => [...acc, ...result.value], []);

    console.log(ids);

    const matchResults = [];
    // to pobiera dane po 5 meczy na raz żeby bot nie zajebał procka i łącza
    for (let i = 0; i < ids.length; i += 5) {
        const results = await Promise.allSettled(
            ids.slice(i, i + 5).map((id) => scraper.getMatchData(id, browser))
        );
        console.log(results);
        const resultsChunk = results.map((result) => result.value);
        console.log(resultsChunk);
        matchResults.push(...resultsChunk);
    }

    // to wsadza mecze do bazki
    matchResults.forEach(async (match) => {
        // to dociąga id home teamu na podstawie jego nazwy żeby można było stworzyć relację
        const { id: homeTeamId } = (
            await client.query(`SELECT id FROM teams WHERE name=$1`, [
                match.homeTeam,
            ])
        ).rows[0];
        // to dociąga id away teamu na podstawie jego nazwy żeby można było stworzyć relację
        const { id: awayTeamId } = (
            await client.query(`SELECT id FROM teams WHERE name=$1`, [
                match.awayTeam,
            ])
        ).rows[0];

        // to wsadza dane teamow do bazki
        client.query(
            `INSERT INTO matches VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)`,
            [
                match.date,
                match.homeGoals,
                match.awayGoals,
                ...match.stats,
                homeTeamId,
                awayTeamId,
            ],
            (err, res) => {
                console.log(err, res);
            }
        );
    });
})();
