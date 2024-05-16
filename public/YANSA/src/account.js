const buttonCategorie = document.getElementById('buttonCategorie');
const buttonAccount = document.getElementById('buttonAccount');
const cerca = document.getElementById('cerca');
const div = document.getElementById('noteContainer');
const loader = document.getElementById('loader');
const modalDetails = new bootstrap.Modal('#modalDetails', {});
let ricerca = 0 //0 account, 1 categorie
let ricercaCorrente = null;
buttonCategorie.onclick = () => {
    buttonCategorie.classList.add('active');
    buttonAccount.classList.remove('active');
    ricerca = 1;
    cerca.placeholder = 'Cerca categorie';
    cerca.value = '';
    div.innerHTML = '';
    div.classList.add('d-none');
    loader.classList.remove('d-none');
}

buttonAccount.onclick = () => {
    buttonAccount.classList.add('active');
    buttonCategorie.classList.remove('active');
    ricerca = 0;
    cerca.placeholder = 'Cerca account';
    cerca.value = '';
    div.innerHTML = '';
    div.classList.add('d-none');
    loader.classList.remove('d-none');
}

document.getElementById('homeButton').onclick = () => {
    window.location.href = './home.html';
};

document.getElementById('searchButton').onclick = () => {
    window.location.href = './ricerca.html';
};


document.getElementById("newNote").onclick = () => {
    sessionStorage.setItem("editorType", "new");
    window.location.href = "./editor.html"
}

cerca.addEventListener('input', async (event) => {
    if (event.target.value.length === 0) {
        div.innerHTML = '';
        div.classList.add('d-none');
        loader.classList.remove('d-none');
    } else {
        if (ricercaCorrente) {
            ricercaCorrente.cancel = true;
        }
        ricercaCorrente = {cancel: false};
        let array = [];
        if (ricerca === 0) {
            array = await searchAccount(event.target.value, ricercaCorrente);
        } else {
            array = await searchCategory(event.target.value, ricercaCorrente);
        }
        console.log(array);
        if (ricercaCorrente.cancel) return;
        if (ricerca === 0) {
            await renderAccount(div, array);
        } else {
            await renderCategory(div, array);
        }
        if (array.length === 0) {
            div.innerHTML = '<h1 class="text-center text-white">Nessun utente trovato</h1>';
        }
        loader.classList.add('d-none');
        div.classList.remove('d-none');
    }
});

const searchAccount = async (testo, cancelToken) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`/searchUsers/${testo}`, {
        headers: {
            Authorization: token
        }
    });
    console.log(response);
    if (cancelToken.cancel) return [];
    return await response.json();
}
const searchCategory = async (testo, cancelToken) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`/searchCategories/${testo}`, {
        headers: {
            Authorization: token
        }
    });
    console.log(response);
    if (cancelToken.cancel) return [];
    return await response.json();
}
const templateAccount = `
<div class="col-auto mt-3">
    <div class="cardAccount">
        <div class="tools justify-content-end"></div>
        <div class="card__content">
            <div class="container">
                <div class="row">
                    <div class="col-auto">
                        <div class="d-flex align-items-center">
                            <div class="col-3">
                                <img src="./images/Logo.png" class="card-img-top rounded-circle w-100" alt="Profilo">
                            </div>
                            <div class="col-md-5 text-start">
                                <h2 class="text-white text-truncate account-title" title="%TITLE" id="%ID">%AUTORE</h2>
                            </div>
                            <div class="col-md-2 ms-2"> 
                                <div class="row">
                                    <p class="text-light account bg-success rounded-3 p-2 account">Seguaci: %FOLLOWER</p>
                                </div>
                                <div class="row">
                                    <p class="text-light account bg-success rounded-3 p-2 account">Seguiti: %SEGUITI</p>
                                </div>
                            </div>
                            <div class="col-auto d-flex align-items-center">
                            <div class="row ms-3">
                                <button class="btn-account rounded-4" type="button" id="button_%ID_%STATUS"> 
    <span class="material-symbols-rounded align-middle">%PERSON</span>
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
const templateCategory = `
<div class="col-auto mt-3">
    <div class="cardAccount" id="%ID">
        <div class="tools justify-content-end"></div>
        <div class="card__content">
            <div class="container">
                <div class="row">
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <div class="col-md-4 text-start mb-2">
                            <h2 class="text-white text-truncate account-title" title="%TITLE">%NOME</h2>
                        </div>
                        <div class="col-md-auto text-center">
                            <p class="text-light account bg-success rounded-3 p-2 account">Follower: %FOLLOWER</p>
                        </div>
                        <div class="col-md-auto text-end mb-3">
                            <button class="btn-account rounded-4" type="button" id="button_%ID_%STATUS"> 
                                <span class="material-symbols-rounded align-middle">%PERSON</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
const renderAccount = async (div, array) => {
    div.innerHTML = '';
    let html = '';
    array.forEach((element) => {
        console.log(element.isFollowed);
        html += templateAccount.replace('%ID', element.id).replace('%ID', element.username).replace('%AUTORE', element.username).replace('%TITLE', element.username).replace('%SEGUITI', element.followingCount).replace('%FOLLOWER', element.followersCount);
        if (!element.isFollowed) {
            console.log('Entrato')
            html = html.replace('%PERSON', 'person_add').replace("%STATUS", "add");
        } else {
            html = html.replace('%PERSON', 'person_remove').replace("%STATUS", "remove");
        }
    });
    div.innerHTML = html;
    const buttons = document.querySelectorAll('.btn-account');
    buttons.forEach((button) => {
        button.onclick = async () => {
            const id = button.id.split('_')[1];
            const status = button.id.split('_')[2];
            const token = sessionStorage.getItem('token');
            const url = status === 'add' ? '/followUser' : '/unfollowUser';
            const response = await fetch(url + "/" + id, {
                method: 'GET', headers: {
                    Authorization: token
                }
            });
            if (response.ok) {
                const array = await searchAccount(cerca.value, ricercaCorrente);
                await renderAccount(div, array);
            }
        }
    });

    const buttonAccount = document.querySelectorAll('.cardAccount');
    buttonAccount.forEach((button) => {
        button.onclick = async () => {
            const id = button.id;
            const token = sessionStorage.getItem('token');
                modalDetails.show();
        }
    });
}
const renderCategory = async (div, array) => {
    div.innerHTML = '';
    let html = '';
    array.forEach((element) => {
        console.log(element.isFollowed);
        html += templateCategory.replace('%ID', element.id).replace('%ID', element.nome).replace('%NOME', element.nome).replace('%TITLE', element.nome).replace('%FOLLOWER', element.followersCount);
        if (!element.isFollowed) {
            html = html.replace('%PERSON', 'add').replace("%STATUS", "add");
        } else {
            html = html.replace('%PERSON', 'remove').replace("%STATUS", "remove");
        }
    });
    div.innerHTML = html;
    const buttons = document.querySelectorAll('.btn-account');
    buttons.forEach((button) => {
        button.onclick = async () => {
            console.log(button.id);
            const id = button.id.split('_')[1];
            const status = button.id.split('_')[2];
            const token = sessionStorage.getItem('token');
            const url = status === 'add' ? '/followCategory' : '/unfollowCategory';
            const response = await fetch(url + "/" + id, {
                method: 'GET', headers: {
                    Authorization: token
                }
            });
            if (response.ok) {
                const array = await searchCategory(cerca.value, ricercaCorrente);
                await renderCategory(div, array);
            }
        }
    });
}