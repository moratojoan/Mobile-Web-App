var app = new Vue({
    el:"#app",
    data:{
        pageToShow:"index2" 
    },
    methods:{
        showHidePages: function(id_pageToShow){
            var allPages = document.getElementsByClassName("page");
            for(let i=0; i<allPages.length;i++){
                if(allPages[i].getAttribute("id") == id_pageToShow){
                    this.pageToShow=id_pageToShow;
                }
            }
        }
    }
})