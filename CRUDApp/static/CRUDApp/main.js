function getNote(id, title, content){
    return(
        `
        <div class="note" data-id=${id}>
            <div class="note-title" data-id=${id}>
                ${title}
            </div>
            <div class="note-content" data-id=${id}>
                ${content}
            </div>
            <div class="note-actions" data-id=${id}>
                <button class="note-edit" data-id=${id}>Edit</button>
                <button class="note-delete" data-id=${id}>Delete</button>
            </div>
        </div>
        `
    )
}

async function updateNoteList(){
    const response = await fetch('/notes/')
    const data = response.json()
    if (data.status == 0){
        const notes = data.notes
        const notesList = document.querySelector('.notes')
        notesList.innerHTML = ""
        notes.forEach(note =>{
            notesList.appendChild(getNote(note.id, note.title, note.note))
        })
    }
    
}

async function addOnClicks(){
    document.querySelectorAll(".note-delete").forEach(button => {
        button.addEventListener('click', async e =>{

            const noteId = {id: e.target.dataset.id}

            let request = await fetch("/delete/", {
                method: 'POST',
                body: JSON.stringify(noteId)
            })

            request = await request.json()
            if (request.status == 0){
                await updateNoteList()
                await addOnClicks()
            }
        })
    })

    document.querySelectorAll(".note-edit").forEach(button => {
        button.addEventListener('click', async e => {
            const noteId = {id: e.target.dataset.id};
            const noteElement = document.querySelector(`.note[data-id="${noteId.id}"]`);
            const noteTitleElement = document.querySelector(`.note-title[data-id="${noteId.id}"]`);
            const noteContentElement = document.querySelector(`.note-content[data-id="${noteId.id}"]`);
            const noteContentEdit = document.createElement("textarea");
            noteContentEdit.classList.add("note-content-edit");
            noteContentEdit.dataset.id = noteId.id;
            noteContentEdit.value = document.querySelector(`.note-content[data-id="${noteId.id}"]`).textContent;
            noteContentEdit.placeholder = "Content";
            noteContentEdit.style.display = "block";
            noteContentElement.style.display = "none";
            noteElement.insertBefore(noteContentEdit, noteContentElement);
            const noteTitleEdit = document.createElement("input");
            noteTitleEdit.classList.add("note-title-edit");
            noteTitleEdit.dataset.id = noteId.id;
            noteTitleEdit.type = "text";
            noteTitleEdit.name = "title";
            noteTitleEdit.placeholder = "Title";
            noteTitleEdit.value = document.querySelector(`.note-title[data-id="${noteId.id}"]`).textContent;
            noteTitleElement.style.display = "none";
            noteElement.insertBefore(noteTitleEdit, noteTitleElement);
            const noteCancelEditButton = document.createElement("button");
            noteCancelEditButton.classList.add("note-cancel-edit");
            noteCancelEditButton.dataset.id = noteId.id;
            noteCancelEditButton.innerHTML = "✕";
            noteCancelEditButton.addEventListener('click', async () => {
                noteElement.removeChild(noteTitleEdit);
                noteElement.removeChild(noteContentEdit);
                noteTitleElement.style.display = "block";
                noteContentElement.style.display = "block";  
                const noteActions = document.querySelector(`.note-actions[data-id="${noteId.id}"]`);
                noteActions.removeChild(noteSaveButton);
                noteActions.removeChild(noteCancelEditButton);
            })
            const noteSaveButton = document.createElement("button");
            noteSaveButton.classList.add("note-save");
            noteSaveButton.dataset.id = noteId.id;
            noteSaveButton.textContent = "Save";
            noteSaveButton.addEventListener('click', async e => {
                const note = {
                    id: e.target.dataset.id,
                    title: document.querySelector(`.note-title-edit[data-id="${noteId.id}"]`).value,
                    content: document.querySelector(`.note-content-edit[data-id="${noteId.id}"]`).value
                };
                if (note.content.length === 0) return
                let request = await fetch(`/edit/`, {
                    method: 'POST',
                    body: JSON.stringify(note)
                })
                request = await request.json();
                if (request.status == 0) {
                    noteElement.removeChild(noteTitleEdit);
                    noteElement.removeChild(noteContentEdit);
                    noteTitleElement.textContent = note.title;
                    noteTitleElement.style.display = "block";
                    noteContentElement.textContent = note.content;
                    noteContentElement.style.display = "block";  
                    const noteActions = document.querySelector(`.note-actions[data-id="${note.id}"]`);
                    noteActions.removeChild(noteSaveButton);
                    noteActions.removeChild(noteCancelEditButton);
                }
            });
            document.querySelector(`.note-actions[data-id="${noteId.id}"]`).appendChild(noteSaveButton);
            document.querySelector(`.note-actions[data-id="${noteId.id}"]`).appendChild(noteCancelEditButton);
        });
    })
}

document.querySelector("form").addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.querySelector("form input[name='title']").value;
    const content = document.querySelector("form input[name='content']").value;
    if (content.length == 0) return
    const note = {
        title: title,
        content: content
    };
    let request = await fetch('/notes/', {
        method: 'POST',
        body: JSON.stringify(note)
    })
    request = await request.json();
    if (request.status == 0) {
        document.querySelectorAll("form input").forEach(field => (!field.dataset["submit"]) ? field.value = "": null);
        await updateNoteList();
        await addOnClicks();
        return;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await updateNoteList();
    addOnClicks();
})