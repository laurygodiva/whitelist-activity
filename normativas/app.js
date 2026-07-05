const menu = document.getElementById("menu");
const viewer = document.getElementById("viewer");
const iframe = document.getElementById("flipbook");
const back = document.getElementById("back");

const books = {
    general: "flipbooks/general/index.html"
};

document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("click", () => {

        const id = card.dataset.book;

        iframe.src = books[id];

        menu.style.display = "none";
        viewer.style.display = "block";

    });

});

back.addEventListener("click", () => {

    iframe.src = "";

    viewer.style.display = "none";
    menu.style.display = "flex";

});
