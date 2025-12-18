<?php
include "db.php";
header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
  $result = $conn->query("SELECT * FROM notes ORDER BY updated_at DESC");
  echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

if ($method === "POST") {
  $data = json_decode(file_get_contents("php://input"), true);
  $title = $data['title'] ?? '';
  $content = $data['content'] ?? '';

  $conn->query("INSERT INTO notes (title, content) VALUES ('$title','$content')");
  echo json_encode(["success" => true]);
}

if ($method === "PUT") {
  parse_str(file_get_contents("php://input"), $_PUT);
  $id = $_PUT['id'];
  $title = $_PUT['title'];
  $content = $_PUT['content'];

  $conn->query("UPDATE notes SET title='$title', content='$content' WHERE id=$id");
  echo json_encode(["success" => true]);
}

if ($method === "DELETE") {
  parse_str(file_get_contents("php://input"), $_DELETE);
  $id = $_DELETE['id'];
  $conn->query("DELETE FROM notes WHERE id=$id");
  echo json_encode(["success" => true]);
}
