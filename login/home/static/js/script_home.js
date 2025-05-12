let timerInterval; // Variável global para armazenar o identificador do intervalo

// Lógica para o popup de feedback
document.getElementById('helpForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': '{{ csrf_token }}', // Inclua o token CSRF
        },
    })
    .then(response => response.json())
    .then(data => {
        const popup = document.getElementById('feedback-popup');
        const message = document.getElementById('feedback-message');

        if (data.success) {
            showSuccessPopup('Feedback enviado com sucesso!');
            document.getElementById('helpPopup').style.display = 'none';
            document.getElementById("dropdown-menu").classList.remove("show");
        } else {
            showFailedPopup('Erro ao enviar feedback. Tente novamente.');
            document.getElementById('helpPopup').style.display = 'none';
            //popup.style.backgroundColor = '#f8d7da'; // Vermelho claro para erro
            document.getElementById("dropdown-menu").classList.remove("show");
        }
    })
    .catch(error => {
        showFailedPopup('Erro ao enviar feedback. Tente novamente.');
        document.getElementById('helpPopup').style.display = 'none';
        //popup.style.backgroundColor = '#f8d7da'; // Vermelho claro para erro
        document.getElementById("dropdown-menu").classList.remove("show");
    });
});

function closePopup_feeback() {
    document.getElementById('feedback-popup').style.display = 'none';
}  

// Function to open the popup for creating a new trail
function openTrailPopup() {
    setMinDate(); // Certifica que a data mínima é a de hoje
    const popup = document.getElementById("trail-popup");
    popup.style.display = "flex"; // Mostra o popup
}

// Add event listener to 'Criar trilha' button
document.querySelectorAll(".open-trail-popup").forEach((element) => {
    element.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default action
        openTrailPopup();
    });
});

// Function to set the minimum selectable date in the date picker to today's date
function setMinDate() {
    const trailDateInput = document.getElementById("trail-date");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const dd = String(today.getDate()).padStart(2, '0');

    trailDateInput.min = `${yyyy}-${mm}-${dd}`; // Format as YYYY-MM-DD
}

// Close the popup when 'Cancelar' is clicked
document.getElementById("cancel-trail").addEventListener("click", function () {
    document.getElementById("trail-popup").style.display = "none";
});


// Function to create a new trail
document.getElementById("save-trail").addEventListener("click", async function () {
    const trailName = document.getElementById("trail-name").value;
    const trailDate = document.getElementById("trail-date").value;
    const trailReminder = document.getElementById("trail-reminder").checked;
    const notification_time = document.getElementById("notification-time").value;
    const token = getCookie('auth_token'); 


    if (trailName && trailDate) {

        try {
            const response = await fetch(`/home/get_trilhas_nome/${trailName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Passa o token no cabeçalho
                },
            });
            if (response.ok) {
                const data = await response.json();
                // Close the popup and reset fields
                
                document.getElementById("trail-popup").style.display = "none";
                document.getElementById("trail-name").value = "";
                document.getElementById("trail-date").value = "";
                document.getElementById("trail-reminder").checked = false;
                document.getElementById("notification-time").value = "";
            } else {
                 // Create a new trail card
                const trailCard = document.createElement("div");
                trailCard.classList.add("trail-card");
                trailCard.innerText = trailName;
                trailCard.setAttribute("title", trailName); 

                // Add click event to open the trail screen
                trailCard.addEventListener("click", function () {
                    displayTrailScreen(trailName, trailDate, trailReminder);
                });

                // Add the trail card to vertical-navbar
                document.getElementById("vertical-navbar").appendChild(trailCard);

                // Close the popup and reset fields
                
                document.getElementById("trail-popup").style.display = "none";
                document.getElementById("trail-name").value = "";
                document.getElementById("trail-date").value = "";
                document.getElementById("trail-reminder").checked = false;
                document.getElementById("notification-time").value = "";
                    }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    } else {
        //alert("Por favor insira um nome e uma data final para a trilha.");
        showFailedPopup("Por favor, insira um nome e uma data final para a trilha.");
    }
});

let isTrailSelected = false;

// Function to display the trail screen
function displayTrailScreen(name, date, reminder) {
    const main = document.getElementById("main");

    isTrailSelected = true;

    main.innerHTML = ""; // Clear the main area initially

    //progress = updateProgress(); // Call the function to get the progress

    // Create the main structure for trail details and tasks
    main.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; max-width: 100%; gap: 20px; height: 100%; background-color: var(--container-bg); padding: 20px; border-radius: 10px; box-sizing: border-box; overflow: hidden;">
    <!-- Top section: Name, Date, Reminder, and Progress -->
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 10px; background-color: #516ED045; padding: 20px; border-radius: 10px; width: 100%; box-sizing: border-box;">
    <ul id="traildisp" style="display: flex; flex-wrap: nowrap; margin: 0; padding: 0; justify-content: space-between; align-items: center; list-style-type: none; width: 100%; box-sizing: border-box; gap:100px;">
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><label>
    <input type="checkbox" ${reminder ? "checked" : ""}> Lembrete </label></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><h2 id="trilha_name" style="font-size: clamp(14px, 1.2vw, 18px); max-width: 7rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${name}</h2></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><h2 id="progress-display" style="font-size: 18px; color: green; font-weight: bold; overflow: visible;">Progresso: 0%</h2></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#1f1f1f"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5-56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg><h2 style="font-size: clamp(14px, 1.2vw, 18px); max-width: 7rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; text-align: center;">${date}</h2></li>
    </ul>
    </div>

    <!-- Task management section -->
    <div style="display: flex; flex-direction: row; gap: 20px; width: 100%; height: 100%; box-sizing: border-box;">
    <!-- Task list -->
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 200px; max-height: 100%; background-color: #516ED045; padding: 20px; border-radius: 10px; box-sizing: border-box; overflow-y: auto;">
    <button id="create-task" style="margin-bottom: 10px;">Criar Tarefa</button>
    <div id="task-list" style="flex-grow: 1; overflow-y: auto; width: 100%;"></div>
    </div>

    <!-- Task details -->
    <div id="task-details" style="flex-grow: 1; width: calc(100% - 220px); max-height: 100%; background-color: #516ED045; padding: 20px; border-radius: 10px; box-sizing: border-box; overflow-y: auto;">
    <h3>Selecione uma tarefa para visualizar os detalhes</h3>
    </div>
    </div>
    </div>
    `;

    // Buscar a data da trilha dinamicamente
    fetchTrilhaDate(name);

    fetchTrailProgress(name); // Chama a função para buscar o progresso da trilha

    // Abrir o popup ao clicar no botão "Criar Task"
    const createTaskButton = document.getElementById("create-task");
    if (createTaskButton) {
        createTaskButton.addEventListener("click", function () {
            document.getElementById("create-task-popup").style.display = "flex";
        });
    }

    // Fechar o popup ao clicar no botão de fechar
    const closePopupButton = document.getElementById("close-create-task-popup");
    if (closePopupButton) {
        closePopupButton.addEventListener("click", function () {
            document.getElementById("create-task-popup").style.display = "none";
        });
    }

    // Criar a task ao enviar o formulário
    const createTaskForm = document.getElementById("create-task-form");
    if (createTaskForm) {
        createTaskForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Impede o envio padrão do formulário
            
            const taskName = document.getElementById("task-name").value.trim();
            if (taskName) {
                const taskId = `${Date.now()}`; // Gera um ID único para a task
                console.log("Task ID gerado:", taskId);
                const taskItem = document.createElement("p");
                taskItem.innerText = taskName;
                taskItem.classList.add("task-item");
                taskItem.dataset.id = taskId;

                taskItem.addEventListener("click", function () {
                    displayTaskDetails(taskName, taskId);
                });

                const taskList = document.getElementById("task-list");
                if (taskList) taskList.appendChild(taskItem);

                // Atualize o progresso
                //updateProgress();
                saveOrUpdateTask(taskName, taskId);
                // Fechar o popup e limpar o campo de input
                document.getElementById("create-task-popup").style.display = "none";
                document.getElementById("task-name").value = "";
            } else {
                null;
            }
        });
    }

    //updateProgress();
}

function applyTheme(theme) {
    // Remove todas as classes de tema do <html>
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'cherry-theme');

    // Aplica a nova classe, se não for "default"
    if (theme !== "default") {
        document.documentElement.classList.add(`${theme}-theme`);
    }

    // Salva o tema no localStorage
    localStorage.setItem('selected-theme', theme);
}

// Ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("selected-theme") || "default";
    document.getElementById("theme-selector").value = savedTheme;
    applyTheme(savedTheme);
});

// Ao trocar o tema manualmente
document.getElementById("theme-selector").addEventListener("change", function () {
    applyTheme(this.value);
});

// Function to display task details
async function displayTaskDetails(taskName, taskId) {  // Tornar a função assíncrona
    const taskDetailsContainer = document.getElementById("task-details");
    const token = getCookie('auth_token'); 
    try {
        const response = await fetch(`get_task/${String(taskId)}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`, // Envia o token de autenticação
            }
        });
        if (response.ok) {  // Verifica se o status é 2xx
            const data = await response.json();
            const isCompleted = data.resultado.status === 'Concluido';

            taskDetailsContainer.innerHTML = `
                <h3>Detalhe da Task</h3>
                <p style = "overflow-wrap: break-word; text-overflow: ellipsis; white-space: normal;">Nome da Tarefa: ${taskName}</p>
                <div style="display: flex; flex-direction: row; gap: 10px; margin-top: 10px;">
                <button id="delete-task-btn"onclick="deleteTask('${taskId}')" style="width:33%; border: 1px solid #fff;">Deletar Tarefa</button>
                <button id="save-task-btn" ${isCompleted ? 'disabled' : ''} onclick="saveOrUpdateTask('${taskName}', '${taskId}')" style="width:33%; border: 1px solid #fff;">Salvar Tarefa</button>
                <button id="finalize-task-btn" ${isCompleted ? 'disabled' : ''} onclick="UpdateTaskStatus('${taskName}', '${taskId}')" style="width:33%; border: 1px solid #fff;">Finalizar Tarefa</button>
                </div> 
                <textarea id="task-notes" placeholder="Comece suas anotações..." style="resize:none; width: 100%; height: 450px; margin-top: 10px; border: 5px;" ${isCompleted ? 'disabled' : ''}></textarea>
            `;
            
            tinymce.init({
                selector: '#task-notes', // Target the textarea with id "task-notes"
                plugins: 'advlist autolink lists link image charmap preview anchor pagebreak',
                readonly: isCompleted, // Torna o editor somente leitura se a tarefa estiver concluída
                toolbar: 'undo redo | bold italic | fontfamily fontsize | alignleft aligncenter alignright | bullist numlist outdent indent | link | code',
                menubar: false, // Optional: Disable the menu bar
                statusbar: false, // Optional: Disable the status bar
                setup: function (editor) {
                    editor.on('init', function () {
                        editor.setContent(data.resultado.notes || ''); // Carregar conteúdo inicial
                    });

                    // Detecção de entrada do mouse
                    document.body.addEventListener('mouseenter', function (e) {
                    const target = e?.target;

                    // Menu tradicional
                    if (target?.classList?.contains('tox-menu')) {
                        toggleTrailList(false);
                  console.log('Mouse entrou em um menu dropdown (tox-menu)');
                }

                // Menu dos três pontinhos (overflow toolbar)
                if (target?.closest('.tox-toolbar__overflow')) {
                    toggleTrailList(false);
                console.log('Mouse entrou no menu de três pontinhos (overflow toolbar)');
                }

                // Itens internos (podem aparecer em qualquer menu)
                if (target?.classList?.contains('tox-collection__item')) {
                    toggleTrailList(false);
                console.log('Mouse sobre item do menu:', target.innerText);
                }
                }, true);

                //Detecção de saída do mouse
                    document.body.addEventListener('mouseleave', function (e) {
                    const target = e?.target;

                    // Menu tradicional
                    if (target?.classList?.contains('tox-menu')) {
                        toggleTrailList(true);
                  console.log('Mouse saiu de um menu dropdown (tox-menu)');
                }

                // Menu dos três pontinhos (overflow toolbar)
                if (target?.closest('.tox-toolbar__overflow')) {
                    toggleTrailList(true);
                console.log('Mouse saiu do menu de três pontinhos (overflow toolbar)');
                }

                // Itens internos (podem aparecer em qualquer menu)
                if (target?.classList?.contains('tox-collection__item')) {
                    toggleTrailList(true);
                console.log('Mouse fora do item do menu:', target.innerText);
                }
                }, true);

                    document.body.addEventListener('mouseenter', function (e) {
                    const target = e?.target;

                    if (target && target.classList && target.classList.contains('tox-menu')) {
                        toggleTrailList(false);
                        console.log('Mouse entrou em um menu dropdown!');
                }

                if (target && target.classList && target.classList.contains('tox-collection__item')) {
                    toggleTrailList(false);
                console.log('Mouse sobre item de menu:', target.innerText);
                }
                }, true); // O "true" aqui garante captura antes do bubbling

                    document.body.addEventListener('mouseleave', function (e) {
                    const target = e?.target;

                    if (target && target.classList && target.classList.contains('tox-menu')) {
                        toggleTrailList(true);
                        console.log('Mouse saiu de um menu dropdown!');
                }

                if (target && target.classList && target.classList.contains('tox-collection__item')) {
                    toggleTrailList(true);
                console.log('Mouse saiu do item de menu:', target.innerText);
                }
                }, true); // O "true" aqui garante captura antes do bubbling

                },
                fontsize_formats: '8px 10px 12px 14px 16px 18px 24px 36px', // Custom font sizes
                font_formats: 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,serif;Times New Roman=times new roman,times,serif;Verdana=verdana,sans-serif', // Set available fonts
                image_advtab: false, // Disable advanced image settings
                file_picker_callback: function(callback, value, meta) {
                    if (meta.filetype === 'image') {
                        alert('Image uploading is disabled.');
                        return false;
                    }
                },
            });
        } else {

            taskDetailsContainer.innerHTML = `
            <h3>Detalhes da Tarefa</h3>
            <p style = "overflow-wrap: break-word; text-overflow: ellipsis; white-space: normal;">Nome da Tarefa: ${taskName}</p>
            <div style="display: flex; flex-direction: row; gap: 10px; margin-top: 10px;">
            <button id="delete-task-btn"onclick="deleteTask('${taskId}')" style="width:33%; border: 1px solid #fff;">Deletar Tarefa</button>
            <button id="save-task-btn" onclick="saveOrUpdateTask('${taskName}', '${taskId}')" style="width:33%; border: 1px solid #fff;">Salvar Tarefa</button>
            <button id="finalize-task-btn" onclick="UpdateTaskStatus('${taskName}', '${taskId}')" style="width:33%; border: 1px solid #fff;">Finalizar Tarefa</button>
            </div> 
            <textarea id="task-notes" placeholder="Comece suas anotações..." style="resize:none; width: 100%; height: 450px; margin-top: 10px; border: 5px;"></textarea>
            `;

            tinymce.init({
            selector: '#task-notes', // Target the textarea with id "task-notes"
            plugins: 'advlist autolink lists link image charmap preview anchor pagebreak',
            toolbar: 'undo redo | bold italic | fontfamily fontsize | alignleft aligncenter alignright | bullist numlist outdent indent | link | code',
            menubar: false, // Optional: Disable the menu bar
            statusbar: false, // Optional: Disable the status bar
            fontsize_formats: '8px 10px 12px 14px 16px 18px 24px 36px', // Custom font sizes
            font_formats: 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,serif;Times New Roman=times new roman,times,serif;Verdana=verdana,sans-serif', // Set available fonts
            image_advtab: false, // Disable advanced image settings
            file_picker_callback: function(callback, value, meta) {
                if (meta.filetype === 'image') {
                    alert('Image uploading is disabled.');
                    return false;
                }
            },
            setup: function(editor) {
                editor.on('init', function() {
                    editor.setContent(''); // Inicializa o editor com conteúdo vazio
                });
            },
            content_style: `
                .mce-container {
                    z-index: 1000 !important; /* Ajuste o z-index do TinyMCE */
                }
            `
            });
            // Lida com diferentes tipos de erro de status
            /*if (response.status === 404) {
                console.error('Tarefa não encontrada');
            } else {
                console.error('Erro ao buscar a tarefa:', response.statusText);
            }*/
        }
    } catch (error) {
        console.error('Erro ao chamar a função Python:', error);
    }
}

//Function to update the task status
async function UpdateTaskStatus(taskName, taskId) {
    const token = getCookie('auth_token'); // Obtenha o token de autenticação
    const url = `/home/update-task-status/${encodeURIComponent(taskId)}/Concluido/`; // Endpoint para atualizar a tarefa

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`, // Inclua o token de autenticação
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'Concluido', // Define o status como concluído
            }),
        });

        if (response.ok) {
            const data = await response.json();

            console.log('Tarefa concluída com sucesso', data);
            showSuccessPopup("Tarefa concluída");

            // Atualize a interface para refletir a conclusão
            const taskItem = document.querySelector(`[data-id="${taskId}"]`);
            if (taskItem) {
                taskItem.classList.add("concluded"); // Adicione uma classe para indicar conclusão
            }

            // Desabilite os botões e o editor
            document.getElementById("save-task-btn").disabled = true;
            document.getElementById("finalize-task-btn").disabled = true;

            const editor = tinymce.get('task-notes');
            if (editor) {
                editor.mode.set('readonly'); // Torna o editor somente leitura
                //editor.getBody().setAttribute('contenteditable', false); // Torna o editor somente leitura
            } else {
                console.error('Editor não inicializado.');
            }

            // Atualize o progresso da trilha
            const trilhaElement = document.getElementById("trilha_name");
            if (trilhaElement) {
                const trailName = trilhaElement.innerText.trim();
                fetchTrailProgress(trailName);
            } else {
                console.error("Elemento com ID 'trilha_name' não encontrado.");
            }
        } else {

            console.error('Erro ao atualizar a tarefa:', response.statusText);
            showFailedPopup("Erro ao atualizar a tarefa. Tente novamente.");

        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showFailedPopup("Erro ao atualizar a tarefa. Tente novamente.");
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    const taskList = document.getElementById("task-list");
    const token = getCookie('auth_token'); 
    const taskToDelete = Array.from(taskList.children).find(
        task => task.dataset.id === taskId
    );

    try {
        const response = await fetch(`delete_task/${encodeURIComponent(taskId)}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}` // Inclua o token de autenticação, se necessário
            }
        });

        if (response.ok) {
            if (taskToDelete) taskToDelete.remove();
            console.log("Task deleted successfully.");
             // Atualize o progresso da trilha
             const trilhaElement = document.getElementById("trilha_name");
             if (trilhaElement) {
                 const trailName = trilhaElement.innerText.trim();
                 fetchTrailProgress(trailName); // Atualiza o progresso
             } else {
                 console.error("Elemento com ID 'trilha_name' não encontrado.");
             }

            showSuccessPopup("Tarefa excluída com êxito.");

                // Clean up TinyMCE editor if it's active
            if (tinymce.get('task-notes')) {
                tinymce.get('task-notes').remove(); // Destroy TinyMCE instance
            }
            document.getElementById("task-details").innerHTML = "<h3>Selecione uma tarefa para ver os detalhes</h3>";
            // Atualizar a interface ou remover a tarefa da lista
        } else {
            console.error("Falhou em deletar task:", response.statusText);
            showFailedPopup("Erro ao apagar a tarefa. Tente novamente.");
        }
    } catch (error) {
        console.error("Error:", error);
    }

    

}

// Function to update progress
// function updateProgress() {
//     const taskList = document.getElementById("task-list");
//     if (!taskList) return;

//     const totalTasks = taskList.childElementCount;
//     const completedTasks = Array.from(taskList.children).filter(task =>
//     task.classList.contains("concluded")
//     ).length;

//     const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
//     const progressDisplay = document.getElementById("progress-display");
//     if (progressDisplay) {
//         progressDisplay.innerText = `Progresso: ${progress.toFixed(0)}%`;
//     }
// }

/////// DAQUI PRA BAIXO É ALTERAÇÃO DO ROSA ///////

function toggleDropdown() {
    const profilePic = document.querySelector(".profile-image");

    document.getElementById("dropdown-menu").classList.toggle("show");

    if (document.getElementById("dropdown-menu").classList.contains("show")) {
        const rect = profilePic.getBoundingClientRect();

        // Define a posição do dropdown em relação à janela
        document.getElementById("dropdown-menu").style.top = `${rect.bottom}px`; // Abaixo do elemento pai
        document.getElementById("dropdown-menu").style.left = `${rect.left}px`; // Alinha à esquerda do pai
    }
}

// Fecha o menu suspenso se o usuário clicar fora dele
window.onclick = function(event) {
    if (!event.target.matches('.profile-image')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function updateDropdownPosition() {
    const profilePic = document.getElementById("profilepic");

    if (document.getElementById("dropdown-menu").classList.contains("show")) {
        const rect = profilePic.getBoundingClientRect();

        // Atualiza a posição do dropdown em relação à janela
        document.getElementById("dropdown-menu").style.top = `${rect.bottom}px`; // Abaixo da imagem de perfil
        document.getElementById("dropdown-menu").style.left = `${rect.left}px`; // Alinha à esquerda da imagem de perfil
    }
}

// Atualiza a posição do dropdown ao rolar a página
window.addEventListener("scroll", updateDropdownPosition);

// Atualiza a posição do dropdown ao redimensionar a janela
window.addEventListener("resize", updateDropdownPosition);


 // Abrir o popup ao clicar no link "Feedback"
 document.getElementById('feedbackLink').addEventListener('click', function(event) {
    event.preventDefault();  // Impede a navegação do link
    document.getElementById('helpPopup').style.display = 'flex';
});

// Fechar o popup ao clicar no "X"
document.getElementById('closePopup').addEventListener('click', function() {
    document.getElementById('helpPopup').style.display = 'none';
});

// Fechar o popup se clicar fora do conteúdo do popup
window.onclick = function(event) {
    if (event.target === document.getElementById('feedback-popup')) {
        document.getElementById('feedback-popup').style.display = 'none';
    }
    if (event.target === document.getElementById('helpPopup')) {
        document.getElementById('helpPopup').style.display = 'none';
    }
};

// Abrir o popup de informações ao clicar no link
document.getElementById('infoLink').addEventListener('click', function(event) {
    event.preventDefault();  // Impede a navegação do link
    document.getElementById('infoPopup').style.display = 'flex';
});

// Fechar o popup ao clicar no "X"
document.getElementById('closeInfoPopup').addEventListener('click', function() {
    document.getElementById('infoPopup').style.display = 'none';
});

// Fechar o popup se clicar fora do conteúdo do popup
window.addEventListener('click', function(event) {
    const profilePic = document.getElementById("profilepic");

    // Fecha o dropdown se o clique não for no dropdown ou na imagem de perfil
    if (!profilePic.contains(event.target) && !document.getElementById("dropdown-menu").contains(event.target)) {
        document.getElementById("dropdown-menu").classList.remove("show");
    }

    // Verifique se o clique foi fora do conteúdo do popup (não no popup-content)
    if (event.target === document.getElementById('infoPopup')) {
        document.querySelector('#dropdown-menu #infoPopup').style.display = 'none';
    }
});

// Referências para os elementos
const profileLink = document.getElementById('profile-link');
const profilePopup = document.getElementById('profile-popup');
const closePopup = document.getElementById('close-popup');
const profileForm = document.getElementById('profile-form');

// Abrir o popup ao clicar no link "Perfil"
profileLink.addEventListener('click', function(event) {
    event.preventDefault();  // Impede a navegação
    profilePopup.style.display = 'flex';  // Exibe o popup
});

// Fechar o popup ao clicar no botão de fechar
closePopup.addEventListener('click', function() {
    profilePopup.style.display = 'none';  // Oculta o popup
});

// Fechar o popup ao clicar fora do conteúdo
window.addEventListener('click', function(event) {
    if (event.target === profilePopup) {
        profilePopup.style.display = 'none';  // Oculta o popup
    }
});

// Função para obter o token CSRF do cookie
function getCSRFToken() {
    const cookieValue = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

// Capturar os dados do formulário quando o usuário clicar em "Salvar Alterações"
profileForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const token = getCookie('auth_token'); // Obtenha o token de autenticação

    // Prepare os dados para enviar
    const formData = new FormData();
    if (email) formData.append('email', email);
    if (password) formData.append('password', password);

    // Obter o token CSRF
    const csrfToken = getCSRFToken();

    try {
        const response = await fetch('/update-profile/', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Token ${token}`, // Inclua o token de autenticação
                'X-CSRFToken': csrfToken, // Incluindo o token CSRF nos cabeçalhos
            },
        });

        const data = await response.json();
        if (data.success) {
            //alert('Perfil atualizado com sucesso!');
            showSuccessPopup(data.message);
            profilePopup.style.display = 'none'; // Fechar o popup
        } else {
            //alert('Erro ao atualizar o perfil: ' + data.message);
            showFailedPopup(data.message);
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showFailedPopup('Erro ao atualizar o perfil. Tente novamente.');
    }
});

async function saveTrail() {
    const trailName = document.getElementById("trail-name").value;
    const trailDate = document.getElementById("trail-date").value;
    const trailReminder = document.getElementById("trail-reminder").checked;
    const notification_time = document.getElementById("notification-time").value;

    console.log(notification_time);
    if (trailName && trailDate) {
        const csrfToken = getCSRFToken(); // Função para obter CSRF Token, se necessário
        const authToken = getAuthToken();  // Função para obter o token de autenticação
        const token = getCookie('auth_token');  // Supondo que o token esteja no cookie 'auth_token'
        try {
            const response = await fetch(`/home/get_trilhas_nome/${trailName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Passa o token no cabeçalho
                },
            });
            if (response.ok) {
                const data = await response.json();
                //alert("Trilha já existente!");
                showFailedPopup("Trilha já existente!");
            } else {
                const response = await fetch('/api/trails/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'Authorization': `Token ${token}`,
                    },
                    body: JSON.stringify({
                        name: trailName,
                        date: trailDate,
                        reminder: trailReminder,
                        notification_time: notification_time,
                    }),
                });
        
                if (response.ok) {
                    const trail = await response.json();
                    console.log("Trilha criada com sucesso:", trail);
                    console.log("notification-time:", notification_time);
                    // Exibe o popup de sucesso
                    showSuccessPopup("Trilha criada com sucesso");

                    // Atualize a interface aqui (adicione a nova trilha à lista)
                } else {
                    const errorData = await response.json();
                    console.error("Error details:", errorData);
                    //alert("Error saving trail: " + JSON.stringify(errorData));
                    showFailedPopup("Erro ao criar a trilha. Tente novamente.");
                }
                    }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }

        
    } else {
        //alert("Por favor insira um nome e uma data final para a trilha.");
        showFailedPopup("Por favor, insira um nome e uma data final para a trilha.");
    }
}

async function saveTask(taskName, taskId) {
    /*const taskName = taskName; // ID do campo*/
    const taskStatus = document.getElementById('task-status').value; // ID do dropdown de status
    const taskNotes = tinymce.get('task-notes').getContent(); // Pegue o conteúdo do TinyMCE
    const token = getCookie('auth_token');  // Supondo que o token esteja no cookie 'auth_token'
    const csrfToken = getCSRFToken();
    const id_task = `${Date.now()}`; // ID da tarefa
    const response = await fetch(`/api/tasks/${taskId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            name: taskName,
            status: taskStatus,
            notes: taskNotes,
            id_task: id_task,
        }),
    });

    if (response.ok) {
        const task = await response.json();
        fetchTrailProgress(taskName); // Chama a função para buscar o progresso da trilha
        console.log("Tarefa atualizada com sucesso:", task);

        // Exibe o popup de sucesso
        showSuccessPopup("Tarefa atualizada com sucesso");

        // Atualize a interface aqui (exemplo: atualize os detalhes da tarefa)

    } else {
        //alert("Erro ao atualizar a tarefa.");
        showFailedPopup("Erro ao atualizar a tarefa. Tente novamente.");
    }
}

async function saveOrUpdateTask(taskName, taskId) {
    //const taskStatus = document.getElementById('task-status').value; // ID do dropdown de status
    let taskNotes = null; // Pegue o conteúdo do TinyMCE
    const trilhaElement = document.getElementById('trilha_name'); // Nome da trilha
    // Obtenha apenas o texto interno do elemento
    const trilhaName = trilhaElement.textContent.trim();
    const token = getCookie('auth_token');  // Supondo que o token esteja no cookie 'auth_token'
    const csrfToken = getCSRFToken();

    console.log(trilhaName);
    console.log("Task ID:", taskId);
    
    try {
        let task_id = null;
        let updatedFields = { notes: null,
            status: null
        }
        let url = '/api/tasks/';
        let method = null;
        let body = JSON.stringify({
            name: taskName,
            //status: taskStatus,
            notes: taskNotes,
            trail_name: trilhaName,
            id_task: taskId,
        });

        let checkResponse = null;  // Defina a variável antes de usá-la.

            // Faz uma requisição GET para verificar se a tarefa existe
            /*
            const checkResponse = await fetch(`${url}${taskId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });*/
        // Verifica se o taskId foi fornecido
        if (taskId) {
            // Faz uma requisição GET para verificar se a tarefa existe
            try {
                const response = await fetch(`get_task/${String(taskId)}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`, // Envia o token de autenticação
                    }
                });
                if (response.ok) {  // Verifica se o status é 2xx
                    const data = await response.json();
                    console.log("Tarefa encontrada:", data.resultado);
                    const editor = tinymce.get('task-notes'); // Obtém o editor do TinyMCE
                    if (editor) { // Verifica se o editor está inicializado
                        const content = editor.getContent(); // Obtém o conteúdo do editor
                        if (content.trim() !== '') { // Verifica se o conteúdo não está vazio
                            taskNotes = content; // Atribui o conteúdo às notas
                        } else {
                            console.log('Nenhuma nota encontrada. Não será feita nenhuma busca.');
                        }
                    } else {
                        console.log('Editor TinyMCE não inicializado.');
                    }
                    showSuccessPopup("Tarefa salva com sucesso");
                    // Se a tarefa existir, use PUT para atualizar
                    method = 'PATCH';
                    //url = `${url}${data.resultado.id}/`;
                    task_id = data.resultado.id_task;
                    updatedFields = {
                        notes:  taskNotes,
                    };
                    ////
                } else {
                    // Lida com diferentes tipos de erro de status
                    if (response.status === 404) {
                        console.error('Tarefa não encontrada');
                    } else {
                        console.error('Erro ao buscar a tarefa:', response.statusText);
                        showFailedPopup("Não foi possível salvar a tarefa. Tente novamente.");
                    }
                }
        
            } catch (error) {
                console.error('Erro ao chamar a função Python:', error);
                showFailedPopup("Não foi possível salvar a tarefa. Tente novamente.");
            }
        }

        
        if (method == 'PATCH') {
            try {
                const response = await fetch(`/home/update-task/${task_id}/`, {
                    method: 'PATCH',  // Usando PATCH para atualizar parcialmente
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',  // Envia os dados como JSON
                    },
                    body: JSON.stringify(updatedFields),  // Passando os campos que vão ser atualizados
                });
            
                if (response.ok) {
                    const data = await response.json();
                    console.log('Tarefa atualizada com sucesso:', data);

                    // Atualize o progresso da trilha
                    fetchTrailProgress(trilhaName);

                    showSuccessPopup("Tarefa atualizada com sucesso");

                } else {
                    console.error('Erro ao atualizar a tarefa:', response.statusText);
                    showFailedPopup("Erro ao atualizar a tarefa. Tente novamente.");
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
            }
        } else {
            // Faz a requisição POST ou PUT
            const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
                'Authorization': `Token ${token}`,
            },
            body: body,
        });

        if (response.ok) {
            const task = await response.json();
            console.log(`Tarefa criada com sucesso`, task);

            fetchTrailProgress(trilhaName);

            showSuccessPopup("Tarefa criada com sucesso");

        } else {
            //alert(`Erro ao criar a tarefa`);
            showFailedPopup("Erro ao criar a tarefa. Tente novamente.");
        }
        }

    } catch (error) {
        console.error("Erro na operação:", error);
    }
}


async function loadTrails() {
    const response = await fetch('/api/trails/');
    if (response.ok) {
        const trails = await response.json();
        console.log("Trilhas carregadas:", trails);
        // Adicione cada trilha à interface aqui
    } else {
        //alert("Erro ao carregar trilhas.");
        showFailedPopup("Erro ao carregar trilhas. Tente novamente.");
    }
}

function getAuthToken() {
    // Supondo que o token esteja armazenado em localStorage ou sessionStorage
    return localStorage.getItem('auth_token');  // Ou sessionStorage.getItem('auth_token')
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener("DOMContentLoaded", async function () {
    // Verifica se o token está presente no cookie (caso tenha sido armazenado após login)
    const token = getCookie('auth_token'); // Função para pegar o token do cookie

    if (!token) {
        console.error("Token não encontrado! O login pode não ter sido feito corretamente.");
        return;
    }

    try {
        const response = await fetch(`/home/get_trilhas/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`, // Passa o token no cabeçalho
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Exibe as trilhas
            displayTrails(data.resultado); // Função para exibir as trilhas
        } else {
            console.error('Erro ao carregar as trilhas:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
});

// Função para exibir as trilhas no DOM
function displayTrails(trails) {
    const trailsContainer = document.getElementById("vertical-navbar");  // O container onde as trilhas serão exibidas
    trailsContainer.innerHTML = "";  // Limpa o conteúdo atual

    trails.forEach(trail => {   
        const trailElement = document.createElement("div");
        trailElement.classList.add("trail-card");  // Adiciona uma classe para estilização

        // Adiciona os dados das trilhas
        trailElement.innerHTML = `
            ${trail.name}
        `;

        // Add click event to open the trail screen and tasks
        trailElement.addEventListener("click", function () {
            displayTrailScreen(trail.name, trail.date, trail.reminder);
            displayTasks(trail.name);
        });

        // Adiciona a trilha ao container
        trailsContainer.appendChild(trailElement);
    });
}

// Função para exibir as trilhas no DOM
function displayTasks(name) {
    const tasksContainer = document.getElementById("task-list");  // O container onde as trilhas serão exibidas
    tasksContainer.innerHTML = "";  // Limpa o conteúdo atual
    const url = `/home/get_task_list?trail_name=${encodeURIComponent(name)}`;

    // Verifica se o token está presente no cookie (caso tenha sido armazenado após login)
    const token = getCookie('auth_token');  // Função para pegar o token do cookie

    if (!token) {
        console.error("Token não encontrado! O login pode não ter sido feito corretamente.");
        return;
    }

    // Faz a requisição para a API para pegar as trilhas do usuário
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,  // Passa o token no cabeçalho
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.resultado.forEach(tasks => {   
            const taskItem = document.createElement("p");
            taskItem.innerText = tasks.name;
            taskItem.classList.add("task-item");
            taskItem.dataset.id = tasks.id_task;

            taskItem.addEventListener("click", function () {
                displayTaskDetails(tasks.name, tasks.id_task);
            });

            const taskList = document.getElementById("task-list");
            if (taskList) taskList.appendChild(taskItem);
})
    })
    .catch(error => {
        console.error('Erro ao carregar as trilhas:', error);
    });

}

// Open and close popup
document.getElementById('trail-popup').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'block';
});
document.getElementById('cancel-trail').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});
// Adjust popup size dynamically
function adjustPopupSize() {
    const popup = document.querySelector('.popup-content');
    if (window.innerWidth < 500) {
        popup.style.width = '90%';
    } else {
        popup.style.width = '400px'; // Default width
    }
}

async function fetchTrailProgress(trailName) {
    const token = getCookie('auth_token'); // Obtenha o token de autenticação
    const url = `/home/get_trail_progress/${encodeURIComponent(trailName)}/`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`, // Inclua o token de autenticação
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Progresso da trilha:', data);

            // Atualize o progresso no DOM
            const progressDisplay = document.getElementById("progress-display");
            if (progressDisplay) {
                progressDisplay.innerText = `Progresso: ${data.progress}%`;
            }
        } else {
            console.error('Erro ao buscar o progresso da trilha:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

async function fetchTrilhaDate(trailName) {
    const token = getCookie('auth_token'); // Obtenha o token de autenticação
    const url = `/home/get_trilha_date/${encodeURIComponent(trailName)}/`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`, // Inclua o token de autenticação
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Data da trilha:', data);

            // Atualize o campo de data no DOM
            const dateElement = document.querySelector('#traildisp li:nth-child(4) h2');
            if (dateElement) {
                dateElement.innerText = data.date;
            }
        } else {
            console.error('Erro ao buscar a data da trilha:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Call on resize and load
window.addEventListener('resize', adjustPopupSize);
adjustPopupSize();

/* // Exemplo: Chamar ao carregar a tela da trilha
document.addEventListener("DOMContentLoaded", function () {

    const trilhaElement = document.getElementById("trilha_name");
    if (trilhaElement) {
        const trailName = trilhaElement.innerText.trim();
        fetchTrailProgress(trailName);
    } else {
        console.error("Elemento com ID 'trilha_name' não encontrado.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const trilhaElement = document.getElementById("trilha_name");
    if (trilhaElement) {
        const trailName = trilhaElement.innerText.trim();
        fetchTrailProgress(trailName);
    } else {
        console.error("Elemento com ID 'trilha_name' não encontrado.");
    }
});

    const trailName = document.getElementById("trilha_name").innerText.trim();
    fetchTrailProgress(trailName);
}); */


function toggleTrailList(expand) {
    if (!isTrailSelected) return;

    const vertical = document.getElementById("vertical");
    const isSmallScreen = window.matchMedia("(max-width: 1200px)").matches;
   if (isSmallScreen) {
    if(expand){
        vertical.classList.remove("collapsed");
        vertical.style.maxWidth = "95%"; // Expande para o tamanho máximo
        vertical.style.maxHeight = "95%"; // Expande para o tamanho máximo
        vertical.style.padding = "30px";
    } else {
        vertical.classList.add("collapsed");
        vertical.style.maxWidth = "95%"; // Encolhe para o tamanho mínimo
        vertical.style.maxHeight = "100px"; // Encolhe para o tamanho mínimo
        vertical.style.padding = "10px";
    }
    } else {
     if (expand) {
        vertical.classList.remove("collapsed");
        vertical.style.maxWidth = "280px"; // Expande para o tamanho máximo
        vertical.style.padding = "30px";
    } else {
        vertical.classList.add("collapsed");
        vertical.style.maxWidth = "100px"; // Encolhe para o tamanho mínimo
        vertical.style.padding = "10px";
    }
}
}


document.getElementById("main").addEventListener("mouseenter", () => {
    toggleTrailList(false); // Encolhe a lista de trilhas
});

document.getElementById("main").addEventListener("mouseleave", () => {
    toggleTrailList(true); // Expande a lista de trilhas

});

function showSuccessPopup(message) {
    // Define a mensagem do popup
    document.getElementById("success-message").textContent = message;

    // Exibe o popup
    document.getElementById("success-popup").style.display = "block";

    // Remove o popup após 4 segundos
    setTimeout(() => {
    document.getElementById("success-popup").style.display = "none";
    }, 4000);
}

function showFailedPopup(message) {
    // Define a mensagem do popup
    document.getElementById("fail-message").textContent = message;

    // Exibe o popup
    document.getElementById("failed-popup").style.display = "block";

    // Remove o popup após 4 segundos
    setTimeout(() => {
    document.getElementById("failed-popup").style.display = "none";
    }, 4000);
}

/** let activeTime = 0; // Tempo ativo em segundos
let activityInterval;
let saveInterval;

// Inicia o contador de tempo ativo
function startActivityTimer() {
    activityInterval = setInterval(() => {
        activeTime++;
        updateActiveTimeLabel(); // Atualiza a label a cada segundo
    }, 1000); // Incrementa a cada segundo

    // Salva o tempo ativo no backend a cada 30 segundos
    saveInterval = setInterval(() => {
        const currentDate = new Date().toISOString().split('T')[0]; // Obtém a data atual no formato YYYY-MM-DD
        updateUserActivity(currentDate, 30); // Atualiza o tempo ativo no backend
    }, 30000); // 30 segundos
}

// Atualiza a label com o tempo ativo em minutos
function updateActiveTimeLabel() {
    const activeMinutes = Math.floor(activeTime / 60); // Converte para minutos
    const userActivityLabel = document.getElementById("user-activity");
    if (userActivityLabel) {
        userActivityLabel.textContent = activeMinutes; // Atualiza o texto da label
    }
}

// Função para atualizar o tempo ativo no backend
async function updateUserActivity(date, activeTimeToAdd) {
    const token = getCookie('auth_token'); // Obtenha o token de autenticação

    try {
        const response = await fetch('/update-user-activity/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, active_time: activeTimeToAdd }), // Envia a data e o tempo ativo a ser adicionado
        });

        const data = await response.json();
        if (data.success) {
            console.log('Tempo ativo atualizado com sucesso!');
        } else {
            console.error('Erro ao atualizar o tempo ativo:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Para o contador de tempo ativo e salva os dados finais
function stopActivityTimer() {
    clearInterval(activityInterval);
    clearInterval(saveInterval);
    const currentDate = new Date().toISOString().split('T')[0]; // Obtém a data atual no formato YYYY-MM-DD
    updateUserActivity(currentDate, activeTime); // Salva o tempo ativo final no backend
}

// Inicia o timer ao carregar a página
window.addEventListener('load', () => {
    console.log('Página carregada');
    startActivityTimer();
});

// Para o timer ao sair da página
window.addEventListener('unload', () => {
    console.log('Página sendo descarregada');
    stopActivityTimer();
}); **/

// Referências aos elementos
const activeTimeButton = document.getElementById("active-time-button");
const activeTimePopup = document.getElementById("activity-popup");
const closeActiveTimePopup = document.getElementById("close-activity-popup");
const activeTimeInfo = document.getElementById("active-time-info");

// Função para buscar e exibir o tempo ativo
activeTimeButton.addEventListener("click", async () => {
    const token = getCookie('auth_token');

    try {
        const response = await fetch('/get-user-activity/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Dados de atividade do usuário:', data);

        if (data.success) {
            // Limpa o conteúdo anterior do popup
            activeTimeInfo.innerHTML = '';

            // Itera sobre o array de dados e exibe cada registro
            data.data.forEach((activity) => {
                const date = activity.date;
                const activeTimeInSeconds = activity.active_time;
                const activeTimeInMinutes = Math.floor(activeTimeInSeconds / 60);

                // Cria um parágrafo para cada registro
                const activityInfo = document.createElement('p');
                activityInfo.textContent = `Data: ${date}, Tempo Ativo: ${activeTimeInMinutes} minutos`;
                activeTimeInfo.appendChild(activityInfo);
            });

            activeTimePopup.style.display = "block"; // Exibe o popup
        } else {
            console.error('Erro ao carregar os dados de atividade:', data.message);
            activeTimeInfo.textContent = 'Erro ao carregar os dados de atividade.';
            activeTimePopup.style.display = "block"; // Exibe o popup
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        activeTimeInfo.textContent = 'Erro ao carregar os dados de atividade.';
        activeTimePopup.style.display = "block"; // Exibe o popup
    }
});

// Função para fechar o popup
closeActiveTimePopup.addEventListener("click", () => {
    activeTimePopup.style.display = "none"; // Esconde o popup
});

// Fecha o popup se o usuário clicar fora do conteúdo
window.addEventListener("click", (event) => {
    if (event.target === activeTimePopup) {
        activeTimePopup.style.display = "none";
    }
});


function startPomodoro() {
    const timerDisplay = document.getElementById("pomodoro-timer");
    if (!timerDisplay) {
        console.error("Elemento com ID 'pomodoro-timer' não encontrado.");
        return;
    }

    // Limpa o cronômetro anterior, se existir
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null; // Reseta o identificador do intervalo
    }

    let timeRemaining = 0.1 * 60; // 25 minutos em segundos

    // Atualiza o display do timer
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // Atualiza o timer a cada segundo
    timerInterval = setInterval(function () {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null; // Reseta o identificador do intervalo

            // Reproduz o som
            const pomodoroSound = document.getElementById("pomodoro-sound");
            if (pomodoroSound) {
                pomodoroSound.play();
            }

            // Altera o título da aba
            const originalTitle = document.title;
            document.title = "Pomodoro concluído! 🎉";

            // Restaura o título após 5 segundos
            setTimeout(() => {
                document.title = originalTitle;
            }, 5000);

            showSuccessPopup("Pomodoro concluído! Faça uma pausa.");
        }
    }, 1000);

    // Inicializa o display do timer
    updateTimerDisplay();
}