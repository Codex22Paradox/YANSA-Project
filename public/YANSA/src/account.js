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

const template = `
<div class="col-auto mt-3">
    <div class="card" id="%ID">
        <div class="tools justify-content-end"></div>
        <div class="card__content">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex align-items-center">
                            <div class="col-3">
                                <img src="./images/Logo.png" class="card-img-top rounded-circle w-100" alt="Profilo">
                            </div>
                            <div class="col-md-5 text-start">
                                <h2 class="text-white text-truncate account-title" title="%TITLE">%AUTORE</h2>
                            </div>
                            <div class="col-auto ms-2"> <!-- Increased width for more space -->
                                <div class="row">
                                    <p class="text-light account bg-success rounded-3 p-2 account">%SEGUITI</p>
                                </div>
                                <div class="row">
                                    <p class="text-light account bg-success rounded-3 p-2 account">%SEGUITI</p>
                                </div>
                            </div>
                            <div class="col-auto d-flex align-items-center">
                            <div class="row ms-3">
                                <button class="btn-account rounded-4" > 
    <span class="material-symbols-rounded align-middle">person_add</span>
</button>
                                </div>
                            </div>
                        </div>
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
        console.log(element);
        html += template.replace('%ID', element.username).replace('%AUTORE', element.username).replace('%TITLE', element.username).replace('%SEGUITI', 'Seguiti').replace('%SEGUITI', 'Seguiti');
    });
    div.innerHTML = html;
}
