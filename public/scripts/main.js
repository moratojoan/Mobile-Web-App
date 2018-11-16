var app = new Vue({
    el: "#app",
    data: {
        loading: false,
        pageToShow: "index2",
        url: "https://api.jsonbin.io/b/5bed66773c134f38b0195ba0/7",
        teams: null,
        matchdays: null,
        teamToShow: null,
        matchToShow: null,
        goalsSorted: null,
        matchdaySelected: null,
        bestGoalkeeper: [],
        topScorer: [],
        chatTeamSelected: "select"
    },
    methods: {
        showHidePages: function (id_pageToShow, infoToShow) {
            if (infoToShow) {
                if (id_pageToShow == "teamInfo") {
                    this.teamToShow = infoToShow;
                } else if (id_pageToShow == "matchInfo") {
                    this.matchToShow = infoToShow;
                    this.goalsSorted = this.sortGoals(infoToShow.localTeam.events.goals, infoToShow.visitingTeam.events.goals)
                }
            }

            this.pageToShow = id_pageToShow;
        },
        startFetch: function (url) {
            fetch(url, {
                    method: "GET"
                })
                .then(response => response.json())
                .then(myData => {
                    console.log(myData);
                    //Plain general data.
                    this.teams = myData.teams;
                    this.matchdays = myData.matchdays;

                    this.prepareData();

                    this.getPost();

                    this.loading = true;
                })
        },
        prepareData: function () {
            //Plain teamToShow, matchToShow and matchdaySelected to avoid errors the first time.
            for (let i = 0; i < this.matchdays.length; i++) {
                if (this.matchdays[i].actualMatchday) {
                    this.matchdaySelected = this.matchdays[i].matchday;
                }
            }
            this.teamToShow = this.teams[0];
            this.matchToShow = this.matchdays[0].dates[0].matchesList[0];

            //Fill the match objects with the team info needed && //Fill the teams objects with their schedule and result
            for (let i = 0; i < this.teams.length; i++) {
                this.teams[i].schedule = [];
            }
            for (let i = 0; i < this.matchdays.length; i++) {
                for (let j = 0; j < this.matchdays[i].dates.length; j++) {
                    for (let k = 0; k < this.matchdays[i].dates[j].matchesList.length; k++) {
                        for (let l = 0; l < this.teams.length; l++) {
                            if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].localTeam.name) {
                                //Fill the match objects with the team info needed
                                this.matchdays[i].dates[j].matchesList[k].localTeam.logo = this.teams[l].logo;
                                this.matchdays[i].dates[j].matchesList[k].localTeam.stadium = this.teams[l].stadium;

                                //Fill the teams objects with their schedule and result
                                var obj = {
                                    localTeam: this.matchdays[i].dates[j].matchesList[k].localTeam.name,
                                    visitingTeam: this.matchdays[i].dates[j].matchesList[k].visitingTeam.name,
                                    schedule: this.matchdays[i].dates[j].matchesList[k].schedule,
                                    result: this.matchdays[i].dates[j].matchesList[k].result
                                }
                                this.teams[l].schedule.push(obj);
                            } else if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].visitingTeam.name) {
                                //Fill the match objects with the team info needed
                                this.matchdays[i].dates[j].matchesList[k].visitingTeam.logo = this.teams[l].logo;

                                //Fill the teams objects with their schedule and result
                                var obj = {
                                    localTeam: this.matchdays[i].dates[j].matchesList[k].localTeam.name,
                                    visitingTeam: this.matchdays[i].dates[j].matchesList[k].visitingTeam.name,
                                    schedule: this.matchdays[i].dates[j].matchesList[k].schedule,
                                    result: this.matchdays[i].dates[j].matchesList[k].result
                                }
                                this.teams[l].schedule.push(obj);
                            }
                        }
                    }
                }
            }

            //Generate Ranking Tables:
            for (let i = 0; i < this.teams.length; i++) {
                var obj = {
                    points: 0,
                    matchesPlayed: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsInFavour: 0,
                    goalsAgainst: 0
                };
                this.teams[i].rankingTableInfo = obj;
            }
            for (let i = 0; i < this.matchdays.length; i++) {
                for (let j = 0; j < this.matchdays[i].dates.length; j++) {
                    for (let k = 0; k < this.matchdays[i].dates[j].matchesList.length; k++) {
                        if (this.matchdays[i].dates[j].matchesList[k].matchEnd) {
                            for (let l = 0; l < this.teams.length; l++) {
                                if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].localTeam.name) {
                                    //Local Team
                                    var resultSign = this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length - this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                    if (resultSign > 0) {
                                        //win
                                        this.teams[l].rankingTableInfo.wins++;
                                        this.teams[l].rankingTableInfo.points += 3;
                                    } else if (resultSign < 0) {
                                        //losse
                                        this.teams[l].rankingTableInfo.losses++;
                                    } else {
                                        //draw
                                        this.teams[l].rankingTableInfo.draws++;
                                        this.teams[l].rankingTableInfo.points += 1;
                                    }

                                    this.teams[l].rankingTableInfo.matchesPlayed++;

                                    this.teams[l].rankingTableInfo.goalsInFavour += this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length;

                                    this.teams[l].rankingTableInfo.goalsAgainst += this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                } else if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].visitingTeam.name) {
                                    //Visiting Team
                                    var resultSign = this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length - this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                    if (resultSign > 0) {
                                        //losse
                                        this.teams[l].rankingTableInfo.losses++;
                                    } else if (resultSign < 0) {
                                        //win
                                        this.teams[l].rankingTableInfo.wins++;
                                        this.teams[l].rankingTableInfo.points += 3;
                                    } else {
                                        //draw
                                        this.teams[l].rankingTableInfo.draws++;
                                        this.teams[l].rankingTableInfo.points += 1;
                                    }

                                    this.teams[l].rankingTableInfo.matchesPlayed++;

                                    this.teams[l].rankingTableInfo.goalsInFavour += this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;

                                    this.teams[l].rankingTableInfo.goalsAgainst += this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length;
                                }
                            }
                        }
                    }
                }
            }
            //Sort Teams by Points
            this.teams.sort(function (a, b) {
                if (a.rankingTableInfo.points - b.rankingTableInfo.points > 0) {
                    return -1;
                } else if (a.rankingTableInfo.points - b.rankingTableInfo.points < 0) {
                    return 1;
                } else {
                    //if there is a draw, compere the goals difference
                    if ((a.rankingTableInfo.goalsInFavour - a.rankingTableInfo.goalsAgainst) - (b.rankingTableInfo.goalsInFavour - b.rankingTableInfo.goalsAgainst) > 0) {
                        return -1;
                    } else if ((a.rankingTableInfo.goalsInFavour - a.rankingTableInfo.goalsAgainst) - (b.rankingTableInfo.goalsInFavour - b.rankingTableInfo.goalsAgainst) < 0) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

            //Generate Ranking Best Goalkeeper:
            for (let i = 0; i < this.teams.length; i++) {
                var obj = {
                    playerName: this.teams[i].members.players.goalkeeper[0].name,
                    teamName: this.teams[i].name,
                    goalsAgainst: this.teams[i].rankingTableInfo.goalsAgainst
                }
                this.bestGoalkeeper.push(obj);
            }
            //Sort beastGoalkeeper
            this.bestGoalkeeper.sort(function (a, b) {
                return a.goalsAgainst - b.goalsAgainst;
            });

            //Generate Ranking Top Scorer:
            for (let i = 0; i < this.matchdays.length; i++) {
                for (let j = 0; j < this.matchdays[i].dates.length; j++) {
                    for (let k = 0; k < this.matchdays[i].dates[j].matchesList.length; k++) {
                        if (this.matchdays[i].dates[j].matchesList[k].matchEnd) {
                            for (let l = 0; l < this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length; l++) {
                                //comprovar si el jugador ya esta añadido a la lista o no
                                var playerAdded = false;
                                for (let m = 0; m < this.topScorer.length; m++) {
                                    if (this.topScorer[m].name == this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals[l].player) {
                                        //Player added before
                                        playerAdded = true;

                                        //Add a goal
                                        this.topScorer[m].goals++;
                                    }
                                }
                                if (!playerAdded) {
                                    var obj = {
                                        name: this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals[l].player,
                                        goals: 1,
                                        team: this.matchdays[i].dates[j].matchesList[k].localTeam.name
                                    }
                                    this.topScorer.push(obj);
                                }
                            }
                            for (let l = 0; l < this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length; l++) {
                                //comprovar si el jugador ya esta añadido a la lista o no
                                var playerAdded = false;
                                for (let m = 0; m < this.topScorer.length; m++) {
                                    if (this.topScorer[m].name == this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals[l].player) {
                                        //Player added before
                                        playerAdded = true;

                                        //Add a goal
                                        this.topScorer[m].goals++;
                                    }
                                }
                                if (!playerAdded) {
                                    var obj = {
                                        name: this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals[l].player,
                                        goals: 1,
                                        team: this.matchdays[i].dates[j].matchesList[k].visitingTeam.name
                                    }
                                    this.topScorer.push(obj);
                                }
                            }
                        }
                    }
                }
            }
            //Sort topScorer
            this.topScorer.sort(function(a,b){
                return b.goals - a.goals;
            })
        },
        sortGoals: function (localGoals, visitingGoals) {
            var allGoals = [...localGoals, ...visitingGoals];
            allGoals.sort(function (a, b) {
                return b.min - a.min;
            })
            return allGoals
        },

        //Chat Methods
        login: function () {
            // https://firebase.google.com/docs/auth/web/google-signin

            // Provider
            var provider = new firebase.auth.GoogleAuthProvider();

            // How to Log In
            firebase.auth().signInWithPopup(provider);

            console.log("login");
        },
        logout: function () {
            firebase.auth().signOut().then(function () {
                // Sign-out successful.
                console.log("logout")
            }, function (error) {
                // An error happened.
                console.log("upss")
            });
        },
        writeNewPost: function () {
            // https://firebase.google.com/docs/database/web/read-and-write

            // Values
            var textInput = document.getElementById("textInput").value;
            console.log(textInput);

            var userName = firebase.auth().currentUser.displayName;
            console.log(userName);

            // A post entry.
            var message = {
                messageText: textInput,
                name: userName
            };
            console.log(message);

            // Get a key for a new Post.
            firebase.database().ref("myChat").push(message);

            //Clear textInput
            document.getElementById("textInput").value = "";

            //Write data
            console.log("write");
        },
        getPost: function () {
            firebase.database().ref('myChat').on('value', function (data) {
                var posts = document.getElementById("posts");
                posts.innerHTML = "";

                var messages = data.val();

                for (var key in messages) {
                    var text = document.createElement("div");
                    var element = messages[key];

                    text.append(element.messageText);
                    posts.append(text);
                }

            })

            console.log("getting posts");
        }
    },
    created: function () {
        this.startFetch(this.url);
    },
    computed: {
        selectMatchday: function () {
            var day = parseInt(this.matchdaySelected.split(" ")[1]);
            return this.matchdays[day - 1].dates;
        }
    }
});
