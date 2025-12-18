<?php
$conn = new mysqli("localhost", "root", "", "cloud_notes");

if ($conn->connect_error) {
  die("DB Connection Failed");
}
?>
