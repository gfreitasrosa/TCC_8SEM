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


// Function to open the popup for creating a new trail
function openTrailPopup() {
    setMinDate(); // Ensure date validation is applied
    const popup = document.getElementById("trail-popup");
    popup.style.display = "flex"; // Display the popup
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
document.getElementById("save-trail").addEventListener("click", function () {
    const trailName = document.getElementById("trail-name").value;
    const trailDate = document.getElementById("trail-date").value;
    const trailReminder = document.getElementById("trail-reminder").checked;

    if (trailName && trailDate) {
        // Create a new trail card
        const trailCard = document.createElement("div");
        trailCard.classList.add("trail-card");
        trailCard.innerText = trailName;

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
    } else {
        alert("Por favor insira um nome e uma data final para a trilha.");
    }
});

// Function to display the trail screen
function displayTrailScreen(name, date, reminder) {
    const main = document.getElementById("main");
    main.innerHTML = ""; // Clear the main area initially

    // Create the main structure for trail details and tasks
    main.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; gap: 20px; height: 100%;">
    <!-- Top section: Name, Date, Reminder, and Progress -->
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 10px; background-color: #516ED045; padding: 20px; border-radius: 10px; width: 100%; box-sizing: border-box;">
    <!-- <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; position: relative;"> -->
    <ul id="traildisp" style="display: flex; flex-wrap: nowrap; margin-left: -60rem; justify-content: space-around; align-items: left; align-content: center; list-style-type: none; max-width: 2rem;">
    <li style="text-decoration: none; display: inline-block;"><label>
    <input type="checkbox" ${reminder ? "checked" : ""}> Lembrete
    </label></li>
    <li style="text-decoration: none; display: inline-block;"><h2 style="font-size: clamp(14px, 1.2vw, 18px); max-width: 7rem; overflow: hidden; text-overflow: ellipsis; white=space: nowrap; display: block;">${name}</h2></li>
    <li style="text-decoration: none; display: inline-block;"><h2 id="progress-display" style="font-size: 18px; color: green; font-weight: bold;">Progresso: 0%</h2></li>
    <li style="text-decoration: none; display: inline-block;"><h2>Data final: ${date}</h2></li>
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
    <h3>Selecione uma task para visualizar detalhes</h3>
    </div>
    </div>
    </div>
    `;

    const createTaskButton = document.getElementById("create-task");
    if (createTaskButton) {
        createTaskButton.addEventListener("click", function () {
            const taskName = prompt("Enter task name:");
            if (taskName) {
                const taskId = `task-${Date.now()}`; // Generate unique ID
                const taskItem = document.createElement("p");
                taskItem.innerText = taskName;
                taskItem.classList.add("task-item");
                taskItem.dataset.id = taskId;
				taskItem.title = taskName; // Tooltip ao passar o mouse
				taskItem.style.maxWidth = "100%";
				taskItem.style.overflow = "hidden";
				taskItem.style.textOverflow = "ellipsis";
				taskItem.style.whiteSpace = "nowrap";

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



// Function to display task details
function displayTaskDetails(taskName, taskId) {
    const taskDetailsContainer = document.getElementById("task-details");
    taskDetailsContainer.innerHTML = `
    <h3>Detalhes da task</h3>
    <p style="max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${taskName}">
    <strong>Nome da task:</strong> ${taskName}
	</p>
    <p>Status:
    <select id="task-status">
    <option value="Ongoing">Em andamento</option>
    <option value="Concluded">Concluído</option>
    </select>
    </p>
    <button onclick="deleteTask('${taskId}')">Deletar Task</button>
    <textarea id="task-notes" placeholder="Comece suas anotações..." style="resize:none; width: 100%; height: 450px; margin-top: 10px;"></textarea>
    `;

    // Add event listener to status change dropdown
    const statusDropdown = document.getElementById("task-status");
    statusDropdown.addEventListener("change", function () {
        updateTaskStatus(taskId, statusDropdown.value); // Update task status
    });

    tinymce.init({
        selector: '#task-notes', // Target the textarea with id "task-notes"
        plugins: 'advlist autolink lists link image charmap preview anchor pagebreak',
        toolbar: 'undo redo | bold italic | fontfamily fontsize | alignleft aligncenter alignright | bullist numlist outdent indent | link | code', // Ensure fontsizeselect is in the toolbar
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
function deleteTask(taskId) {
    const taskList = document.getElementById("task-list");
    const taskToDelete = Array.from(taskList.children).find(
        task => task.dataset.id === taskId
    );
    if (taskToDelete) taskToDelete.remove();

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