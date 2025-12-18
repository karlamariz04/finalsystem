<!DOCTYPE html>
<html>
<head>
  <title>Cloud Notes</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="app">
  <header>
    <h1>☁️ Cloud Notes</h1>
    <button onclick="createNote()">＋</button>
  </header>

  <div class="container">
    <aside id="notesList"></aside>

    <main>
      <input id="title" placeholder="Note title">
      <div id="editor" contenteditable="true" data-placeholder="Start typing..."></div>
      <button onclick="saveNote()">💾 Save</button>
    </main>
  </div>
</div>

<script src="assets/js/app.js"></script>
</body>
</html>
