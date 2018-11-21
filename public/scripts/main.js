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
        //Chat
        chatTeamSelected: "GlobalChat",
        loginDone: false,
        chatTextInput: "",
        chatMessages: []
    },
    methods: {
        showHidePages: function (id_pageToShow, infoToShow) {
            if (infoToShow) {
                if (id_pageToShow == "teamInfo") {
                    this.teamToShow = infoToShow;
                } else if (id_pageToShow == "matchInfo") {
                    this.matchToShow = infoToShow;
                    this.goalsSorted = this.sortMatchGoals(infoToShow.localTeam.events.goals, infoToShow.visitingTeam.events.goals)
                }
            }

            //Nav Bar
            var navA = document.getElementsByClassName("navA");
            for (let i = 0; i < navA.length; i++) {
                navA[i].classList.remove("aActive");
            }
            if ((id_pageToShow == "page-list-teams") || (id_pageToShow == "index2") || (id_pageToShow == "rankings") || (id_pageToShow == "chat")) {
                document.getElementById(id_pageToShow).classList.add("aActive");
            }

            this.pageToShow = id_pageToShow;

            if (id_pageToShow == "chat") {
                setTimeout(() => {
                    this.scrollDown();
                }, 100);
            }
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

                    this.loading = true;
                })
        },
        prepareData: function () {
            console.time("data")

            //Plain teamToShow, matchToShow and matchdaySelected to avoid errors the first time.
            for (let i = 0; i < this.matchdays.length; i++) {
                if (this.matchdays[i].actualMatchday) {
                    this.matchdaySelected = this.matchdays[i].matchday;
                }
            }
            this.teamToShow = this.teams[0];
            this.matchToShow = this.matchdays[0].dates[0].matchesList[0];

            //Add the necessary keys to the teams object: schedule and rankingTableInfo:
            for (let i = 0; i < this.teams.length; i++) {
                //Add schedule key in teams
                this.teams[i].schedule = [];

                //Add rankingTableInfo key with a empty object to each team:
                var obj = {
                    points: 0,
                    matchesPlayed: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsInFavour: 0,
                    goalsAgainst: 0,
                    arrayWDL: []
                };
                this.teams[i].rankingTableInfo = obj;
            }

            //Fill Obj teams and Obj matchdays with necessary info to show in the web-app:
            for (let i = 0; i < this.matchdays.length; i++) { //1.1- loop into each matchday in the matchdays array
                for (let j = 0; j < this.matchdays[i].dates.length; j++) { //1.2- loop into each date in each matchday
                    for (let k = 0; k < this.matchdays[i].dates[j].matchesList.length; k++) { //1.3- loop into each match in each date
                        for (let l = 0; l < this.teams.length; l++) { //2.1- loop into each team in the teams array
                            if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].localTeam.name) { //LocalT
                                //A.L- Fill matches with the logo of the two teams and the stadium info of local team:
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
                                //A.L- End
                                //B.L- Calculate the Ranking League Table 
                                if (this.matchdays[i].dates[j].matchesList[k].matchEnd) {
                                    var resultSign = this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length - this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                    if (resultSign > 0) {
                                        //win
                                        this.teams[l].rankingTableInfo.wins++;
                                        this.teams[l].rankingTableInfo.points += 3;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("W");
                                    } else if (resultSign < 0) {
                                        //losse
                                        this.teams[l].rankingTableInfo.losses++;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("L");
                                    } else {
                                        //draw
                                        this.teams[l].rankingTableInfo.draws++;
                                        this.teams[l].rankingTableInfo.points += 1;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("D");
                                    }

                                    this.teams[l].rankingTableInfo.matchesPlayed++;

                                    this.teams[l].rankingTableInfo.goalsInFavour += this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length;

                                    this.teams[l].rankingTableInfo.goalsAgainst += this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                }
                                //B.L- End
                            } else if (this.teams[l].name == this.matchdays[i].dates[j].matchesList[k].visitingTeam.name) { //VisitingT
                                //A.V- Fill matches with the logo of the two teams and the stadium info of local team:
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
                                //A.V-End
                                //B.V- Calculate the Ranking League Table 
                                if (this.matchdays[i].dates[j].matchesList[k].matchEnd) {
                                    var resultSign = this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length - this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;
                                    if (resultSign > 0) {
                                        //losse
                                        this.teams[l].rankingTableInfo.losses++;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("L");
                                    } else if (resultSign < 0) {
                                        //win
                                        this.teams[l].rankingTableInfo.wins++;
                                        this.teams[l].rankingTableInfo.points += 3;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("W");
                                    } else {
                                        //draw
                                        this.teams[l].rankingTableInfo.draws++;
                                        this.teams[l].rankingTableInfo.points += 1;
                                        this.teams[l].rankingTableInfo.arrayWDL.push("D");
                                    }

                                    this.teams[l].rankingTableInfo.matchesPlayed++;

                                    this.teams[l].rankingTableInfo.goalsInFavour += this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length;

                                    this.teams[l].rankingTableInfo.goalsAgainst += this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length;
                                }
                                //B.V- End
                            }
                        } //2.1- End

                        //C- Generate Ranking Top Scorer:
                        if (this.matchdays[i].dates[j].matchesList[k].matchEnd) {
                            //loop in each goal of localTeams
                            for (let l = 0; l < this.matchdays[i].dates[j].matchesList[k].localTeam.events.goals.length; l++) {
                                //Check if the player is already added
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
                            //loop in each goal of visitingTeams
                            for (let l = 0; l < this.matchdays[i].dates[j].matchesList[k].visitingTeam.events.goals.length; l++) {
                                //Check if the player is already added
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
                        } //C- End
                    } //1.3- End
                } //1.2- End
            } //1.1- End

            //C- Sort topScorer
            this.topScorer.sort(function (a, b) {
                return b.goals - a.goals;
            })

            //D- Sort Teams by Points
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

            //D- Save Teams League Table Position
            for (let i = 0; i < this.teams.length; i++) {
                this.teams[i].rankingTableInfo.position = i + 1;
            }

            //E- Generate Ranking Best Goalkeeper:
            for (let i = 0; i < this.teams.length; i++) {
                var obj = {
                    playerName: this.teams[i].members.players.goalkeeper[0].name,
                    teamName: this.teams[i].name,
                    goalsAgainst: this.teams[i].rankingTableInfo.goalsAgainst
                }
                this.bestGoalkeeper.push(obj);
            }

            //E- Sort beastGoalkeeper
            this.bestGoalkeeper.sort(function (a, b) {
                return a.goalsAgainst - b.goalsAgainst;
            });

            console.timeEnd("data")
            //Before Refactor: data: 6.492919921875ms
            //After Refactor: data: 3.8798828125ms
        },
        sortMatchGoals: function (localGoals, visitingGoals) {
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
            firebase.auth().signInWithPopup(provider).then(() => {
                this.loginDone = true;
                setTimeout(() => {
                    this.getPost();
                }, 100);
            });

            console.log("login");
        },
        logout: function () {
            firebase.auth().signOut().then(() => {
                // Sign-out successful.
                console.log("logout");
                this.loginDone = false;
            }, (error) => {
                // An error happened.
                console.log("upss")
            });

        },
        correctDate: function (number) {
            var stringNum = "" + number;
            if (stringNum.length == 1) {
                return "0" + number;
            } else {
                return number;
            }
        },
        writeNewPost: function () {
            // https://firebase.google.com/docs/database/web/read-and-write

            // Values
            var textInput = this.chatTextInput.trim();
            console.log(textInput);
            if (textInput != "") {
                var userName = firebase.auth().currentUser.displayName;
                console.log(userName);
                var date = new Date();
                var time = this.correctDate(date.getHours()) + ":" + this.correctDate(date.getMinutes());
                console.log(time);
                var dayMonthYear = this.correctDate(date.getDate()) + "-" + this.correctDate(date.getMonth() + 1) + "-" +
                    date.getFullYear();
                console.log(date.getFullYear());

                // A post entry.
                var message = {
                    messageText: textInput,
                    userName: userName,
                    time: time,
                    dayMonthYear: dayMonthYear
                };
                console.log(message);

                // Get a key for a new Post.
                //firebase.database().ref("myChat").push(message);
                firebase.database().ref(this.chatTeamSelected).push(message);

                //Clear textInput
                this.chatTextInput = "";

                //Write data
                console.log("write");

                setTimeout(() => {
                    this.scrollDown();
                }, 100);
            }

        },
        getPost: function () {
            firebase.database().ref(this.chatTeamSelected).on('value', (data) => {
                this.chatMessages = [];

                var messages = data.val();

                var lastUserName = null;
                var lastDay = null;
                for (var key in messages) {
                    var element = messages[key];
                    var obj = {
                        userName: element.userName,
                        messageText: element.messageText,
                        time: element.time,
                        dayMonthYear: element.dayMonthYear
                    }

                    if (element.userName == firebase.auth().currentUser.displayName) {
                        obj.isTheUser = true;
                    } else {
                        obj.isTheUser = false;
                    }

                    if (lastDay == element.dayMonthYear) {
                        obj.isTheFirstMessageOfDay = false;
                    } else {
                        obj.isTheFirstMessageOfDay = true;
                        lastDay = element.dayMonthYear;
                    }

                    if (lastUserName == element.userName && !obj.isTheFirstMessageOfDay) {
                        obj.isTheFirstMessage = false;
                    } else {
                        obj.isTheFirstMessage = true;
                        lastUserName = element.userName;
                    }

                    this.chatMessages.push(obj);
                }

            })

            console.log("getting posts");
        },
        changeBackground: function () {
            switch (this.chatTeamSelected) {
                case "GlobalChat":
                    document.getElementsByClassName("chat")[0].style.background = "rgba(159, 203, 156, 0.52) url('../images/logo.png') no-repeat center";
                    document.getElementsByClassName("chat")[0].style.backgroundSize = "100% auto";
                    document.getElementsByClassName("chat")[0].style.backgroundAttachment = "fixed";
                    break;
                default:
                    for (var i = 0; i < this.teams.length; i++) {
                        if (this.teams[i].name == this.chatTeamSelected) {
                            break;
                        }
                    }
                    //linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,.5))
                    document.getElementsByClassName("chat")[0].style.background = "rgba(159, 203, 156, 0.52) url(" + this.teams[i].logo.url + ") no-repeat center";
                    document.getElementsByClassName("chat")[0].style.backgroundSize = "100% auto";
                    document.getElementsByClassName("chat")[0].style.backgroundAttachment = "fixed";
                    break;
            }
            setTimeout(() => {
                this.scrollDown();
            }, 1000);
        },
        scrollDown: function () {
            document.getElementsByClassName("box")[0].scrollTop = document.getElementsByClassName("box")[0].scrollHeight;
            console.log("Scroll");
        }
    },
    computed: {
        selectMatchday: function () {
            for (let i = 0; i < this.matchdays.length; i++) {
                if (this.matchdays[i].matchday == this.matchdaySelected) {
                    return this.matchdays[i].dates;
                }
            }
        }
    },
    created: function () {
        this.startFetch(this.url);
        document.getElementsByClassName("chat")[0].style.background = "rgba(159, 203, 156, 0.52) url('../images/logo.png') no-repeat center";
        document.getElementsByClassName("chat")[0].style.backgroundSize = "100% auto";
        document.getElementsByClassName("chat")[0].style.backgroundAttachment = "fixed";
        setTimeout(() => {
            if (firebase.auth().currentUser != null) {
                this.loginDone = true;
                setTimeout(() => {
                    this.getPost();
                }, 100);
            }
        }, 1000);
    }
});
