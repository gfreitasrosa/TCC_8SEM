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
                    }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    } else {
        alert("Por favor insira um nome e uma data final para a trilha.");
    }
});

let isTrailSelected = false;

// Function to display the trail screen
function displayTrailScreen(name, date, reminder) {
    const main = document.getElementById("main");

    isTrailSelected = true;

    main.innerHTML = ""; // Clear the main area initially

    // Create the main structure for trail details and tasks
    main.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; max-width: 100%; gap: 20px; height: 100%; background-color: var(--container-bg); padding: 20px; border-radius: 10px; box-sizing: border-box; overflow: hidden;">
    <!-- Top section: Name, Date, Reminder, and Progress -->
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 10px; background-color: #516ED045; padding: 20px; border-radius: 10px; width: 100%; box-sizing: border-box;">
    <!-- <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; position: relative;"> -->
    <ul id="traildisp" style="display: flex; flex-wrap: nowrap; margin: 0; padding: 0; justify-content: space-between; align-items: center; list-style-type: none; width: 100%; box-sizing: border-box; gap:100px;">
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><label>
    <input type="checkbox" ${reminder ? "checked" : ""}> Lembrete
    </label></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><h2 id="trilha_name" style="font-size: clamp(14px, 1.2vw, 18px); max-width: 7rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${name}</h2></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><h2 id="progress-display" style="font-size: 18px; color: green; font-weight: bold;">Progresso: 0%</h2></li>
    <li style="text-decoration: none; display: inline-block; box-shadow: none;"><svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#1f1f1f"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg><h2 style="font-size: clamp(14px, 1.2vw, 18px); max-width: 7rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; text-align: center;">${date}</h2></li>
    </ul>
   <!-- </div> -->
    </div>

    <!-- Task management section -->
    <div style="display: flex; flex-direction: row; gap: 20px; width: 100%; height: 100%; box-sizing: border-box;">
    <!-- Task list -->
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 200px; max-height: 100%; background-color: #516ED045; padding: 20px; border-radius: 10px; box-sizing: border-box; overflow-y: auto;">
    <button id="create-task" style="margin-bottom: 10px;">Criar Task</button>
    <div id="task-list" style="flex-grow: 1; overflow-y: auto; width: 100%;"></div>
    </div>

    <!-- Task details -->
    <div id="task-details" style="flex-grow: 1; width: calc(100% - 220px); max-height: 100%; background-color: #516ED045; padding: 20px; border-radius: 10px; box-sizing: border-box; overflow-y: auto;">
    <h3>Selecione uma task para visualizar os detalhes</h3>
    </div>
    </div>
    </div>
    `;

    const createTaskButton = document.getElementById("create-task");
    if (createTaskButton) {
        createTaskButton.addEventListener("click", function () {
            const taskName = prompt("Enter task name:");
            if (taskName) {
                const taskId = `${Date.now()}`; // Generate unique ID
                const taskItem = document.createElement("p");
                taskItem.innerText = taskName;
                taskItem.classList.add("task-item");
                taskItem.dataset.id = taskId;

                taskItem.addEventListener("click", function () {
                    displayTaskDetails(taskName, taskId);
                });

                const taskList = document.getElementById("task-list");
                if (taskList) taskList.appendChild(taskItem);

                // Update progress
                updateProgress();
            }
        });
    }

    updateProgress();
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
            let status = null;
            if (data.resultado.status == 'Concluido'){
                status = `
                <option value"Concluido"=>Concluded</option>
                <option value="Em andamento">Ongoing</option>
                `;
            } else {
                status = `
                <option value="Em andamento">Ongoing</option>
                <option value"Concluido">Concluded</option>
                `;
            }
            taskDetailsContainer.innerHTML = `
            <h3>Detalhe da task</h3>
            <p style = "overflow-wrap: break-word; text-overflow: ellipsis; white-space: normal;">Nome da Task: ${taskName}</p>
            <p>Status: 
            <select id="task-status">
            '${status}'
            </select>
            </p>
            <button onclick="deleteTask('${taskId}')">Deletar Task</button>
            <button onclick="saveOrUpdateTask('${taskName}','${taskId}')">Salvar Task</button>
            <textarea id="task-notes" placeholder="Comece suas anotações..." style="resize:none; width: 100%; height: 450px; margin-top: 10px; border: 5px;"></textarea>
            `;

            // Add event listener to status change dropdown
            const statusDropdown = document.getElementById("task-status");
            statusDropdown.addEventListener("change", function () {
                updateTaskStatus(taskId, statusDropdown.value); // Update task status
            });
            
            tinymce.init({
                selector: '#task-notes', // Target the textarea with id "task-notes"
                plugins: 'advlist autolink lists link image charmap preview anchor pagebreak',
                toolbar: 'undo redo | bold italic | fontfamily fontsize | alignleft aligncenter alignright | bullist numlist outdent indent | link | code',
                menubar: false, // Optional: Disable the menu bar
                statusbar: false, // Optional: Disable the status bar
                setup: function (editor) {
                    editor.on('init', function () {
                        // Carregar conteúdo inicial
                        editor.setContent(data.resultado.notes);  // Corrigido: Removido o `string()` desnecessário
                    });
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
            <h3>Task Details</h3>
            <p>Task Name: ${taskName}</p>
            <p>Status: 
            <select id="task-status">
            <option>Em andamento</option>
            <option>Concluido</option>
            </select>
            </p>
            <button onclick="deleteTask('${taskId}')">Delete Task</button>
            <button onclick="saveOrUpdateTask('${taskName}','${taskId}')">Save Task</button>
            <textarea id="task-notes" placeholder="Task notes..." style="resize:none; width: 100%; height: 450px; margin-top: 10px; border: 5px;"></textarea>
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
function updateTaskStatus(taskId, status) {
    const taskItem = document.querySelector(`[data-id="${taskId}"]`);
    if (taskItem) {
        // Mark the task as concluded or ongoing based on status
        if (status === "Concluded") {
            taskItem.classList.add("concluded");
        } else {
            taskItem.classList.remove("concluded");
        }
        // Update the progress after changing task status
        updateProgress();
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    const taskList = document.getElementById("task-list");
    const token = getCookie('auth_token'); 
    const taskToDelete = Array.from(taskList.children).find(
        task => task.dataset.id === taskId
    );
    if (taskToDelete) taskToDelete.remove();

    try {
        const response = await fetch(`delete_task/${encodeURIComponent(taskId)}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}` // Inclua o token de autenticação, se necessário
            }
        });

        if (response.ok) {
            console.log("Task deleted successfully.");
            // Atualizar a interface ou remover a tarefa da lista
        } else {
            console.error("Failed to delete task:", response.statusText);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    // Clean up TinyMCE editor if it's active
    if (tinymce.get('task-notes')) {
        tinymce.get('task-notes').remove(); // Destroy TinyMCE instance
    }
    document.getElementById("task-details").innerHTML = "<h3>Select a task to view details</h3>";
    updateProgress();
}

// Function to update progress
function updateProgress() {
    const taskList = document.getElementById("task-list");
    if (!taskList) return;

    const totalTasks = taskList.childElementCount;
    const completedTasks = Array.from(taskList.children).filter(task =>
    task.classList.contains("concluded")
    ).length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const progressDisplay = document.getElementById("progress-display");
    if (progressDisplay) {
        progressDisplay.innerText = `Progress: ${progress.toFixed(0)}%`;
    }
}

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
profileForm.addEventListener('submit', function(event) {
    event.preventDefault();  // Impede o envio do formulário

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePic = document.getElementById('profile-pic').files[0];

    // Preparar os dados para enviar
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (profilePic) {
        formData.append('profile_pic', profilePic);
    }

    // Obter o token CSRF
    const csrfToken = getCSRFToken();

    // Enviar os dados via Fetch para o back-end
    fetch('/update-profile/', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken,  // Incluindo o token CSRF nos cabeçalhos
            // 'Authorization': 'Bearer token' (se precisar de autenticação)
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Perfil atualizado com sucesso!');
            profilePopup.style.display = 'none';  // Fechar o popup
        } else {
            alert('Ocorreu um erro ao atualizar o perfil.');
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar perfil:', error);
        alert('Ocorreu um erro.');
    });
});

document.getElementById('helpForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Previne o comportamento padrão de envio do formulário (que causa o redirecionamento)
    
    var subject = document.getElementById('subject').value;
    var message = document.getElementById('message').value;

    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Faz a requisição AJAX
    fetch('/feedback/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Inclui o CSRF token na requisição
        },
        body: JSON.stringify({
            subject: subject,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'E-mail enviado com sucesso!') {
            // Exibe a mensagem de sucesso na mesma página
            alert(data.message);
        } else {
            // Exibe a mensagem de erro
            alert(data.message);
        }

        // Fecha o popup (se necessário)
        document.getElementById('helpPopup').style.display = 'none';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao tentar enviar o e-mail. Tente novamente!');
    });
});

async function saveTrail() {
    const trailName = document.getElementById("trail-name").value;
    const trailDate = document.getElementById("trail-date").value;
    const trailReminder = document.getElementById("trail-reminder").checked;

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
                alert("Trilha já existente!");
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
                    }),
                });
        
                if (response.ok) {
                    const trail = await response.json();
                    console.log("Trilha criada com sucesso:", trail);
                    // Atualize a interface aqui (adicione a nova trilha à lista)
                } else {
                    const errorData = await response.json();
                    console.error("Error details:", errorData);
                    alert("Error saving trail: " + JSON.stringify(errorData));
                }
                    }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }

        
    } else {
        alert("Por favor insira um nome e uma data final para a trilha.");
    }
}

async function saveTask(taskName, taskId) {
    /*const taskName = taskName; // ID do campo*/
    const taskStatus = document.getElementById('task-status').value; // ID do dropdown de status
    const taskNotes = tinymce.get('task-notes').getContent(); // Pegue o conteúdo do TinyMCE
    const token = getCookie('auth_token');  // Supondo que o token esteja no cookie 'auth_token'
    const csrfToken = getCSRFToken();
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
        }),
    });

    if (response.ok) {
        const task = await response.json();
        console.log("Tarefa atualizada com sucesso:", task);
        // Atualize a interface aqui (exemplo: atualize os detalhes da tarefa)
    } else {
        alert("Erro ao atualizar a tarefa.");
    }
}

async function saveOrUpdateTask(taskName, taskId = null) {
    const taskStatus = document.getElementById('task-status').value; // ID do dropdown de status
    const taskNotes = tinymce.get('task-notes').getContent(); // Conteúdo do TinyMCE
    const trilhaElement = document.getElementById('trilha_name'); // Nome da trilha
    // Obtenha apenas o texto interno do elemento
    const trilhaName = trilhaElement.textContent.trim();
    const token = getCookie('auth_token');  // Supondo que o token esteja no cookie 'auth_token'
    const csrfToken = getCSRFToken();

    console.log(trilhaName);
    
    try {
        let task_id = null;
        let updatedFields = { notes: null,
            status: null
        }
        let url = '/api/tasks/';
        let method = null;
        let body = JSON.stringify({
            name: taskName,
            status: taskStatus,
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
                    // Se a tarefa existir, use PUT para atualizar
                    method = 'PATCH';
                    //url = `${url}${data.resultado.id}/`;
                    task_id = data.resultado.id;
                    updatedFields = {
                        notes:  taskNotes,
                        status:  taskStatus
                    };
                    ////
                } else {
                    // Lida com diferentes tipos de erro de status
                    if (response.status === 404) {
                        console.error('Tarefa não encontrada');
                    } else {
                        console.error('Erro ao buscar a tarefa:', response.statusText);
                    }
                }
        
            } catch (error) {
                console.error('Erro ao chamar a função Python:', error);
            }
        }

        
        if (method == 'PATCH') {
            try {
                const response = await fetch(`/update-task/${task_id}/`, {
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
                } else {
                    console.error('Erro ao atualizar a tarefa:', response.statusText);
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
        } else {
            alert(`Erro ao criar a tarefa`);
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
        alert("Erro ao carregar trilhas.");
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
// Call on resize and load
window.addEventListener('resize', adjustPopupSize);
adjustPopupSize();


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