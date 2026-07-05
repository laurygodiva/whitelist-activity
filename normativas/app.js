const menu=document.getElementById("menu");

const viewer=document.getElementById("viewer");

const iframe=document.getElementById("flipbook");

document.querySelectorAll(".card").forEach(card=>{

    card.onclick=()=>{

        const book=card.dataset.book;

        iframe.src=`flipbooks/${book}/index.html`;

        menu.style.display="none";

        viewer.style.display="block";

    };

});

document.getElementById("back").onclick=()=>{

    viewer.style.display="none";

    menu.style.display="flex";

    iframe.src="";

};
