const buttonCategorie = document.getElementById('buttonCategorie');
const buttonAccount = document.getElementById('buttonAccount');
const cerca = document.getElementById('cerca');
const div = document.getElementById('noteContainer');
const loader = document.getElementById('loader');

let ricercaCorrente = null;
buttonCategorie.onclick = () => {
    buttonCategorie.classList.add('active');
    buttonAccount.classList.remove('active');
}

buttonAccount.onclick = () => {
    buttonAccount.classList.add('active');
    buttonCategorie.classList.remove('active');
}

cerca.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        if (ricercaCorrente) {
            ricercaCorrente.cancel = true;
        }
        ricercaCorrente = {cancel: false};
        const array = await searchAccount(event.target.value, ricercaCorrente);
        if (ricercaCorrente.cancel) return;
        await render(div, array);
    }
});

const searchAccount = async (testo, cancelToken) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`/searchUsers/${testo}`, {
        headers: {
            Authorization: token
        }
    });
    if (cancelToken.cancel) return [];
    return await response.json();
}

const template = `<div class="col-auto mt-3">
            <div class="card" id="%ID">
                <div class="tools justify-content-end"></div>
                <div class="card__content">
                    <div class="container">
                        <div class="row justify-content-between">
                            <div class="col-auto">
                                <h2 class="text-white">%AUTORE</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

div.innerHTML = template;

const render = async (div, array) => {
    div.innerHTML = '';
    let html = '';
    array.forEach((element) => {
        html += template;
    });
    div.innerHTML = html;
}
