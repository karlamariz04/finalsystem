let selectedId = null;

function loadNotes() {
  fetch("api/notes.php")
    .then(res => res.json())
    .then(notes => {
      const list = document.getElementById("notesList");
      list.innerHTML = "";
      notes.forEach(note => {
        const div = document.createElement("div");
        div.className = "note";
        div.innerText = note.title || "Untitled";
        div.onclick = () => selectNote(note);
        list.appendChild(div);
      });
    });
}

function selectNote(note) {
  selectedId = note.id;
  document.getElementById("title").value = note.title;
  document.getElementById("editor").innerHTML = note.content;
}

function createNote() {
  fetch("api/notes.php", {
    method: "POST",
    body: JSON.stringify({ title: "", content: "" })
  }).then(loadNotes);
}

function saveNote() {
  fetch("api/notes.php", {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${selectedId}&title=${title.value}&content=${editor.innerHTML}`
  }).then(loadNotes);
}

loadNotes();
